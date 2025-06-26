// Biến toàn cục
let countdownInterval;
let isPaused = false;
let examData = {
    subject: '',
    startTime: null,
    endTime: null,
    stages: []
};

// Thời gian phát đề (pre-exam)
let preExamTimeStart = '';
let preExamTimeEnd = '';

// DOM elements - sẽ được khởi tạo sau khi DOM load
let configForm, countdownScreen, examForm, subjectDisplay, examTimeInfo, currentDate;
let currentStage, progressFill, progressText, stageMarkers, stageTimes;
let pauseBtn, resetBtn, stagesContainer, savedModal, savedList;
let daysEl, hoursEl, minutesEl, secondsEl;

// Khởi tạo
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    initializeApp();
    setupEventListeners();
    updateCurrentDate();
    addDefaultStages();
});

function initializeElements() {
    // Khởi tạo tất cả DOM elements
    configForm = document.getElementById('configForm');
    countdownScreen = document.getElementById('countdownScreen');
    examForm = document.getElementById('examForm');
    subjectDisplay = document.getElementById('subjectDisplay');
    examTimeInfo = document.getElementById('examTimeInfo');
    currentDate = document.getElementById('currentDate');
    currentStage = document.getElementById('currentStage');
    progressFill = document.getElementById('progressFill');
    progressText = document.getElementById('progressText');
    stageMarkers = document.getElementById('stageMarkers');
    stageTimes = document.getElementById('stageTimes');
    pauseBtn = document.getElementById('pauseBtn');
    resetBtn = document.getElementById('resetBtn');
    stagesContainer = document.getElementById('stagesContainer');
    savedModal = document.getElementById('savedModal');
    savedList = document.getElementById('savedList');
    
    // Elements cho countdown
    daysEl = document.getElementById('days');
    hoursEl = document.getElementById('hours');
    minutesEl = document.getElementById('minutes');
    secondsEl = document.getElementById('seconds');
}

function initializeApp() {
    // Cập nhật ngày hiện tại mỗi giây
    setInterval(updateCurrentDate, 1000);
    
    // Kiểm tra xem có dữ liệu đã lưu không
    const savedData = localStorage.getItem('examCountdownData');
    if (savedData) {
        try {
            examData = JSON.parse(savedData);
            if (examData.endTime && new Date(examData.endTime) > new Date()) {
                startCountdown();
            }
        } catch (e) {
            console.error('Lỗi khi tải dữ liệu đã lưu:', e);
        }
    }
}

function setupEventListeners() {
    // Form submit
    examForm.addEventListener('submit', handleFormSubmit);
    
    // Nút điều khiển
    pauseBtn.addEventListener('click', togglePause);
    resetBtn.addEventListener('click', resetCountdown);
    
    // Thiết lập thời gian mặc định cho form
    setupDefaultTimes();
    
    // Event listeners cho thời gian
    document.getElementById('startTime').addEventListener('change', updateDuration);
    document.getElementById('endTime').addEventListener('change', updateDuration);
    
    // Thêm event listener cho input để đảm bảo dấu cách hoạt động
    const inputs = document.querySelectorAll('input[type="text"]');
    inputs.forEach(input => {
        input.addEventListener('keydown', function(e) {
            // Cho phép tất cả key trong input, không ngăn chặn gì cả
            return true;
        });
    });

    // Lưu giá trị thời gian phát đề khi thay đổi
    if (document.getElementById('preExamTimeStart')) {
        document.getElementById('preExamTimeStart').addEventListener('change', function(e) {
            preExamTimeStart = e.target.value;
            updatePreExamDuration();
            updateDuration();
        });
    }
    if (document.getElementById('preExamTimeEnd')) {
        document.getElementById('preExamTimeEnd').addEventListener('change', function(e) {
            preExamTimeEnd = e.target.value;
            updatePreExamDuration();
            updateDuration();
        });
    }
}

