// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generateBtn');
    const resultContainer = document.getElementById('resultContainer');
    const resultJson = document.getElementById('resultJson');
    
    generateBtn.addEventListener('click', function() {
        // 收集表单数据
        const formData = collectFormData();
        
        // 生成JSON
        const jsonResult = JSON.stringify(formData, null, 2);
        
        // 显示结果
        displayResult(jsonResult);
    });
    
    function collectFormData() {
        // 获取基本信息
        const departure = document.getElementById('departure').value.trim();
        const departureDate = document.getElementById('departureDate').value;
        const days = parseInt(document.getElementById('days').value);
        const budget = parseInt(document.getElementById('budget').value);
        
        // 获取选中的旅行风格
        const styleCheckboxes = document.querySelectorAll('input[name="style"]:checked');
        const selectedStyles = Array.from(styleCheckboxes).map(cb => cb.value);
        
        // 生成时间戳
        const timestamp = new Date().toISOString();
        
        return {
            基本信息: {
                出发地: departure || '未填写',
                出发日期: departureDate || '未选择',
                假期天数: days,
                总预算: budget
            },
            旅行偏好: {
                选择的风格: selectedStyles.length > 0 ? selectedStyles : ['未选择'],
                风格数量: selectedStyles.length
            },
            生成信息: {
                生成时间: timestamp,
                数据版本: '1.0'
            }
        };
    }
    
    function displayResult(jsonString) {
        resultJson.textContent = jsonString;
        resultContainer.classList.remove('hidden');
        
        // 平滑滚动到结果区域
        resultContainer.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
});