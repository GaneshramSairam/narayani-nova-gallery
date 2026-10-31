import { calculateDeliveryCharge } from '../src/utils/deliveryUtils.js';

const mockSettings = {
    isEnabled: true,
    defaultRate: 100,
    jewelsFreeDeliveryThreshold: 5000,
    drapesFreeDeliveryThreshold: 10000,
    stateRates: {
        'Tamil Nadu': 60,
        'Kerala': 80
    }
};

// Case 1: Jewellery order below 5000
const cart1 = [{ id: '1', price: 4500, quantity: 1, store: 'jewels' }];
const res1 = calculateDeliveryCharge('Tamil Nadu', 4500, mockSettings, cart1);
console.assert(res1.charge === 60, `Case 1 Failed: Expected 60, got ${res1.charge}`);
console.assert(!res1.isFree, 'Case 1 Failed: Should not be free');
console.log('Case 1 Passed: Jewels ₹4,500 in TN -> Delivery ₹60 (tip:', res1.tipMessage, ')');

// Case 2: Jewellery order above 5000
const cart2 = [{ id: '2', price: 5200, quantity: 1, store: 'jewels' }];
const res2 = calculateDeliveryCharge('Tamil Nadu', 5200, mockSettings, cart2);
console.assert(res2.charge === 0, `Case 2 Failed: Expected 0, got ${res2.charge}`);
console.assert(res2.isFree, 'Case 2 Failed: Should be free');
console.log('Case 2 Passed: Jewels ₹5,200 in TN -> Delivery FREE (reason:', res2.reason, ')');

// Case 3: Saree order below 10000 (e.g. 8500)
const cart3 = [{ id: '3', price: 8500, quantity: 1, store: 'drapes' }];
const res3 = calculateDeliveryCharge('Tamil Nadu', 8500, mockSettings, cart3);
console.assert(res3.charge === 60, `Case 3 Failed: Expected 60, got ${res3.charge}`);
console.assert(!res3.isFree, 'Case 3 Failed: Should not be free');
console.log('Case 3 Passed: Sarees ₹8,500 in TN -> Delivery ₹60 (tip:', res3.tipMessage, ')');

// Case 4: Saree order above 10000 (e.g. 10500)
const cart4 = [{ id: '4', price: 10500, quantity: 1, store: 'drapes' }];
const res4 = calculateDeliveryCharge('Tamil Nadu', 10500, mockSettings, cart4);
console.assert(res4.charge === 0, `Case 4 Failed: Expected 0, got ${res4.charge}`);
console.assert(res4.isFree, 'Case 4 Failed: Should be free');
console.log('Case 4 Passed: Sarees ₹10,500 in TN -> Delivery FREE (reason:', res4.reason, ')');

// Case 5: Mixed cart with Sarees >= 10000 and Jewels < 5000
const cart5 = [
    { id: 'j', price: 1500, quantity: 1, store: 'jewels' },
    { id: 's', price: 10200, quantity: 1, store: 'drapes' }
];
const res5 = calculateDeliveryCharge('Tamil Nadu', 11700, mockSettings, cart5);
console.assert(res5.charge === 0, `Case 5 Failed: Expected 0, got ${res5.charge}`);
console.assert(res5.isFree, 'Case 5 Failed: Should be free');
console.log('Case 5 Passed: Mixed (Sarees ₹10,200 + Jewels ₹1,500) -> Delivery FREE (reason:', res5.reason, ')');

// Case 6: Mixed cart with neither threshold met (Jewels 2000, Sarees 3000)
const cart6 = [
    { id: 'j', price: 2000, quantity: 1, store: 'jewels' },
    { id: 's', price: 3000, quantity: 1, store: 'drapes' }
];
const res6 = calculateDeliveryCharge('Tamil Nadu', 5000, mockSettings, cart6);
console.assert(res6.charge === 60, `Case 6 Failed: Expected 60, got ${res6.charge}`);
console.assert(!res6.isFree, 'Case 6 Failed: Should not be free');
console.log('Case 6 Passed: Mixed (Jewels ₹2,000 + Sarees ₹3,000) -> Delivery ₹60 (tip:', res6.tipMessage, ')');

console.log('\n--- ALL FREE DELIVERY TEST CASES WITH ₹10,000 SAREE THRESHOLD PASSED ---');
