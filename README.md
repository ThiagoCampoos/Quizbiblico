## Visão Geral
O Quiz Competitivo é uma aplicação web interativa que permite a realização de competições de perguntas e respostas entre duas equipes. O sistema foi desenvolvido utilizando HTML, CSS e JavaScript puro, sem dependências de frameworks externos, tornando-o leve e de fácil manutenção.

## Funcionalidades Principais
### 1. Sistema de Equipes
- Suporte para duas equipes (Equipe A e Equipe B)
- Sistema de pontuação baseado na dificuldade das perguntas
- Indicador visual da equipe atual
- Troca automática de equipes após cada resposta
### 2. Gerenciamento de Perguntas
- Carregamento dinâmico de perguntas a partir de um arquivo JSON
- Categorização por níveis de dificuldade (Fácil, Médio, Difícil)
- Embaralhamento aleatório das perguntas e opções
- Sistema para passar perguntas para a equipe adversária
### 3. Interface do Usuário
- Design responsivo adaptável a diferentes tamanhos de tela
- Feedback visual para respostas corretas e incorretas
- Animações para melhorar a experiência do usuário
- Sistema de modais para mensagens e transições
- Contador de tempo para cada pergunta
### 4. Regras do Jogo
- Pontuação variável conforme dificuldade (10, 20 ou 30 pontos)
- Penalização por respostas incorretas
- Remoção de opções incorretas após tentativas erradas
- Condição de vitória ao atingir 150 pontos
- Possibilidade de passar a pergunta para a outra equipe
## Arquitetura do Projeto
### Estrutura de Arquivos
- index.html : Estrutura da página e elementos de UI
- style.css : Estilização e animações
- script.js : Lógica do jogo e interatividade
- perguntas.json : Banco de perguntas e respostas
### Componentes Principais Sistema de Modais
Implementação de um sistema de modais reutilizável para diferentes tipos de mensagens:

- Troca de equipes
- Respostas corretas/incorretas
- Tempo esgotado
- Fim de jogo
- Erros críticos Sistema de Animações
- Animações de entrada para novas perguntas (fade-in)
- Feedback visual para respostas corretas (pulse-win)
- Feedback visual para respostas incorretas (shake)
- Animação para abertura de modais (pop)
## Implementações Recentes
### Botão "Passar Pergunta"
Adicionamos um botão que permite à equipe atual passar a pergunta para a equipe adversária quando não souber a resposta, com as seguintes características:

- Posicionado centralmente abaixo das opções de resposta
- Estilização consistente com o design da aplicação
- Feedback visual ao passar o mouse (hover)
- Integração com o sistema de troca de equipes
### Melhorias na Experiência do Usuário
- Substituição de alertas nativos por modais personalizados
- Transições suaves entre perguntas
- Feedback visual aprimorado para respostas
- Melhor tratamento de erros no carregamento de perguntas
## Próximos Passos
### Melhorias Planejadas
- Implementação de categorias temáticas para as perguntas
- Sistema de estatísticas de jogo
- Modo de jogo com tempo limitado
- Suporte para mais de duas equipes
- Opção para personalização de nomes das equipes
### Correções Pendentes
- Otimização para dispositivos móveis
- Melhorias de acessibilidade
- Armazenamento local de progresso do jogo
## Informações Técnicas
### Requisitos do Sistema
- Navegador web moderno com suporte a ES6
- Conexão com internet para carregamento inicial
### Instruções de Instalação
1. 1.
   Clone o repositório
2. 2.
   Não são necessárias dependências externas
3. 3.
   Abra o arquivo index.html em um navegador web
### Manutenção
Para adicionar novas perguntas, edite o arquivo perguntas.json seguindo o formato existente:

{
  "pergunta": "Texto da pergunta",
  "respostas": ["Opção 1", "Opção 2", "Opção 3", "Opção 4"],
  "correta": 0,
  "dificuldade": "facil"
}
