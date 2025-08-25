// utils/pdfExtractor.js - Complete replacement for pdf-parse

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';

// Configure PDF.js for Node.js environment
const NodeCanvasFactory = pdfjsLib.NodeCanvasFactory;
const NodeCMapReaderFactory = pdfjsLib.NodeCMapReaderFactory;

export async function extractTextFromPDF(buffer) {
  try {
    console.log("🔄 Extracting text from PDF using PDF.js, buffer size:", buffer.length);
    
    // Validate buffer
    if (!buffer || !Buffer.isBuffer(buffer)) {
      throw new Error("Invalid PDF buffer provided");
    }
    
    if (buffer.length === 0) {
      throw new Error("Empty PDF buffer provided");
    }

    // Convert buffer to Uint8Array for PDF.js
    const uint8Array = new Uint8Array(buffer);
    
    // Configure PDF.js options for server environment
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      // Disable worker in server environment
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
      // Add canvas factory for Node.js
      canvasFactory: new NodeCanvasFactory(),
      cMapReaderFactory: new NodeCMapReaderFactory({
        baseUrl: '',
        isCompressed: false,
      }),
    });
    
    const pdf = await loadingTask.promise;
    console.log(`📄 PDF loaded successfully, ${pdf.numPages} pages found`);
    
    let fullText = '';
    let totalChars = 0;
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Extract text items and combine them
        const pageText = textContent.items
          .filter(item => item.str && typeof item.str === 'string')
          .map(item => {
            // Clean up the text
            let text = item.str.trim();
            // Handle common PDF encoding issues
            text = text.replace(/\u00A0/g, ' '); // Non-breaking space
            text = text.replace(/\u2019/g, "'"); // Right single quotation mark
            text = text.replace(/\u2018/g, "'"); // Left single quotation mark
            text = text.replace(/\u201C/g, '"'); // Left double quotation mark
            text = text.replace(/\u201D/g, '"'); // Right double quotation mark
            text = text.replace(/\u2013/g, '-'); // En dash
            text = text.replace(/\u2014/g, '--'); // Em dash
            return text;
          })
          .join(' ')
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();
        
        if (pageText && pageText.length > 0) {
          fullText += pageText + '\n\n';
          totalChars += pageText.length;
          console.log(`📝 Page ${pageNum}: extracted ${pageText.length} characters`);
        }
        
        // Clean up page resources
        page.cleanup();
        
      } catch (pageError) {
        console.warn(`⚠️ Failed to extract text from page ${pageNum}:`, pageError.message);
        // Continue with other pages
        continue;
      }
    }
    
    // Clean up PDF resources
    pdf.cleanup();
    
    // Final text processing
    const extractedText = fullText
      .trim()
      .replace(/\n{3,}/g, '\n\n') // Normalize paragraph breaks
      .replace(/[ \t]+/g, ' '); // Normalize spaces and tabs
    
    if (!extractedText || extractedText.length < 10) {
      throw new Error("PDF contains no extractable text or text is too short");
    }
    
    console.log(`✅ Successfully extracted ${extractedText.length} characters from ${pdf.numPages} pages`);
    return extractedText;
    
  } catch (error) {
    console.error("❌ PDF text extraction failed:", error);
    
    // Provide specific error messages
    if (error.message.includes('Invalid PDF structure')) {
      throw new Error("The uploaded file is not a valid PDF document");
    } else if (error.message.includes('password')) {
      throw new Error("This PDF is password protected and cannot be processed");
    } else if (error.message.includes('damaged') || error.message.includes('corrupt')) {
      throw new Error("The PDF file appears to be corrupted");
    } else if (error.name === 'PasswordException') {
      throw new Error("This PDF requires a password to access");
    } else {
      throw new Error(`PDF processing failed: ${error.message}`);
    }
  }
}

// Fallback function using simple text extraction (for very problematic PDFs)
export function extractTextSimple(buffer) {
  try {
    console.log("🔄 Attempting simple text extraction as fallback");
    
    if (!buffer || !Buffer.isBuffer(buffer)) {
      throw new Error("Invalid buffer provided");
    }
    
    // Convert buffer to string and look for text patterns
    const pdfString = buffer.toString('binary');
    
    // Look for text content between parentheses (common in PDF text objects)
    const textMatches = [];
    
    // Pattern 1: Text in parentheses
    const parenthesesRegex = /\(([^)]*)\)/g;
    let match;
    while ((match = parenthesesRegex.exec(pdfString)) !== null) {
      const text = match[1].trim();
      if (text.length > 2 && /[a-zA-Z]/.test(text)) {
        textMatches.push(text);
      }
    }
    
    // Pattern 2: Text in square brackets (alternative format)
    const bracketRegex = /\[([^\]]*)\]/g;
    while ((match = bracketRegex.exec(pdfString)) !== null) {
      const text = match[1].trim();
      if (text.length > 2 && /[a-zA-Z]/.test(text)) {
        textMatches.push(text);
      }
    }
    
    // Combine and clean up text
    let extractedText = textMatches
      .join(' ')
      .replace(/\\n/g, ' ')
      .replace(/\\t/g, ' ')
      .replace(/\\r/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (extractedText.length < 20) {
      throw new Error("Could not extract meaningful text using simple method");
    }
    
    console.log(`✅ Simple extraction successful, ${extractedText.length} characters`);
    return extractedText;
    
  } catch (error) {
    console.error("❌ Simple extraction failed:", error);
    throw new Error(`Simple text extraction failed: ${error.message}`);
  }
}

// Main extraction function with fallback
export async function extractTextFromPDFWithFallback(buffer) {
  const methods = [
    { name: 'PDF.js', fn: () => extractTextFromPDF(buffer), async: true },
    { name: 'Simple', fn: () => extractTextSimple(buffer), async: false }
  ];
  
  let lastError = null;
  
  for (const method of methods) {
    try {
      console.log(`🔄 Attempting ${method.name} extraction...`);
      
      const result = method.async ? 
        await method.fn() : 
        method.fn();
      
      if (result && result.trim().length >= 50) {
        console.log(`✅ ${method.name} extraction successful`);
        return result;
      } else {
        console.warn(`⚠️ ${method.name} extraction returned insufficient text`);
        continue;
      }
    } catch (error) {
      console.warn(`❌ ${method.name} extraction failed:`, error.message);
      lastError = error;
      continue;
    }
  }
  
  // If all methods failed
  throw new Error(
    `All PDF extraction methods failed. ${lastError?.message || 'Unknown error'}`
  );
}