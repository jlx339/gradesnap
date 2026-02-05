import { NyckelResponse, CONDITION_TO_PSA, GradingResult } from "@/types";

const NYCKEL_FUNCTION_ID = "card-grading-condition";
const NYCKEL_API_URL = `https://www.nyckel.com/v1/functions/${NYCKEL_FUNCTION_ID}/invoke`;

export async function gradeCardWithNyckel(imageBase64: string): Promise<GradingResult> {
  try {
    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    
    const response = await fetch(NYCKEL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: `data:image/jpeg;base64,${base64Data}`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Nyckel API error: ${response.status} - ${errorText}`);
    }

    const data: NyckelResponse = await response.json();
    
    // Get the primary condition
    const primaryCondition = data.labelName;
    const confidence = data.confidence;
    
    // Map to PSA estimate
    const psaMapping = CONDITION_TO_PSA[primaryCondition] || {
      grade: 5,
      range: "Unknown",
      label: primaryCondition,
    };

    // Generate unique ID
    const id = `grade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      id,
      timestamp: new Date(),
      imageUrl: imageBase64,
      condition: primaryCondition,
      confidence,
      allPredictions: data.predictions || [{ labelName: primaryCondition, confidence }],
      estimatedPSA: psaMapping,
    };
  } catch (error) {
    console.error("Error grading card:", error);
    throw error;
  }
}

// Test function to verify API is working
export async function testNyckelAPI(): Promise<boolean> {
  try {
    // Use a simple test image (1x1 pixel)
    const testResponse = await fetch(NYCKEL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: "https://images.pokemontcg.io/base1/4.png",
      }),
    });
    
    return testResponse.ok;
  } catch {
    return false;
  }
}
