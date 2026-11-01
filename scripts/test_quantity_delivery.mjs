import assert from 'assert';
import { calculateDeliveryCharge, validateDeliverySettings } from '../src/utils/deliveryUtils.js';

console.log('--- Running Quantity Delivery Test Suite ---');

// 1. Example Settings from User Prompt:
// State base delivery charge: 100
// Sarees per block: 5, charge per block: 50
// Jewellery units per block: 3, charge per block: 30
const testSettings = {
    isEnabled: true,
    defaultRate: 100,
    freeDeliveryThreshold: 0,
    jewelsFreeDeliveryThreshold: 0, // disable threshold for these pure unit tests
    drapesFreeDeliveryThreshold: 0,
    stateRates: {
        "Tamil Nadu": 100
    },
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

const makeSarees = (qty) => [{ id: 's1', title: 'Silk Saree', price: 100, quantity: qty, store: 'drapes' }];
const makeJewels = (qty) => [{ id: 'j1', title: 'Gold Necklace', price: 100, quantity: qty, store: 'jewels' }];
const makeMixed = (sareeQty, jewelQty) => [
    { id: 's1', title: 'Silk Saree', price: 100, quantity: sareeQty, store: 'drapes' },
    { id: 'j1', title: 'Gold Necklace', price: 100, quantity: jewelQty, store: 'jewels' }
];

// Test Empty Cart: charge must be 0
const emptyRes = calculateDeliveryCharge('Tamil Nadu', 0, testSettings, []);
assert.strictEqual(emptyRes.charge, 0, 'Empty cart should be 0');
console.log('✔ Empty cart test passed');

// Test Saree-only Orders from prompt table:
// 1-5 -> 100
// 6-10 -> 150
// 11-15 -> 200
// 16-20 -> 250
// 21-25 -> 300
const sareeExpected = [
    { qty: 1, expected: 100 },
    { qty: 5, expected: 100 },
    { qty: 6, expected: 150 },
    { qty: 10, expected: 150 },
    { qty: 11, expected: 200 },
    { qty: 15, expected: 200 },
    { qty: 16, expected: 250 },
    { qty: 20, expected: 250 },
    { qty: 21, expected: 300 },
    { qty: 25, expected: 300 }
];

for (const { qty, expected } of sareeExpected) {
    const res = calculateDeliveryCharge('Tamil Nadu', qty * 100, testSettings, makeSarees(qty));
    assert.strictEqual(res.charge, expected, `Saree Qty ${qty} expected ₹${expected}, got ₹${res.charge}`);
}
console.log('✔ All Saree-only test cases (1, 5, 6, 10, 11, 15, 16, 20, 21, 25) passed');

// Test Jewellery-only Orders from prompt table:
// 1-3 -> 100
// 4-6 -> 130
// 7-9 -> 160
// 10-12 -> 190
const jewelsExpected = [
    { qty: 1, expected: 100 },
    { qty: 3, expected: 100 },
    { qty: 4, expected: 130 },
    { qty: 6, expected: 130 },
    { qty: 7, expected: 160 },
    { qty: 9, expected: 160 },
    { qty: 10, expected: 190 },
    { qty: 12, expected: 190 }
];

for (const { qty, expected } of jewelsExpected) {
    const res = calculateDeliveryCharge('Tamil Nadu', qty * 100, testSettings, makeJewels(qty));
    assert.strictEqual(res.charge, expected, `Jewellery Qty ${qty} expected ₹${expected}, got ₹${res.charge}`);
}
console.log('✔ All Jewellery-only test cases (1, 3, 4, 6, 7, 9, 10, 12) passed');

// Test Mixed-store Orders from prompt table:
// 5 Sarees, 3 Jewels -> 100 base, 0 addl -> 100
// 6 Sarees, 3 Jewels -> 100 + 50 -> 150
// 5 Sarees, 4 Jewels -> 100 + 30 -> 130
// 6 Sarees, 4 Jewels -> 100 + 50 + 30 -> 180
// 11 Sarees, 7 Jewels -> 100 + 100 + 60 -> 260
const mixedExpected = [
    { s: 5, j: 3, expected: 100 },
    { s: 6, j: 3, expected: 150 },
    { s: 5, j: 4, expected: 130 },
    { s: 6, j: 4, expected: 180 },
    { s: 11, j: 7, expected: 260 }
];

for (const { s, j, expected } of mixedExpected) {
    const res = calculateDeliveryCharge('Tamil Nadu', (s + j) * 100, testSettings, makeMixed(s, j));
    assert.strictEqual(res.charge, expected, `Mixed (${s} sarees, ${j} jewels) expected ₹${expected}, got ₹${res.charge}`);
}
console.log('✔ All Mixed-store test cases ((5,3), (6,3), (5,4), (6,4), (11,7)) passed');

// Test Surcharges Disabled Independently
const sareeDisabled = {
    ...testSettings,
    sareeQuantityDelivery: { isEnabled: false, blockSize: 5, chargePerBlock: 50 },
    jewelsQuantityDelivery: { isEnabled: true, blockSize: 3, chargePerBlock: 30 }
};
const resSareeDisabled = calculateDeliveryCharge('Tamil Nadu', 1000, sareeDisabled, makeMixed(11, 7));
// Sarees: 11 (surcharge disabled -> 0), Jewels: 7 (addl 2 -> 60), Base: 100 -> Total: 160
assert.strictEqual(resSareeDisabled.charge, 160, 'Saree surcharge disabled test failed');
console.log('✔ Independent disable (Saree disabled, Jewels enabled) passed');

const jewelsDisabled = {
    ...testSettings,
    sareeQuantityDelivery: { isEnabled: true, blockSize: 5, chargePerBlock: 50 },
    jewelsQuantityDelivery: { isEnabled: false, blockSize: 3, chargePerBlock: 30 }
};
const resJewelsDisabled = calculateDeliveryCharge('Tamil Nadu', 1000, jewelsDisabled, makeMixed(11, 7));
// Sarees: 11 (addl 2 -> 100), Jewels: 7 (surcharge disabled -> 0), Base: 100 -> Total: 200
assert.strictEqual(resJewelsDisabled.charge, 200, 'Jewels surcharge disabled test failed');
console.log('✔ Independent disable (Saree enabled, Jewels disabled) passed');

// Test Both Disabled (Initial default behavior)
const bothDisabled = {
    ...testSettings,
    sareeQuantityDelivery: { isEnabled: false, blockSize: 5, chargePerBlock: 50 },
    jewelsQuantityDelivery: { isEnabled: false, blockSize: 3, chargePerBlock: 30 }
};
const resBothDisabled = calculateDeliveryCharge('Tamil Nadu', 1000, bothDisabled, makeMixed(11, 7));
// Base: 100 only
assert.strictEqual(resBothDisabled.charge, 100, 'Both surcharges disabled test failed');
console.log('✔ Both surcharges disabled (initial default behavior) passed');

// Test Validation Rules
assert.strictEqual(validateDeliverySettings({
    sareeQuantityDelivery: { isEnabled: true, blockSize: 0, chargePerBlock: 50 }
}).isValid, false, 'Should reject blockSize 0');

assert.strictEqual(validateDeliverySettings({
    sareeQuantityDelivery: { isEnabled: true, blockSize: -5, chargePerBlock: 50 }
}).isValid, false, 'Should reject negative blockSize');

assert.strictEqual(validateDeliverySettings({
    sareeQuantityDelivery: { isEnabled: true, blockSize: 2.5, chargePerBlock: 50 }
}).isValid, false, 'Should reject fractional blockSize');

assert.strictEqual(validateDeliverySettings({
    sareeQuantityDelivery: { isEnabled: true, blockSize: 5, chargePerBlock: -10 }
}).isValid, false, 'Should reject negative chargePerBlock');

assert.strictEqual(validateDeliverySettings({
    sareeQuantityDelivery: { isEnabled: true, blockSize: 5, chargePerBlock: 0 }
}).isValid, true, 'Should accept chargePerBlock 0');

console.log('✔ All Validation tests (zero, negative, fractional, zero charge) passed');

console.log('--- ALL QUANTITY DELIVERY TESTS PASSED SUCCESSFULLY! ---');
