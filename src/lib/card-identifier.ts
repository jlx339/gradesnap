"use client";

import { createWorker } from "tesseract.js";
import { CardInfo } from "@/types";

const POKEMON_TCG_API_URL = "https://api.pokemontcg.io/v2";

/**
 * Extract text from an image using Tesseract OCR (runs in browser)
 */
async function extractTextFromImage(imageBase64: string): Promise<string> {
  const worker = await createWorker("eng");
  
  try {
    const { data: { text } } = await worker.recognize(imageBase64);
    return text;
  } finally {
    await worker.terminate();
  }
}

/**
 * Parse Pokemon card name from OCR text
 */
function parseCardNameFromText(ocrText: string): string | null {
  const lines = ocrText
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 2);
  
  if (lines.length === 0) return null;
  
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
    /^\d+\s*\/\s*\d+$/,
  ];
  
  for (const line of lines) {
    if (skipPatterns.some(pattern => pattern.test(line))) continue;
    if (line.length < 3 || line.length > 30) continue;
    
    const letterCount = (line.match(/[a-zA-Z]/g) || []).length;
    if (letterCount < line.length * 0.5) continue;
    
    let name = line
      .replace(/[^a-zA-Z\s'-]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    
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
 * Parse card set number from OCR text
 */
function parseCardNumberFromText(ocrText: string): string | null {
  const numberPattern = /(\d{1,3})\s*\/\s*(\d{1,3})/;
  const match = ocrText.match(numberPattern);
  
  if (match) {
    return `${match[1]}/${match[2]}`;
  }
  
  return null;
}

/**
 * Search Pokemon TCG API for cards
 */
async function searchPokemonTCG(query: string): Promise<CardInfo[]> {
  try {
    const response = await fetch(
      `${POKEMON_TCG_API_URL}/cards?q=name:"${encodeURIComponent(query)}*"&pageSize=10&orderBy=-set.releaseDate`
    );

    if (!response.ok) {
      console.error(`Pokemon TCG API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error searching Pokemon TCG API:", error);
    return [];
  }
}

export interface IdentificationResult {
  success: boolean;
  card?: CardInfo;
  detectedName?: string;
  error?: string;
}

/**
 * Identify a Pokemon card from an image (runs entirely in browser)
 */
export async function identifyCard(imageBase64: string): Promise<IdentificationResult> {
  try {
    // Extract text using OCR
    const ocrText = await extractTextFromImage(imageBase64);
    const cardName = parseCardNameFromText(ocrText);
    const cardNumber = parseCardNumberFromText(ocrText);

    if (!cardName) {
      return {
        success: false,
        error: "Could not read card name from image",
      };
    }

    // Search Pokemon TCG API
    const searchResults = await searchPokemonTCG(cardName);

    if (searchResults.length === 0) {
      return {
        success: false,
        detectedName: cardName,
        error: `No cards found matching "${cardName}"`,
      };
    }

    // Find best match
    let bestMatch = searchResults[0];
    if (cardNumber) {
      const numberOnly = cardNumber.split("/")[0];
      const exactMatch = searchResults.find(card => card.number === numberOnly);
      if (exactMatch) {
        bestMatch = exactMatch;
      }
    }

    return {
      success: true,
      card: bestMatch,
      detectedName: cardName,
    };
  } catch (error) {
    console.error("Card identification error:", error);
    return {
      success: false,
      error: "Failed to identify card",
    };
  }
}
