import { NyckelResponse, CONDITION_TO_PSA } from "@/types";

const NYCKEL_FUNCTION_ID = "card-grading-condition";
const NYCKEL_API_URL = `https://www.nyckel.com/v1/functions/${NYCKEL_FUNCTION_ID}/invoke`;

export interface SingleImageGradeResult {
  condition: string;
  confidence: number;
  predictions: Array<{ labelName: string; confidence: number }>;
  psaEstimate: {
    grade: number;
    range: string;
    label: string;
  };
}

export async function gradeCardImage(imageBase64: string): Promise<SingleImageGradeResult> {
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

  return {
    condition: primaryCondition,
    confidence,
    predictions: data.predictions || [{ labelName: primaryCondition, confidence }],
    psaEstimate: psaMapping,
  };
}

// Test function to verify API is working
export async function testNyckelAPI(): Promise<boolean> {
  try {
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
