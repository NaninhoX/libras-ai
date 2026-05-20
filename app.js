// ==================== GLOBALS ====================
let handLandmarker = null;
let video = null;
let canvas = null;
let canvasCtx = null;
let lastLandmarks = null;
let recording = false;
let recordedFrames = [];
const FRAMES_TO_RECORD = 30;
let currentRole = null; // 'admin' ou 'user'
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

// ==================== INICIALIZAÇÃO ====================
async function initMediaPipe() {
    const vision = await window.createVisionTasks();
    const filesetResolver = await vision.FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );
    handLandmarker = await vision.HandLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
        },
        numHands: 1,
        runningMode: "VIDEO"
    });
    console.log("MediaPipe pronto");
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
    // Desenhar conexões simplificadas (MediaPipe tem 21 pontos)
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
        if (document.getElementById('coordsPanel').style.display !== 'none') {
            updateCoordsDisplay(lastLandmarks);
        }
        // Se estiver gravando, armazena os landmarks
        if (recording && recordedFrames.length < FRAMES_TO_RECORD) {
            // Normalizar: centralizar na palma (ponto 0)
            const palmBase = lastLandmarks[0];
            const normalized = lastLandmarks.map(lm => ({
                x: lm.x - palmBase.x,
                y: lm.y - palmBase.y,
                z: lm.z - palmBase.z
            }));
            recordedFrames.push(normalized);
            const statusDiv = document.getElementById('recordingStatus');
            statusDiv.innerText = `Gravando... ${recordedFrames.length}/${FRAMES_TO_RECORD}`;
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
    document.getElementById('recordingStatus').innerText = "Gravando... 0/30";
}

async function finishRecording() {
    recording = false;
    const signName = prompt("Digite o significado do sinal (ex: AJUDA, OLA):");
    if (!signName) {
        document.getElementById('recordingStatus').innerText = "Gravação cancelada.";
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
    document.getElementById('recordingStatus').innerHTML = `Sinal "${signName}" salvo! Total: ${allSigns.length}`;
    recordedFrames = [];
    updateMetricsDisplay();
}

// ==================== RECONHECIMENTO (distância euclidiana) ====================
function normalizeSequence(seq) {
    // seq é array de frames, cada frame com 21 pontos {x,y,z}
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
        }, 100); // 10fps para demo (mais suave)
    });
    const currentSeq = await promise;
    
    const allSigns = JSON.parse(localStorage.getItem('libras_signs') || '[]');
    if (allSigns.length === 0) {
        document.getElementById('confidenceBadge').innerHTML = "Palavra: --- | Confiança: Nenhum sinal cadastrado";
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
    // Converter distância em confiança (quanto menor distância, maior confiança)
    let confidence = 1 / (1 + bestDistance);
    confidence = Math.min(0.99, confidence);
    let confidenceColor = "var(--primary-cyan)";
    if (confidence < 0.5) confidenceColor = "var(--danger-red)";
    else if (confidence < 0.8) confidenceColor = "var(--primary-orange)";
    else confidenceColor = "var(--primary-cyan)";
    
    const badge = document.getElementById('confidenceBadge');
    badge.innerHTML = `Palavra: ${bestMatch.sign} | Confiança: ${confidence.toFixed(3)}`;
    badge.style.backgroundColor = `${confidenceColor}20`;
    badge.style.color = confidenceColor;
    badge.style.borderLeft = `4px solid ${confidenceColor}`;
}

