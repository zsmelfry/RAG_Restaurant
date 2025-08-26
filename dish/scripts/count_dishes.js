const fs = require('fs');
const path = require('path');

const dishDataPath = path.join(__dirname, '../raw_data');
let totalDishes = 0;
const cuisineStats = {};

const files = fs.readdirSync(dishDataPath).filter(file => file.endsWith('.json'));

files.forEach(file => {
    const filePath = path.join(dishDataPath, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    totalDishes += data.length;
    
    data.forEach(dish => {
        const cuisine = dish.cuisine || 'unknown';
        cuisineStats[cuisine] = (cuisineStats[cuisine] || 0) + 1;
    });
});

console.log(`总菜品数量: ${totalDishes}`);
console.log('\n各菜系分布:');
Object.entries(cuisineStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cuisine, count]) => {
        console.log(`${cuisine}: ${count} 道菜`);
    });
