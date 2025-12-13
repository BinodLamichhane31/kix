// Currency utility for Nepali Rupee (NPR)
// Conversion rate: 1 USD = 133 NPR (approximate rate)

const USD_TO_NPR_RATE = 133;

/**
 * Convert USD price to NPR
 * @param {number} usdPrice - Price in USD
 * @returns {number} - Price in NPR (rounded to nearest integer)
 */
export function convertUSDToNPR(usdPrice) {
  return Math.round(usdPrice * USD_TO_NPR_RATE);
}

/**
 * Format price in Nepali Rupee
 * @param {number} price - Price in NPR
 * @param {boolean} showDecimals - Whether to show decimal places (default: false for NPR)
 * @returns {string} - Formatted price string
 */
export function formatNPR(price, showDecimals = false) {
  if (price === null || price === undefined) return 'N/A';
  
  const formattedPrice = showDecimals 
    ? price.toLocaleString('en-NP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : Math.round(price).toLocaleString('en-NP');
  
  return `₨${formattedPrice}`;
}

/**
 * Format price with conversion from USD to NPR
 * @param {number} usdPrice - Price in USD
 * @param {boolean} showDecimals - Whether to show decimal places
 * @returns {string} - Formatted price in NPR
 */
export function formatPrice(usdPrice, showDecimals = false) {
  if (usdPrice === null || usdPrice === undefined) return 'N/A';
  const nprPrice = convertUSDToNPR(usdPrice);
  return formatNPR(nprPrice, showDecimals);
}

