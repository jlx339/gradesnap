import { NextRequest, NextResponse } from "next/server";
import { CardInfo } from "@/types";

const POKEMON_TCG_API_URL = "https://api.pokemontcg.io/v2";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ cards: [] });
    }

    // Search Pokemon TCG API
    const response = await fetch(
      `${POKEMON_TCG_API_URL}/cards?q=name:"${encodeURIComponent(query)}*"&pageSize=12&orderBy=-set.releaseDate`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(`Pokemon TCG API error: ${response.status}`);
      return NextResponse.json({ cards: [], error: "Search failed" });
    }

    const data = await response.json();
    const cards: CardInfo[] = (data.data || []).map((card: CardInfo) => ({
      id: card.id,
      name: card.name,
      number: card.number,
      set: {
        id: card.set.id,
        name: card.set.name,
        series: card.set.series,
        releaseDate: card.set.releaseDate,
        printedTotal: card.set.printedTotal,
      },
      rarity: card.rarity,
      images: card.images,
      tcgplayer: card.tcgplayer,
    }));

    return NextResponse.json({ cards });
  } catch (error) {
    console.error("Card search error:", error);
    return NextResponse.json({ cards: [], error: "Search failed" });
  }
}
