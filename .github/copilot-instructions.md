# Quiz Bíblico - Instruções para Agentes de IA

## Visão Geral do Projeto
Este é um **quiz competitivo** em tempo real com duas equipes, focado em perguntas bíblicas. A aplicação é um jogo web vanilla (HTML/CSS/JS) sem frameworks, com sistema de turnos, pontuação dinâmica e timer.

## Arquitetura Principal

### Sistema de Perguntas
- **Fonte de dados**: `perguntas.json` - array de objetos com estrutura fixa
- **Estrutura da pergunta**:
  ```json
  {
    "pergunta": "string",
    "respostas": ["opção1", "opção2", "opção3", "opção4"],
    "correta": 0,  // índice da resposta correta
    "dificuldade": "facil|medio|dificil"
  }
  ```
- **Sistema de pontuação**: Fácil=10pts, Médio=20pts, Difícil=30pts
- **Embaralhamento**: Perguntas e opções são embaralhadas, mas a resposta correta mantém referência por índice

### Mecânicas do Jogo
- **Alternância de equipes**: Sempre alterna após cada pergunta (acerto ou erro)
- **Remoção de opções**: Respostas erradas são removidas da pergunta atual, não da pergunta original
- **Timer**: 120 segundos por rodada, reinicia a cada nova pergunta
- **Condição de vitória**: Primeira equipe a atingir 150 pontos
- **Penalização**: Resposta errada remove pontos (não fica negativo)

### Estado Global Crítico
```javascript
// Variáveis de estado que controlam toda a lógica
let perguntasShuffled = [];     // Perguntas embaralhadas
let perguntaIndex = 0;          // Índice atual da pergunta
let removidasPorPergunta = new Map(); // Opções removidas por pergunta
let equipeDaVez = "A";          // Equipe atual
```

## Padrões de Desenvolvimento

### Estrutura de Arquivos
- `index.html` - Interface mínima, foco nos elementos de estado
- `script.js` - Lógica principal com funções bem definidas
- `perguntas.json` - Base de dados das perguntas
- `style.css` - Design system com CSS custom properties

### Convenções de Nomenclatura
- **IDs de elementos**: Prefixo descritivo (`#elementoPergunta`, `#elementoRespostas`)
- **Classes CSS**: Kebab-case (`team-a`, `btn-passar`)
- **Funções JS**: camelCase descritivo (`mostrarProximaPergunta`, `verificarResposta`)

### Padrão Modal
Sistema modal customizado para feedback:
```javascript
mostrarModal(titulo, mensagem, botaoTexto, onContinueCallback)
```
- Usado para: mudança de equipe, timeout, fim de jogo
- Modal recria botão dinamicamente para evitar listeners duplicados

### Sistema de Animações
- **Feedback visual**: `.correct`, `.wrong`, `.shake` para respostas
- **Transições**: `.fade-in` para novos elementos
- **CSS custom properties**: Cores das equipes via `--a` e `--b`

## Fluxos de Trabalho Críticos

### Adicionando Novas Perguntas
1. Editar `perguntas.json` mantendo estrutura exata
2. Usar índice 0-3 para `"correta"`
3. Classificar dificuldade adequadamente
4. Testar carregamento via fetch (erro crítico se JSON inválido)

### Modificando Mecânicas do Jogo
- **Pontuação**: Função `adicionarPontos()` e `removerPontos()`
- **Timer**: Variável `tempoRestante` e função `iniciarContador()`
- **Alternância**: Função `trocarEquipe()` sempre chamada após resposta

### Debugging Common Issues
- **Perguntas não carregam**: Verificar console, erro no fetch do JSON
- **Estado inconsistente**: Verificar `removidasPorPergunta` Map
- **Modal não funciona**: Botão é recriado dinamicamente, não usar addEventListener direto

## Integração e Dependências
- **Sem frameworks**: Vanilla JavaScript ES6+
- **Carregamento**: `fetch()` assíncrono para JSON
- **Compatibilidade**: CSS moderno (custom properties, grid, flexbox)
- **Deploy**: Servidor estático suficiente, JSON deve ser servido via HTTP

## Considerações de UX
- **Feedback imediato**: Cores e animações para acerto/erro
- **Acessibilidade**: Modal com `role="dialog"` e `aria-*`
- **Responsividade**: Grid layout que colapsa em mobile
- **Estado visual**: Badges coloridos mostram equipe atual e dificuldade