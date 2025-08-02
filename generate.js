// YOLO旅行目的地生成器 - 主要逻辑文件（集成AI版本）

// Cloudflare Worker API端点
const WORKER_API_URL = 'https://your-worker.your-subdomain.workers.dev'; // 替换为您的Worker URL

// 旅行目的地数据库（作为备用）
const destinations = {
    '文化历史': ['北京', '西安', '南京', '洛阳', '开封', '曲阜', '平遥', '丽江'],
    '自然风光': ['桂林', '张家界', '九寨沟', '黄山', '泰山', '华山', '峨眉山', '稻城亚丁'],
    '美食体验': ['成都', '重庆', '广州', '厦门', '杭州', '苏州', '长沙', '武汉'],
    '休闲度假': ['三亚', '青岛', '大连', '珠海', '烟台', '威海', '北海', '丽江'],
    '冒险刺激': ['拉萨', '新疆', '内蒙古', '云南', '贵州', '四川', '甘肃', '青海'],
    '购物娱乐': ['上海', '深圳', '香港', '澳门', '天津', '沈阳', '哈尔滨', '昆明']
};

// 表单提交处理
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('travelForm');
    const results = document.getElementById('results');
    const resultsContent = document.getElementById('resultsContent');

    // 设置默认日期为今天
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('departureDate').setAttribute('min', today);
    document.getElementById('departureDate').value = today;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // 显示加载状态
        showLoadingState();
        
        try {
            // 收集表单数据
            const formData = collectFormData();
            
            // 调用AI生成旅行计划
            const travelPlan = await generateAITravelPlan(formData);
            
            // 显示结果
            displayAIResults(travelPlan);
            
        } catch (error) {
            console.error('生成旅行计划失败:', error);
            // 降级到本地生成
            const fallbackPlan = generateLocalTravelPlan(collectFormData());
            displayAIResults(fallbackPlan);
        }
        
        // 滚动到结果区域
        results.scrollIntoView({ behavior: 'smooth' });
    });
});

// 显示加载状态
function showLoadingState() {
    const results = document.getElementById('results');
    const resultsContent = document.getElementById('resultsContent');
    
    resultsContent.innerHTML = `
        <div class="text-center py-12">
            <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 class="text-lg font-semibold text-gray-700 mb-2">🤖 Kimi AI正在为您生成专属旅行计划...</h3>
            <p class="text-gray-500">使用免费的moonshot/kimi-k2模型，请稍候</p>
        </div>
    `;
    
    results.classList.remove('hidden');
}

// 调用AI生成旅行计划
async function generateAITravelPlan(formData) {
    const response = await fetch(WORKER_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    });

    if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
        throw new Error(result.error || 'AI生成失败');
    }

    return result;
}

// 本地备用生成方案
function generateLocalTravelPlan(data) {
    // 根据风格推荐目的地
    let recommendedDestinations = [];
    
    if (data.styles.length > 0) {
        data.styles.forEach(style => {
            if (destinations[style]) {
                recommendedDestinations = recommendedDestinations.concat(destinations[style]);
            }
        });
        recommendedDestinations = [...new Set(recommendedDestinations)];
        recommendedDestinations = shuffleArray(recommendedDestinations).slice(0, 3);
    } else {
        const allDestinations = Object.values(destinations).flat();
        recommendedDestinations = shuffleArray([...new Set(allDestinations)]).slice(0, 3);
    }

    return {
        success: true,
        data: {
            destinations: recommendedDestinations.map(dest => ({
                name: dest,
                reason: '基于您的偏好推荐',
                itinerary: ['详细行程规划中...'],
                highlights: ['当地特色体验'],
                estimatedCost: data.budget
            })),
            budgetBreakdown: {
                transportation: '根据距离调整',
                accommodation: '根据预算选择',
                food: '品尝当地美食',
                activities: '体验当地文化'
            },
            tips: ['建议提前预订', '关注天气变化', '准备必要证件'],
            bestTime: '根据目的地气候选择最佳时间'
        },
        userInput: data,
        timestamp: new Date().toISOString(),
        isLocal: true,
        model: 'local-fallback'
    };
}

