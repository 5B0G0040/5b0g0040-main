let history = [];
let currencyRates = {
    'TWD': 1,
    'USD': 0.033,
    'EUR': 0.028
};
let currentCurrency = 'TWD';

$(document).ready(function() {
    // 清除本地存儲的歷史紀錄
    localStorage.removeItem('history');

    loadHistory();
    setInterval(function() {
        $.getJSON('/weight', function(data) {
            $('#weight_display').text('重量: ' + data.weight + ' 公斤');
            updatePrice(parseFloat(data.weight));
            saveToHistory(data.weight, calculatePrice(parseFloat(data.weight)));
            displayHistory();
        });
    }, 500);
});

function updateCurrency() {
    currentCurrency = $('#currency_select').val();
    let currentWeight = parseFloat($('#weight_display').text().split(' ')[1]);
    updatePrice(currentWeight);
}

function saveToHistory(weight, price) {
    history.push({ weight: weight, price: price });
    localStorage.setItem('history', JSON.stringify(history));
}

function loadHistory() {
    let storedHistory = localStorage.getItem('history');
    if (storedHistory) {
        history = JSON.parse(storedHistory);
        displayHistory();
    }
}

function displayHistory() {
    let historyDisplay = $('#history_display');
    historyDisplay.empty();
    history.forEach(entry => {
        historyDisplay.append(`<p>重量: ${entry.weight} 公斤, 價格: ${entry.price.toFixed(2)} ${currentCurrency}</p>`);
    });
}

function calculatePrice(weight) {
    let price;
    if (weight === 0) {  
        price = 0;  
    } else if (weight < 1) {
        price = 8;
    } else if (weight <= 20) {
        price = 8;
    } else if (weight <= 50) {
        price = 16;
    } else if (weight <= 100) {
        price = 24;
    } else if (weight <= 250) {
        price = 40;
    } else if (weight <= 500) {
        price = 72;
    } else if (weight <= 1000) {
        price = 112;
    } else if (weight <= 2000) {
        price = 200;
    } else {
        price = NaN; // 超重了
    }
    return price;
}

function updatePrice(weight) {
    let price = calculatePrice(weight);
    let displayWeight;
    if (isNaN(price)) {
        $('#price_display').text('價格: 超重了');
    } else {
        let convertedPrice = (price * currencyRates[currentCurrency]).toFixed(2);
        if (weight === 0) {
            displayWeight = '0 公斤';
        } else if (weight < 1) {
            displayWeight = (weight * 1000).toFixed(1) + ' 公克';
        } else {
            displayWeight = weight + ' 公斤';
        }
        $('#weight_display').text('重量: ' + displayWeight);
        $('#price_display').text('價格: ' + convertedPrice + ' ' + currentCurrency);
    }
}

function manualCalculate() {
    let manualWeight = parseFloat($('#manual_weight').val());
    updatePrice(manualWeight);
    saveToHistory(manualWeight, calculatePrice(manualWeight));
    displayHistory();
}

function shareResults() {
    let weight = $('#weight_display').text();
    let price = $('#price_display').text();

    // 繪製圖片
    let canvas = document.getElementById('resultCanvas');
    let context = canvas.getContext('2d');
    let scale = 4; // 增加縮放比例以提高清晰度
    canvas.width = 800 * scale;
    canvas.height = 400 * scale;
    context.scale(scale, scale);

    // 设置白色背景
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // 清除原先的文本
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.font = 'bold 30px Arial';
    context.textAlign = 'center';
    context.fillStyle = '#333';

    context.fillText('郵費計算器', canvas.width / 2 / scale, 80);
    context.fillText(weight, canvas.width / 2 / scale, 180);
    context.fillText(price, canvas.width / 2 / scale, 280);

    // 將 Canvas 數據轉換為 Blob 對象並自動下載
    canvas.toBlob(function(blob) {
        let link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'result.png';
        link.click();

        // 使用 Web Share API 分享 File 對象
        if (navigator.share) {
            let file = new File([blob], 'result.png', {type: 'image/png'});
            navigator.share({
                title: '郵費計算結果分享',
                text: '這是實時郵費計算器的計算結果：',
                files: [file]
            })
            .then(() => console.log('成功分享'))
            .catch((error) => console.log('分享失敗', error));
        } else {
            // 如果不支持 Web Share API，則顯示圖片
            let img = document.createElement('img');
            img.src = URL.createObjectURL(blob);
            document.body.appendChild(img);
        }
    }, 'image/png');
}
