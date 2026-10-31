import { resolveProductStore } from './storeConstants.js';
// Canonical list of all 28 Indian States and 8 Union Territories
export const INDIAN_STATES_AND_UTS = [
    // 28 States
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",

    // 8 Union Territories
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry"
];

// Common variations and abbreviations mapped to canonical state names
const STATE_ALIAS_MAP = {
    "tn": "Tamil Nadu",
    "tamilnadu": "Tamil Nadu",
    "tamil nadu": "Tamil Nadu",
    "kl": "Kerala",
    "kerala": "Kerala",
    "ka": "Karnataka",
    "karnataka": "Karnataka",
    "ap": "Andhra Pradesh",
    "andhra": "Andhra Pradesh",
    "ts": "Telangana",
    "telangana": "Telangana",
    "mh": "Maharashtra",
    "maharashtra": "Maharashtra",
    "dl": "Delhi",
    "new delhi": "Delhi",
    "nct of delhi": "Delhi",
    "delhi ncr": "Delhi",
    "wb": "West Bengal",
    "west bengal": "West Bengal",
    "bengal": "West Bengal",
    "orissa": "Odisha",
    "odisha": "Odisha",
    "py": "Puducherry",
    "pondicherry": "Puducherry",
    "puducherry": "Puducherry",
    "up": "Uttar Pradesh",
    "uttar pradesh": "Uttar Pradesh",
    "uk": "Uttarakhand",
    "uttarakhand": "Uttarakhand",
    "uttaranchal": "Uttarakhand",
    "mp": "Madhya Pradesh",
    "madhya pradesh": "Madhya Pradesh",
    "gujarat": "Gujarat",
    "gj": "Gujarat",
    "rajasthan": "Rajasthan",
    "rj": "Rajasthan",
    "punjab": "Punjab",
    "pb": "Punjab",
    "haryana": "Haryana",
    "hr": "Haryana",
    "bihar": "Bihar",
    "br": "Bihar",
    "assam": "Assam",
    "as": "Assam",
    "goa": "Goa",
    "ga": "Goa",
    "jharkhand": "Jharkhand",
    "jh": "Jharkhand",
    "chhattisgarh": "Chhattisgarh",
    "cg": "Chhattisgarh",
    "himachal": "Himachal Pradesh",
    "himachal pradesh": "Himachal Pradesh",
    "hp": "Himachal Pradesh",
    "jammu": "Jammu and Kashmir",
    "kashmir": "Jammu and Kashmir",
    "j&k": "Jammu and Kashmir",
    "jammu and kashmir": "Jammu and Kashmir",
    "jk": "Jammu and Kashmir",
    "chandigarh": "Chandigarh",
    "ch": "Chandigarh",
    "tripura": "Tripura",
    "tr": "Tripura",
    "meghalaya": "Meghalaya",
    "ml": "Meghalaya",
    "manipur": "Manipur",
    "mn": "Manipur",
    "mizoram": "Mizoram",
    "mz": "Mizoram",
    "nagaland": "Nagaland",
    "nl": "Nagaland",
    "arunachal": "Arunachal Pradesh",
    "arunachal pradesh": "Arunachal Pradesh",
    "ar": "Arunachal Pradesh",
    "sikkim": "Sikkim",
    "sk": "Sikkim",
    "ladakh": "Ladakh",
    "la": "Ladakh",
    "lakshadweep": "Lakshadweep",
    "ld": "Lakshadweep",
    "andaman": "Andaman and Nicobar Islands",
    "andaman & nicobar": "Andaman and Nicobar Islands",
    "andaman and nicobar islands": "Andaman and Nicobar Islands",
    "an": "Andaman and Nicobar Islands",
    "daman": "Dadra and Nagar Haveli and Daman and Diu",
    "diu": "Dadra and Nagar Haveli and Daman and Diu",
    "dadra": "Dadra and Nagar Haveli and Daman and Diu",
    "dadra and nagar haveli and daman and diu": "Dadra and Nagar Haveli and Daman and Diu"
};

/**
 * Normalizes any freeform or selected state string to a canonical Indian state name.
 */