// 显示AI生成的结果
function displayAIResults(result) {
    const resultsContent = document.getElementById('resultsContent');
    const results = document.getElementById('results');
    
    const { data, userInput, isLocal, model } = result;
    
    let html = `
        <div class="bg-blue-50 rounded-lg p-6 mb-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-blue-800">📊 您的旅行信息</h3>
                <div class="flex gap-2">
                    ${isLocal ? '<span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">本地生成</span>' : '<span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">🤖 Kimi AI</span>'}
                    <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">${model || 'unknown'}</span>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><strong>出发地：</strong>${userInput.departure}</div>
                <div><strong>出发日期：</strong>${formatDate(userInput.departureDate)}</div>
                <div><strong>旅行天数：</strong>${userInput.duration}</div>
                <div><strong>预算范围：</strong>${userInput.budget}元</div>
                <div class="md:col-span-2"><strong>旅行风格：</strong>${userInput.styles.join('、') || '随心所欲'}</div>
            </div>
        </div>
    `;

    // 显示推荐目的地
    if (data.destinations && data.destinations.length > 0) {
        html += `
            <div class="bg-green-50 rounded-lg p-6 mb-6">
                <h3 class="text-lg font-semibold text-green-800 mb-4">🎯 Kimi AI推荐目的地</h3>
                <div class="space-y-6">
        `;
        
        data.destinations.forEach((dest, index) => {
            html += `
                <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-400">
                    <div class="flex items-start justify-between mb-3">
                        <h4 class="text-xl font-bold text-gray-800">${dest.name}</h4>
                        <span class="text-sm text-green-600 font-medium">推荐指数: ${'⭐'.repeat(5)}</span>
                    </div>
                    <p class="text-gray-600 mb-3"><strong>推荐理由：</strong>${dest.reason}</p>
                    
                    ${dest.highlights ? `
                        <div class="mb-3">
                            <strong class="text-gray-700">🌟 亮点：</strong>
                            <div class="flex flex-wrap gap-2 mt-1">
                                ${dest.highlights.map(highlight => `<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${highlight}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${dest.itinerary ? `
                        <div class="mb-3">
                            <strong class="text-gray-700">📅 行程安排：</strong>
                            <ul class="mt-1 space-y-1">
                                ${dest.itinerary.map(item => `<li class="text-sm text-gray-600">• ${item}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    <div class="text-sm text-gray-600">
                        <strong>💰 预估费用：</strong>${dest.estimatedCost}
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    }

    // 显示预算分配
    if (data.budgetBreakdown) {
        html += `
            <div class="bg-yellow-50 rounded-lg p-6 mb-6">
                <h3 class="text-lg font-semibold text-yellow-800 mb-4">💰 Kimi AI预算建议</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><strong>🚗 交通：</strong>${data.budgetBreakdown.transportation}</div>
                    <div><strong>🏨 住宿：</strong>${data.budgetBreakdown.accommodation}</div>
                    <div><strong>🍜 餐饮：</strong>${data.budgetBreakdown.food}</div>
                    <div><strong>🎪 活动：</strong>${data.budgetBreakdown.activities}</div>
                </div>
            </div>
        `;
    }

    // 显示旅行贴士
    if (data.tips && data.tips.length > 0) {
        html += `
            <div class="bg-purple-50 rounded-lg p-6 mb-6">
                <h3 class="text-lg font-semibold text-purple-800 mb-4">💡 Kimi AI旅行贴士</h3>
                <ul class="space-y-2 text-sm">
        `;
        
        data.tips.forEach(tip => {
            html += `<li class="flex items-start space-x-2"><span class="text-purple-600">•</span><span>${tip}</span></li>`;
        });
        
        html += `
                </ul>
            </div>
        `;
    }

    // 显示最佳时间
    if (data.bestTime) {
        html += `
            <div class="bg-indigo-50 rounded-lg p-6 mb-6">
                <h3 class="text-lg font-semibold text-indigo-800 mb-2">⏰ 最佳出行时间</h3>
                <p class="text-sm text-indigo-700">${data.bestTime}</p>
            </div>
        `;
    }

    // 如果有原始响应，显示它
    if (data.rawResponse) {
        html += `
            <div class="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-2">🤖 Kimi AI原始回复</h3>
                <div class="text-sm text-gray-700 whitespace-pre-wrap">${data.rawResponse}</div>
            </div>
        `;
    }

    // 显示完整JSON数据
    html += `
        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 class="font-semibold text-gray-700 mb-2">📋 完整数据</h4>
            <pre class="bg-gray-800 text-green-400 p-4 rounded text-xs overflow-x-auto">${JSON.stringify(result, null, 2)}</pre>
        </div>
    `;
    
    resultsContent.innerHTML = html;
    results.classList.remove('hidden');
}

// 收集表单数据
function collectFormData() {
    const departure = document.getElementById('departure').value;
    const departureDate = document.getElementById('departureDate').value;
    const duration = document.getElementById('duration').value;
    const budget = document.getElementById('budget').value;
    
    const styleCheckboxes = document.querySelectorAll('input[name="style"]:checked');
    const styles = Array.from(styleCheckboxes).map(cb => cb.value);
    
    return {
        departure,
        departureDate,
        duration,
        budget,
        styles,
        timestamp: new Date().toISOString()
    };
}

// 重置表单
function resetForm() {
    document.getElementById('travelForm').reset();
    document.getElementById('results').classList.add('hidden');
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('departureDate').value = today;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 工具函数
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
}

// 添加交互效果
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('transform', 'scale-105', 'transition-transform');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('transform', 'scale-105', 'transition-transform');
        });
    });
});