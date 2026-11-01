import { calculateDeliveryCharge, INITIAL_DELIVERY_SETTINGS } from '../src/utils/deliveryUtils.js';

const deliverySettings = {
    stateRates: {
        'Tamil Nadu': 100,
        'Kerala': 120,
        'Maharashtra': 150
    },
    defaultRate: 100,
    jewelsFreeDeliveryThreshold: 5000,
    drapesFreeDeliveryThreshold: 10000,
    freeDeliveryThreshold: 0,
    sareeQuantityDelivery: {
        isEnabled: true,
        blockSize: 5,
        chargePerBlock: 50
    },
    jewelsQuantityDelivery: {
        isEnabled: true,
        blockSize: 3,
        chargePerBlock: 30
    }
};

let passedCount = 0;
let totalCount = 0;

function assert(condition, message, details = {}) {
    totalCount++;
    if (!condition) {
        console.error(`❌ FAIL: ${message}`, details);
        process.exit(1);
    } else {
        passedCount++;
        console.log(`✔ PASS: ${message}`);
    }
}

console.log('--- 1. REGRESSION CHECK (Screenshot Scenario) ---');
{
    // Screenshot: 15 sarees at 899 = 13,485 subtotal in Tamil Nadu
    const cart = [{ id: 1, title: 'Silk Saree', price: 899, quantity: 15, store: 'drapes' }];
    const res = calculateDeliveryCharge('Tamil Nadu', 13485, deliverySettings, cart);
    assert(res.charge === 0, 'Screenshot scenario delivery charge must be ₹0', res);
    assert(res.isFree === true, 'Screenshot scenario isFree must be true', res);
    assert((13485 + res.charge) === 13485, 'Screenshot scenario total must be ₹13,485', res);
    assert(res.reason.includes('₹10,000 and above'), 'Reason matches inclusive wording', res);
}

console.log('\n--- 2. STORE 1: SIGNATURE SAREES (Threshold ₹10,000, Block 5, Extra ₹50) ---');
{
    // 2.1 Below threshold
    const cart = [{ id: 1, title: 'Saree', price: 1000, quantity: 4, store: 'drapes' }]; // 4000
    const res = calculateDeliveryCharge('Tamil Nadu', 4000, deliverySettings, cart);
    assert(res.charge === 100, 'Sarees below threshold (4 sarees, ₹4000): base ₹100, 0 surcharge = ₹100', res);
    assert(res.isFree === false, 'isFree false', res);
    assert(res.tipMessage.includes('Add ₹6000.00 more in Signature Sarees to unlock Free Delivery!'), 'Tip message correct', res);
}
{
    // 2.2 Exactly at threshold
    const cart = [{ id: 1, title: 'Saree', price: 1000, quantity: 10, store: 'drapes' }]; // 10000
    const res = calculateDeliveryCharge('Tamil Nadu', 10000, deliverySettings, cart);
    assert(res.charge === 0, 'Sarees exactly at threshold (10 sarees, ₹10,000): delivery ₹0', res);
    assert(res.isFree === true, 'isFree true', res);
    assert(res.sareeSurcharge === 0, 'saree surcharge waived to 0', res);
    assert(res.reason.includes('₹10,000 and above'), 'Reason mentions ₹10,000 and above', res);
}
{
    // 2.3 Above threshold
    const cart = [{ id: 1, title: 'Saree', price: 1000, quantity: 12, store: 'drapes' }]; // 12000
    const res = calculateDeliveryCharge('Tamil Nadu', 12000, deliverySettings, cart);
    assert(res.charge === 0, 'Sarees above threshold (12 sarees, ₹12,000): delivery ₹0', res);
    assert(res.isFree === true, 'isFree true', res);
    assert(res.sareeSurcharge === 0, 'saree surcharge waived to 0', res);
}
{
    // 2.4 Qualifying order large enough to trigger multiple quantity surcharges
    // 25 sarees at ₹500 = ₹12,500. Without free delivery: 25 sarees -> 4 extra blocks * ₹50 = ₹200 surcharge + ₹100 base = ₹300.
    const cart = [{ id: 1, title: 'Saree', price: 500, quantity: 25, store: 'drapes' }];
    const res = calculateDeliveryCharge('Tamil Nadu', 12500, deliverySettings, cart);
    assert(res.charge === 0, 'Large qualifying order (25 sarees): delivery ₹0', res);
    assert(res.isFree === true, 'isFree true', res);
    assert(res.sareeSurcharge === 0, 'saree surcharge waived to 0', res);
}
{
    // 2.5 Removing items so a qualifying order becomes non-qualifying
    // Start: 10 sarees at 1000 = 10000 -> delivery 0
    const cart1 = [{ id: 1, title: 'Saree', price: 1000, quantity: 10, store: 'drapes' }];
    const res1 = calculateDeliveryCharge('Tamil Nadu', 10000, deliverySettings, cart1);
    assert(res1.charge === 0, 'Qualifying 10 sarees -> ₹0', res1);

    // Remove 1 item: 9 sarees at 1000 = 9000 (below threshold). Surcharge for 9 sarees: (9-5)/5 = 1 block * 50 = 50. Total = 100 + 50 = 150.
    const cart2 = [{ id: 1, title: 'Saree', price: 1000, quantity: 9, store: 'drapes' }];
    const res2 = calculateDeliveryCharge('Tamil Nadu', 9000, deliverySettings, cart2);
    assert(res2.charge === 150, 'Non-qualifying 9 sarees -> ₹150 (base 100 + surcharge 50)', res2);
    assert(res2.isFree === false, 'isFree false after item removal', res2);
    assert(res2.tipMessage.includes('Add ₹1000.00 more in Signature Sarees to unlock Free Delivery!'), 'Tip message updated', res2);
}