function setupDefaultTimes() {
    const now = new Date();
    const startTime = new Date(now.getTime() + 5 * 60000); // 5 phút từ bây giờ
    const endTime = new Date(now.getTime() + 120 * 60000); // 2 giờ từ bây giờ
    
    document.getElementById('startTime').value = formatDateTimeLocal(startTime);
    document.getElementById('endTime').value = formatDateTimeLocal(endTime);
    updateDuration();
}

function addDefaultStages() {
    // Thêm 4 giai đoạn mặc định
    const defaultStages = [
        { name: 'Đọc đề', startTime: '', endTime: '' },
        { name: 'Làm bài', startTime: '', endTime: '' },
        { name: 'Kiểm tra', startTime: '', endTime: '' },
        { name: 'Nộp bài', startTime: '', endTime: '' }
    ];
    
    defaultStages.forEach(stage => {
        addStage(stage);
    });
}

function addStage(stageData = null) {
    const stageIndex = document.querySelectorAll('.stage-item').length;
    const stageItem = document.createElement('div');
    stageItem.className = 'stage-item';
    stageItem.setAttribute('data-stage-index', stageIndex);
    
    stageItem.innerHTML = `
        <div class="stage-header">
            <div class="stage-number">${stageIndex + 1}</div>
            <button type="button" class="remove-stage-btn" onclick="removeStage(${stageIndex})">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="stage-content">
            <div class="stage-name-group">
                <label>Tên giai đoạn:</label>
                <input type="text" class="stage-name-input" placeholder="Nhập tên giai đoạn" 
                       value="${stageData ? stageData.name : ''}" required>
            </div>
            <div class="stage-time-group">
                <label>Thời gian bắt đầu:</label>
                <input type="time" class="stage-start-time" 
                       value="${stageData ? stageData.startTime : ''}" required>
            </div>
            <div class="stage-time-group">
                <label>Thời gian kết thúc:</label>
                <input type="time" class="stage-end-time" 
                       value="${stageData ? stageData.endTime : ''}" required>
            </div>
        </div>
    `;
    
    stagesContainer.appendChild(stageItem);
    
    // Thêm event listeners cho các input mới
    const stageNameInput = stageItem.querySelector('.stage-name-input');
    const stageStartTime = stageItem.querySelector('.stage-start-time');
    const stageEndTime = stageItem.querySelector('.stage-end-time');
    
    stageNameInput.addEventListener('input', validateStageTimes);
    stageStartTime.addEventListener('change', validateStageTimes);
    stageEndTime.addEventListener('change', validateStageTimes);
}

function removeStage(stageIndex) {
    const stageItem = document.querySelector(`[data-stage-index="${stageIndex}"]`);
    if (stageItem) {
        stageItem.remove();
        // Cập nhật lại số thứ tự
        updateStageNumbers();
    }
}

function updateStageNumbers() {
    const stageItems = document.querySelectorAll('.stage-item');
    stageItems.forEach((item, index) => {
        item.setAttribute('data-stage-index', index);
        item.querySelector('.stage-number').textContent = index + 1;
        item.querySelector('.remove-stage-btn').setAttribute('onclick', `removeStage(${index})`);
    });
}

function validateStageTimes() {
    const stageItems = document.querySelectorAll('.stage-item');
    let isValid = true;
    
    stageItems.forEach((item, index) => {
        const startTime = item.querySelector('.stage-start-time').value;
        const endTime = item.querySelector('.stage-end-time').value;
        
        if (startTime && endTime && startTime >= endTime) {
            item.style.borderColor = '#dc3545';
            isValid = false;
        } else {
            item.style.borderColor = '#e9ecef';
        }
    });
    
    return isValid;
}

function updateDuration() {
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const preExamStart = document.getElementById('preExamTimeStart') ? document.getElementById('preExamTimeStart').value : '';
    const preExamEnd = document.getElementById('preExamTimeEnd') ? document.getElementById('preExamTimeEnd').value : '';
    const durationText = document.getElementById('durationText');
    if (!durationText) {
        console.warn('Duration text element not found');
        return;
    }
    if (startTime && endTime) {
        const start = new Date(startTime);
        const end = new Date(endTime);
        let examStart = new Date(start);
        if (preExamEnd) {
            const [h, m] = preExamEnd.split(':').map(Number);
            examStart.setHours(h, m, 0, 0);
        }
        let duration = end - examStart;
        if (duration < 0) duration = 0;
        const hours = Math.floor(duration / (1000 * 60 * 60));
        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
        durationText.textContent = `${hours} giờ ${minutes} phút`;
    } else {
        durationText.textContent = '--';
    }
}

function formatDateTimeLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatTimeDisplay(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const subjectName = document.getElementById('subjectName').value.trim();
    const startTime = new Date(document.getElementById('startTime').value);
    const endTime = new Date(document.getElementById('endTime').value);
    
    // Validation
    if (!subjectName) {
        alert('Vui lòng nhập tên môn thi!');
        return;
    }
    
    if (startTime >= endTime) {
        alert('Thời gian kết thúc phải sau thời gian bắt đầu!');
        return;
    }
    
    if (endTime <= new Date()) {
        alert('Thời gian kết thúc phải trong tương lai!');
        return;
    }
    
    if (!validateStageTimes()) {
        alert('Vui lòng kiểm tra lại thời gian các giai đoạn!');
        return;
    }
    
    // Lấy dữ liệu các giai đoạn
    const stages = [];
    const stageItems = document.querySelectorAll('.stage-item');
    
    stageItems.forEach(item => {
        const name = item.querySelector('.stage-name-input').value.trim();
        const startTime = item.querySelector('.stage-start-time').value;
        const endTime = item.querySelector('.stage-end-time').value;
        
        if (name && startTime && endTime) {
            stages.push({
                name: name,
                startTime: startTime,
                endTime: endTime
            });
        }
    });
    
    if (stages.length === 0) {
        alert('Vui lòng nhập ít nhất một giai đoạn!');
        return;
    }
    
    // Lấy giá trị thời gian phát đề
    preExamTimeStart = document.getElementById('preExamTimeStart') ? document.getElementById('preExamTimeStart').value : '';
    preExamTimeEnd = document.getElementById('preExamTimeEnd') ? document.getElementById('preExamTimeEnd').value : '';
    
    // Lưu dữ liệu
    examData = {
        subject: subjectName,
        startTime: startTime,
        endTime: endTime,
        stages: stages,
        preExamTimeStart: preExamTimeStart,
        preExamTimeEnd: preExamTimeEnd
    };
    
    localStorage.setItem('examCountdownData', JSON.stringify(examData));
    
    // Chuyển sang màn hình countdown
    showCountdownScreen();
    
    // Bắt đầu countdown
    startCountdown();
}

function saveFormData() {
    const subjectName = document.getElementById('subjectName').value.trim();
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    
    if (!subjectName) {
        alert('Vui lòng nhập tên môn thi!');
        return;
    }
    
    // Lấy dữ liệu các giai đoạn
    const stages = [];
    const stageItems = document.querySelectorAll('.stage-item');
    
    stageItems.forEach(item => {
        const name = item.querySelector('.stage-name-input').value.trim();
        const startTime = item.querySelector('.stage-start-time').value;
        const endTime = item.querySelector('.stage-end-time').value;
        
        if (name) {
            stages.push({
                name: name,
                startTime: startTime,
                endTime: endTime
            });
        }
    });
    
    const configName = prompt('Nhập tên cho cấu hình này:');
    if (!configName) return;
    
    const savedConfig = {
        id: Date.now(),
        name: configName,
        subject: subjectName,
        startTime: startTime,
        endTime: endTime,
        stages: stages,
        savedAt: new Date().toISOString()
    };
    
    // Lấy danh sách cấu hình đã lưu
    let savedConfigs = JSON.parse(localStorage.getItem('savedConfigs') || '[]');
    savedConfigs.push(savedConfig);
    
    // Lưu vào localStorage
    localStorage.setItem('savedConfigs', JSON.stringify(savedConfigs));
    
    alert('Đã lưu cấu hình thành công!');
}

