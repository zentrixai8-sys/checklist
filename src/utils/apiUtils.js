/**
 * Fetches data from a URL with caching support using localStorage.
 * 
 * @param {string} url - The URL to fetch data from.
 * @param {object} options - Fetch options (method, headers, etc.).
 * @param {string} cacheKey - Unique key to store the response in localStorage.
 * @param {number} ttl - Time to live in milliseconds (default: 1 hour).
 * @returns {Promise<any>} - The JSON response data.
 */
export const fetchWithCache = async (url, options = {}, cacheKey, ttl = 3600000) => {
  if (!cacheKey) {
    console.warn("fetchWithCache: No cacheKey provided, bypassing cache.");
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
    return await response.json();
  }

  const cachedItem = localStorage.getItem(cacheKey);
  if (cachedItem) {
    try {
      const { data, expiry } = JSON.parse(cachedItem);
      if (Date.now() < expiry) {
        console.log(`[Cache Hit] Serving ${cacheKey} from cache.`);
        return data;
      } else {
        console.log(`[Cache Expired] refreshing ${cacheKey}.`);
        localStorage.removeItem(cacheKey);
      }
    } catch (e) {
      console.error("Error parsing cached item:", e);
      localStorage.removeItem(cacheKey);
    }
  }

  console.log(`[API Fetch] Fetching ${cacheKey} from network.`);
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
  
  const data = await response.json();
  
  try {
    const itemToCache = {
      data,
      expiry: Date.now() + ttl,
    };
    localStorage.setItem(cacheKey, JSON.stringify(itemToCache));
  } catch (e) {
    console.warn("Failed to cache data (likely quota exceeded):", e);
  }

  return data;
};

/**
 * Clears a specific cache item.
 * @param {string} cacheKey 
 */
export const clearCache = (cacheKey) => {
  localStorage.removeItem(cacheKey);
};

/**
 * Clears all app-related cache.
 */
export const clearAllCache = () => {
  // clear only keys starting with expected prefixes if needed, 
  // but for now, we might want to be careful not to wipe unrelated data if any.
  // This is a simple implementation.
  Object.keys(localStorage).forEach(key => {
    if (key.includes('_sheet_data') || key.includes('master_data')) {
      localStorage.removeItem(key);
    }
  });
};
