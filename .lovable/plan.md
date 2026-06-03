# Plano — Dark Room v2

Implementação em fases das 12 melhorias. Mantém estética dark atual; muda arquitetura, conteúdo e fluxo.

## Fase 1 — Fundação (dados + motor)

**1.1 Novo banco de dados** (`src/data/challenges.ts`)
- Reestruturar: cada categoria com `acoes` indexadas por nível (`"1"` a `"5"`), `rank_base`, flags `oculta` e `especial`.
- Adicionar categorias novas: `tensao_psicologica` (oculta), `coringa` (especial), `virada` (especial).
- Textos com variáveis `{ativo} {passivo} {pronome} {pronome_cap} {dele_dela} {dele_dela_ativo} {local}`.
- S/M (impact) com array `locais`.

**1.2 Sistema de jogadores + gênero** (store)
- Adicionar ao store: `jogador1 {nome, genero}`, `jogador2 {nome, genero}`, `controle: 'aleatorio'|'j1'|'j2'`.
- Persistir em sessionStorage.
- A cada nova carta, calcular `ativo`/`passivo` conforme `controle`.

**1.3 Motor de substituição** (`src/lib/text.ts` novo)
- Função `interpolate(texto, {ativo, passivo})` que troca todas as variáveis.
- Pronomes derivados do gênero do passivo/ativo.

**1.4 Motor de props como camada adicional** (`engine.ts`)
- Mapa `PROP_HINTS` (venda/gelo/corda/etc → frase extra).
- Retorna `{ text, propHint? }`. Card exibe propHint em itálico.
- Match por keywords (categoria/texto compatível).

## Fase 2 — Sistema de níveis (5 níveis)

**2.1** Substituir `LEVELS` (3 → 5): IGNIÇÃO/SEDUÇÃO/TENSÃO/ENTREGA/ÁPICE com thresholds 0/20/50/100/180 e cores definidas.
**2.2** `levelForScore` atualizado. `IntensityRank = 1..5`.
**2.3** Pontuação: +10 concluído, +15 c/ timer, +5 combinado, +20 carta de virada.
**2.4** Filtro de cartas no engine: nível da ação ≤ nível atual.

## Fase 3 — Cartas especiais

**3.1 Coringa**: 1 a cada ~15 sorteios (contador no store). Renderiza tela única (fundo branco, texto preto "{ativo} decide."). Componente `JokerCard`.
**3.2 Virada**: a cada 5 rodadas concluídas, força próxima carta como virada. Inverte ativo/passivo só naquela rodada. +20 pts. Borda laranja pulsante. Componente `TwistCard`.
**3.3 Tensão Psicológica**: a cada 4 rodadas concluídas, força carta dessa categoria (oculta, sem toggle). Borda cinza sutil.

Engine decide a sequência: virada > tensão psicológica > coringa (probabilístico) > sorteio normal.

## Fase 4 — Setup expandido (`/`)

Ordem de seções:
- **00 · Jogadores**: 2 nomes + gênero (M/F) + "Quem comanda" (3 botões).
- **01 · Safe Word** (existente).
- **02 · Categorias** (com glow ativo — já existente, refinar).
- **03 · Props** como chips com check (refazer visual).
- **04 · Modo de jogo**: Padrão / Combinado.
- **05 · Pontuação**: Juntos / Competitivo (+ campos secretos de recompensa quando competitivo).
- **06 · Ritual de abertura** (toggle, padrão on).

Validação: nomes obrigatórios + safe word + ≥1 categoria.

## Fase 5 — Fluxo de jogo (`/play`)

**5.1 Ritual** (`/ritual` nova rota ou overlay): tela fullscreen com timer 30s opcional, botão "Estamos prontos".
**5.2 Card redesenhado** (`ChallengeCard`):
- Topo: linha "{ativo} comanda · {passivo} recebe" + badges (categoria + intensidade).
- Centro: texto 18-20px, respiro generoso.
- Prop hint em itálico, opacity 70%.
- Timer como arco SVG circular (sem números), pulsa ao zerar.
**5.3 Animações**: flip de entrada (rotateY 0.4s), concluir → slide up + fade, pular → slide left + fade. Framer-motion.
**5.4 Barra de progressão narrativa**: nome do nível atual ← barra com glow → próximo nível. Sem números. Micro-pulso ao pontuar.
**5.5 Safe word discreto**: ícone ⬡ canto superior direito, expande no hover/touch para botão completo.
**5.6 Level-up cinematográfico**: fullscreen, nome 72-80px na cor do nível, subtítulo, glow pulsante, botão "Continuar" aparece após 2.5s.
**5.7 Micro-animações**: "+10/+15" sobe e some em verde neon perto da barra ao pontuar.

## Fase 6 — Final de sessão

**6.1 Aftercare** (`/aftercare`): visual invertido (bege `#F5F0EB`, texto escuro, sem neon). Texto diferente para safe-word vs. encerramento normal. Cross-fade 0.8s. Botão único "Estamos bem." → histórico.
**6.2 Histórico** (`/historia` nova rota): nível alcançado, rodadas, top 3 categorias, tempo total, pulos, carta mais intensa. Se competitivo: revela recompensa do vencedor (quem recebeu mais soma de níveis como passivo). Botão "Nova sessão" → `/`.

Store rastreia: `startedAt`, `roundsCompleted`, `skips`, `categoryCounts`, `maxLevelPlayed`, `passiveLoad: {j1, j2}`.

## Detalhes técnicos

- Cores dos níveis como CSS vars em `styles.css`: `--lvl-1` … `--lvl-5`.
- Tipos: `IntensityRank = 1|2|3|4|5`, `CategoryKey` expandido.
- Engine retorna `DrawResult = { kind: 'normal'|'joker'|'twist'|'tension', challenge, ativo, passivo, levelOfCard }`.
- Cron interno via contadores no store (não usar timers globais).
- `framer-motion` já instalado — usar `AnimatePresence` com `mode="wait"`.

## Escopo desta sessão

Implementarei tudo de uma vez (volume grande, mas coerente). Se algo ficar limítrofe, sinalizo. Conteúdo dos desafios: vou escrever um banco enxuto mas funcional (10–15 ações por nível, por categoria) usando as variáveis — você refina depois se quiser mais volume.

Posso seguir?