function showSavedConfigs() {
    const savedConfigs = JSON.parse(localStorage.getItem('savedConfigs') || '[]');
    
    if (savedConfigs.length === 0) {
        alert('Chưa có cấu hình nào được lưu!');
        return;
    }
    
    savedList.innerHTML = '';
    
    savedConfigs.forEach(config => {
        const configItem = document.createElement('div');
        configItem.className = 'saved-item';
        
        const savedDate = new Date(config.savedAt).toLocaleDateString('vi-VN');
        
        configItem.innerHTML = `
            <div class="saved-item-header">
                <div class="saved-item-name">${config.name}</div>
                <div class="saved-item-date">${savedDate}</div>
            </div>
            <div class="saved-item-details">
                <strong>Môn thi:</strong> ${config.subject}<br>
                <strong>Thời gian:</strong> ${config.startTime} - ${config.endTime}<br>
                <strong>Số giai đoạn:</strong> ${config.stages.length}
            </div>
            <div class="saved-item-actions">
                <button class="saved-item-btn load-item-btn" onclick="loadConfig(${config.id})">
                    <i class="fas fa-download"></i> Tải
                </button>
                <button class="saved-item-btn delete-item-btn" onclick="deleteConfig(${config.id})">
                    <i class="fas fa-trash"></i> Xóa
                </button>
            </div>
        `;
        
        savedList.appendChild(configItem);
    });
    
    savedModal.classList.remove('hidden');
}

function closeSavedModal() {
    savedModal.classList.add('hidden');
}

function loadConfig(configId) {
    const savedConfigs = JSON.parse(localStorage.getItem('savedConfigs') || '[]');
    const config = savedConfigs.find(c => c.id === configId);
    
    if (config) {
        // Điền dữ liệu vào form
        document.getElementById('subjectName').value = config.subject;
        document.getElementById('startTime').value = config.startTime;
        document.getElementById('endTime').value = config.endTime;
        
        // Xóa các giai đoạn hiện tại
        stagesContainer.innerHTML = '';
        
        // Thêm các giai đoạn từ cấu hình
        config.stages.forEach(stage => {
            addStage(stage);
        });
        
        updateDuration();
        closeSavedModal();
        alert('Đã tải cấu hình thành công!');
    }
}

function deleteConfig(configId) {
    if (confirm('Bạn có chắc muốn xóa cấu hình này?')) {
        let savedConfigs = JSON.parse(localStorage.getItem('savedConfigs') || '[]');
        savedConfigs = savedConfigs.filter(c => c.id !== configId);
        localStorage.setItem('savedConfigs', JSON.stringify(savedConfigs));
        
        showSavedConfigs(); // Refresh danh sách
    }
}

function showCountdownScreen() {
    configForm.classList.add('hidden');
    countdownScreen.classList.remove('hidden');
    
    // Hiển thị thông tin
    subjectDisplay.textContent = examData.subject;
    updateExamTimeInfo();
    
    // Tạo đánh dấu giai đoạn và thời gian
    createStageMarkers();
    createStageTimes();
    
    // Animation cho các phần tử
    animateElements();
}

function updateExamTimeInfo() {
    if (!examTimeInfo) {
        console.warn('Exam time info element not found');
        return;
    }
    const startTime = new Date(examData.startTime);
    const endTime = new Date(examData.endTime);
    const preExamEnd = examData.preExamTimeEnd;
    let examStart = new Date(startTime);
    if (preExamEnd) {
        const [h, m] = preExamEnd.split(':').map(Number);
        examStart.setHours(h, m, 0, 0);
    }
    const now = new Date();
    const startTimeStr = formatTimeDisplay(examStart);
    const endTimeStr = formatTimeDisplay(endTime);
    if (now < examStart) {
        // Chưa đến giờ thi
        const timeUntilStart = examStart - now;
        const hoursUntilStart = Math.floor(timeUntilStart / (1000 * 60 * 60));
        const minutesUntilStart = Math.floor((timeUntilStart % (1000 * 60 * 60)) / (1000 * 60));
        examTimeInfo.textContent = `Thời gian thi: ${startTimeStr} - ${endTimeStr} (Còn ${hoursUntilStart}h ${minutesUntilStart}p để bắt đầu)`;
        examTimeInfo.style.color = '';
    } else if (now >= endTime) {
        // Đã hết thời gian
        examTimeInfo.textContent = `Thời gian thi: ${startTimeStr} - ${endTimeStr} (Đã kết thúc)`;
        examTimeInfo.style.color = '#f44336';
    } else {
        // Đang thi
        const timeLeft = endTime - now;
        const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        examTimeInfo.textContent = `Thời gian thi: ${startTimeStr} - ${endTimeStr} (Còn ${hoursLeft}h ${minutesLeft}p)`;
        examTimeInfo.style.color = '#FFD600';
    }
}

