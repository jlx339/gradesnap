import { NextRequest, NextResponse } from "next/server";
import { CardInfo } from "@/types";

const XIMILAR_API_URL = "https://api.ximilar.com/collectibles/v2/tcg_id";

interface XimilarCardMatch {
  name: string;
  year?: number;
  set: string;
  set_code: string;
  card_number: string;
  out_of?: string;
  rarity?: string;
  series?: string;
  full_name?: string;
  subcategory?: string;
  color?: string;
  type?: string;
  links?: {
    "tcgplayer.com"?: string;
    "ebay.com"?: string;
  };
}

interface XimilarIdentification {
  best_match?: XimilarCardMatch;
  alternatives?: XimilarCardMatch[];
}

interface XimilarObject {
  name: string;
  _tags?: {
    Subcategory?: Array<{ name: string; prob: number }>;
    Category?: Array<{ name: string; prob: number }>;
  };
  _identification?: XimilarIdentification;
}

interface XimilarRecord {
  _objects?: XimilarObject[];
  _status?: { code: number; text: string };
}

interface XimilarResponse {
  records: XimilarRecord[];
  status: { code: number; text: string };
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

    const apiToken = process.env.XIMILAR_API_TOKEN;
    
    if (!apiToken) {
      // Return gracefully if no API token configured
      return NextResponse.json({
        success: false,
        error: "Card identification not configured",
      });
    }

    // Remove data URL prefix for base64
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    const response = await fetch(XIMILAR_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${apiToken}`,
      },
      body: JSON.stringify({
        records: [{ _base64: base64Data }],
      }),
    });

    if (!response.ok) {
      console.error(`Ximilar API error: ${response.status}`);
      return NextResponse.json({
        success: false,
        error: "Card identification service unavailable",
      });
    }

    const data: XimilarResponse = await response.json();

    // Find the card object in the response
    const cardObject = data.records[0]?._objects?.find(
      obj => obj.name === "Card" && obj._identification?.best_match
    );

    if (!cardObject || !cardObject._identification?.best_match) {
      return NextResponse.json({
        success: false,
        error: "Could not identify card from image",
      });
    }

    const match = cardObject._identification.best_match;

    // Map Ximilar response to our CardInfo format
    const cardInfo: CardInfo = {
      id: `${match.set_code}-${match.card_number}`.toLowerCase(),
      name: match.name,
      number: match.card_number,
      set: {
        id: match.set_code.toLowerCase(),
        name: match.set,
        series: match.series || "",
        releaseDate: match.year ? `${match.year}-01-01` : undefined,
        printedTotal: match.out_of ? parseInt(match.out_of) : undefined,
      },
      rarity: match.rarity,
      images: {
        small: "", // Ximilar doesn't provide images
        large: "",
      },
      tcgplayer: match.links?.["tcgplayer.com"] 
        ? { url: match.links["tcgplayer.com"] } 
        : undefined,
    };

    return NextResponse.json({
      success: true,
      card: cardInfo,
      fullName: match.full_name,
      year: match.year,
      alternatives: cardObject._identification.alternatives?.slice(0, 3).map(alt => ({
        name: alt.name,
        set: alt.set,
        number: alt.card_number,
        year: alt.year,
      })),
    });
  } catch (error) {
    console.error("Card identification error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to identify card",
    });
  }
}
