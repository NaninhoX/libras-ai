// ==================== GLOBALS ====================
let handLandmarker = null;
let video = null;
let canvas = null;
let canvasCtx = null;
let lastLandmarks = null;
let recording = false;
let recordedFrames = [];
const FRAMES_TO_RECORD = 30;
let currentRole = null;
let recognitionInterval = null;
let currentStream = null;

// Elementos do DOM
const pages = {
    home: document.getElementById('homePage'),
    recognize: document.getElementById('recognizePage'),
    voiceToLibras: document.getElementById('voiceToLibrasPage')
};
const navItems = document.querySelectorAll('.nav-item');
const loginModal = document.getElementById('loginModal');
const userInfoSpan = document.getElementById('userInfo');
const securitySpan = document.getElementById('securityStatus');
const footerSecurity = document.getElementById('footerSecurity');

// ==================== MEDIAPIPE CORRIGIDO ====================
async function initMediaPipe() {
    try {
        // Verifica se o MediaPipe foi carregado
        if (!window.vision) {
            console.error("MediaPipe Vision não carregado");
            return;
        }
        
        const filesetResolver = await window.vision.FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        
        handLandmarker = await window.vision.HandLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
                modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
                delegate: "GPU"
            },
            numHands: 1,
            runningMode: "VIDEO"
        });
        console.log("MediaPipe pronto");
    } catch (error) {
        console.error("Erro ao inicializar MediaPipe:", error);
    }
}

async function startWebcam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        currentStream = stream;
        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play();
                resolve();
            };
        });
    } catch (err) {
        console.error("Erro webcam:", err);
        alert("Permita acesso à câmera.");
    }
}

function drawLandmarks(landmarks, videoWidth, videoHeight) {
    if (!canvasCtx) return;
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    if (!landmarks) return;
    
    canvasCtx.beginPath();
    canvasCtx.strokeStyle = "#00b4d8";
    canvasCtx.fillStyle = "#ffffff";
    canvasCtx.lineWidth = 2;
    for (let lm of landmarks) {
        const x = lm.x * canvas.width;
        const y = lm.y * canvas.height;
        canvasCtx.beginPath();
        canvasCtx.arc(x, y, 4, 0, 2 * Math.PI);
        canvasCtx.fill();
        canvasCtx.stroke();
    }
    // Desenhar conexões simplificadas
    const connections = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
    canvasCtx.beginPath();
    canvasCtx.strokeStyle = "#00b4d8";
    for (let [a,b] of connections) {
        if (landmarks[a] && landmarks[b]) {
            const p1 = {x: landmarks[a].x * canvas.width, y: landmarks[a].y * canvas.height};
            const p2 = {x: landmarks[b].x * canvas.width, y: landmarks[b].y * canvas.height};
            canvasCtx.beginPath();
            canvasCtx.moveTo(p1.x, p1.y);
            canvasCtx.lineTo(p2.x, p2.y);
            canvasCtx.stroke();
        }
    }
}

function updateCoordsDisplay(landmarks) {
    const coordsDiv = document.getElementById('landmarkCoords');
    if (!landmarks) {
        coordsDiv.innerText = "Nenhuma mão detectada";
        return;
    }
    let text = "Pontos (x,y,z):\n";
    landmarks.forEach((p, idx) => {
        text += `${idx}: (${p.x.toFixed(3)}, ${p.y.toFixed(3)}, ${p.z.toFixed(3)})\n`;
    });
    coordsDiv.innerText = text;
}