function getAllStagesWithPreExam() {
    // Trả về mảng stages, thêm giai đoạn phát đề nếu có
    const stages = examData.stages ? [...examData.stages] : [];
    if (examData.preExamTimeStart && examData.preExamTimeEnd) {
        // Thêm phát đề vào đầu
        stages.unshift({
            name: 'Phát đề',
            startTime: examData.preExamTimeStart,
            endTime: examData.preExamTimeEnd
        });
    }
    return stages;
}

function createStageMarkers() {
    stageMarkers.innerHTML = '';
    const stages = getAllStagesWithPreExam();
    if (stages.length === 0) return;
    // Tính tổng thời gian các stage
    let totalStageMs = 0;
    const stageDurations = [];
    for (let i = 0; i < stages.length; i++) {
        const start = parseTimeToDate(stages[i].startTime, examData.startTime);
        const end = parseTimeToDate(stages[i].endTime, examData.startTime);
        const duration = end - start;
        stageDurations.push(duration);
        totalStageMs += duration;
    }
    // Tính vị trí marker dựa trên tỷ lệ thời gian thực tế
    let accMs = 0;
    for (let i = 0; i < stages.length; i++) {
        const leftPercent = (accMs / totalStageMs) * 100;
        const marker = document.createElement('div');
        marker.className = 'stage-marker';
        marker.style.left = `${leftPercent}%`;
        marker.setAttribute('data-stage', i);
        stageMarkers.appendChild(marker);
        accMs += stageDurations[i];
    }
    // Thêm marker cuối cùng ở 100%
    const lastMarker = document.createElement('div');
    lastMarker.className = 'stage-marker';
    lastMarker.style.left = '100%';
    lastMarker.setAttribute('data-stage', stages.length);
    stageMarkers.appendChild(lastMarker);
}

// Helper: chuyển chuỗi HH:mm sang Date dựa trên ngày thi
function parseTimeToDate(timeStr, baseDate) {
    if (!timeStr) return new Date(baseDate);
    const [h, m] = timeStr.split(':').map(Number);
    const d = new Date(baseDate);
    d.setHours(h, m, 0, 0);
    return d;
}

function createStageTimes() {
    stageTimes.innerHTML = '';
    const stages = getAllStagesWithPreExam();
    if (stages.length === 0) return;
    // Tính tổng thời gian các stage
    let totalStageMs = 0;
    const stageDurations = [];
    for (let i = 0; i < stages.length; i++) {
        const start = parseTimeToDate(stages[i].startTime, examData.startTime);
        const end = parseTimeToDate(stages[i].endTime, examData.startTime);
        const duration = end - start;
        stageDurations.push(duration);
        totalStageMs += duration;
    }
    // Render từng stage-time-item theo flex
    for (let i = 0; i < stages.length; i++) {
        const timeItem = document.createElement('div');
        timeItem.className = 'stage-time-item';
        timeItem.setAttribute('data-stage', i);
        timeItem.style.textAlign = 'center';
        const timeLabel = document.createElement('div');
        timeLabel.className = 'stage-time-label';
        timeLabel.textContent = stages[i].name;
        const timeValue = document.createElement('div');
        timeValue.className = 'stage-time-value';
        timeValue.textContent = `${stages[i].startTime} - ${stages[i].endTime}`;
        timeItem.appendChild(timeLabel);
        timeItem.appendChild(timeValue);
        stageTimes.appendChild(timeItem);
    }
    // Đảm bảo stageTimes là flex
    stageTimes.style.position = '';
    stageTimes.style.width = '';
    stageTimes.style.height = '';
    stageTimes.style.display = 'flex';
    stageTimes.style.justifyContent = 'space-between';
}

