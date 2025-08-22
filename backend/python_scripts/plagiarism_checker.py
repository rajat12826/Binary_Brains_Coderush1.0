# plagiarism_checker.py
# -*- coding: utf-8 -*-
import sys
import json
import torch
import numpy as np
import re
import requests
import tempfile
import os
import pdfplumber
from transformers import GPT2LMHeadModel, GPT2TokenizerFast, AutoTokenizer, AutoModelForSequenceClassification
from docx import Document
from langdetect import detect

# ---------------------------
# Load Models (only once)
# ---------------------------
gpt2_model = GPT2LMHeadModel.from_pretrained("gpt2")
gpt2_tokenizer = GPT2TokenizerFast.from_pretrained("gpt2")

longformer_model_name = "jpwahle/longformer-base-plagiarism-detection"
longformer_tokenizer = AutoTokenizer.from_pretrained(longformer_model_name)
longformer_model = AutoModelForSequenceClassification.from_pretrained(longformer_model_name)

# ---------------------------
# Functions
# ---------------------------
def compute_perplexity(text):
    if not text.strip():
        return 0
    encodings = gpt2_tokenizer(text, return_tensors="pt", truncation=True)
    max_length = gpt2_model.config.n_positions
    stride = 512
    lls = []

    for i in range(0, encodings.input_ids.size(1), stride):
        begin_loc = max(i + stride - max_length, 0)
        end_loc = min(i + stride, encodings.input_ids.size(1))
        trg_len = end_loc - i
        input_ids = encodings.input_ids[:, begin_loc:end_loc]
        target_ids = input_ids.clone()
        target_ids[:, :-trg_len] = -100

        with torch.no_grad():
            outputs = gpt2_model(input_ids, labels=target_ids)
            log_likelihood = outputs.loss * trg_len

        lls.append(log_likelihood)

    ppl = torch.exp(torch.stack(lls).sum() / end_loc)
    return ppl.item()

def compute_entropy(text):
    if not text.strip():
        return 0
    inputs = gpt2_tokenizer(text, return_tensors="pt", truncation=True)
    input_ids = inputs.input_ids
    with torch.no_grad():
        logits = gpt2_model(input_ids).logits
        probs = torch.softmax(logits, dim=-1)
    entropy_per_token = -torch.sum(probs * torch.log(probs + 1e-10), dim=-1)
    avg_entropy = entropy_per_token.mean().item()
    watermark_score = max(0, min(100, 100 - avg_entropy * 4))
    return watermark_score

def detect_plagiarism(chunk):
    if not chunk.strip():
        return 0
    inputs = longformer_tokenizer(chunk, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        logits = longformer_model(**inputs).logits
    predicted_class = torch.argmax(torch.nn.functional.softmax(logits, dim=-1), dim=-1).item()
    return predicted_class  # 0 = not plagiarised, 1 = plagiarised

def stylometric_fingerprint(text, keywords=None):
    if not text.strip():
        return {}
    lines = [line for line in text.split("\n") if line.strip() != ""]
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip() != ""]
    words = re.findall(r'\b\w+\b', text.lower())
    num_sentences = len(sentences)
    num_words = len(words)
    unique_words = len(set(words))
    avg_sentence_length = num_words / num_sentences if num_sentences > 0 else 0
    avg_word_length = sum(len(w) for w in words) / num_words if num_words > 0 else 0
    vocabulary_richness = unique_words / num_words if num_words > 0 else 0
    keyword_count = sum(text.lower().count(k.lower()) for k in keywords) if keywords else 0

    return {
        "lines": len(lines),
        "sentences": num_sentences,
        "words": num_words,
        "unique_words": unique_words,
        "avg_sentence_length": avg_sentence_length,
        "avg_word_length": avg_word_length,
        "vocabulary_richness": vocabulary_richness,
        "keyword_count": keyword_count
    }

# ---------------------------
# Main entrypoint
# ---------------------------
if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: python plagiarism_checker.py <fileUrl> <submissionId>"}))
        sys.exit(1)

    file_url = sys.argv[1]
    submission_id = sys.argv[2]

    text = ""

    try:
        # download file from Cloudinary to a temp file
        response = requests.get(file_url)
        response.raise_for_status()

        suffix = ""
        if ".docx" in file_url.lower():
            suffix = ".docx"
        elif ".txt" in file_url.lower():
            suffix = ".txt"
        elif ".pdf" in file_url.lower():
            suffix = ".pdf"
        else:
            suffix = ".bin"  # fallback

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
            tmp_file.write(response.content)
            tmp_path = tmp_file.name

        # ---------------------------
        # Extract text depending on file type
        # ---------------------------
        if tmp_path.endswith(".txt"):
            with open(tmp_path, "r", encoding="utf-8") as f:
                text = f.read()
        elif tmp_path.endswith(".docx"):
            doc = Document(tmp_path)
            text = "\n".join([para.text for para in doc.paragraphs])
        elif tmp_path.endswith(".pdf"):
            with pdfplumber.open(tmp_path) as pdf:
                text = "\n".join([page.extract_text() or "" for page in pdf.pages])
        else:
            text = ""

    except Exception as e:
        print(json.dumps({"error": f"Failed to fetch or parse file: {str(e)}"}))
        sys.exit(1)
    finally:
        if "tmp_path" in locals() and os.path.exists(tmp_path):
            os.unlink(tmp_path)

    # ---------------------------
    # Split & run analysis
    # ---------------------------
    chunk_size = 1000
    chunks = [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]

    ai_flags = [1 if compute_perplexity(c) < 25 else 0 for c in chunks if c.strip()]
    watermark_scores = [compute_entropy(c) for c in chunks if c.strip()]
    plag_flags = [detect_plagiarism(c) for c in chunks if c.strip()]

    ai_percentage = float(np.mean(ai_flags) * 100) if ai_flags else 0
    watermark_percentage = float(np.mean(watermark_scores)) if watermark_scores else 0
    plag_percentage = float(np.mean(plag_flags) * 100) if plag_flags else 0

    keywords = ["AI", "machine", "learning", "data", "algorithm"]
    fingerprint = stylometric_fingerprint(text, keywords)

    # ---------------------------
    # Output JSON (for Node)
    # ---------------------------
    result = {
        "submissionId": submission_id,
        "plagiarismScore": plag_percentage / 100,   # normalized 0–1
        "sources": [],
        "rephrasedDetected": False,
        "aiLikelihood": ai_percentage / 100,        # normalized 0–1
        "entropy": watermark_percentage,
        "perplexity": np.mean([compute_perplexity(c) for c in chunks]) if chunks else None,
        "watermarkDetected": watermark_percentage > 50,
        "stylometry": fingerprint,
        "heatmap": [{"idx": i, "score": float(s)} for i, s in enumerate(plag_flags)],
        "language": detect(text) if text.strip() else "unknown",
        "verdict": "Safe" if plag_percentage < 30 else "High Risk"
    }

    print(json.dumps(result))