export const normalizeIndianState = (rawState) => {
    if (!rawState || typeof rawState !== 'string') return '';
    const clean = rawState.trim().toLowerCase().replace(/[^a-z0-9& ]/g, '');

    // Direct alias check
    if (STATE_ALIAS_MAP[clean]) {
        return STATE_ALIAS_MAP[clean];
    }

    // Exact case-insensitive match against canonical list
    const exactMatch = INDIAN_STATES_AND_UTS.find(
        s => s.toLowerCase() === clean
    );
    if (exactMatch) return exactMatch;

    // Substring or fuzzy check
    const partialMatch = INDIAN_STATES_AND_UTS.find(
        s => clean.includes(s.toLowerCase()) || s.toLowerCase().includes(clean)
    );
    if (partialMatch) return partialMatch;

    // Return original trimmed if unrecognized
    return rawState.trim();
};

/**
 * Calculates delivery charge based on state, subtotal, and Super Admin delivery settings.
 * Ensures that ₹0 is distinguished from unset.
 * Tamil Nadu or any other state rate is retrieved dynamically from configuration, never hardcoded.
 */
export const calculateDeliveryCharge = (stateName, subtotal = 0, deliverySettings = {}, cartItems = []) => {
    const isEnabled = deliverySettings?.isEnabled !== false;
    if (!isEnabled) {
        return {
            charge: 0,
            isFree: true,
            reason: 'Delivery charges disabled',
            tipMessage: '',
            jewelsSubtotal: 0,
            drapesSubtotal: 0
        };
    }

    // Configurable thresholds with requested defaults: 5000 for jewels, 1000 for sarees
    const jewelsThreshold = deliverySettings?.jewelsFreeDeliveryThreshold !== undefined
        ? Number(deliverySettings.jewelsFreeDeliveryThreshold)
        : 5000;
    const drapesThreshold = deliverySettings?.drapesFreeDeliveryThreshold !== undefined
        ? Number(deliverySettings.drapesFreeDeliveryThreshold)
        : 10000;
    const globalThreshold = parseFloat(deliverySettings?.freeDeliveryThreshold) || 0;

    // Calculate store-specific subtotals from cart items
    let jewelsSubtotal = 0;
    let drapesSubtotal = 0;

    if (Array.isArray(cartItems) && cartItems.length > 0) {
        cartItems.forEach(item => {
            const price = Number(item.price) || 0;
            const qty = Number(item.quantity) || 1;
            const line = price * qty;
            const store = item.store || resolveProductStore(item);
            if (store === 'drapes') {
                drapesSubtotal += line;
            } else {
                jewelsSubtotal += line;
            }
        });
    } else {
        // Fallback if cartItems not provided
        jewelsSubtotal = subtotal;
    }

    const hasJewels = jewelsSubtotal > 0;
    const hasDrapes = drapesSubtotal > 0;

    // Check free delivery qualification:
    // 1. Sarees >= 1000
    // 2. Jewels >= 5000
    // 3. Global threshold if configured
    let isFree = false;
    let reason = '';
    let tipMessage = '';

    if (globalThreshold > 0 && subtotal >= globalThreshold) {
        isFree = true;
        reason = `Free delivery on orders above ₹${globalThreshold}`;
    } else if (hasDrapes && !hasJewels) {
        // Cart with ONLY Sarees
        if (drapesThreshold > 0 && drapesSubtotal >= drapesThreshold) {
            isFree = true;
            reason = `Free delivery unlocked on Sarees above ₹${drapesThreshold.toLocaleString('en-IN')}!`;
        } else if (drapesThreshold > 0) {
            const diff = drapesThreshold - drapesSubtotal;
            tipMessage = `Add ₹${diff.toFixed(2)} more in Sarees to unlock Free Delivery!`;
        }
    } else if (hasJewels && !hasDrapes) {
        // Cart with ONLY Jewellery
        if (jewelsThreshold > 0 && jewelsSubtotal >= jewelsThreshold) {
            isFree = true;
            reason = `Free delivery unlocked on Jewellery above ₹${jewelsThreshold.toLocaleString('en-IN')}!`;
        } else if (jewelsThreshold > 0) {
            const diff = jewelsThreshold - jewelsSubtotal;
            tipMessage = `Add ₹${diff.toFixed(2)} more in Jewellery to unlock Free Delivery!`;
        }
    } else if (hasJewels && hasDrapes) {
        // Mixed Cart with BOTH Jewellery and Sarees
        const drapesQualifies = drapesThreshold > 0 && drapesSubtotal >= drapesThreshold;
        const jewelsQualifies = jewelsThreshold > 0 && jewelsSubtotal >= jewelsThreshold;

        if (drapesQualifies || jewelsQualifies) {
            isFree = true;
            if (drapesQualifies && jewelsQualifies) {
                reason = `Free delivery unlocked (Jewellery above ₹${jewelsThreshold.toLocaleString('en-IN')} & Sarees above ₹${drapesThreshold.toLocaleString('en-IN')})!`;
            } else if (drapesQualifies) {
                reason = `Free delivery unlocked (Sarees portion above ₹${drapesThreshold.toLocaleString('en-IN')})!`;
            } else {
                reason = `Free delivery unlocked (Jewellery portion above ₹${jewelsThreshold.toLocaleString('en-IN')})!`;
            }
        } else {
            const sareeDiff = drapesThreshold - drapesSubtotal;
            const jewelDiff = jewelsThreshold - jewelsSubtotal;
            tipMessage = `Add ₹${sareeDiff.toFixed(2)} in Sarees OR ₹${jewelDiff.toFixed(2)} in Jewels to unlock Free Delivery!`;
        }
    }

    if (isFree) {
        return {
            charge: 0,
            isFree: true,
            reason,
            tipMessage: '',
            jewelsSubtotal,
            drapesSubtotal,
            jewelsThreshold,
            drapesThreshold
        };
    }

    // If not free, calculate configured state rate
    const normalizedState = normalizeIndianState(stateName);
    const rates = deliverySettings?.stateRates || {};
    const defaultRate = typeof deliverySettings?.defaultRate === 'number' 
        ? deliverySettings.defaultRate 
        : (parseFloat(deliverySettings?.defaultRate) || 100);

    // If the state rate is explicitly configured (including explicitly ₹0)
    if (rates[normalizedState] !== undefined && rates[normalizedState] !== null && rates[normalizedState] !== '') {
        const configuredRate = Math.max(0, parseFloat(rates[normalizedState]) || 0);
        return {
            charge: configuredRate,
            isFree: configuredRate === 0,
            state: normalizedState,
            isDefault: false,
            tipMessage,
            jewelsSubtotal,
            drapesSubtotal,
            jewelsThreshold,
            drapesThreshold
        };
    }

    // Fall back to the explicitly configured default rate
    return {
        charge: Math.max(0, defaultRate),
        isFree: defaultRate === 0,
        state: normalizedState || 'Unspecified',
        isDefault: true,
        tipMessage,
        jewelsSubtotal,
        drapesSubtotal,
        jewelsThreshold,
        drapesThreshold
    };
};

