# 📅 Plano Executável de 2 Dias – Libras Web

**Objetivo**: Transformar seu projeto desktop em uma versão web funcional e demonstrável em 48 horas.

---

## 🎯 DIA 1 – Setup + Funcionalidades Essenciais (8 horas)

### 08:00–09:00 | Preparação (1h)

**O que fazer:**
1. Copie os 4 arquivos para uma pasta:
   ```bash
   mkdir libras-web
   cd libras-web
   # index.html, styles.css, app.js, converter_*.py, README.md
   ```

2. Teste servidor local:
   ```bash
   python -m http.server 8000
   # Abre http://localhost:8000
   ```

3. Você deve ver:
   - ✅ Modal de login (design escuro profissional)
   - ✅ Menu lateral com 4 itens
   - ✅ Header com "Reconhecimento de Libras" e submarca

**Tempo esperado**: 15 min (restante: revisar código)

---

### 09:00–10:30 | Login + Navegação (1.5h)

**O que fazer:**
1. Teste login:
   - Usuário: `admin` / Senha: `admin` ✅ Deve entrar
   - Usuário: `user` / Senha: `user` ✅ Deve entrar
   - Usuário: `qualquer coisa` ❌ Deve recusar

2. Teste navegação:
   - Menu: "Início" (mostra cards de features)
   - Menu: "Reconhecer Libras" (tela vazia de webcam)
   - Menu: "Voz para Libras" (tela com avatar)
   - Menu: "Métricas" (só aparece se logado como admin)
   - Menu: "Sair" (volta ao login)

3. Teste com users diferentes:
   - Admin: vê link "Métricas" no menu
   - User: não vê link "Métricas" no menu

**✅ Checkpoint**: Navegação perfeita entre telas

---

### 10:30–12:00 | Webcam + MediaPipe (1.5h)

**O que fazer:**
1. Na tela "Reconhecer Libras", clique "▶️ Iniciar Webcam"
   - Deve pedir permissão de câmera
   - Deve mostrar vídeo ao vivo
   - Deve desenhar **21 pontos azuis/laranja** nas mãos
   - Deve desenhar **linhas conectando** os pontos

2. Abra "Coordenadas em tempo real":
   - Deve mostrar valores (x, y, z) atualizando

3. Teste com 2 mãos:
   - Levante as duas mãos na frente da câmera
   - Deve desenhar landmarks em ambas

4. Clique "⏹️ Parar":
   - Deve desligar câmera
   - Botão "Gravar sinal" deve ficar desabilitado

**✅ Checkpoint**: Webcam rodando, landmarks visíveis

---

### 12:00–13:00 | Almoço ☕

---

### 13:00–15:00 | Coleta de Dataset (2h)

**O que fazer:**
1. Clique "▶️ Iniciar Webcam" novamente

2. Deixe uma mão na frente da câmera fazendo um sinal
   (ex: mão aberta, mão fechada, etc.)

3. Clique "⏹️ Gravar sinal (30 frames)":
   - Botão deve mudar para "⏹️ Gravando... 0/30"
   - Deve contar até 30
   - Deve mostrar resultado: "Palavra: [novo sinal] | Confiança: X.XX"

4. Seção "📝 Coletar novo sinal" aparece:
   - Digite: "TESTE1"
   - Clique "💾 Salvar sinal"
   - Deve mostrar: "✅ Sinal "TESTE1" salvo! Total de sinais: 1"

5. Repita 3-4 vezes com sinais diferentes:
   - "AJUDA", "OBRIGADO", "OLÁ", "TUDO_BEM"
   - Cada um deve aumentar o contador

6. Clique "⬇️ Download Dataset (.json)":
   - Deve fazer download de arquivo
   - Abra o arquivo baixado no editor de texto
   - Deve ter estrutura JSON com seus sinais

**✅ Checkpoint**: Dataset salvo localmente, downloadável em JSON

---

### 15:00–16:30 | Reconhecimento por Similaridade (1.5h)

