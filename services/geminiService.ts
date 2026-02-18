import { fetchStrategy } from './aiService';

/**
 * Legacy service alias to prevent broken imports and fix "BACKEND_OFFLINE" errors.
 * Now routes directly to the SDK-based aiService.
 */
export const analyzePriceStrategy = async (
  skuDescription: string,
  retailPrice: number,
  anchorBand: { lower: number; upper: number; median: number; brand: string },
  market: string
) => {
  // Mapping legacy parameters to the new payload format
  const result = await fetchStrategy({
    sku_name: skuDescription,
    country: market,
    cost: 0, // Not available in legacy call, but handled by new aiService
    sell_in: 0,
    retail_price: retailPrice,
    anchor_brand: anchorBand.brand,
    anchor_median: anchorBand.median,
    anchor_lower: anchorBand.lower,
    anchor_upper: anchorBand.upper,
    distributor_margin: 0.20,
    retailer_margin: 0.35
  });

  return result.strategy_text;
};