console.log('\n--- 3. STORE 2: NARAYANI GALLERY (Threshold ₹5,000, Block 3, Extra ₹30) ---');
{
    // 3.1 Below threshold
    const cart = [{ id: 2, title: 'Jewel', price: 1500, quantity: 2, store: 'jewels' }]; // 3000
    const res = calculateDeliveryCharge('Tamil Nadu', 3000, deliverySettings, cart);
    assert(res.charge === 100, 'Jewels below threshold (2 items, ₹3000): base ₹100, 0 surcharge = ₹100', res);
    assert(res.isFree === false, 'isFree false', res);
    assert(res.tipMessage.includes('Add ₹2000.00 more in Narayani Gallery to unlock Free Delivery!'), 'Tip message correct', res);
}
{
    // 3.2 Exactly at threshold
    const cart = [{ id: 2, title: 'Jewel', price: 1000, quantity: 5, store: 'jewels' }]; // 5000
    const res = calculateDeliveryCharge('Tamil Nadu', 5000, deliverySettings, cart);
    assert(res.charge === 0, 'Jewels exactly at threshold (5 items, ₹5,000): delivery ₹0', res);
    assert(res.isFree === true, 'isFree true', res);
    assert(res.jewelsSurcharge === 0, 'jewels surcharge waived to 0', res);
    assert(res.reason.includes('₹5,000 and above'), 'Reason mentions ₹5,000 and above', res);
}
{
    // 3.3 Above threshold
    const cart = [{ id: 2, title: 'Jewel', price: 1000, quantity: 6, store: 'jewels' }]; // 6000
    const res = calculateDeliveryCharge('Tamil Nadu', 6000, deliverySettings, cart);
    assert(res.charge === 0, 'Jewels above threshold (6 items, ₹6,000): delivery ₹0', res);
    assert(res.isFree === true, 'isFree true', res);
    assert(res.jewelsSurcharge === 0, 'jewels surcharge waived to 0', res);
}
{
    // 3.4 Qualifying order large enough to trigger multiple quantity surcharges
    // 12 jewels at ₹500 = ₹6,000. Without free delivery: 12 jewels -> 3 extra blocks * ₹30 = ₹90 surcharge + ₹100 base = ₹190.
    const cart = [{ id: 2, title: 'Jewel', price: 500, quantity: 12, store: 'jewels' }];
    const res = calculateDeliveryCharge('Tamil Nadu', 6000, deliverySettings, cart);
    assert(res.charge === 0, 'Large qualifying jewels order (12 items): delivery ₹0', res);
    assert(res.isFree === true, 'isFree true', res);
    assert(res.jewelsSurcharge === 0, 'jewels surcharge waived to 0', res);
}
{
    // 3.5 Removing items so a qualifying order becomes non-qualifying
    // Start: 5 jewels at 1000 = 5000 -> delivery 0
    const cart1 = [{ id: 2, title: 'Jewel', price: 1000, quantity: 5, store: 'jewels' }];
    const res1 = calculateDeliveryCharge('Tamil Nadu', 5000, deliverySettings, cart1);
    assert(res1.charge === 0, 'Qualifying 5 jewels -> ₹0', res1);

    // Remove 1 item: 4 jewels at 1000 = 4000. Surcharge for 4 items: (4-3)/3 = 1 block * 30 = 30. Total = 100 + 30 = 130.
    const cart2 = [{ id: 2, title: 'Jewel', price: 1000, quantity: 4, store: 'jewels' }];
    const res2 = calculateDeliveryCharge('Tamil Nadu', 4000, deliverySettings, cart2);
    assert(res2.charge === 130, 'Non-qualifying 4 jewels -> ₹130 (base 100 + surcharge 30)', res2);
    assert(res2.isFree === false, 'isFree false after item removal', res2);
    assert(res2.tipMessage.includes('Add ₹1000.00 more in Narayani Gallery to unlock Free Delivery!'), 'Tip message updated', res2);
}

