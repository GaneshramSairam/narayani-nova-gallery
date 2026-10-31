import fs from 'fs';

const productsRaw = JSON.parse(fs.readFileSync('./data_backup/products_backup.json', 'utf8'));
const categoriesRaw = JSON.parse(fs.readFileSync('./data_backup/categories_backup.json', 'utf8'));

const products = Object.values(productsRaw);
console.log('Sample product structure:');
console.log(JSON.stringify(products[0], null, 2));

const byCat = {};
for (const p of products) {
  const cat = p.category || 'NO_CATEGORY';
  if (!byCat[cat]) byCat[cat] = [];
  byCat[cat].push({ id: p.id, title: p.title, artist: p.artist, store: p.store });
}

console.log('\n--- Category Breakdown ---');
for (const [cat, list] of Object.entries(byCat)) {
  console.log(`\nCategory: [${cat}] (${list.length} products)`);
  list.forEach(item => {
    console.log(`  - [${item.id}] "${item.title}" (Code: ${item.artist || 'N/A'}, Store: ${item.store || 'unset'})`);
  });
}
