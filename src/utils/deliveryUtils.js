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
 * Validates delivery settings for Super Admin configuration.
 * Enforces positive integer block sizes, non-negative charges, and checks required fields before enabling.
 */
export const validateDeliverySettings = (settings) => {
    if (!settings || typeof settings !== 'object') {
        return { isValid: false, error: 'Invalid delivery settings object.' };
    }

    // Default rate validation
    if (settings.defaultRate !== undefined && settings.defaultRate !== null && settings.defaultRate !== '') {
        const def = Number(settings.defaultRate);
        if (isNaN(def) || def < 0) {
            return { isValid: false, error: 'Default delivery rate must be a non-negative amount (₹0 or higher).' };
        }
    }

    // Free delivery thresholds validation
    if (settings.jewelsFreeDeliveryThreshold !== undefined && settings.jewelsFreeDeliveryThreshold !== null && settings.jewelsFreeDeliveryThreshold !== '') {
        const jt = Number(settings.jewelsFreeDeliveryThreshold);
        if (isNaN(jt) || jt < 0) {
            return { isValid: false, error: 'Jewellery free delivery threshold must be a non-negative amount.' };
        }
    }
    if (settings.drapesFreeDeliveryThreshold !== undefined && settings.drapesFreeDeliveryThreshold !== null && settings.drapesFreeDeliveryThreshold !== '') {
        const dt = Number(settings.drapesFreeDeliveryThreshold);
        if (isNaN(dt) || dt < 0) {
            return { isValid: false, error: 'Saree free delivery threshold must be a non-negative amount.' };
        }
    }

    // Signature Sarees Quantity Delivery Settings Validation
    const sq = settings.sareeQuantityDelivery;
    if (sq) {
        if (sq.blockSize !== undefined && sq.blockSize !== null && sq.blockSize !== '') {
            const bs = Number(sq.blockSize);
            if (!Number.isInteger(bs) || bs <= 0) {
                return {
                    isValid: false,
                    error: 'Sarees per delivery block must be a positive whole number (e.g. 5). Zero, negative, and fractional values are not permitted.'
                };
            }
        } else if (sq.isEnabled) {
            return {
                isValid: false,
                error: 'Sarees per delivery block must be configured before enabling quantity delivery.'
            };
        }

        if (sq.chargePerBlock !== undefined && sq.chargePerBlock !== null && sq.chargePerBlock !== '') {
            const cp = Number(sq.chargePerBlock);
            if (isNaN(cp) || cp < 0) {
                return {
                    isValid: false,
                    error: 'Additional delivery charge per saree block must be a non-negative amount (₹0 or greater).'
                };
            }
        } else if (sq.isEnabled) {
            return {
                isValid: false,
                error: 'Additional delivery charge per saree block must be configured before enabling quantity delivery.'
            };
        }

        // When enabling, ensure both are valid
        if (sq.isEnabled) {
            const bs = Number(sq.blockSize);
            const cp = Number(sq.chargePerBlock);
            if (!Number.isInteger(bs) || bs <= 0 || isNaN(cp) || cp < 0) {
                return {
                    isValid: false,
                    error: 'Valid sarees per block (> 0) and additional charge (>= 0) are required to enable Signature Sarees quantity delivery.'
                };
            }
        }
    }

    // Narayani Gallery Quantity Delivery Settings Validation
    const jq = settings.jewelsQuantityDelivery;
    if (jq) {
        if (jq.blockSize !== undefined && jq.blockSize !== null && jq.blockSize !== '') {
            const bs = Number(jq.blockSize);
            if (!Number.isInteger(bs) || bs <= 0) {
                return {
                    isValid: false,
                    error: 'Jewellery units per delivery block must be a positive whole number (e.g. 3). Zero, negative, and fractional values are not permitted.'
                };
            }
        } else if (jq.isEnabled) {
            return {
                isValid: false,
                error: 'Jewellery units per delivery block must be configured before enabling quantity delivery.'
            };
        }

        if (jq.chargePerBlock !== undefined && jq.chargePerBlock !== null && jq.chargePerBlock !== '') {
            const cp = Number(jq.chargePerBlock);
            if (isNaN(cp) || cp < 0) {
                return {
                    isValid: false,
                    error: 'Additional delivery charge per jewellery block must be a non-negative amount (₹0 or greater).'
                };
            }
        } else if (jq.isEnabled) {
            return {
                isValid: false,
                error: 'Additional delivery charge per jewellery block must be configured before enabling quantity delivery.'
            };
        }

        // When enabling, ensure both are valid
        if (jq.isEnabled) {
            const bs = Number(jq.blockSize);
            const cp = Number(jq.chargePerBlock);
            if (!Number.isInteger(bs) || bs <= 0 || isNaN(cp) || cp < 0) {
                return {
                    isValid: false,
                    error: 'Valid jewellery units per block (> 0) and additional charge (>= 0) are required to enable Narayani Gallery quantity delivery.'
                };
            }
        }
    }

    // State rates validation
    if (settings.stateRates && typeof settings.stateRates === 'object') {
        for (const [st, val] of Object.entries(settings.stateRates)) {
            if (val !== undefined && val !== null && val !== '') {
                const num = Number(val);
                if (isNaN(num) || num < 0) {
                    return { isValid: false, error: `Delivery charge for ${st} must be a non-negative number.` };
                }
            }
        }
    }

    return { isValid: true };
};