console.log('\n--- 4. MIXED-STORE ORDERS ---');
{
    // 4.1 Neither store qualifies
    // 6 Sarees at 500 = 3000 (< 10000). Surcharge: 1 block * 50 = 50.
    // 4 Jewels at 500 = 2000 (< 5000). Surcharge: 1 block * 30 = 30.
    // Base: 100. Total = 100 + 50 + 30 = 180.
    const cart = [
        { id: 1, title: 'Saree', price: 500, quantity: 6, store: 'drapes' },
        { id: 2, title: 'Jewel', price: 500, quantity: 4, store: 'jewels' }
    ];
    const res = calculateDeliveryCharge('Tamil Nadu', 5000, deliverySettings, cart);
    assert(res.charge === 180, 'Mixed neither qualifies: base 100 + saree surcharge 50 + jewels surcharge 30 = 180', res);
    assert(res.isFree === false, 'isFree false', res);
    assert(res.tipMessage.includes('Add ₹7000.00 in Signature Sarees OR ₹3000.00 in Narayani Gallery'), 'Tip shows both options', res);
}
{
    // 4.2 ONLY Sarees qualify
    // 10 Sarees at 1100 = 11000 (>= 10000, qualifies!). Normal surcharge for 10 sarees would be 1 block * 50 = 50, but waived!
    // 4 Jewels at 500 = 2000 (< 5000, does not qualify). Jewels surcharge = 1 block * 30 = 30.
    // Base charge: 100 (retained). Total = 100 (base) + 0 (sarees waived) + 30 (jewels) = 130.
    const cart = [
        { id: 1, title: 'Saree', price: 1100, quantity: 10, store: 'drapes' },
        { id: 2, title: 'Jewel', price: 500, quantity: 4, store: 'jewels' }
    ];
    const res = calculateDeliveryCharge('Tamil Nadu', 13000, deliverySettings, cart);
    assert(res.charge === 130, 'Mixed only sarees qualify: base 100 + saree 0 (waived) + jewels 30 = 130', res);
    assert(res.isFree === false, 'isFree is false (base + jewels surcharge apply)', res);
    assert(res.reason.includes('Signature Sarees delivery surcharge waived'), 'Reason specifies only sarees waived', res);
    assert(!res.reason.includes('entire order'), 'Does not imply entire order is free', res);
    assert(res.tipMessage.includes('Add ₹3000.00 more in Narayani Gallery to unlock Free Delivery on entire order!'), 'Tip tells how to unlock entire free delivery', res);
}
{
    // 4.3 ONLY Jewellery qualifies
    // 6 Sarees at 500 = 3000 (< 10000, does not qualify). Saree surcharge = 1 block * 50 = 50.
    // 6 Jewels at 1000 = 6000 (>= 5000, qualifies!). Normal surcharge for 6 jewels would be 1 block * 30 = 30, but waived!
    // Base charge: 100 (retained). Total = 100 (base) + 50 (sarees) + 0 (jewels waived) = 150.
    const cart = [
        { id: 1, title: 'Saree', price: 500, quantity: 6, store: 'drapes' },
        { id: 2, title: 'Jewel', price: 1000, quantity: 6, store: 'jewels' }
    ];
    const res = calculateDeliveryCharge('Tamil Nadu', 9000, deliverySettings, cart);
    assert(res.charge === 150, 'Mixed only jewels qualify: base 100 + saree 50 + jewels 0 (waived) = 150', res);
    assert(res.isFree === false, 'isFree is false', res);
    assert(res.reason.includes('Narayani Gallery delivery surcharge waived'), 'Reason specifies only jewellery waived', res);
    assert(!res.reason.includes('entire order'), 'Does not imply entire order is free', res);
    assert(res.tipMessage.includes('Add ₹7000.00 more in Signature Sarees to unlock Free Delivery on entire order!'), 'Tip tells how to unlock entire free delivery', res);
}
{
    // 4.4 BOTH stores qualify
    // 10 Sarees at 1100 = 11000 (>= 10000).
    // 6 Jewels at 1000 = 6000 (>= 5000).
    // Delivery: ₹0!
    const cart = [
        { id: 1, title: 'Saree', price: 1100, quantity: 10, store: 'drapes' },
        { id: 2, title: 'Jewel', price: 1000, quantity: 6, store: 'jewels' }
    ];
    const res = calculateDeliveryCharge('Tamil Nadu', 17000, deliverySettings, cart);
    assert(res.charge === 0, 'Mixed both qualify: delivery ₹0', res);
    assert(res.isFree === true, 'isFree true', res);
    assert(res.effectiveBaseCharge === 0, 'base waived', res);
    assert(res.sareeSurcharge === 0, 'saree surcharge waived', res);
    assert(res.jewelsSurcharge === 0, 'jewels surcharge waived', res);
    assert(res.reason.includes('Free delivery unlocked on entire order'), 'Reason states entire order', res);
}

