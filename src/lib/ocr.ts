import { createWorker, PSM } from "tesseract.js";

/**
 * Extract text from an image using Tesseract OCR
 * Optimized for Pokemon card name extraction
 */
export async function extractTextFromImage(imageBase64: string): Promise<string> {
  const worker = await createWorker("eng");
  
  try {
    // Set parameters for better Pokemon card text recognition
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
      tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 '-.",
    });
    
    const { data: { text } } = await worker.recognize(imageBase64);
    return text;
  } finally {
    await worker.terminate();
  }
}

/**
 * Parse Pokemon card name from OCR text
 * The name is typically at the top of the card in large letters
 */
export function parseCardNameFromText(ocrText: string): string | null {
  // Split into lines and clean up
  const lines = ocrText
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 2);
  
  if (lines.length === 0) return null;
  
  // Common Pokemon card patterns to filter out
  const skipPatterns = [
    /^HP$/i,
    /^\d+$/,
    /^Basic$/i,
    /^Stage \d$/i,
    /^VMAX$/i,
    /^VSTAR$/i,
    /^GX$/i,
    /^EX$/i,
    /^V$/i,
    /^Pokemon$/i,
    /^Trainer$/i,
    /^Energy$/i,
    /^Weakness$/i,
    /^Resistance$/i,
    /^Retreat$/i,
    /^\d+\s*\/\s*\d+$/,  // Card number like "4/102"
  ];
  
  // Find the first line that looks like a card name
  for (const line of lines) {
    // Skip if matches any skip pattern
    if (skipPatterns.some(pattern => pattern.test(line))) continue;
    
    // Skip if too short or too long
    if (line.length < 3 || line.length > 30) continue;
    
    // Skip if mostly numbers
    const letterCount = (line.match(/[a-zA-Z]/g) || []).length;
    if (letterCount < line.length * 0.5) continue;
    
    // Clean up the name
    let name = line
      .replace(/[^a-zA-Z\s'-]/g, "") // Remove non-letter chars except space, hyphen, apostrophe
      .replace(/\s+/g, " ")  // Normalize whitespace
      .trim();
    
    // Remove common suffixes that aren't part of the actual Pokemon name
    name = name
      .replace(/\s*(EX|GX|V|VMAX|VSTAR|ex|gx)\s*$/i, "")
      .trim();
    
    if (name.length >= 3) {
      return name;
    }
  }
  
  return null;
}

/**
 * Extract card set number from OCR text
 * Usually appears as "XXX/YYY" at the bottom of the card
 */
export function parseCardNumberFromText(ocrText: string): string | null {
  // Look for patterns like "4/102", "001/025", etc.
  const numberPattern = /(\d{1,3})\s*\/\s*(\d{1,3})/;
  const match = ocrText.match(numberPattern);
  
  if (match) {
    return `${match[1]}/${match[2]}`;
  }
  
  return null;
}
