# Dark Room — Diagnóstico da sessão de teste + melhorias

Joguei uma sessão completa automatizada (setup → ritual → 46 rodadas, até o nível Ápice). Nenhum erro de tela em branco ou travamento apareceu, e nenhum erro de console foi registrado. Mas vários problemas de lógica ficaram visíveis no registro da partida.

## Bugs encontrados (com evidência da partida)

**1. Cartas de intensidade máxima aparecem na Rodada 01 (crítico)**
Na primeira rodada, ainda em "Ignição", saiu uma carta marcada como MÁXIMA (controle total de clímax). Quando a categoria sorteada não tem ação para o nível atual, o motor libera qualquer nível em vez de pular a categoria. Isso destrói a sensação de ascensão.
Correção: se a categoria não tem ação compatível, sortear outra categoria; só usar o fallback dentro do teto do nível atual.

**2. Cartas PAUSA (tensão psicológica) e CORINGA não contam rodada**
Registro: "Rodada 04" na carta normal, PAUSA concluída, e continua "Rodada 04". O contador de rodadas, o histórico e a carga de intensidade ignoram essas cartas, mas os pontos são dados.
Correção: contar a rodada em todos os tipos de carta concluída.

**3. Carta de VIRADA não inverte de verdade**
Ela sorteia papéis do zero em vez de inverter os papéis da carta anterior, então às vezes "inverte" para a mesma configuração. Além disso, dá 20 pontos sem propor nenhuma ação — é a carta mais lucrativa e a mais vazia do jogo.
Correção: inverter os papéis reais da rodada anterior e acoplar a virada a um desafio real (a próxima carta já sai invertida), reduzindo o bônus para algo coerente.

**4. Concordância de gênero errada**
Apareceu "Bia vendado e proibido de falar". Vários textos-base têm adjetivos fixos no masculino.
Correção: usar variáveis de concordância nos textos ({o_a}, {vendado_a}) e reforçar no prompt da IA que a concordância deve seguir o gênero informado.

**5. Repetição de cartas PAUSA**
"Descreve em detalhes o que vai acontecer..." e "Circula em volta sem tocar..." saíram duas vezes cada. As cartas de tensão não entram no histórico antirrepetição.
Correção: registrar o texto-base das cartas especiais no histórico e ampliar o histórico de 10 para ~20.

**6. Cadência das cartas especiais é previsível**
Tensão a cada 4, virada a cada 5, coringa a cada 15 — sempre nos mesmos turnos, o que gerou sequências de especial-atrás-de-especial. Correção: cadência com variação aleatória dentro de uma janela e bloqueio de duas especiais seguidas.

**7. Frase em primeira pessoa fora de voz**
"Allan, seus olhos não vão sair dos meus" — o jogo fala como se fosse um dos jogadores. Revisar os textos-base nesse padrão.

**8. Ápice é um beco sem saída**
Chegando ao nível 5, a barra mostra "—" e a partida segue indefinidamente sem nenhum fechamento. Correção: após X rodadas no Ápice, oferecer a carta final ("última carta") que encerra e leva ao aftercare.

## Melhorias sugeridas

- **Placar mais justo:** hoje o ponto sempre vai para quem recebe, então o placar mede "quem aguentou mais" — o que faz sentido no modo competitivo, mas no modo Juntos confunde. No modo Juntos, mostrar só a pontuação da dupla.
- **Cartas com timer:** iniciar o timer automaticamente em vez de exigir toque, com opção de pausar.
- **Botão "trocar de categoria"** na carta, além de Pular, para quem quer outro clima sem perder a rodada.
- **Intensidade visível como escala** (1 a 5 pontinhos) em vez de só a palavra BAIXA/ALTA.
- **Resumo de sessão mais rico:** carta mais intensa concluída e tempo médio por rodada.

## Detalhes técnicos

- `src/lib/engine.ts`: reescrever `catHasActionAt`/`pickFromCat` para nunca exceder o nível atual; `drawTwist` recebe os papéis da carta anterior; `decideKind` com jitter e trava anti-sequência.
- `src/routes/play.tsx`: `recordComplete` para `tension`/`joker`; limpar buffer de prefetch quando o nível sobe (a carta pré-carregada pode ser de um nível antigo); `loadingNext` nunca é ligado — remover ou usar.
- `src/lib/store.ts`: `HISTORY_LIMIT` 10 → 20; registrar baseText das especiais.
- `src/data/challenges.ts`: revisar textos com concordância fixa no masculino e com voz em primeira pessoa.

## Ordem sugerida

1. Bugs 1, 2, 3 (afetam diretamente a progressão e o equilíbrio).
2. Bugs 4, 5, 7 (qualidade de texto).
3. Bugs 6, 8 + melhorias.

Posso implementar tudo de uma vez ou só o bloco 1 — me diz.