// ==================== VOZ PARA LIBRAS (Web Speech) ====================
let speechRecognition = null;
function initSpeech() {
    if ('webkitSpeechRecognition' in window) {
        speechRecognition = new webkitSpeechRecognition();
        speechRecognition.continuous = false;
        speechRecognition.lang = 'pt-BR';
        speechRecognition.interimResults = false;
        speechRecognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            document.getElementById('voiceText').value = text;
            document.getElementById('translatedText').innerHTML = `🎬 Tradução para Libras (simulação): "${text.toUpperCase()}" em sinais.`;
            // Animação simples do avatar
            const avatarCanvas = document.getElementById('avatarCanvas');
            const ctx = avatarCanvas.getContext('2d');
            ctx.fillStyle = "#2c3e50";
            ctx.fillRect(0,0,150,150);
            ctx.fillStyle = "white";
            ctx.font = "20px sans-serif";
            ctx.fillText("🤖", 60, 80);
            setTimeout(() => drawAvatar(), 500);
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
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = "#2c3e50";
    ctx.fillRect(0,0,150,150);
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(75, 60, 25, 0, 2*Math.PI);
    ctx.fill();
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(65, 55, 3, 0, 2*Math.PI);
    ctx.arc(85, 55, 3, 0, 2*Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(75, 70, 8, 0, Math.PI);
    ctx.fillStyle = "#e74c3c";
    ctx.fill();
    // mãos
    ctx.fillStyle = "white";
    ctx.fillRect(40,80,20,10);
    ctx.fillRect(90,80,20,10);
}

// ==================== LOGIN E HIERARQUIA ====================
function doLogin() {
    const user = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPass').value;
    if (user === 'admin' && pass === 'admin') {
        currentRole = 'admin';
        userInfoSpan.innerText = 'Admin';
        securitySpan.innerText = 'Sim';
        footerSecurity.innerText = 'Sim';
        loginModal.style.display = 'none';
        updateUIBasedOnRole();
    } else if (user === 'user' && pass === 'user') {
        currentRole = 'user';
        userInfoSpan.innerText = 'Usuário';
        securitySpan.innerText = 'Não';
        footerSecurity.innerText = 'Não';
        loginModal.style.display = 'none';
        updateUIBasedOnRole();
    } else {
        alert("Credenciais inválidas. Use admin/admin ou user/user");
    }
}
function updateUIBasedOnRole() {
    const adminMetrics = document.getElementById('metricsGridAdmin');
    const userMetrics = document.getElementById('metricsGridUser');
    if (currentRole === 'admin') {
        adminMetrics.style.display = 'grid';
        userMetrics.style.display = 'none';
        updateMetricsDisplay();
    } else {
        adminMetrics.style.display = 'none';
        userMetrics.style.display = 'block';
    }
}
function updateMetricsDisplay() {
    const allSigns = JSON.parse(localStorage.getItem('libras_signs') || '[]');
    document.getElementById('totalSignals').innerText = allSigns.length;
    // Média de confiança simulada (poderia ser real)
    document.getElementById('avgConfidence').innerText = (Math.random() * 0.2 + 0.75).toFixed(2);
}
function logout() {
    currentRole = null;
    loginModal.style.display = 'flex';
    userInfoSpan.innerText = 'Visitante';
    securitySpan.innerText = 'Não';
    footerSecurity.innerText = 'Não';
    // Fechar stream se quiser
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }
    location.reload(); // simples
}

// ==================== NAVEGAÇÃO ====================
function navigateTo(pageId) {
    Object.keys(pages).forEach(id => {
        pages[id].classList.remove('active');
    });
    pages[pageId].classList.add('active');
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
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('openModuleDemo').addEventListener('click', () => alert("Módulo de expansão em breve. Versão web demonstrativa."));
    document.getElementById('startRecordingBtn').addEventListener('click', startRecording);
    document.getElementById('recognizeBtn').addEventListener('click', recognizeSign);
    document.getElementById('toggleCoordsBtn').addEventListener('click', () => {
        const panel = document.getElementById('coordsPanel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });
    document.getElementById('startVoiceBtn').addEventListener('click', startVoiceRecognition);
    document.getElementById('doLoginBtn').addEventListener('click', doLogin);
}

// ==================== RELÓGIO RODAPÉ ====================
function updateDateTime() {
    const now = new Date();
    const formatted = now.toLocaleString('pt-BR');
    document.getElementById('datetime').innerText = formatted;
    setTimeout(updateDateTime, 1000);
}

// ==================== MAIN ====================
window.onload = async () => {
    video = document.getElementById('webcam');
    canvas = document.getElementById('landmarkCanvas');
    canvasCtx = canvas.getContext('2d');
    await initMediaPipe();
    await startWebcam();
    detectFrame();
    setupNavigation();
    updateDateTime();
    initSpeech();
    drawAvatar();
    // Ajustar canvas tamanho
    setInterval(() => {
        if (video.videoWidth) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        }
    }, 1000);
    // Forçar login inicial
    loginModal.style.display = 'flex';
};
