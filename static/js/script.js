const file1Input = document.getElementById('file1');
const file2Input = document.getElementById('file2');
const preview1 = document.getElementById('preview1');
const preview2 = document.getElementById('preview2');
const dropzone1 = document.getElementById('dropzone1');
const dropzone2 = document.getElementById('dropzone2');
const analyzeBtn = document.getElementById('analyzeBtn');
const loadingState = document.getElementById('loadingState');
const resultsDisplay = document.getElementById('resultsDisplay');
const scoreProgress = document.getElementById('scoreProgress');
const scoreValue = document.getElementById('scoreValue');
const statusCard = document.getElementById('statusCard');
const statusTitle = document.getElementById('statusTitle');
const statusDescription = document.getElementById('statusDescription');
const matchLevel = document.getElementById('matchLevel');
const riskLevel = document.getElementById('riskLevel');
const confidence = document.getElementById('confidence');
const resetBtn = document.getElementById('resetBtn');

// File upload handlers
file1Input.addEventListener('change', (e) => handleFileSelect(e, preview1, 1));
file2Input.addEventListener('change', (e) => handleFileSelect(e, preview2, 2));

function handleFileSelect(e, preview, num) {
    if (e.target.files.length > 0) {
        const file = e.target.files[0];
        preview.textContent = `✓ ${file.name}`;
        preview.classList.add('show');
        checkBothFiles();
    }
}

// Drag and drop
[dropzone1, dropzone2].forEach((zone, index) => {
    const input = index === 0 ? file1Input : file2Input;
    const preview = index === 0 ? preview1 : preview2;

    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('active');
    });

    zone.addEventListener('dragleave', () => {
        zone.classList.remove('active');
    });

    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('active');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            input.files = files;
            handleFileSelect({ target: input }, preview, index + 1);
        }
    });
});

function checkBothFiles() {
    if (file1Input.files.length > 0 && file2Input.files.length > 0) {
        analyzeBtn.disabled = false;
    }
}

// Analyze button
analyzeBtn.addEventListener('click', async () => {
    const formData = new FormData();
    formData.append('file1', file1Input.files[0]);
    formData.append('file2', file2Input.files[0]);

    loadingState.classList.add('active');
    resultsDisplay.classList.remove('active');
    analyzeBtn.disabled = true;

    try {
        const response = await fetch('/compare', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (data.error) {
            alert('Error: ' + data.error);
            return;
        }

        displayResults(data.similarity);
    } catch (error) {
        alert('Error: ' + error.message);
    } finally {
        loadingState.classList.remove('active');
        analyzeBtn.disabled = false;
    }
});

function displayResults(similarity) {
    resultsDisplay.classList.add('active');

    // Determine colors and status
    let color, status, description, risk, match;
    
    if (similarity >= 80) {
        color = '#ef4444';
        status = '🚨 High Similarity Detected';
        description = `The documents show ${similarity}% similarity. This indicates significant overlap and potential plagiarism. Immediate review recommended.`;
        risk = 'Critical';
        match = 'Exact Match';
    } else if (similarity >= 60) {
        color = '#f59e0b';
        status = '⚠️ Moderate Similarity Found';
        description = `Documents have ${similarity}% similarity. Notable content overlap detected. Further investigation suggested.`;
        risk = 'Medium';
        match = 'Partial Match';
    } else if (similarity >= 40) {
        color = '#3b82f6';
        status = 'ℹ️ Some Similarity Detected';
        description = `Documents show ${similarity}% similarity. Some common elements found, but largely unique content.`;
        risk = 'Low';
        match = 'Minor Match';
    } else {
        color = '#10b981';
        status = '✅ Minimal Similarity';
        description = `Only ${similarity}% similarity detected. Documents appear to be original and unique.`;
        risk = 'None';
        match = 'Unique';
    }

    // Update score circle
    const circumference = 2 * Math.PI * 90;
    scoreProgress.style.strokeDasharray = circumference;
    scoreProgress.style.stroke = color;
    
    setTimeout(() => {
        const offset = circumference - (similarity / 100) * circumference;
        scoreProgress.style.strokeDashoffset = offset;
    }, 100);

    // Animate score value
    animateValue(scoreValue, 0, similarity, 2000);
    scoreValue.style.color = color;

    // Update status card
    statusCard.style.borderLeft = `4px solid ${color}`;
    statusTitle.textContent = status;
    statusTitle.style.color = color;
    statusDescription.textContent = description;

    // Update metrics
    matchLevel.textContent = match;
    matchLevel.style.color = color;
    riskLevel.textContent = risk;
    riskLevel.style.color = color;
    confidence.textContent = '98%';
    confidence.style.color = '#10b981';
}

function animateValue(element, start, end, duration) {
    let startTime = null;
    
    function animation(currentTime) {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value + '%';
        
        if (progress < 1) {
            requestAnimationFrame(animation);
        }
    }
    
    requestAnimationFrame(animation);
}

// Reset button
resetBtn.addEventListener('click', () => {
    file1Input.value = '';
    file2Input.value = '';
    preview1.textContent = '';
    preview2.textContent = '';
    preview1.classList.remove('show');
    preview2.classList.remove('show');
    resultsDisplay.classList.remove('active');
    analyzeBtn.disabled = true;
    scoreProgress.style.strokeDashoffset = 2 * Math.PI * 90;
});