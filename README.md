# 🎯 Javrs Libras IA – Versão Web

**Seu app de reconhecimento de Libras agora na web!**

Este é um **protótipo funcional** que migra seu projeto desktop (Python + OpenCV + MediaPipe + LSTM) para o navegador, mantendo a **identidade visual idêntica** e permitindo coleta colaborativa de dados.

---

## 📋 O Que Você Tem Aqui

```
libras-web/
├── index.html              # Estrutura HTML (layout sidebar + conteúdo)
├── styles.css             # Design visual completo (tema escuro profissional)
├── app.js                 # Lógica: login, webcam, MediaPipe, coleta, reconhecimento
├── converter_npy_to_json.py    # Converte seu dataset original (.npy) → web (.json)
├── converter_json_to_npy.py    # Converte dados coletados na web (.json) → seu projeto (.npy)
└── README.md              # Este arquivo
```

---

## 🚀 Como Rodar (1º dia – 30 minutos)

### Opção 1: Servidor local simples (recomendado para teste)

```bash
# Navega até a pasta do projeto
cd caminho/para/libras-web

# Python 3.x
python -m http.server 8000

# Ou Node.js/npm
npx http-server -p 8000
```

Depois, abre no navegador:
```
http://localhost:8000
```

### Opção 2: Abrir direto (funciona em alguns navegadores)

Simplesmente abre `index.html` no navegador (alguns recursos podem funcionar parcialmente).

### Credenciais de demo

```
Usuário: user
Senha: user

Usuário: admin
Senha: admin
```

---

## ✨ Funcionalidades Incluídas

### ✅ Módulo A: Login e Navegação
- Login com hierarquia (user/admin)
- Menu lateral fixo com 4 telas
- Header com titulo e marca
- Rodapé com data/hora em tempo real

### ✅ Módulo B: Captura de Landmarks
- **Webcam em tempo real** com MediaPipe HandLandmarker
- Desenha 21 pontos das mãos no canvas
- Exibe coordenadas (x, y, z) em tempo real (colapsável)
- Suporta 2 mãos simultaneamente

### ✅ Módulo C: Coleta de Dataset Colaborativo
1. **Grava 30 frames** de um sinal (botão "Gravar sinal")
2. Usuário digita o significado (ex: "AJUDA", "OBRIGADO")
3. **Salva em localStorage** (dados ficam no navegador, nada enviado)
4. **Download em JSON** do dataset coletado