function animateElements() {
    // Animation cho logo và title
    const logoSection = document.querySelector('.logo-section');
    logoSection.style.animation = 'fadeInDown 1s ease';
    
    // Animation cho countdown items
    const countdownItems = document.querySelectorAll('.countdown-item');
    countdownItems.forEach((item, index) => {
        item.style.animationDelay = `${0.9 + index * 0.1}s`;
    });
}

function startCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown(); // Cập nhật ngay lập tức
}

function updateCountdown() {
    if (isPaused) return;
    
    const now = new Date();
    const endTime = new Date(examData.endTime);
    const startTime = new Date(examData.startTime);
    
    let timeLeft;
    let isBeforeStart = false;
    let justStarted = false;
    
    if (now < startTime) {
        // Chưa đến thời gian bắt đầu - chỉ đếm ngược đến lúc bắt đầu
        timeLeft = startTime - now;
        isBeforeStart = true;
    } else if (now >= endTime) {
        // Đã hết thời gian
        timeLeft = 0;
        handleTimeUp();
        return;
    } else {
        // Đang trong thời gian thi - đếm ngược đến lúc kết thúc
        timeLeft = endTime - now;
        
        // Kiểm tra xem có phải vừa mới bắt đầu không (trong vòng 1 phút đầu)
        if (now - startTime < 60000) {
            justStarted = true;
        }
    }
    
    // Tính toán thời gian
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    // Cập nhật hiển thị
    updateCountdownDisplay(days, hours, minutes, seconds);
    updateExamTimeInfo(); // Cập nhật thông tin trạng thái
    
    // Cập nhật progress và giai đoạn
    updateProgressAndStage(now, startTime, endTime, isBeforeStart);
    
    // Hiển thị thông báo khi vừa bắt đầu
    if (justStarted) {
        showStartNotification();
    }
}

function updateCountdownDisplay(days, hours, minutes, seconds) {
    // Kiểm tra các element có tồn tại không
    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) {
        console.warn('Countdown elements not found');
        return;
    }
    
    // Animation cho số thay đổi
    animateNumberChange(daysEl, days);
    animateNumberChange(hoursEl, hours);
    animateNumberChange(minutesEl, minutes);
    animateNumberChange(secondsEl, seconds);
}

function animateNumberChange(element, newValue) {
    if (!element) {
        console.warn('Element not found for animation');
        return;
    }
    
    const currentValue = parseInt(element.textContent);
    if (currentValue !== newValue) {
        element.style.animation = 'numberPulse 0.5s ease';
        element.textContent = String(newValue).padStart(2, '0');
        
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }
}

function updateProgressAndStage(now, startTime, endTime, isBeforeStart) {
    if (!currentStage || !progressFill || !progressText) {
        console.warn('Some elements not found');
        return;
    }
    const stages = getAllStagesWithPreExam();
    if (isBeforeStart) {
        currentStage.textContent = 'Chờ đến giờ thi...';
        currentStage.style.color = '#ff9800';
        updateProgressBar(0);
        updateStageMarkers(null, null);
    } else if (stages.length > 0) {
        currentStage.style.color = '#4CAF50';
        // Tính tổng thời gian các stage
        let totalStageMs = 0;
        const stageDurations = [];
        for (let i = 0; i < stages.length; i++) {
            const s = parseTimeToDate(stages[i].startTime, startTime);
            const e = parseTimeToDate(stages[i].endTime, startTime);
            const dur = e - s;
            stageDurations.push(dur);
            totalStageMs += dur;
        }
        // Tính thời gian đã qua
        let progressMs = 0;
        let found = false;
        for (let i = 0; i < stages.length; i++) {
            const s = parseTimeToDate(stages[i].startTime, startTime);
            const e = parseTimeToDate(stages[i].endTime, startTime);
            if (now >= e) {
                progressMs += stageDurations[i];
            } else if (now >= s && now < e) {
                progressMs += now - s;
                found = true;
                break;
            } else if (now < s) {
                found = true;
                break;
            }
        }
        let progress = (progressMs / totalStageMs) * 100;
        progress = Math.max(0, Math.min(100, progress));
        updateProgressBar(progress);
        updateCurrentStage(now, startTime);
        updateStageMarkers(now, startTime);
    } else {
        updateProgressBar(0);
        updateStageMarkers(null, null);
    }
}

