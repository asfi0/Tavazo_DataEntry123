
import { GoogleGenAI } from "@google/genai";

export interface StrategyPayload {
  sku_name: string;
  country: string;
  cost: number;
  sell_in: number;
  retail_price: number;
  anchor_brand: string;
  anchor_median: number;
  anchor_lower: number;
  anchor_upper: number;
  distributor_margin: number;
  retailer_margin: number;
}

export async function fetchStrategy(payload: StrategyPayload) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      You are a Senior EU VAT Compliance Architect and FMCG Pricing Strategist for TAVAAZO.
      Analyze this pricing data for SKU: "${payload.sku_name}" in market: "${payload.country}".
      
      FINANCIAL ARCHITECTURE:
      - Unit Net Cost: €${payload.cost.toFixed(4)}
      - Proposed Sell-in (TAVAAZO to Distributor): €${payload.sell_in.toFixed(2)}
      - Final Consumer SRP (Incl. VAT): €${payload.retail_price.toFixed(2)}
      
      MARKET BENCHMARK (Anchor: ${payload.anchor_brand}):
      - Anchor Median SRP (Incl. VAT): €${payload.anchor_median.toFixed(2)}
      - Anchor Band: €${payload.anchor_lower.toFixed(2)} - €${payload.anchor_upper.toFixed(2)}
      
      VALUE CHAIN TARGETS:
      - Distributor Target Margin: ${(payload.distributor_margin * 100).toFixed(0)}%
      - Retailer Target Margin: ${(payload.retailer_margin * 100).toFixed(0)}%
      
      TASK:
      1. Evaluate if the Brand Margin is sustainable after accounting for EU VAT obligations.
      2. Analyze the retail competitiveness against the anchor median.
      3. Provide a tactical "Tax-Smart" recommendation (Max 3 sentences).
      4. Use a decisive, senior executive tone.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.1,
      }
    });

    return {
      strategy_text: response.text || "Compliance check complete. Maintain current tax-neutral positioning.",
      model_used: "gemini-3-flash-preview"
    };
  } catch (error) {
    console.error("Gemini SDK Error:", error);
    throw new Error("AI_SDK_OFFLINE: Could not reach Gemini API.");
  }
}