**O que fazer:**
1. Na tela "Reconhecer Libras", você já tem dados salvos

2. Faça o sinal "AJUDA" na webcam
   - Deve reconhecer como "AJUDA" com confiança (ex: 0.75–0.95)
   - Badge deve aparecer: "Palavra: AJUDA | Confiança: 0.XX"

3. A cor deve ser:
   - 🟦 Azul ciano (confiança > 0.8)
   - 🟧 Laranja (0.5–0.8)
   - 🟥 Vermelho (< 0.5)

4. Faça um sinal diferente:
   - Reconhecimento pode errar (é por similaridade simples)
   - Badge se atualiza em tempo real

**✅ Checkpoint**: Reconhecimento funcionando (mesmo que impreciso)

---

### 16:30–17:30 | Voz para Libras (1h)

**O que fazer:**
1. Vá para tela "Voz para Libras"

2. Clique "🎤 Fale algo...":
   - Deve acender luz de microfone
   - Fale em português: "Olá, tudo bem?"
   - Deve reconhecer e preencher campo de texto
   - Avatar deve se animar

3. Ou digite manualmente no campo:
   - "OBRIGADO", "AJUDA", etc.
   - Clique fora do campo
   - Avatar se anima

4. Clique "🗑️ Limpar":
   - Deve limpar texto

**✅ Checkpoint**: Voz funcionando (mesmo sem tradução para Libras real)

---

### 17:30–18:00 | Métricas e Admin (0.5h)

**O que fazer:**
1. Faça logout e login como **admin/admin**

2. Menu "Métricas" deve aparecer

3. Clique em "Métricas":
   - Deve mostrar 4 cards:
     - Sinais coletados: X
     - Confiança média: 0.XX
     - Usuários ativos: 1
     - Uptime: 99%

4. Faça logout e login como **user/user**

5. Tente acessar "Métricas":
   - Link desaparece do menu
   - Se tentar URL direta, mostra overlay "🔒 Bloqueado"

**✅ Checkpoint**: Controle de acesso funcionando

---

### 18:00–18:30 | Validação Final do Dia 1

**Checklist:**
- ✅ Login com 2 usuários diferentes
- ✅ Navegação entre telas (sem recarregar)
- ✅ Webcam + MediaPipe (landmarks visíveis)
- ✅ Coleta de 4+ sinais
- ✅ Download de JSON
- ✅ Reconhecimento por similaridade
- ✅ Voz funcionando
- ✅ Controle admin/user
- ✅ Design visual idêntico ao original

**Status**: 🟢 **DIA 1 COMPLETO** ✨

---

## 🎯 DIA 2 – Integração de Dados + Documentação (8 horas)

### 09:00–10:00 | Preparar Conversão de Dados (1h)

**O que fazer:**
1. Se você tem arquivo `seu_dataset.npy` do projeto desktop:

   ```bash
   python converter_npy_to_json.py \
     --input seu_dataset.npy \
     --output dataset_desktop.json
   ```

   Você agora tem um JSON que pode importar na web!

2. Se você tem rótulos em arquivo `.txt`:

   ```bash
   python converter_npy_to_json.py \
     --input seu_dataset.npy \
     --output dataset_desktop.json \
     --labels seus_rotulos.txt
   ```

3. Valide o arquivo gerado:
   - Abra `dataset_desktop.json` em editor de texto
   - Deve ter estrutura:
     ```json
     [
       {
         "sign": "AJUDA",
         "timestamp": "...",
         "landmarks_sequence": [...]
       }
     ]
     ```

**✅ Checkpoint**: Dataset convertido com sucesso

---

### 10:00–11:00 | Importar Dataset Original na Web (1h)

**O que fazer:**
1. Abra a demo web em navegador

2. Login como `admin/admin`

3. Abra DevTools (F12 → Console)

4. Cole este código:
   ```javascript
   const datasetJSON = [ /* copiar conteúdo de dataset_desktop.json */ ];
   localStorage.setItem('libras_dataset', JSON.stringify(datasetJSON));
   ```