function updateProgressBar(percentage) {
    if (!progressFill || !progressText) {
        console.warn('Progress elements not found');
        return;
    }
    
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `${Math.round(percentage)}%`;
    
    // Thay đổi màu sắc dựa trên phần trăm
    if (percentage < 25) {
        progressFill.style.background = 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)';
    } else if (percentage < 50) {
        progressFill.style.background = 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)';
    } else if (percentage < 75) {
        progressFill.style.background = 'linear-gradient(90deg, #fa709a 0%, #fee140 100%)';
    } else {
        progressFill.style.background = 'linear-gradient(90deg, #ff6b6b 0%, #ee5a24 100%)';
    }
}

function updateCurrentStage(now, startTime) {
    if (!currentStage) {
        console.warn('Current stage element not found');
        return;
    }
    const stages = getAllStagesWithPreExam();
    const currentTime = formatTimeDisplay(now);
    let currentStageName = 'Chuẩn bị';
    for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        if (currentTime >= stage.startTime && currentTime <= stage.endTime) {
            currentStageName = stage.name;
            break;
        }
    }
    currentStage.textContent = currentStageName;
}

function updateStageMarkers(now, startTime) {
    const markers = document.querySelectorAll('.stage-marker');
    const timeItems = document.querySelectorAll('.stage-time-item');
    const stages = getAllStagesWithPreExam();
    if (!now || !startTime) {
        markers.forEach(marker => {
            marker.classList.remove('completed', 'current');
        });
        timeItems.forEach(item => {
            item.classList.remove('completed', 'current');
        });
        return;
    }
    const currentTime = formatTimeDisplay(now);
    let currentStageIndex = -1;
    for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        if (currentTime >= stage.startTime && currentTime <= stage.endTime) {
            currentStageIndex = i;
            break;
        }
    }
    markers.forEach((marker, index) => {
        marker.classList.remove('completed', 'current');
        if (index < currentStageIndex) {
            marker.classList.add('completed');
        } else if (index === currentStageIndex) {
            marker.classList.add('current');
        }
    });
    timeItems.forEach((item, index) => {
        item.classList.remove('completed', 'current');
        if (index < currentStageIndex) {
            item.classList.add('completed');
        } else if (index === currentStageIndex) {
            item.classList.add('current');
        }
    });
}

function togglePause() {
    isPaused = !isPaused;
    
    if (isPaused) {
        pauseBtn.innerHTML = '<i class="fas fa-play"></i> Tiếp tục';
        pauseBtn.style.background = 'rgba(76, 175, 80, 0.3)';
    } else {
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Tạm dừng';
        pauseBtn.style.background = 'rgba(255, 255, 255, 0.2)';
    }
}

function resetCountdown() {
    if (confirm('Bạn có chắc muốn làm lại từ đầu?')) {
        // Dừng countdown
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
        
        // Xóa dữ liệu đã lưu
        localStorage.removeItem('examCountdownData');
        
        // Reset trạng thái
        isPaused = false;
        examData = {
            subject: '',
            startTime: null,
            endTime: null,
            stages: []
        };
        
        // Quay về form
        countdownScreen.classList.add('hidden');
        configForm.classList.remove('hidden');
        
        // Reset form
        examForm.reset();
        setupDefaultTimes();
        stagesContainer.innerHTML = '';
        addDefaultStages();
        
        // Reset nút pause
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Tạm dừng';
        pauseBtn.style.background = 'rgba(255, 255, 255, 0.2)';
    }
}

