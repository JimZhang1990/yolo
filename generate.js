// YOLO旅行目的地生成器 - 主要逻辑文件

// 旅行目的地数据库
const destinations = {
    '文化历史': ['北京', '西安', '南京', '洛阳', '开封', '曲阜', '平遥', '丽江'],
    '自然风光': ['桂林', '张家界', '九寨沟', '黄山', '泰山', '华山', '峨眉山', '稻城亚丁'],
    '美食体验': ['成都', '重庆', '广州', '厦门', '杭州', '苏州', '长沙', '武汉'],
    '休闲度假': ['三亚', '青岛', '大连', '珠海', '烟台', '威海', '北海', '丽江'],
    '冒险刺激': ['拉萨', '新疆', '内蒙古', '云南', '贵州', '四川', '甘肃', '青海'],
    '购物娱乐': ['上海', '深圳', '香港', '澳门', '天津', '沈阳', '哈尔滨', '昆明']
};

// 预算建议数据
const budgetSuggestions = {
    '500-1000': {
        accommodation: '青年旅社、经济型酒店',
        transport: '火车、长途汽车',
        food: '当地小吃、快餐',
        activities: '免费景点、徒步'
    },
    '1000-3000': {
        accommodation: '三星级酒店、精品民宿',
        transport: '高铁、飞机经济舱',
        food: '当地特色餐厅',
        activities: '主要景点门票、当地体验'
    },
    '3000-8000': {
        accommodation: '四星级酒店、度假村',
        transport: '飞机、高铁商务座',
        food: '高档餐厅、特色美食',
        activities: '全景点通票、特色体验项目'
    },
    '8000+': {
        accommodation: '五星级酒店、奢华度假村',
        transport: '飞机头等舱、包车服务',
        food: '米其林餐厅、私人定制',
        activities: 'VIP体验、私人导游'
    }
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

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 收集表单数据
        const formData = collectFormData();
        
        // 生成旅行建议
        const travelPlan = generateTravelPlan(formData);
        
        // 显示结果
        displayResults(travelPlan);
        
        // 滚动到结果区域
        results.scrollIntoView({ behavior: 'smooth' });
    });
});