5. Recarregue a página (F5)

6. Vá para "Reconhecer Libras":
   - Seus sinais originais devem estar disponíveis!
   - Faça um sinal que está no dataset
   - Deve reconhecer com alta confiança

**✅ Checkpoint**: Dados originais integrados na web

---

### 11:00–12:00 | Testar Ciclo Completo (1h)

**O que fazer:**
1. Colete 3 sinais **novos** na web:
   - "NOVO1", "NOVO2", "NOVO3"

2. Clique "⬇️ Download Dataset":
   - Salva como `libras_dataset_2026-05-DD.json`

3. Converta de volta para NPY:
   ```bash
   python converter_json_to_npy.py \
     --input libras_dataset_2026-05-DD.json \
     --output landmarks_web.npy \
     --labels labels_web.txt
   ```

4. Valide o arquivo:
   ```python
   import numpy as np
   X = np.load('landmarks_web.npy')
   print(X.shape)  # Deve ser (3, 30, 21, 3) ou similar
   
   with open('labels_web.txt') as f:
       labels = [line.strip() for line in f]
   print(labels)  # ['NOVO1', 'NOVO2', 'NOVO3']
   ```

**✅ Checkpoint**: Ciclo bidirecional funcionando

---

### 12:00–13:00 | Almoço ☕

---

### 13:00–15:00 | Documentação + Testes (2h)

**O que fazer:**
1. Leia `README.md` completo:
   - Verifique se todas as instruções fazem sentido
   - Teste cada comando
   - Valide exemplos de código

2. Teste com um colega/amigo:
   - Ele deve conseguir:
     - Abrir a demo
     - Fazer login
     - Gravar um sinal
     - Baixar dataset
   - Sem sua ajuda (só lendo README)

3. Documente qualquer erro encontrado:
   - Adicione à seção "Troubleshooting" do README

4. Revise comentários no código:
   - HTML: está claro?
   - CSS: está organizado por seção?
   - JS: está bem comentado?

**✅ Checkpoint**: Documentação validada

---

### 15:00–16:00 | Preparação para Modelo Real (1h)

**O que fazer:**
1. Se você vai usar **TensorFlow.js**:

   ```bash
   pip install tensorflowjs
   
   tensorflowjs_converter \
       --input_format=tf_saved_model \
       ./seu_modelo/ \
       ./web_model/
   ```

   Crie arquivo `integrar_lstm.js` com template:
   ```javascript
   // Exemplo: substituir reconhecimento simples por modelo real
   async function recognizeWithLSTM(frames) {
       const model = await tf.loadLayersModel('web_model/model.json');
       const tensor = tf.tensor4d([frames]);
       const output = model.predict(tensor);
       // ... processamento
       tensor.dispose();
       return prediction;
   }
   ```

2. Se você vai usar **backend**:

   Crie arquivo `integrar_api.js`:
   ```javascript
   async function recognizeWithAPI(frames) {
       const response = await fetch('https://seu-servidor.com/recognize', {
           method: 'POST',
           body: JSON.stringify({ landmarks: frames })
       });
       return await response.json();
   }
   ```

**✅ Checkpoint**: Templates preparados para integração real

---

### 16:00–17:00 | Demo Final (1h)

**O que fazer:**
1. Prepare uma sequência de demo de 10 minutos:

   **Passo 1** (1 min): Login
   ```
   - Abra navegador
   - Mostra login
   - Login como admin
   ```

   **Passo 2** (3 min): Coleta
   ```
   - Vai para "Reconhecer Libras"
   - Liga webcam
   - Mostra landmarks sendo desenhados
   - Grava 1 sinal novo
   ```

   **Passo 3** (2 min): Reconhecimento
   ```
   - Repete o sinal que foi gravado
   - Mostra que foi reconhecido com alta confiança
   ```

   **Passo 4** (2 min): Voz
   ```
   - Vai para "Voz para Libras"
   - Fala algo
   - Mostra avatar se mexendo
   ```

   **Passo 5** (2 min): Download + Conversão
   ```
   - Download dataset em JSON
   - Mostra conversão JSON → NPY
   ```

