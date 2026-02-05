import { NextRequest, NextResponse } from "next/server";
import { extractTextFromImage, parseCardNameFromText, parseCardNumberFromText } from "@/lib/ocr";
import { CardInfo } from "@/types";

const POKEMON_TCG_API_URL = "https://api.pokemontcg.io/v2";

async function searchPokemonTCG(query: string): Promise<CardInfo[]> {
  try {
    // Search by name with fuzzy matching
    const response = await fetch(
      `${POKEMON_TCG_API_URL}/cards?q=name:"${encodeURIComponent(query)}*"&pageSize=10&orderBy=-set.releaseDate`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
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

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Extract text from image using OCR
    let ocrText: string;
    try {
      ocrText = await extractTextFromImage(image);
    } catch (ocrError) {
      console.error("OCR error:", ocrError);
      return NextResponse.json(
        { 
          success: false,
          error: "Could not read text from image",
          suggestions: []
        }
      );
    }

    // Parse card name and number from OCR text
    const cardName = parseCardNameFromText(ocrText);
    const cardNumber = parseCardNumberFromText(ocrText);

    if (!cardName) {
      return NextResponse.json({
        success: false,
        error: "Could not identify card name from image",
        ocrText: ocrText.substring(0, 200), // Return partial OCR for debugging
        suggestions: []
      });
    }

    // Search Pokemon TCG API
    const searchResults = await searchPokemonTCG(cardName);

    if (searchResults.length === 0) {
      return NextResponse.json({
        success: false,
        error: `No cards found matching "${cardName}"`,
        detectedName: cardName,
        detectedNumber: cardNumber,
        suggestions: []
      });
    }

    // Try to find best match based on card number if available
    let bestMatch = searchResults[0];
    if (cardNumber) {
      const numberOnly = cardNumber.split("/")[0];
      const exactMatch = searchResults.find(card => card.number === numberOnly);
      if (exactMatch) {
        bestMatch = exactMatch;
      }
    }

    // Extract year from release date
    const releaseYear = bestMatch.set.releaseDate 
      ? new Date(bestMatch.set.releaseDate).getFullYear()
      : null;

    return NextResponse.json({
      success: true,
      card: {
        id: bestMatch.id,
        name: bestMatch.name,
        number: bestMatch.number,
        set: bestMatch.set,
        rarity: bestMatch.rarity,
        hp: bestMatch.hp,
        types: bestMatch.types,
        supertype: bestMatch.supertype,
        subtypes: bestMatch.subtypes,
        images: bestMatch.images,
        tcgplayer: bestMatch.tcgplayer,
      },
      year: releaseYear,
      fullNumber: `${bestMatch.number}/${bestMatch.set.printedTotal || "?"}`,
      detectedName: cardName,
      detectedNumber: cardNumber,
      alternativeMatches: searchResults.slice(1, 5).map(card => ({
        id: card.id,
        name: card.name,
        set: card.set.name,
        number: card.number,
      })),
    });
  } catch (error) {
    console.error("Card identification error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to identify card" 
      },
      { status: 500 }
    );
  }
}
