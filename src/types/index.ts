// Nyckel API response types
export interface NyckelPrediction {
  labelName: string;
  confidence: number;
}

export interface NyckelResponse {
  labelName: string;
  labelId: string;
  confidence: number;
  predictions: NyckelPrediction[];
}

// Grading result types
export interface GradingResult {
  id: string;
  timestamp: string;
  frontImageUrl: string;
  backImageUrl: string;
  
  // Primary grade (combined from front and back)
  condition: string;
  confidence: number;
  
  // Individual results
  frontResult: {
    condition: string;
    confidence: number;
    predictions: NyckelPrediction[];
  };
  backResult: {
    condition: string;
    confidence: number;
    predictions: NyckelPrediction[];
  };
  
  // Combined predictions
  allPredictions: NyckelPrediction[];
  
  // Estimated PSA grade (derived from condition)
  estimatedPSA: {
    grade: number;
    range: string;
    label: string;
  };
  
  // Card info (if identified)
  card?: CardInfo;
}

// Pokemon TCG API types
export interface CardInfo {
  id: string;
  name: string;
  number: string;
  set: {
    id: string;
    name: string;
    series: string;
    releaseDate?: string;
    printedTotal?: number;
  };
  rarity?: string;
  hp?: string;
  types?: string[];
  supertype?: string;
  subtypes?: string[];
  images: {
    small: string;
    large: string;
  };
  tcgplayer?: {
    url?: string;
    prices?: Record<string, { market?: number; low?: number; mid?: number; high?: number }>;
  };
}

export interface PokemonTCGResponse {
  data: CardInfo[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

// App state types
export type AppStep = "home" | "capture-front" | "capture-back" | "preview" | "processing" | "results";

export type CardSide = "front" | "back";

export interface CapturedImages {
  front: string | null;
  back: string | null;
}

export interface AppState {
  step: AppStep;
  capturedImages: CapturedImages;
  currentSide: CardSide;
  gradingResult: GradingResult | null;
  error: string | null;
  isLoading: boolean;
}

// Condition to PSA mapping
export const CONDITION_TO_PSA: Record<string, { grade: number; range: string; label: string }> = {
  "Gem Mint": { grade: 10, range: "10", label: "Gem Mint" },
  "Pristine": { grade: 10, range: "10", label: "Gem Mint" },
  "Mint": { grade: 9, range: "9-10", label: "Mint" },
  "Near Mint": { grade: 8, range: "7-8", label: "Near Mint-Mint" },
  "Excellent": { grade: 7, range: "6-7", label: "Excellent-Mint" },
  "Very Good": { grade: 5, range: "5-6", label: "Very Good-Excellent" },
  "Good": { grade: 4, range: "4-5", label: "Good-Very Good" },
  "Fair": { grade: 3, range: "2-3", label: "Fair-Good" },
  "Poor": { grade: 1, range: "1-2", label: "Poor" },
  "Worn": { grade: 2, range: "1-3", label: "Poor-Fair" },
  "Damaged": { grade: 1, range: "1", label: "Poor" },
  "Corner Wear": { grade: 6, range: "5-7", label: "Shows corner wear" },
  "Edge Wear": { grade: 6, range: "5-7", label: "Shows edge wear" },
  "Scratched": { grade: 5, range: "4-6", label: "Surface scratches" },
  "Discolored": { grade: 4, range: "3-5", label: "Discoloration present" },
  "Faded": { grade: 4, range: "3-5", label: "Fading present" },
};

// Get grade color class
export function getGradeColorClass(grade: number): string {
  if (grade >= 10) return "text-emerald-500";
  if (grade >= 9) return "text-green-500";
  if (grade >= 8) return "text-lime-500";
  if (grade >= 7) return "text-yellow-500";
  if (grade >= 6) return "text-amber-500";
  if (grade >= 5) return "text-orange-500";
  if (grade >= 4) return "text-red-500";
  return "text-red-700";
}

// Get grade background color class
export function getGradeBgClass(grade: number): string {
  if (grade >= 10) return "bg-emerald-500";
  if (grade >= 9) return "bg-green-500";
  if (grade >= 8) return "bg-lime-500";
  if (grade >= 7) return "bg-yellow-500";
  if (grade >= 6) return "bg-amber-500";
  if (grade >= 5) return "bg-orange-500";
  if (grade >= 4) return "bg-red-500";
  return "bg-red-700";
}
