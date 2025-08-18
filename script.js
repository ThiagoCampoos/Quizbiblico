// Substituir o array de perguntas atual por este:
let perguntas = [];

let pontosEquipeA = 0;
let pontosEquipeB = 0;
let equipeDaVez = "A";
let tempoRestante = 120;
let timer;

// Elementos da UI
const elementoPergunta = document.getElementById("pergunta");
const elementoRespostas = document.getElementById("respostas");
const elementoPontosA = document.getElementById("pontosA");
const elementoPontosB = document.getElementById("pontosB");
const elementoContador = document.getElementById("contador");
const elementoEquipeVez = document.getElementById("equipeVez");
const elementoDificuldade = document.getElementById("dificuldade");

// Elementos do Modal
const modalOverlay = document.getElementById("modalOverlay");
const modalTitulo = document.getElementById("modalTitulo");
const modalMensagem = document.getElementById("modalMensagem");
let modalBtnContinuar = document.getElementById("modalBtnContinuar"); // 'let' para poder ser recriado

// --- Funções do Modal ---

function fecharModal() {
    modalOverlay.classList.remove("show");
}

function mostrarModal(titulo, mensagem, botaoTexto = "Continuar", onContinueCallback) {
    modalTitulo.textContent = titulo;
    modalMensagem.textContent = mensagem;
    
    const novoBotao = modalBtnContinuar.cloneNode(true);
    novoBotao.textContent = botaoTexto;
    modalBtnContinuar.parentNode.replaceChild(novoBotao, modalBtnContinuar);
    modalBtnContinuar = novoBotao;

    const continueAction = () => {
        fecharModal();
        if (onContinueCallback) {
            onContinueCallback();
        }
    };

    modalBtnContinuar.addEventListener("click", continueAction, { once: true });

    modalOverlay.classList.add("show");
    const modal = modalOverlay.querySelector(".modal");
    modal.classList.remove("pop");
    void modal.offsetWidth;
    modal.classList.add("pop");
}

// --- Lógica do Quiz ---

// Utilitários de dificuldade e embaralhamento
const DIFICULDADE_LABEL = { facil: "Fácil", medio: "Médio", dificil: "Difícil" };

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function triggerFade(...elements) {
    elements.forEach(el => {
        if (!el) return;
        el.classList.remove("fade-in");
        void el.offsetWidth; // Força o "reflow" para reiniciar a animação
        el.classList.add("fade-in");
    });
}

let perguntasShuffled = [];
let perguntaIndex = 0;

function prepararPerguntas() {
    perguntasShuffled = shuffleArray(perguntas);
    perguntaIndex = 0;
}

function iniciarRodada() {
    clearInterval(timer);
    tempoRestante = 120;
    mostrarProximaPergunta();
    iniciarContador();
}

function atualizarDificuldadeDisplay(dificuldade) {
    if (!elementoDificuldade) return;
    const cls = dificuldade || "facil";
    elementoDificuldade.textContent = `Nível: ${DIFICULDADE_LABEL[cls] || "Fácil"}`;
    elementoDificuldade.className = `badge diff ${cls}`;
}

function mostrarProximaPergunta() {
    if (perguntaIndex >= perguntasShuffled.length) {
        prepararPerguntas();
    }
    const pergunta = perguntasShuffled[perguntaIndex++];
    elementoPergunta.textContent = pergunta.pergunta;
    elementoRespostas.innerHTML = "";
    atualizarDificuldadeDisplay(pergunta.dificuldade);

    const opcoes = pergunta.respostas.map((texto, idx) => ({
        texto,
        correta: idx === pergunta.correta
    }));
    const opcoesEmbaralhadas = shuffleArray(opcoes);

    opcoesEmbaralhadas.forEach(op => {
        const botaoResposta = document.createElement("button");
        botaoResposta.className = "resposta";
        botaoResposta.textContent = op.texto;
        botaoResposta.onclick = () => verificarResposta(op.correta, pergunta.dificuldade, botaoResposta);
        elementoRespostas.appendChild(botaoResposta);
    });

    // anima a entrada dos elementos
    triggerFade(elementoPergunta, elementoRespostas);
}

function verificarResposta(acertou, dificuldade, botaoClicado) {
    clearInterval(timer);

    // Desabilita todos os botões para evitar cliques múltiplos
    const botoes = elementoRespostas.querySelectorAll(".resposta");
    botoes.forEach(b => b.disabled = true);

    if (acertou) {
        botaoClicado.classList.add("correct");
        adicionarPontos(dificuldade);
        trocarEquipe(); // Troca a equipe mesmo no acerto
        // Apenas espera um pouco e vai para a próxima rodada
        setTimeout(iniciarRodada, 1200);
    } else {
        botaoClicado.classList.add("wrong", "shake");
        trocarEquipe();
        
        // Mostra o modal após a animação de erro
        setTimeout(() => {
            const mensagem = `Resposta errada! A vez é da Equipe ${equipeDaVez}.`;
            mostrarModal("Ops!", mensagem, "Continuar", iniciarRodada);
        }, 600); // A duração da animação shake
    }
}

function atualizarEquipeDaVezDisplay() {
    if (!elementoEquipeVez) return;
    elementoEquipeVez.textContent = `Vez da Equipe: ${equipeDaVez}`;
    elementoEquipeVez.className = `badge team-${equipeDaVez.toLowerCase()}`;
}

function adicionarPontos(dificuldade) {
    const pontos = dificuldade === "facil" ? 10 : dificuldade === "medio" ? 20 : 30;
    if (equipeDaVez === "A") pontosEquipeA += pontos;
    else pontosEquipeB += pontos;
    atualizarPlacar();
}

function trocarEquipe() {
    equipeDaVez = equipeDaVez === "A" ? "B" : "A";
    atualizarEquipeDaVezDisplay();
}

function atualizarPlacar() {
    elementoPontosA.textContent = pontosEquipeA;
    elementoPontosB.textContent = pontosEquipeB;
}

function iniciarContador() {
    elementoContador.textContent = `Tempo: ${tempoRestante}s`;
    timer = setInterval(() => {
        tempoRestante--;
        elementoContador.textContent = `Tempo: ${tempoRestante}s`;
        if (tempoRestante <= 0) {
            clearInterval(timer);
            trocarEquipe();
            atualizarEquipeDaVezDisplay();
            mostrarModal(
                "Tempo Esgotado!", 
                `Agora é a vez da Equipe ${equipeDaVez}.`,
                "Continuar",
                iniciarRodada
            );
        }
    }, 1000);
}

// Carregar perguntas do JSON
async function carregarPerguntas() {
    try {
        const resp = await fetch('perguntas.json', { cache: 'no-store' });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        perguntas = Array.isArray(data) ? data : [];
        if (perguntas.length === 0) {
            throw new Error('JSON de perguntas está vazio ou mal formatado.');
        }
    } catch (e) {
        console.error('Erro ao carregar perguntas:', e);
        mostrarModal(
            "Erro Crítico",
            "Não foi possível carregar as perguntas. Verifique o console para mais detalhes e se o arquivo `perguntas.json` está acessível.",
            "Tentar Novamente",
            () => window.location.reload()
        );
        perguntas = []; // Garante que o quiz não continue sem perguntas
    }
}

// Inicialização do app
window.onload = iniciarAplicacao;
async function iniciarAplicacao() {
    await carregarPerguntas();
    // Se o carregamento falhar, o modal de erro já foi mostrado.
    // Apenas continua se houver perguntas.
    if (perguntas.length > 0) {
        atualizarPlacar();
        atualizarEquipeDaVezDisplay();
        prepararPerguntas();
        iniciarRodada();
    }
}