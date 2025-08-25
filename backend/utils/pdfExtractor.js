// utils/pdfExtractor.js or wherever your PDF extraction function is located

import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';

export async function extractTextFromPDF(buffer) {
  try {
    // On Vercel, use /tmp directory instead of ./temp
    const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';
    const tempDir = isVercel ? '/tmp' : './temp';
    
    // Create temp directory only if it doesn't exist and we're not on Vercel
    if (!isVercel && !fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Option 1: Direct buffer parsing (recommended for Vercel)
    if (isVercel) {
      console.log("Using direct buffer parsing for Vercel environment");
      const data = await pdf(buffer);
      
      if (!data.text || data.text.trim().length === 0) {
        throw new Error("No text could be extracted from the PDF");
      }
      
      return data.text;
    }

    // Option 2: File-based parsing for local development
    const tempFilePath = path.join(tempDir, `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.pdf`);
    
    try {
      // Write buffer to temporary file
      fs.writeFileSync(tempFilePath, buffer);
      
      // Read and parse the PDF
      const data = await pdf(fs.readFileSync(tempFilePath));
      
      if (!data.text || data.text.trim().length === 0) {
        throw new Error("No text could be extracted from the PDF");
      }
      
      return data.text;
      
    } finally {
      // Clean up temporary file
      if (fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (cleanupError) {
          console.warn("Failed to cleanup temp file:", cleanupError.message);
        }
      }
    }

  } catch (error) {
    console.error("PDF text extraction error:", error);
    throw new Error(`PDF processing failed: ${error.message}`);
  }
}

// Alternative: Pure buffer-based extraction (simpler approach)
export async function extractTextFromPDFSimple(buffer) {
  try {
    console.log("Extracting text from PDF buffer, size:", buffer.length);
    
    // Validate buffer
    if (!buffer || !Buffer.isBuffer(buffer)) {
      throw new Error("Invalid PDF buffer provided");
    }
    
    if (buffer.length === 0) {
      throw new Error("Empty PDF buffer provided");
    }
    
    // Parse PDF directly from buffer (no file system needed)
    const data = await pdf(buffer);
    
    if (!data || !data.text) {
      throw new Error("PDF parsing returned no data");
    }
    
    const extractedText = data.text.trim();
    
    if (extractedText.length === 0) {
      throw new Error("PDF contains no extractable text");
    }
    
    console.log("Successfully extracted text, length:", extractedText.length);
    return extractedText;
    
  } catch (error) {
    console.error("PDF extraction failed:", error);
    
    // More specific error messages
    if (error.message.includes('Invalid PDF')) {
      throw new Error("The uploaded file is not a valid PDF document");
    } else if (error.message.includes('password')) {
      throw new Error("This PDF is password protected and cannot be processed");
    } else if (error.message.includes('damaged') || error.message.includes('corrupt')) {
      throw new Error("The PDF file appears to be corrupted");
    } else {
      throw new Error(`PDF processing failed: ${error.message}`);
    }
  }
}