/**
 * Default initial state rates if super admin hasn't configured them yet.
 * Can be customized by super admin at any time.
 */
export const INITIAL_DELIVERY_SETTINGS = {
    isEnabled: true,
    defaultRate: 100, // Explicit default delivery charge for states without a configured rate
    freeDeliveryThreshold: 0, // Global threshold (0 = disabled)
    jewelsFreeDeliveryThreshold: 5000, // Free delivery for Jewellery above ₹5,000
    drapesFreeDeliveryThreshold: 10000, // Free delivery for Sarees above ₹10,000
    stateRates: {
        "Tamil Nadu": 60,
        "Puducherry": 60,
        "Kerala": 80,
        "Karnataka": 80,
        "Andhra Pradesh": 80,
        "Telangana": 80,
        "Maharashtra": 100,
        "Goa": 100,
        "Delhi": 120,
        "Gujarat": 120,
        "Rajasthan": 120,
        "Uttar Pradesh": 120,
        "West Bengal": 120,
        "Madhya Pradesh": 120,
        "Bihar": 130,
        "Odisha": 130,
        "Punjab": 130,
        "Haryana": 130,
        "Himachal Pradesh": 140,
        "Uttarakhand": 140,
        "Assam": 150,
        "Jharkhand": 130,
        "Chhattisgarh": 130,
        "Jammu and Kashmir": 150,
        "Ladakh": 160,
        "Sikkim": 150,
        "Manipur": 160,
        "Meghalaya": 160,
        "Mizoram": 160,
        "Nagaland": 160,
        "Tripura": 160,
        "Arunachal Pradesh": 160,
        "Chandigarh": 120,
        "Dadra and Nagar Haveli and Daman and Diu": 120,
        "Lakshadweep": 170,
        "Andaman and Nicobar Islands": 180
    }
};