// 收集表单数据
function collectFormData() {
    const departure = document.getElementById('departure').value;
    const departureDate = document.getElementById('departureDate').value;
    const duration = document.getElementById('duration').value;
    const budget = document.getElementById('budget').value;
    
    // 收集选中的旅行风格
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

// 生成旅行计划
function generateTravelPlan(data) {
    // 根据风格推荐目的地
    let recommendedDestinations = [];
    
    if (data.styles.length > 0) {
        data.styles.forEach(style => {
            if (destinations[style]) {
                recommendedDestinations = recommendedDestinations.concat(destinations[style]);
            }
        });
        
        // 去重并随机选择
        recommendedDestinations = [...new Set(recommendedDestinations)];
        recommendedDestinations = shuffleArray(recommendedDestinations).slice(0, 3);
    } else {
        // 如果没有选择风格，随机推荐
        const allDestinations = Object.values(destinations).flat();
        recommendedDestinations = shuffleArray([...new Set(allDestinations)]).slice(0, 3);
    }
    
    // 获取预算建议
    const budgetAdvice = budgetSuggestions[data.budget] || {
        accommodation: '根据预算选择合适住宿',
        transport: '选择性价比高的交通方式',
        food: '品尝当地特色美食',
        activities: '参与有意义的活动体验'
    };
    
    return {
        userInput: data,
        destinations: recommendedDestinations,
        budgetAdvice: budgetAdvice,
        tips: generateTravelTips(data)
    };
}

// 生成旅行小贴士
function generateTravelTips(data) {
    const tips = [];
    
    // 根据出发日期给出季节建议
    const month = new Date(data.departureDate).getMonth() + 1;
    if (month >= 3 && month <= 5) {
        tips.push('🌸 春季出行，注意天气变化，建议携带薄外套');
    } else if (month >= 6 && month <= 8) {
        tips.push('☀️ 夏季出行，注意防晒和补水，选择清爽衣物');
    } else if (month >= 9 && month <= 11) {
        tips.push('🍂 秋季出行，天气宜人，是旅游的好季节');
    } else {
        tips.push('❄️ 冬季出行，注意保暖，关注天气预报');
    }
    
    // 根据旅行天数给出建议
    if (data.duration === '1-2') {
        tips.push('⚡ 短途旅行，建议选择距离较近的目的地，合理安排时间');
    } else if (data.duration === '10+') {
        tips.push('🎒 长途旅行，建议提前做好详细规划，准备充足物品');
    }
    
    // 根据风格给出建议
    if (data.styles.includes('自然风光')) {
        tips.push('🥾 自然风光游，建议穿着舒适的徒步鞋，携带相机');
    }
    if (data.styles.includes('美食体验')) {
        tips.push('🍽️ 美食之旅，建议提前了解当地特色菜品，保持开放心态');
    }
    
    tips.push('📱 出行前下载离线地图，确保手机电量充足');
    tips.push('💳 建议携带现金和银行卡，以备不时之需');
    
    return tips;
}

// 显示结果
function displayResults(plan) {
    const resultsContent = document.getElementById('resultsContent');
    const results = document.getElementById('results');
    
    // 构建结果HTML
    let html = `
        <div class="bg-blue-50 rounded-lg p-6 mb-6">
            <h3 class="text-lg font-semibold text-blue-800 mb-4">📊 您的旅行信息</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><strong>出发地：</strong>${plan.userInput.departure}</div>
                <div><strong>出发日期：</strong>${formatDate(plan.userInput.departureDate)}</div>
                <div><strong>旅行天数：</strong>${plan.userInput.duration}天</div>
                <div><strong>预算范围：</strong>${plan.userInput.budget}元</div>
                <div class="md:col-span-2"><strong>旅行风格：</strong>${plan.userInput.styles.join('、') || '随心所欲'}</div>
            </div>
        </div>
        
        <div class="bg-green-50 rounded-lg p-6 mb-6">
            <h3 class="text-lg font-semibold text-green-800 mb-4">🎯 推荐目的地</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    `;
    
    plan.destinations.forEach((dest, index) => {
        html += `
            <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-green-400">
                <div class="text-lg font-semibold text-gray-800">${dest}</div>
                <div class="text-sm text-gray-600 mt-1">推荐指数：${'⭐'.repeat(4 + (index % 2))}</div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
        
        <div class="bg-yellow-50 rounded-lg p-6 mb-6">
            <h3 class="text-lg font-semibold text-yellow-800 mb-4">💰 预算建议</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><strong>🏨 住宿：</strong>${plan.budgetAdvice.accommodation}</div>
                <div><strong>🚗 交通：</strong>${plan.budgetAdvice.transport}</div>
                <div><strong>🍜 餐饮：</strong>${plan.budgetAdvice.food}</div>
                <div><strong>🎪 活动：</strong>${plan.budgetAdvice.activities}</div>
            </div>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-purple-800 mb-4">💡 旅行小贴士</h3>
            <ul class="space-y-2 text-sm">
    `;
    
    plan.tips.forEach(tip => {
        html += `<li class="flex items-start space-x-2"><span class="text-purple-600">•</span><span>${tip}</span></li>`;
    });
    
    html += `
            </ul>
        </div>
        
        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 class="font-semibold text-gray-700 mb-2">📋 完整JSON数据</h4>
            <pre class="bg-gray-800 text-green-400 p-4 rounded text-xs overflow-x-auto">${JSON.stringify(plan, null, 2)}</pre>
        </div>
    `;
    
    resultsContent.innerHTML = html;
    results.classList.remove('hidden');
}

// 重置表单
function resetForm() {
    document.getElementById('travelForm').reset();
    document.getElementById('results').classList.add('hidden');
    
    // 重新设置默认日期
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('departureDate').value = today;
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 工具函数：数组随机排序
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// 工具函数：格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
}

// 添加一些交互效果
document.addEventListener('DOMContentLoaded', function() {
    // 为输入框添加焦点效果
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