import { CardInfo, PokemonTCGResponse } from "@/types";

const POKEMON_TCG_API_URL = "https://api.pokemontcg.io/v2";

export async function searchCards(query: string): Promise<CardInfo[]> {
  try {
    const response = await fetch(
      `${POKEMON_TCG_API_URL}/cards?q=name:"${encodeURIComponent(query)}"&pageSize=10`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Pokemon TCG API error: ${response.status}`);
    }

    const data: PokemonTCGResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error searching cards:", error);
    throw error;
  }
}

export async function getCardById(cardId: string): Promise<CardInfo | null> {
  try {
    const response = await fetch(`${POKEMON_TCG_API_URL}/cards/${cardId}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Pokemon TCG API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error getting card:", error);
    throw error;
  }
}

export async function getRandomCard(): Promise<CardInfo | null> {
  try {
    // Get a random popular card for demo purposes
    const popularCards = ["base1-4", "base1-2", "neo3-17", "swsh35-44"];
    const randomId = popularCards[Math.floor(Math.random() * popularCards.length)];
    return getCardById(randomId);
  } catch (error) {
    console.error("Error getting random card:", error);
    return null;
  }
}
