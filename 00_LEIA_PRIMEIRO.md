# 🚀 LEIA PRIMEIRO – Guia Rápido

## Bem-vindo! Você tem tudo pronto para rodar em **5 minutos**.

---

## ⚡ Quick Start (5 minutos)

### 1. Abrir projeto
```bash
cd libras-web/
# Todos os arquivos estão nesta pasta
```

### 2. Rodar servidor
```bash
python -m http.server 8000
# Ou: npx http-server -p 8000
```

### 3. Abrir navegador
```
http://localhost:8000
```

### 4. Login
```
Usuário: admin (ou user)
Senha: admin (ou user)
```

### 5. Testar
- ✅ Clique "▶️ Iniciar Webcam"
- ✅ Veja landmarks sendo desenhados
- ✅ Grave um sinal (30 frames)
- ✅ Baixe dataset em JSON

**Pronto! 🎉**

---

## 📂 Arquivos Inclusos

```
libras-web/
├── index.html                       # Estrutura HTML (layout sidebar + main)
├── styles.css                       # Design visual completo
├── app.js                           # Lógica: login, webcam, coleta, reconhecimento
├── converter_npy_to_json.py         # Script: dataset original → web (.npy → .json)
├── converter_json_to_npy.py         # Script: dados coletados → desktop (.json → .npy)
├── README.md                        # Documentação completa (LEIA!!)
├── PLANO_EXECUCAO_2_DIAS.md         # Timeline detalhada com timebox
└── 00_LEIA_PRIMEIRO.md              # Este arquivo
```

---

## 🎯 O Que Você Consegue Fazer

### ✨ Funcionalidades Prontas

- ✅ **Login** com hierarquia (admin/user)
- ✅ **Webcam** em tempo real com MediaPipe
- ✅ **Landmarks** de mão (21 pontos) desenhados
- ✅ **Coleta** de sinais (30 frames)
- ✅ **Reconhecimento** por similaridade (distância euclidiana)
- ✅ **Voz** para texto (Web Speech API)
- ✅ **Avatar** simples em Canvas
- ✅ **Export/Import** de dataset em JSON
- ✅ **Admin panel** com métricas
- ✅ **Design** idêntico ao original

### ⏳ Pronto para Integrar

- ⏳ Seu **modelo LSTM** (TensorFlow.js ou API backend)
- ⏳ Seu **dataset original** (.npy → web)
- ⏳ Coleta **em escala** (comunidade/crowdsourcing)

---

## 📖 Próximas Leituras

### Se você tem **5 minutos** 👇
→ Rode o Quick Start acima (secção ⚡)

### Se você tem **30 minutos** 👇
→ Leia `README.md` (secção "O Que Você Tem Aqui")

### Se você tem **2 horas** 👇
→ Siga `PLANO_EXECUCAO_2_DIAS.md` (Dia 1)

### Se você tem **seus dados** (.npy) 👇
→ Veja `README.md` (secção "Converter Seus Dados")

---

## 🔗 Dependências

- ✅ **Navegador moderno** (Chrome, Edge, Firefox, Safari)
- ✅ **Python 3.x** (para servidor local)
- ✅ **NumPy** (para conversão de dados)
  ```bash
  pip install numpy
  ```
- ✅ **Conexão internet** (MediaPipe usa CDN)

---

## 🎓 Estrutura da Entrega

```
ARQUITETURA DE MIGRAÇÃO
├── Parte 1: Como converter TensorFlow/Keras → TensorFlow.js
│   └── Trade-offs: latência vs privacidade vs custo
│
CÓDIGO FUNCIONAL
├── Parte 2A: Layout (HTML + CSS grid)
├── Parte 2B: Webcam + landmarks (MediaPipe)
├── Parte 2C: Coleta de dataset (localStorage)
├── Parte 2D: Reconhecimento (distância euclidiana)
├── Parte 2E: Voz para Libras (Web Speech API)
├── Parte 2F: Login e controle de acesso (admin/user)
│
SCRIPTS DE CONVERSÃO
├── Parte 3: .npy ↔ .json (bidirecional)
│
DOCUMENTAÇÃO
├── Parte 4: README em português (completo)
└── Bônus: Plano de 2 dias (executável)
```

---

## ⚠️ Importantes

1. **Privacidade**: Dados salvos em `localStorage` (navegador local)
   - Nada é enviado para servidor por padrão
   - Para produção, implemente backend seguro

2. **Reconhecimento**: Usa similaridade simples (você pode integrar LSTM real depois)

3. **Webcam**: Requer permissão do navegador

4. **Data**: Sempre faça download do dataset JSON antes de limpar navegador

---

## 💬 Primeira Dúvida?

### "Não funciona!"
1. Verifique console (F12 → Console)
2. Veja secção "Troubleshooting" no README.md
3. Verifique URL: http://localhost:8000 (não http://localhost:8000/index.html)

### "Como adiciono meu modelo LSTM?"
1. Leia secção "Integrar Seu Modelo LSTM Real" em README.md
2. Use TensorFlow.js (web) ou API backend (recomendado produção)

### "Como converto meus dados?"
1. Leia secção "Converter Seus Dados" em README.md
2. Use scripts `converter_*.py`

---

## 🎬 Próximo Passo

1. **Agora**: Siga o ⚡ Quick Start acima
2. **Depois**: Leia `README.md` para entender tudo
3. **Dia 1**: Siga `PLANO_EXECUCAO_2_DIAS.md` (Dia 1)
4. **Dia 2**: Siga `PLANO_EXECUCAO_2_DIAS.md` (Dia 2)

---

## ✨ Resultado

Você terá um **app web funcional** que é **visualmente idêntico** ao seu original desktop, roda **sem instalação** no navegador, permite **coleta colaborativa** de dados, e está **100% pronto** para integrar seu modelo LSTM real.

**Boa sorte! 🚀**

---

*Javrs Libras IA – Transformando a acessibilidade em código*

*Criado em 2 dias | Pronto para escalar | Documentação em português*