function handleTimeUp() {
    // Hiệu ứng kết thúc
    const countdownContainer = document.querySelector('.countdown-container');
    countdownContainer.classList.add('countdown-finished');
    
    // Thông báo
    currentStage.textContent = 'HẾT THỜI GIAN!';
    currentStage.style.color = '#ff6b6b';
    currentStage.style.animation = 'glow 0.5s ease-in-out infinite alternate';
    
    // Đánh dấu tất cả giai đoạn hoàn thành
    const markers = document.querySelectorAll('.stage-marker');
    const timeItems = document.querySelectorAll('.stage-time-item');
    
    markers.forEach(marker => {
        marker.classList.add('completed');
        marker.classList.remove('current');
    });
    
    timeItems.forEach(item => {
        item.classList.add('completed');
        item.classList.remove('current');
    });
    
    // Dừng countdown
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    // Hiển thị thông báo
    setTimeout(() => {
        alert('HẾT THỜI GIAN THI!');
    }, 1000);
}

function updateCurrentDate() {
    if (!currentDate) {
        console.warn('Current date element not found');
        return;
    }
    
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    
    const dateString = now.toLocaleDateString('vi-VN', options);
    currentDate.textContent = dateString;
}

// Thêm hiệu ứng âm thanh (tùy chọn)
function playNotificationSound() {
    // Có thể thêm âm thanh thông báo ở đây
    console.log('Notification sound played');
}

// Thêm tính năng fullscreen
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Chỉ xử lý keyboard shortcuts khi đang ở màn hình countdown
    if (countdownScreen.classList.contains('hidden')) {
        return; // Không xử lý shortcuts khi đang ở form
    }
    
    if (e.key === ' ') {
        e.preventDefault();
        togglePause();
    } else if (e.key === 'r' || e.key === 'R') {
        resetCountdown();
    } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
    }
});

// Thêm tooltip cho keyboard shortcuts
document.addEventListener('DOMContentLoaded', function() {
    // Thêm tooltip cho các nút
    pauseBtn.title = 'Space - Tạm dừng/Tiếp tục';
    resetBtn.title = 'R - Làm lại';
    
    // Thêm nút fullscreen
    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.className = 'control-btn';
    fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i> Fullscreen';
    fullscreenBtn.title = 'F - Toàn màn hình';
    fullscreenBtn.onclick = toggleFullscreen;
    
    document.querySelector('.controls').appendChild(fullscreenBtn);
});

function showStartNotification() {
    // Hiển thị thông báo bắt đầu thi
    if (currentStage) {
        currentStage.textContent = 'BẮT ĐẦU THI!';
        currentStage.style.color = '#4CAF50';
        currentStage.style.animation = 'glow 0.5s ease-in-out infinite alternate';
        
        // Reset animation sau 3 giây
        setTimeout(() => {
            if (currentStage) {
                currentStage.style.animation = '';
                currentStage.style.color = '';
            }
        }, 3000);
    }
    
    // Có thể thêm âm thanh thông báo ở đây
    playNotificationSound();
}

function showPreExamTimePicker() {
    document.getElementById('preExamTimeGroup').style.display = 'block';
}

function hidePreExamTimePicker() {
    document.getElementById('preExamTimeGroup').style.display = 'none';
}

function updatePreExamDuration() {
    const text = document.getElementById('preExamDurationText');
    if (!text) return;
    if (preExamTimeStart && preExamTimeEnd) {
        // Tính số phút
        const [h1, m1] = preExamTimeStart.split(':').map(Number);
        const [h2, m2] = preExamTimeEnd.split(':').map(Number);
        const start = h1 * 60 + m1;
        const end = h2 * 60 + m2;
        let diff = end - start;
        if (diff < 0) diff = 0;
        const hours = Math.floor(diff / 60);
        const minutes = diff % 60;
        text.textContent = `Thời lượng phát đề: ${hours} giờ ${minutes} phút`;
    } else {
        text.textContent = '';
    }
} 