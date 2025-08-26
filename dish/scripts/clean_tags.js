const fs = require('fs');
const path = require('path');

/**
 * 清理所有菜谱文件中的标签，确保 dict_codes.tags 与 tags 字段保持一致
 */

const dishDataPath = path.join(__dirname, '../raw_data');
let totalFiles = 0;
let totalDishes = 0;
let updatedDishes = 0;

console.log('开始清理菜谱标签...\n');

// 读取所有 JSON 文件
const files = fs.readdirSync(dishDataPath).filter(file => file.endsWith('.json'));

files.forEach(file => {
    const filePath = path.join(dishDataPath, file);
    console.log(`处理文件: ${file}`);
    
    try {
        // 读取文件内容
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        let fileUpdated = false;
        let dishesInFile = 0;
        let updatedInFile = 0;
        
        // 处理每道菜
        data.forEach(dish => {
            dishesInFile++;
            
            // 检查是否存在 tags 和 dict_codes
            if (dish.tags && dish.dict_codes) {
                // 将 tags 数组复制到 dict_codes.tags
                const originalTags = dish.dict_codes.tags ? [...dish.dict_codes.tags] : [];
                dish.dict_codes.tags = [...dish.tags];
                
                // 检查是否有变化
                if (JSON.stringify(originalTags) !== JSON.stringify(dish.tags)) {
                    updatedInFile++;
                    fileUpdated = true;
                }
            }
        });
        
        // 如果文件有更新，写回文件
        if (fileUpdated) {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
            console.log(`  ✓ 已更新 ${updatedInFile}/${dishesInFile} 道菜的标签`);
        } else {
            console.log(`  - 无需更新，${dishesInFile} 道菜的标签已一致`);
        }
        
        totalFiles++;
        totalDishes += dishesInFile;
        updatedDishes += updatedInFile;
        
    } catch (error) {
        console.error(`  ✗ 处理文件 ${file} 时出错:`, error.message);
    }
});

console.log('\n=== 清理完成 ===');
console.log(`处理文件数: ${totalFiles}`);
console.log(`总菜品数: ${totalDishes}`);
console.log(`更新菜品数: ${updatedDishes}`);

if (updatedDishes > 0) {
    console.log(`\n已成功清理所有标签不一致的问题！`);
} else {
    console.log(`\n所有文件的标签都已保持一致，无需更新。`);
}
