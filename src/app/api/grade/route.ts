import { NextRequest, NextResponse } from "next/server";
import { CONDITION_TO_PSA, NyckelResponse, NyckelPrediction, CardInfo } from "@/types";
import { extractTextFromImage, parseCardNameFromText, parseCardNumberFromText } from "@/lib/ocr";

const NYCKEL_FUNCTION_ID = "card-grading-condition";
const NYCKEL_API_URL = `https://www.nyckel.com/v1/functions/${NYCKEL_FUNCTION_ID}/invoke`;
const POKEMON_TCG_API_URL = "https://api.pokemontcg.io/v2";

// Weight for combining front and back grades (70% front, 30% back - industry standard)
const FRONT_WEIGHT = 0.7;
const BACK_WEIGHT = 0.3;

async function gradeImage(imageData: string): Promise<NyckelResponse> {
  const response = await fetch(NYCKEL_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: imageData,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Grading service error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

function getNumericGrade(condition: string): number {
  const mapping = CONDITION_TO_PSA[condition];
  return mapping ? mapping.grade : 5; // Default to 5 if unknown
}

function getConditionFromGrade(grade: number): string {
  if (grade >= 9.5) return "Gem Mint";
  if (grade >= 9) return "Mint";
  if (grade >= 8) return "Near Mint";
  if (grade >= 7) return "Excellent";
  if (grade >= 6) return "Very Good";
  if (grade >= 5) return "Good";
  if (grade >= 4) return "Fair";
  return "Poor";
}

function combinePredictions(
  frontPredictions: NyckelPrediction[],
  backPredictions: NyckelPrediction[]
): NyckelPrediction[] {
  const combined = new Map<string, number>();

  // Add weighted front predictions
  for (const pred of frontPredictions) {
    const current = combined.get(pred.labelName) || 0;
    combined.set(pred.labelName, current + pred.confidence * FRONT_WEIGHT);
  }

  // Add weighted back predictions
  for (const pred of backPredictions) {
    const current = combined.get(pred.labelName) || 0;
    combined.set(pred.labelName, current + pred.confidence * BACK_WEIGHT);
  }

  // Convert to array and sort by confidence
  const result: NyckelPrediction[] = [];
  for (const [labelName, confidence] of combined) {
    result.push({ labelName, confidence });
  }

  return result.sort((a, b) => b.confidence - a.confidence);
}

// Identify card from image using OCR and Pokemon TCG API
async function identifyCard(imageData: string): Promise<CardInfo | null> {
  try {
    // Extract text from image
    const ocrText = await extractTextFromImage(imageData);
    const cardName = parseCardNameFromText(ocrText);
    const cardNumber = parseCardNumberFromText(ocrText);

    if (!cardName) {
      console.log("Could not extract card name from OCR");
      return null;
    }

    console.log(`OCR detected card name: "${cardName}", number: "${cardNumber}"`);

    // Search Pokemon TCG API
    const response = await fetch(
      `${POKEMON_TCG_API_URL}/cards?q=name:"${encodeURIComponent(cardName)}*"&pageSize=10&orderBy=-set.releaseDate`,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      console.error(`Pokemon TCG API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const cards: CardInfo[] = data.data || [];

    if (cards.length === 0) {
      console.log(`No cards found for "${cardName}"`);
      return null;
    }

    // Find best match based on card number if available
    let bestMatch = cards[0];
    if (cardNumber) {
      const numberOnly = cardNumber.split("/")[0];
      const exactMatch = cards.find(card => card.number === numberOnly);
      if (exactMatch) {
        bestMatch = exactMatch;
      }
    }

    return bestMatch;
  } catch (error) {
    console.error("Card identification error:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { frontImage, backImage } = await request.json();

    if (!frontImage || !backImage) {
      return NextResponse.json(
        { error: "Both front and back images are required" },
        { status: 400 }
      );
    }

    // Grade both images and identify card in parallel
    const [frontResponse, backResponse, cardInfo] = await Promise.all([
      gradeImage(frontImage),
      gradeImage(backImage),
      identifyCard(frontImage), // Use front image for card identification
    ]);

    // Extract results
    const frontCondition = frontResponse.labelName;
    const frontConfidence = frontResponse.confidence;
    const frontPredictions = frontResponse.predictions || [
      { labelName: frontCondition, confidence: frontConfidence },
    ];

    const backCondition = backResponse.labelName;
    const backConfidence = backResponse.confidence;
    const backPredictions = backResponse.predictions || [
      { labelName: backCondition, confidence: backConfidence },
    ];

    // Get numeric grades for each side
    const frontGrade = getNumericGrade(frontCondition);
    const backGrade = getNumericGrade(backCondition);

    // Calculate weighted combined grade
    const combinedGrade = frontGrade * FRONT_WEIGHT + backGrade * BACK_WEIGHT;
    const roundedGrade = Math.round(combinedGrade * 2) / 2; // Round to nearest 0.5

    // Get condition label for combined grade
    const combinedCondition = getConditionFromGrade(combinedGrade);

    // Combine predictions
    const allPredictions = combinePredictions(frontPredictions, backPredictions);

    // Calculate combined confidence
    const combinedConfidence = frontConfidence * FRONT_WEIGHT + backConfidence * BACK_WEIGHT;

    // Map to PSA estimate
    const psaMapping = CONDITION_TO_PSA[combinedCondition] || {
      grade: roundedGrade,
      range: `${Math.floor(roundedGrade)}-${Math.ceil(roundedGrade)}`,
      label: combinedCondition,
    };

    // Generate unique ID
    const id = `grade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const result = {
      id,
      timestamp: new Date().toISOString(),
      frontImageUrl: frontImage,
      backImageUrl: backImage,
      condition: combinedCondition,
      confidence: combinedConfidence,
      frontResult: {
        condition: frontCondition,
        confidence: frontConfidence,
        predictions: frontPredictions,
      },
      backResult: {
        condition: backCondition,
        confidence: backConfidence,
        predictions: backPredictions,
      },
      allPredictions,
      estimatedPSA: {
        grade: roundedGrade,
        range: psaMapping.range,
        label: psaMapping.label,
      },
      card: cardInfo || undefined,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Grading error:", error);
    return NextResponse.json(
      { error: "Failed to grade card. Please try again." },
      { status: 500 }
    );
  }
}
