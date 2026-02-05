"use client";

import { createWorker } from "tesseract.js";

/**
 * Crop the top portion of an image where the card name typically is
 * Returns a base64 image of the cropped area
 */
function cropTopPortion(imageBase64: string, topPercent: number = 20): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      
      // Crop top portion of the image
      const cropHeight = Math.floor(img.height * (topPercent / 100));
      canvas.width = img.width;
      canvas.height = cropHeight;
      
      // Draw only the top portion
      ctx.drawImage(img, 0, 0, img.width, cropHeight, 0, 0, img.width, cropHeight);
      
      // Convert to base64
      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };
    
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageBase64;
  });
}

/**
 * Parse Pokemon card name from OCR text
 * Card names are typically at the top in large text
 */
function parseCardName(ocrText: string): string | null {
  // Split into lines and clean up
  const lines = ocrText
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 2);
  
  if (lines.length === 0) return null;
  
  // Patterns to skip (not card names)
  const skipPatterns = [
    /^HP\s*\d+$/i,
    /^\d+$/,
    /^Basic$/i,
    /^Stage\s*\d$/i,
    /^VMAX$/i,
    /^VSTAR$/i,
    /^GX$/i,
    /^EX$/i,
    /^V$/i,
    /^Pokemon$/i,
    /^Trainer$/i,
    /^Energy$/i,
    /^\d+\s*\/\s*\d+$/,
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
      .replace(/[^a-zA-Z\s'-]/g, "") // Remove non-letter chars
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();
    
    // Remove common suffixes
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
 * Extract card name from the front image using OCR
 * Focuses on the top portion where the name is located
 */
export async function extractCardName(frontImageBase64: string): Promise<string | null> {
  try {
    // Crop top 25% of the image where card name typically is
    const croppedImage = await cropTopPortion(frontImageBase64, 25);
    
    // Create OCR worker
    const worker = await createWorker("eng");
    
    try {
      // Run OCR on the cropped image
      const { data: { text } } = await worker.recognize(croppedImage);
      
      // Parse card name from OCR text
      const cardName = parseCardName(text);
      
      console.log("OCR text:", text);
      console.log("Detected card name:", cardName);
      
      return cardName;
    } finally {
      await worker.terminate();
    }
  } catch (error) {
    console.error("OCR error:", error);
    return null;
  }
}
