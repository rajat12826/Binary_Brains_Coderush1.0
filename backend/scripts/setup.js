// scripts/setup.js - Run this before starting your server

import fs from 'fs';
import path from 'path';

// Create the missing test directory and file that pdf-parse is looking for
const testDir = './test/data';
const testFile = path.join(testDir, '05-versions-space.pdf');

try {
  // Create directories if they don't exist
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
    console.log('Created test directory:', testDir);
  }
  
  // Create a minimal PDF file if it doesn't exist
  if (!fs.existsSync(testFile)) {
    // Minimal PDF content (this is a very basic PDF structure)
    const minimalPDF = Buffer.from([
      0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, 0x0A, // %PDF-1.4
      0x25, 0xE2, 0xE3, 0xCF, 0xD3, 0x0A, // Binary marker
      0x0A, 0x65, 0x6E, 0x64, 0x6F, 0x62, 0x6A, 0x0A, // endobj
      0x73, 0x74, 0x61, 0x72, 0x74, 0x78, 0x72, 0x65, 0x66, 0x0A, // startxref
      0x30, 0x0A, // 0
      0x25, 0x25, 0x45, 0x4F, 0x46 // %%EOF
    ]);
    
    fs.writeFileSync(testFile, minimalPDF);
    console.log('Created minimal test PDF:', testFile);
  }
  
  console.log('Setup completed successfully');
} catch (error) {
  console.error('Setup failed:', error);
}