console.log('\n--- 5. SHIPPING STATE CHANGES ---');
{
    // Non-qualifying order: 4 Sarees (subtotal 4000)
    const cart = [{ id: 1, title: 'Saree', price: 1000, quantity: 4, store: 'drapes' }];

    // Tamil Nadu: rate is 100
    const resTN = calculateDeliveryCharge('Tamil Nadu', 4000, deliverySettings, cart);
    assert(resTN.charge === 100, 'Tamil Nadu non-qualifying = ₹100', resTN);

    // Kerala: rate is 120
    const resKL = calculateDeliveryCharge('Kerala', 4000, deliverySettings, cart);
    assert(resKL.charge === 120, 'Kerala non-qualifying = ₹120', resKL);

    // Maharashtra: rate is 150
    const resMH = calculateDeliveryCharge('Maharashtra', 4000, deliverySettings, cart);
    assert(resMH.charge === 150, 'Maharashtra non-qualifying = ₹150', resMH);

    // Qualifying order (10 sarees at 1000 = 10000): should be 0 in ALL states
    const cartQual = [{ id: 1, title: 'Saree', price: 1000, quantity: 10, store: 'drapes' }];
    assert(calculateDeliveryCharge('Tamil Nadu', 10000, deliverySettings, cartQual).charge === 0, 'TN qualifying = 0');
    assert(calculateDeliveryCharge('Kerala', 10000, deliverySettings, cartQual).charge === 0, 'KL qualifying = 0');
    assert(calculateDeliveryCharge('Maharashtra', 10000, deliverySettings, cartQual).charge === 0, 'MH qualifying = 0');
}

console.log('\n--- 6. EMPTY CART ---');
{
    const resEmpty = calculateDeliveryCharge('Tamil Nadu', 0, deliverySettings, []);
    assert(resEmpty.charge === 0, 'Empty cart charge is 0', resEmpty);
    assert(resEmpty.isFree === true, 'Empty cart isFree is true', resEmpty);
}

console.log(`\n========================================`);
console.log(`ALL ${passedCount} / ${totalCount} TESTS PASSED PERFECTLY!`);
console.log(`========================================`);