### ✅ Módulo D: Reconhecimento por Similaridade
- Calcula **distância euclidiana** entre frames
- Compara com sinais armazenados
- Exibe badge: `"Palavra: AJUDA | Confiança: 0.87"`
- Código de cores:
  - 🟦 **Azul ciano** (#00b4d8): confiança > 0.8
  - 🟧 **Laranja** (#f39c12): confiança 0.5–0.8
  - 🟥 **Vermelho** (#e74c3c): confiança < 0.5

### ✅ Módulo E: Voz para Libras
- **Web Speech API** para reconhecimento de voz (português)
- Campo de texto para entrada manual
- Avatar simples em Canvas que se anima
- Exibe o texto reconhecido

### ✅ Módulo F: Métricas (Admin only)
- Sinais coletados
- Confiança média
- Usuários ativos
- Uptime do sistema
- **User comum**: overlay "Bloqueado" com mensagem administrativa

---

## 🔄 Converter Seus Dados (2º dia – 1-2 horas)

### Passo 1: Exportar seu dataset original para web

Se você tem um arquivo `seu_dataset.npy`:

```bash
python converter_npy_to_json.py \
  --input seu_dataset.npy \
  --output dataset.json \
  --labels seus_rotulos.txt  # opcional
```

Isso gera `dataset.json` que você pode importar no navegador:

```javascript
// Abre o console do navegador (F12 → Console)
const datasetJSON = /* copiar conteúdo de dataset.json */;
localStorage.setItem('libras_dataset', JSON.stringify(datasetJSON));
```

### Passo 2: Coletar novos dados na web

1. Use a tela "Reconhecer Libras"
2. Grave sinais novos (30 frames)
3. Clique "Download Dataset (.json)"
4. Arquivo é salvo como `libras_dataset_YYYY-MM-DD.json`

### Passo 3: Reimportar para seu projeto

```bash
python converter_json_to_npy.py \
  --input libras_dataset_2026-05-19.json \
  --output landmarks_novos.npy \
  --labels labels_novos.txt
```

Agora você tem:
- `landmarks_novos.npy` → shape (N, T, 21, 3) para seu LSTM
- `labels_novos.txt` → nomes dos sinais (um por linha)

---

## 🧠 Integrar Seu Modelo LSTM Real

Este protótipo usa **distância euclidiana simples**. Para usar seu modelo de verdade:

### Opção A: TensorFlow.js no navegador

```javascript
// No app.js, substitua a função recognizeSignalFromFrames() por:

async function recognizeWithLSTM(frames) {
    // Carrega modelo LSTM convertido para TF.js
    const model = await tf.loadLayersModel('seu_modelo/model.json');
    
    // Formata frames como tensor
    const tensor = tf.tensor4d([frames]);
    
    // Predição
    const output = model.predict(tensor);
    const prediction = await output.data();
    
    // Pós-processamento...
    tensor.dispose();
    output.dispose();
    
    return prediction;
}
```

**Converter seu Keras para TF.js:**

```bash
pip install tensorflowjs

tensorflowjs_converter \
    --input_format=tf_saved_model \
    ./seu_modelo/ \
    ./web_model/
```

### Opção B: API backend (mais seguro em produção)

Envie os landmarks para seu servidor:

```javascript
const response = await fetch('https://api.seu-servidor.com/recognize', {
    method: 'POST',
    body: JSON.stringify({ landmarks: frames }),
    headers: { 'Content-Type': 'application/json' }
});

const result = await response.json();
// result.word, result.confidence
```

---

## 🎨 Personalizar Design

Todas as cores estão definidas em `styles.css`:

```css
:root {
    --accent-primary: #00b4d8;     /* Azul ciano */
    --accent-secondary: #f39c12;   /* Laranja */
    --accent-danger: #e74c3c;      /* Vermelho */
    --bg-page: #0a0a0a;
    --bg-card: #1e1e1e;
    /* ... mais cores ... */
}
```

Mude conforme necessário!

---

## 📱 Responsividade

- ✅ Desktop (1024px+)
- ✅ Tablet (768px+)
- ⏳ Mobile (ainda não otimizado, mas estrutura preparada)

---

## 🔐 Privacidade e Segurança

- ✅ **Sem backend**: Tudo roda no navegador
- ✅ **Dados locais**: localStorage (persiste no navegador do usuário)
- ✅ **Sem upload**: Você escolhe quando fazer download do .json
- ⚠️ **Não é seguro**: Dados em localStorage podem ser acessados por scripts. Para produção, use:
  - Web Workers para isolamento
  - Backend seguro com criptografia
  - HTTPS obrigatório

---

## 📊 Estrutura de Dados

### Formato JSON (localStorage)

```json
[
  {
    "sign": "AJUDA",
    "timestamp": "2026-05-19T10:30:00Z",
    "landmarks_sequence": [
      [
        [
          [0.45, 0.30, 0.0],
          [0.46, 0.31, 0.05],
          ...
          [0.50, 0.35, 0.10]
        ]
      ],
      // ... 29 mais frames
    ]
  }
]
```

### Conversão para NumPy

```python
import numpy as np

# Após converter JSON → .npy
X = np.load('landmarks.npy')
print(X.shape)  # (N_sinais, T_frames, 21, 3)

# Usar no LSTM
model.fit(X, y, epochs=50)
```

---

## 🚀 Próximos Passos Técnicos

### Curto prazo (1-2 semanas)
1. ✅ Versão web funcional (você está aqui!)
2. ✅ Coleta de dados colaborativa
3. ✅ Conversão bidirecional de dados
4. Integrar seu modelo LSTM real (TF.js ou API)
5. Testes com comunidade piloto

### Médio prazo (1-2 meses)
- Sincronização de datasets (múltiplos usuários)
- Versionamento de modelos
- Analytics básicos (sinais mais reconhecidos, etc)
- Melhorar avatar (usar Three.js ou animação SVG)

### Longo prazo (produção)
- Backend Node.js/Python para persistência
- Banco de dados PostgreSQL para datasets
- Autenticação real (OAuth, JWT)
- CI/CD para deploy automático
- Métricas de qualidade do modelo
- API pública para integração

---

## 🐛 Troubleshooting

### "Permissão de câmera negada"
- Verifique as configurações do navegador
- Chrome/Edge: 🔒 > Câmera > Permitir
- Firefox: 🔒 > Privacidade > Câmera > Permitir

### "MediaPipe não carregou"
- Verifique conexão com internet (usa CDN)
- Verifique o console (F12) para erros

### "Web Speech API não funciona"
- Suportado em: Chrome, Edge, Safari
- Firefox: use campo de texto manual

### Dados não salvam
- LocalStorage pode estar cheio (limite ~5MB)
- Exporte e limpe com "Download Dataset"
- Private browsing (incógnito) não persiste dados

---

## 💡 Dicas de Uso

1. **Qualidade de coleta**: Gravação estável em 30 frames (∼1 segundo a 30fps)
2. **Múltiplos ângulos**: Colete o mesmo sinal de diferentes câmeras/posições para melhorar modelo
3. **Exportar frequentemente**: Não perca dados; baixe .json regularmente
4. **Testar reconhecimento**: Use dados coletados na web com seu modelo LSTM real

---

## 📄 Licença

Este protótipo é fornecido como base para migração. Adapte conforme necessário!

---

## 🤝 Contribuições

- Coletou dados novos? Exporte .json e compartilhe!
- Encontrou bug? Verifique o console (F12)
- Sugestões? Abra uma issue!

---

## 📞 Contato / Suporte

Para dúvidas sobre:
- **Web (HTML/CSS/JS)**: Verifique comentários em `app.js`
- **Conversão de dados**: Veja scripts `converter_*.py`
- **Integração LSTM**: Consulte documentação de TensorFlow.js

---

## ✨ Resumo

Você agora tem:
1. **Versão web funcional** (identidade visual idêntica)
2. **Coleta colaborativa** de sinais (crowdsourcing)
3. **Conversão bidirecional** de dados (desktop ↔ web)
4. **Prototipagem rápida** para integrar seu LSTM real
5. **Base sólida** para escalar e produção

**Próximo passo: Integre seu modelo LSTM real e comece a coletar dados da comunidade! 🚀**

---

*Javrs Libras IA – Transformando a acessibilidade em código*
