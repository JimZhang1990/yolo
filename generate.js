// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generateBtn');
    const resultContainer = document.getElementById('resultContainer');
    const resultJson = document.getElementById('resultJson');
    
    generateBtn.addEventListener('click', async function() {
        // 禁用按钮，防止重复点击
        generateBtn.disabled = true;
        generateBtn.textContent = '🔄 生成中...';
        
        try {
            // 收集表单数据
            const formData = collectFormData();
            
            // 发送POST请求
            await sendTravelPlan(formData);
            
        } catch (error) {
            console.error('生成旅行计划时出错:', error);
            displayError('生成旅行计划时出错，请稍后重试。');
        } finally {
            // 恢复按钮状态
            generateBtn.disabled = false;
            generateBtn.textContent = '🎯 生成旅行计划';
        }
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
        
        return {
            departure: departure || '',
            departureDate: departureDate || '',
            days: days,
            budget: budget,
            styles: selectedStyles
        };
    }
    
    async function sendTravelPlan(data) {
        const apiUrl = 'https://yolo-travel-worker.zhen-zhang-investing.workers.dev/';
        
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            // 显示API返回的结果
            displayResult(JSON.stringify(result, null, 2));
            
        } catch (error) {
            console.error('API请求失败:', error);
            
            // 如果API请求失败，显示本地生成的数据作为备选
            const localData = generateLocalData(data);
            displayResult(JSON.stringify(localData, null, 2));
            
            // 显示错误提示
            displayError('无法连接到服务器，显示本地生成的数据。');
        }
    }
    
    function generateLocalData(formData) {
        const timestamp = new Date().toISOString();
        
        return {
            基本信息: {
                出发地: formData.departure || '未填写',
                出发日期: formData.departureDate || '未选择',
                假期天数: formData.days,
                总预算: formData.budget
            },
            旅行偏好: {
                选择的风格: formData.styles.length > 0 ? formData.styles : ['未选择'],
                风格数量: formData.styles.length
            },
            生成信息: {
                生成时间: timestamp,
                数据版本: '1.0',
                数据来源: '本地生成（API不可用）'
            }
        };
    }
    
    function displayResult(jsonString) {
        resultJson.textContent = jsonString;
        resultContainer.classList.remove('hidden');
        
        // 清除之前的错误信息
        const errorDiv = document.getElementById('errorMessage');
        if (errorDiv) {
            errorDiv.remove();
        }
        
        // 平滑滚动到结果区域
        resultContainer.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
    
    function displayError(message) {
        // 移除之前的错误信息
        const existingError = document.getElementById('errorMessage');
        if (existingError) {
            existingError.remove();
        }
        
        // 创建错误信息元素
        const errorDiv = document.createElement('div');
        errorDiv.id = 'errorMessage';
        errorDiv.className = 'mt-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-md';
        errorDiv.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2">⚠️</span>
                <span>${message}</span>
            </div>
        `;
        
        // 插入到结果容器之前
        resultContainer.parentNode.insertBefore(errorDiv, resultContainer);
    }
});