/**
 * Calculates delivery charge based on state base delivery, quantity-based surcharges, and thresholds.
 * - Empty cart: ₹0.
 * - Single base charge applied once per order (including mixed carts).
 * - Saree quantity surcharge applies for blocks after the first.
 * - Jewellery quantity surcharge applies for blocks after the first.
 * - Preserves existing state rates, free delivery thresholds, and default fallback.
 */
export const calculateDeliveryCharge = (stateName, subtotal = 0, deliverySettings = {}, cartItems = []) => {
    const isEnabled = deliverySettings?.isEnabled !== false;
    if (!isEnabled) {
        return {
            charge: 0,
            baseCharge: 0,
            effectiveBaseCharge: 0,
            isBaseFree: true,
            isFree: true,
            reason: 'Delivery charges disabled',
            tipMessage: '',
            jewelsSubtotal: 0,
            drapesSubtotal: 0,
            sareeCount: 0,
            sareeBlockSize: 0,
            sareeAddlBlocks: 0,
            sareeSurcharge: 0,
            sareeSurchargeWaived: false,
            sareeSurchargeEnabled: false,
            jewelsCount: 0,
            jewelsBlockSize: 0,
            jewelsAddlBlocks: 0,
            jewelsSurcharge: 0,
            jewelsSurchargeWaived: false,
            jewelsSurchargeEnabled: false
        };
    }

    // Calculate product unit quantities and store-specific subtotals
    let sareeCount = 0;
    let jewelsCount = 0;
    let sareeSubtotal = 0;
    let jewelsSubtotal = 0;

    if (Array.isArray(cartItems) && cartItems.length > 0) {
        cartItems.forEach(item => {
            const price = Number(item.price) || 0;
            const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
            const line = price * qty;
            const store = item.store || resolveProductStore(item);
            if (store === 'drapes') {
                sareeCount += qty;
                sareeSubtotal += line;
            } else {
                jewelsCount += qty;
                jewelsSubtotal += line;
            }
        });
    } else {
        jewelsSubtotal = Number(subtotal) || 0;
    }

    const totalUnits = sareeCount + jewelsCount;
    const hasSarees = sareeCount > 0 || sareeSubtotal > 0;
    const hasJewels = jewelsCount > 0 || jewelsSubtotal > 0;

    // Empty cart incurs no delivery charges
    if ((!cartItems || cartItems.length === 0 || totalUnits === 0) && Number(subtotal) === 0) {
        return {
            charge: 0,
            baseCharge: 0,
            effectiveBaseCharge: 0,
            isBaseFree: true,
            isFree: true,
            reason: 'Empty cart',
            tipMessage: '',
            state: stateName || '',
            jewelsSubtotal: 0,
            drapesSubtotal: 0,
            sareeCount: 0,
            sareeBlockSize: 0,
            sareeAddlBlocks: 0,
            sareeSurcharge: 0,
            sareeSurchargeWaived: false,
            sareeSurchargeEnabled: false,
            jewelsCount: 0,
            jewelsBlockSize: 0,
            jewelsAddlBlocks: 0,
            jewelsSurcharge: 0,
            jewelsSurchargeWaived: false,
            jewelsSurchargeEnabled: false
        };
    }

    // Determine state base delivery charge
    const normalizedState = normalizeIndianState(stateName);
    const rates = deliverySettings?.stateRates || {};
    const defaultRate = typeof deliverySettings?.defaultRate === 'number'
        ? deliverySettings.defaultRate
        : (parseFloat(deliverySettings?.defaultRate) || 100);

    let rawBaseCharge = Math.max(0, defaultRate);
    let isDefaultState = true;

    if (rates[normalizedState] !== undefined && rates[normalizedState] !== null && rates[normalizedState] !== '') {
        rawBaseCharge = Math.max(0, parseFloat(rates[normalizedState]) || 0);
        isDefaultState = false;
    }

    // Configurable thresholds
    const jewelsThreshold = deliverySettings?.jewelsFreeDeliveryThreshold !== undefined
        ? Number(deliverySettings.jewelsFreeDeliveryThreshold)
        : 5000;
    const drapesThreshold = deliverySettings?.drapesFreeDeliveryThreshold !== undefined
        ? Number(deliverySettings.drapesFreeDeliveryThreshold)
        : 10000;
    const globalThreshold = parseFloat(deliverySettings?.freeDeliveryThreshold) || 0;

    // Surcharge configuration
    const sq = deliverySettings?.sareeQuantityDelivery || {};
    const sareeSurchargeEnabled = Boolean(sq.isEnabled);
    const sareeBlockSize = Math.max(1, parseInt(sq.blockSize, 10) || 5);
    const sareeChargePerBlock = Math.max(0, Number(sq.chargePerBlock) || 0);

    let sareeAddlBlocks = 0;
    let rawSareeSurcharge = 0;
    if (sareeSurchargeEnabled && sareeCount > sareeBlockSize) {
        sareeAddlBlocks = Math.ceil((sareeCount - sareeBlockSize) / sareeBlockSize);
        rawSareeSurcharge = sareeAddlBlocks * sareeChargePerBlock;
    }

    const jq = deliverySettings?.jewelsQuantityDelivery || {};
    const jewelsSurchargeEnabled = Boolean(jq.isEnabled);
    const jewelsBlockSize = Math.max(1, parseInt(jq.blockSize, 10) || 3);
    const jewelsChargePerBlock = Math.max(0, Number(jq.chargePerBlock) || 0);

    let jewelsAddlBlocks = 0;
    let rawJewelsSurcharge = 0;
    if (jewelsSurchargeEnabled && jewelsCount > jewelsBlockSize) {
        jewelsAddlBlocks = Math.ceil((jewelsCount - jewelsBlockSize) / jewelsBlockSize);
        rawJewelsSurcharge = jewelsAddlBlocks * jewelsChargePerBlock;
    }

    // Evaluate qualification independently for each store
    const sareeQualifies = hasSarees && drapesThreshold > 0 && sareeSubtotal >= drapesThreshold;
    const jewelsQualifies = hasJewels && jewelsThreshold > 0 && jewelsSubtotal >= jewelsThreshold;
    const globalQualifies = globalThreshold > 0 && Number(subtotal) >= globalThreshold;

    let effectiveBaseCharge = rawBaseCharge;
    let sareeSurcharge = rawSareeSurcharge;
    let jewelsSurcharge = rawJewelsSurcharge;
    let sareeSurchargeWaived = false;
    let jewelsSurchargeWaived = false;
    let isBaseFree = false;
    let freeReason = '';
    let tipMessage = '';

    if (globalQualifies) {
        // Global threshold met: everything free
        effectiveBaseCharge = 0;
        sareeSurcharge = 0;
        jewelsSurcharge = 0;
        sareeSurchargeWaived = rawSareeSurcharge > 0;
        jewelsSurchargeWaived = rawJewelsSurcharge > 0;
        isBaseFree = true;
        freeReason = `Free delivery on orders for ₹${globalThreshold.toLocaleString('en-IN')} and above!`;
    } else if (hasSarees && !hasJewels) {
        // Single-store: Saree-only order
        if (sareeQualifies) {
            effectiveBaseCharge = 0;
            sareeSurcharge = 0;
            sareeSurchargeWaived = rawSareeSurcharge > 0;
            isBaseFree = true;
            freeReason = `Free delivery unlocked on Signature Sarees for ₹${drapesThreshold.toLocaleString('en-IN')} and above!`;
        } else {
            effectiveBaseCharge = rawBaseCharge;
            sareeSurcharge = rawSareeSurcharge;
            if (drapesThreshold > 0) {
                const diff = drapesThreshold - sareeSubtotal;
                tipMessage = `Add ₹${diff.toFixed(2)} more in Signature Sarees to unlock Free Delivery!`;
            }
        }
    } else if (hasJewels && !hasSarees) {
        // Single-store: Jewellery-only order
        if (jewelsQualifies) {
            effectiveBaseCharge = 0;
            jewelsSurcharge = 0;
            jewelsSurchargeWaived = rawJewelsSurcharge > 0;
            isBaseFree = true;
            freeReason = `Free delivery unlocked on Narayani Gallery for ₹${jewelsThreshold.toLocaleString('en-IN')} and above!`;
        } else {
            effectiveBaseCharge = rawBaseCharge;
            jewelsSurcharge = rawJewelsSurcharge;
            if (jewelsThreshold > 0) {
                const diff = jewelsThreshold - jewelsSubtotal;
                tipMessage = `Add ₹${diff.toFixed(2)} more in Narayani Gallery to unlock Free Delivery!`;
            }
        }
    } else if (hasSarees && hasJewels) {
        // Mixed-store order: evaluate each store independently
        if (sareeQualifies && jewelsQualifies) {
            effectiveBaseCharge = 0;
            sareeSurcharge = 0;
            jewelsSurcharge = 0;
            sareeSurchargeWaived = rawSareeSurcharge > 0;
            jewelsSurchargeWaived = rawJewelsSurcharge > 0;
            isBaseFree = true;
            freeReason = `Free delivery unlocked on entire order (Narayani Gallery ₹${jewelsThreshold.toLocaleString('en-IN')} and above & Signature Sarees ₹${drapesThreshold.toLocaleString('en-IN')} and above)!`;
        } else if (sareeQualifies && !jewelsQualifies) {
            // Only Sarees qualify: waive saree surcharge, retain base charge once + jewels surcharge
            effectiveBaseCharge = rawBaseCharge;
            sareeSurcharge = 0;
            sareeSurchargeWaived = rawSareeSurcharge > 0;
            jewelsSurcharge = rawJewelsSurcharge;
            isBaseFree = false;
            freeReason = `Signature Sarees delivery surcharge waived (₹${drapesThreshold.toLocaleString('en-IN')} and above). Base delivery applies.`;
            const jewelDiff = jewelsThreshold - jewelsSubtotal;
            tipMessage = `Add ₹${jewelDiff.toFixed(2)} more in Narayani Gallery to unlock Free Delivery on entire order!`;
        } else if (!sareeQualifies && jewelsQualifies) {
            // Only Jewellery qualifies: waive jewels surcharge, retain base charge once + saree surcharge
            effectiveBaseCharge = rawBaseCharge;
            jewelsSurcharge = 0;
            jewelsSurchargeWaived = rawJewelsSurcharge > 0;
            sareeSurcharge = rawSareeSurcharge;
            isBaseFree = false;
            freeReason = `Narayani Gallery delivery surcharge waived (₹${jewelsThreshold.toLocaleString('en-IN')} and above). Base delivery applies.`;
            const sareeDiff = drapesThreshold - sareeSubtotal;
            tipMessage = `Add ₹${sareeDiff.toFixed(2)} more in Signature Sarees to unlock Free Delivery on entire order!`;
        } else {
            // Neither qualifies: retain base charge once + both surcharges
            effectiveBaseCharge = rawBaseCharge;
            sareeSurcharge = rawSareeSurcharge;
            jewelsSurcharge = rawJewelsSurcharge;
            isBaseFree = false;
            const sareeDiff = drapesThreshold - sareeSubtotal;
            const jewelDiff = jewelsThreshold - jewelsSubtotal;
            tipMessage = `Add ₹${sareeDiff.toFixed(2)} in Signature Sarees OR ₹${jewelDiff.toFixed(2)} in Narayani Gallery to unlock Free Delivery!`;
        }
    }

    const totalDeliveryCharge = effectiveBaseCharge + sareeSurcharge + jewelsSurcharge;

    return {
        charge: totalDeliveryCharge,
        baseCharge: rawBaseCharge,
        effectiveBaseCharge,
        isBaseFree,
        isFree: totalDeliveryCharge === 0,
        state: normalizedState || 'Unspecified',
        isDefaultState,
        reason: freeReason,
        tipMessage,

        // Saree quantity details
        sareeCount,
        sareeBlockSize: sareeSurchargeEnabled ? sareeBlockSize : 0,
        sareeAddlBlocks,
        sareeSurcharge,
        rawSareeSurcharge,
        sareeSurchargeWaived,
        sareeSurchargeEnabled,
        sareeChargePerBlock,
        sareeQualifies,

        // Jewellery quantity details
        jewelsCount,
        jewelsBlockSize: jewelsSurchargeEnabled ? jewelsBlockSize : 0,
        jewelsAddlBlocks,
        jewelsSurcharge,
        rawJewelsSurcharge,
        jewelsSurchargeWaived,
        jewelsSurchargeEnabled,
        jewelsChargePerBlock,
        jewelsQualifies,

        // Subtotals & Thresholds
        jewelsSubtotal,
        drapesSubtotal: sareeSubtotal,
        jewelsThreshold,
        drapesThreshold
    };
};

/**
 * Default initial state rates and delivery configuration.
 * Independent quantity delivery settings for sarees and jewellery are disabled by default.
 */
export const INITIAL_DELIVERY_SETTINGS = {
    isEnabled: true,
    defaultRate: 100, // Explicit default delivery charge for states without a configured rate
    freeDeliveryThreshold: 0, // Global threshold (0 = disabled)
    jewelsFreeDeliveryThreshold: 5000, // Free delivery for Jewellery above ₹5,000
    drapesFreeDeliveryThreshold: 10000, // Free delivery for Sarees above ₹10,000
    // Signature Sarees Quantity-based Delivery (independent, disabled initially)
    sareeQuantityDelivery: {
        isEnabled: false,
        blockSize: 5,
        chargePerBlock: 50
    },
    // Narayani Gallery Quantity-based Delivery (independent, disabled initially)
    jewelsQuantityDelivery: {
        isEnabled: false,
        blockSize: 3,
        chargePerBlock: 30
    },
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