2. Grave a sequência em vídeo (opcional):
   ```bash
   # OBS Studio, ScreenFlow, ou similar
   ```

**✅ Checkpoint**: Demo pronta para apresentar

---

### 17:00–18:00 | Finalização + Limpeza (1h)

**O que fazer:**
1. Revise todos os arquivos:
   - ✅ `index.html` – sem erros
   - ✅ `styles.css` – cores corretas
   - ✅ `app.js` – lógica funcional
   - ✅ `converter_*.py` – testados
   - ✅ `README.md` – completo
   - ✅ Este arquivo: `PLANO_EXECUCAO_2_DIAS.md`

2. Crie arquivo `.gitignore` se for usar Git:
   ```
   node_modules/
   __pycache__/
   *.pyc
   .DS_Store
   ```

3. Prepare entrega:
   ```bash
   # Confirme que tudo está em uma pasta
   ls -la libras-web/
   # index.html, styles.css, app.js, converter_*.py, 
   # README.md, PLANO_EXECUCAO_2_DIAS.md
   ```

4. Teste uma última vez com servidor:
   ```bash
   python -m http.server 8000
   # Visita http://localhost:8000
   # Valida cada funcionalidade
   ```

**✅ Checkpoint**: Tudo pronto para delivery

---

### 18:00–18:30 | Resumo Final

**O que você conquistou em 2 dias:**

| Funcionalidade | Dia 1 | Dia 2 |
|---|---|---|
| Login com hierarquia | ✅ 09:00–10:30 | - |
| Navegação dinâmica | ✅ 09:00–10:30 | - |
| Webcam + MediaPipe | ✅ 10:30–12:00 | - |
| Coleta de sinais | ✅ 13:00–15:00 | - |
| Reconhecimento básico | ✅ 15:00–16:30 | ✅ Integrado |
| Voz para Libras | ✅ 16:30–17:30 | - |
| Controle Admin/User | ✅ 17:30–18:00 | - |
| Conversão de dados | - | ✅ 09:00–11:00 |
| Documentação | - | ✅ 13:00–15:00 |
| Integração do modelo real | - | ✅ 15:00–16:00 |
| Demo pronta | - | ✅ 16:00–17:00 |

---

## 🎁 Arquivos de Entrega

```
libras-web/
├── index.html                    # ✅ HTML estruturado
├── styles.css                    # ✅ Design identidade visual
├── app.js                        # ✅ Lógica completa
├── converter_npy_to_json.py      # ✅ Conversão .npy → .json
├── converter_json_to_npy.py      # ✅ Conversão .json → .npy
├── README.md                     # ✅ Documentação completa
├── PLANO_EXECUCAO_2_DIAS.md      # ✅ Este arquivo
├── integrar_lstm.js              # ⏳ Template (se usar TF.js)
├── integrar_api.js               # ⏳ Template (se usar API)
└── dataset_desktop.json          # ⏳ Seus dados originais convertidos
```

---

## 🎯 Resultado Final

Você terá um **app de reconhecimento de Libras na web** que:

✅ **Funciona offline** (navegador local)  
✅ **Design idêntico** ao original desktop  
✅ **Coleta colaborativa** de sinais  
✅ **Exporta/importa dados** facilmente  
✅ **Pronto para integrar** seu modelo LSTM real  
✅ **Documentado** em português  
✅ **Testado** e validado  

---

## 💡 Dica Final

Se você conseguir completar tudo nos **2 dias**, parabéns! 🎉

Se não conseguir, está tudo bem:
- Dia 1 é essencial (funcionalidades core)
- Dia 2 é preparação (integração com seu projeto)
- Você pode fazer Dia 2 nos dias seguintes sem pressa

**O importante é ter uma base sólida para evoluir!**

---

*Boa sorte! 🚀 Você tem 48h para transformar seu projeto. Vamos lá!*
