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
// Armazena as opções removidas (erradas) por pergunta atual (chave: índice da pergunta)
let removidasPorPergunta = new Map();

function prepararPerguntas() {
    perguntasShuffled = shuffleArray(perguntas);
    perguntaIndex = 0;
    // Zera o mapa de opções removidas para uma nova sequência de perguntas
    removidasPorPergunta = new Map();
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
    // NÃO incrementa aqui; apenas mostra a pergunta atual
    const pergunta = perguntasShuffled[perguntaIndex];

    elementoPergunta.textContent = pergunta.pergunta;
    elementoRespostas.innerHTML = "";
    atualizarDificuldadeDisplay(pergunta.dificuldade);

    // Opções com flag de correta
    const opcoes = pergunta.respostas.map((texto, idx) => ({
        texto,
        correta: idx === pergunta.correta
    }));

    // Recupera as opções já removidas (erradas clicadas antes) nesta mesma pergunta
    const removidas = removidasPorPergunta.get(perguntaIndex) || new Set();

    // Filtra as opções: não renderiza as removidas
    const opcoesFiltradas = opcoes.filter(op => !removidas.has(op.texto));

    // Embaralha as remanescentes
    const opcoesEmbaralhadas = shuffleArray(opcoesFiltradas);

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
        // Feedback de acerto
        botaoClicado.classList.add("correct");
        adicionarPontos(dificuldade);

        // Verifica vencedor antes de continuar
        if (verificarVencedor()) return;

        // Avança para a próxima pergunta
        perguntaIndex++;
        // Alterna a vez mesmo no acerto (regra solicitada anteriormente)
        trocarEquipe();

        setTimeout(iniciarRodada, 1200);
    } else {
        // Feedback de erro
        botaoClicado.classList.add("wrong", "shake");

        // Remove pontos da equipe atual, garantindo que não fique negativo
        removerPontos(dificuldade);

        // Marca a opção clicada como removida para esta pergunta
        const textoRemovido = botaoClicado.textContent;
        const setRemovidas = removidasPorPergunta.get(perguntaIndex) || new Set();
        setRemovidas.add(textoRemovido);
        removidasPorPergunta.set(perguntaIndex, setRemovidas);

        // Alterna a vez após o erro
        trocarEquipe();

        // Mostra o modal após a animação de erro e volta com a mesma pergunta (sem incrementar índice)
        setTimeout(() => {
            const mensagem = `Resposta errada! A vez é da Equipe ${equipeDaVez}.`;
            mostrarModal("Ops!", mensagem, "Continuar", iniciarRodada);
        }, 600);
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

function removerPontos(dificuldade) {
    const pontos = dificuldade === "facil" ? 10 : dificuldade === "medio" ? 20 : 30;
    if (equipeDaVez === "A") {
        pontosEquipeA = Math.max(0, pontosEquipeA - pontos);
    } else {
        pontosEquipeB = Math.max(0, pontosEquipeB - pontos);
    }
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


function verificarVencedor() {
    if (pontosEquipeA >= 150 || pontosEquipeB >= 150) {
        const vencedor = pontosEquipeA >= 150 ? "A" : "B";
        mostrarModal(
            "Fim de Jogo",
            `Equipe ${vencedor} atingiu 150 pontos e venceu!`,
            "Reiniciar",
            () => {
                // Reinicia o jogo
                pontosEquipeA = 0;
                pontosEquipeB = 0;
                atualizarPlacar();

                // Você pode decidir quem começa após reiniciar; aqui deixo o vencedor começar
                equipeDaVez = vencedor;
                atualizarEquipeDaVezDisplay();

                prepararPerguntas();
                perguntaIndex = 0;
                removidasPorPergunta = new Map();

                iniciarRodada();
            }
        );
        return true;
    }
    return false;
}