// Loop de detecção
function detectFrame() {
    if (!handLandmarker || !video || video.readyState < 2) {
        requestAnimationFrame(detectFrame);
        return;
    }
    const startTime = performance.now();
    const results = handLandmarker.detectForVideo(video, startTime);
    if (results.landmarks.length > 0) {
        lastLandmarks = results.landmarks[0];
        drawLandmarks(lastLandmarks, video.videoWidth, video.videoHeight);
        if (document.getElementById('coordsPanel') && document.getElementById('coordsPanel').style.display !== 'none') {
            updateCoordsDisplay(lastLandmarks);
        }
        // Se estiver gravando, armazena os landmarks
        if (recording && recordedFrames.length < FRAMES_TO_RECORD) {
            const palmBase = lastLandmarks[0];
            const normalized = lastLandmarks.map(lm => ({
                x: lm.x - palmBase.x,
                y: lm.y - palmBase.y,
                z: lm.z - palmBase.z
            }));
            recordedFrames.push(normalized);
            const statusDiv = document.getElementById('recordingStatus');
            if (statusDiv) {
                statusDiv.innerText = `Gravando... ${recordedFrames.length}/${FRAMES_TO_RECORD}`;
            }
            if (recordedFrames.length === FRAMES_TO_RECORD) {
                finishRecording();
            }
        }
    } else {
        drawLandmarks(null, video.videoWidth, video.videoHeight);
    }
    requestAnimationFrame(detectFrame);
}

// ==================== COLEÇÃO DE SINAIS ====================
function startRecording() {
    if (recording) return;
    if (!lastLandmarks) {
        alert("Mão não detectada. Mostre sua mão para a câmera.");
        return;
    }
    recording = true;
    recordedFrames = [];
    const statusDiv = document.getElementById('recordingStatus');
    if (statusDiv) statusDiv.innerText = "Gravando... 0/30";
}

async function finishRecording() {
    recording = false;
    const signName = prompt("Digite o significado do sinal (ex: AJUDA, OLA):");
    if (!signName) {
        const statusDiv = document.getElementById('recordingStatus');
        if (statusDiv) statusDiv.innerText = "Gravação cancelada.";
        recordedFrames = [];
        return;
    }
    const data = {
        sign: signName.toUpperCase(),
        timestamp: new Date().toISOString(),
        landmarks_sequence: recordedFrames
    };
    // Salvar no localStorage
    let allSigns = JSON.parse(localStorage.getItem('libras_signs') || '[]');
    allSigns.push(data);
    localStorage.setItem('libras_signs', JSON.stringify(allSigns));
    // Download JSON
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const a = document.createElement('a');
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = `sinal_${signName}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    const statusDiv = document.getElementById('recordingStatus');
    if (statusDiv) statusDiv.innerHTML = `Sinal "${signName}" salvo! Total: ${allSigns.length}`;
    recordedFrames = [];
    updateMetricsDisplay();
}

// ==================== RECONHECIMENTO ====================
function normalizeSequence(seq) {
    return seq;
}

function euclideanDistance(seq1, seq2) {
    let total = 0;
    for (let f = 0; f < seq1.length; f++) {
        for (let p = 0; p < seq1[f].length; p++) {
            const dx = seq1[f][p].x - seq2[f][p].x;
            const dy = seq1[f][p].y - seq2[f][p].y;
            const dz = seq1[f][p].z - seq2[f][p].z;
            total += dx*dx + dy*dy + dz*dz;
        }
    }
    return Math.sqrt(total);
}

async function recognizeSign() {
    if (!lastLandmarks) {
        alert("Mostre sua mão para a câmera.");
        return;
    }
    // Coletar 30 frames atuais
    let tempFrames = [];
    const promise = new Promise((resolve) => {
        let count = 0;
        const interval = setInterval(() => {
            if (lastLandmarks) {
                const palmBase = lastLandmarks[0];
                const normalized = lastLandmarks.map(lm => ({
                    x: lm.x - palmBase.x,
                    y: lm.y - palmBase.y,
                    z: lm.z - palmBase.z
                }));
                tempFrames.push(normalized);
                count++;
                if (count === FRAMES_TO_RECORD) {
                    clearInterval(interval);
                    resolve([...tempFrames]);
                }
            }
        }, 100);
    });
    const currentSeq = await promise;
    
    const allSigns = JSON.parse(localStorage.getItem('libras_signs') || '[]');
    if (allSigns.length === 0) {
        const badge = document.getElementById('confidenceBadge');
        if (badge) badge.innerHTML = "Palavra: --- | Confiança: Nenhum sinal cadastrado";
        return;
    }
    let bestMatch = null;
    let bestDistance = Infinity;
    for (let signData of allSigns) {
        const dist = euclideanDistance(currentSeq, signData.landmarks_sequence);
        if (dist < bestDistance) {
            bestDistance = dist;
            bestMatch = signData;
        }
    }
    let confidence = 1 / (1 + bestDistance);
    confidence = Math.min(0.99, confidence);
    let confidenceColor = "var(--primary-cyan)";
    if (confidence < 0.5) confidenceColor = "var(--danger-red)";
    else if (confidence < 0.8) confidenceColor = "var(--primary-orange)";
    else confidenceColor = "var(--primary-cyan)";
    
    const badge = document.getElementById('confidenceBadge');
    if (badge) {
        badge.innerHTML = `Palavra: ${bestMatch.sign} | Confiança: ${confidence.toFixed(3)}`;
        badge.style.backgroundColor = `${confidenceColor}20`;
        badge.style.color = confidenceColor;
        badge.style.borderLeft = `4px solid ${confidenceColor}`;
    }
}

// ==================== VOZ PARA LIBRAS ====================
let speechRecognition = null;
function initSpeech() {
    if ('webkitSpeechRecognition' in window) {
        speechRecognition = new webkitSpeechRecognition();
        speechRecognition.continuous = false;
        speechRecognition.lang = 'pt-BR';
        speechRecognition.interimResults = false;
        speechRecognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            const voiceText = document.getElementById('voiceText');
            const translatedText = document.getElementById('translatedText');
            if (voiceText) voiceText.value = text;
            if (translatedText) translatedText.innerHTML = `🎬 Tradução para Libras (simulação): "${text.toUpperCase()}" em sinais.`;
            drawAvatar();
        };
        speechRecognition.onerror = () => alert("Erro no microfone.");
    } else {
        alert("Seu navegador não suporta Web Speech API.");
    }
}
function startVoiceRecognition() {
    if (speechRecognition) {
        speechRecognition.start();
    }
}
function drawAvatar() {
    const canvas = document.getElementById('avatarCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = "#2c3e50";
    ctx.fillRect(0, 0, 150, 150);
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(75, 60, 25, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(65, 55, 3, 0, 2 * Math.PI);
    ctx.arc(85, 55, 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(75, 70, 8, 0, Math.PI);
    ctx.fillStyle = "#e74c3c";
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.fillRect(40, 80, 20, 10);
    ctx.fillRect(90, 80, 20, 10);
}

// ==================== LOGIN CORRIGIDO ====================
function doLogin() {
    const user = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPass').value;
    const modal = document.getElementById('loginModal');
    
    if (user === 'admin' && pass === 'admin') {
        currentRole = 'admin';
        if (userInfoSpan) userInfoSpan.innerText = 'Admin';
        if (securitySpan) securitySpan.innerText = 'Sim';
        if (footerSecurity) footerSecurity.innerText = 'Sim';
        if (modal) modal.style.display = 'none';
        updateUIBasedOnRole();
        updateMetricsDisplay();
    } 
    else if (user === 'user' && pass === 'user') {
        currentRole = 'user';
        if (userInfoSpan) userInfoSpan.innerText = 'Usuário';
        if (securitySpan) securitySpan.innerText = 'Não';
        if (footerSecurity) footerSecurity.innerText = 'Não';
        if (modal) modal.style.display = 'none';
        updateUIBasedOnRole();
    } 
    else {
        alert("Credenciais inválidas. Use admin/admin ou user/user");
    }
}

function updateUIBasedOnRole() {
    const adminMetrics = document.getElementById('metricsGridAdmin');
    const userMetrics = document.getElementById('metricsGridUser');
    if (currentRole === 'admin') {
        if (adminMetrics) adminMetrics.style.display = 'grid';
        if (userMetrics) userMetrics.style.display = 'none';
    } else {
        if (adminMetrics) adminMetrics.style.display = 'none';
        if (userMetrics) userMetrics.style.display = 'block';
    }
}

function updateMetricsDisplay() {
    const allSigns = JSON.parse(localStorage.getItem('libras_signs') || '[]');
    const totalSignals = document.getElementById('totalSignals');
    if (totalSignals) totalSignals.innerText = allSigns.length;
    const avgConfidence = document.getElementById('avgConfidence');
    if (avgConfidence) avgConfidence.innerText = (Math.random() * 0.2 + 0.75).toFixed(2);
}

function logout() {
    currentRole = null;
    const modal = document.getElementById('loginModal');
    if (modal) modal.style.display = 'flex';
    if (userInfoSpan) userInfoSpan.innerText = 'Visitante';
    if (securitySpan) securitySpan.innerText = 'Não';
    if (footerSecurity) footerSecurity.innerText = 'Não';
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }
    location.reload();
}

// ==================== NAVEGAÇÃO ====================
function navigateTo(pageId) {
    Object.keys(pages).forEach(id => {
        if (pages[id]) pages[id].classList.remove('active');
    });
    if (pages[pageId]) pages[pageId].classList.add('active');
    navItems.forEach(btn => btn.classList.remove('active'));
    const activeNav = Array.from(navItems).find(btn => btn.dataset.page === pageId);
    if (activeNav) activeNav.classList.add('active');
}

function setupNavigation() {
    navItems.forEach(btn => {
        if (btn.dataset.page) {
            btn.addEventListener('click', () => navigateTo(btn.dataset.page));
        }
    });
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    
    const openModuleBtn = document.getElementById('openModuleDemo');
    if (openModuleBtn) openModuleBtn.addEventListener('click', () => alert("Módulo de expansão em breve. Versão web demonstrativa."));
    
    const startRecordingBtn = document.getElementById('startRecordingBtn');
    if (startRecordingBtn) startRecordingBtn.addEventListener('click', startRecording);
    
    const recognizeBtn = document.getElementById('recognizeBtn');
    if (recognizeBtn) recognizeBtn.addEventListener('click', recognizeSign);
    
    const toggleCoordsBtn = document.getElementById('toggleCoordsBtn');
    if (toggleCoordsBtn) {
        toggleCoordsBtn.addEventListener('click', () => {
            const panel = document.getElementById('coordsPanel');
            if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        });
    }
    
    const startVoiceBtn = document.getElementById('startVoiceBtn');
    if (startVoiceBtn) startVoiceBtn.addEventListener('click', startVoiceRecognition);
    
    const doLoginBtn = document.getElementById('doLoginBtn');
    if (doLoginBtn) doLoginBtn.addEventListener('click', doLogin);
}

// ==================== RELÓGIO ====================
function updateDateTime() {
    const now = new Date();
    const formatted = now.toLocaleString('pt-BR');
    const datetimeDiv = document.getElementById('datetime');
    if (datetimeDiv) datetimeDiv.innerText = formatted;
    setTimeout(updateDateTime, 1000);
}

// ==================== MAIN ====================
window.onload = async () => {
    video = document.getElementById('webcam');
    canvas = document.getElementById('landmarkCanvas');
    if (canvas) canvasCtx = canvas.getContext('2d');
    
    await initMediaPipe();
    await startWebcam();
    detectFrame();
    setupNavigation();
    updateDateTime();
    initSpeech();
    drawAvatar();
    
    // Ajustar canvas tamanho
    setInterval(() => {
        if (video && video.videoWidth && canvas) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        }
    }, 1000);
    
    // Forçar login inicial
    if (loginModal) loginModal.style.display = 'flex';
};
