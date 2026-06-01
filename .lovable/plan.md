# Plano — Dark Room: Jogo de Cartas para Casais

SPA premium em TanStack Start com estética minimalista "Dark Room" (preto absoluto + acentos neon), engine dinâmico de combinação de desafios, e fluxo seguro com Safe Word global.

## Stack & arquitetura

- **Frontend only** (sem backend): todo o estado vive em memória + `sessionStorage` (limpa ao fechar — privacidade).
- **Rotas** (TanStack Router):
  - `/` — Tela de Boas-vindas + Setup (Safe Word, categorias, props, modo)
  - `/play` — Arena de Gameplay (carta + ações + botão Safe Word flutuante)
  - `/aftercare` — Tela de cuidado pós-Safe Word
- **Estado global**: Zustand store (`useSessionStore`) com safe word, categorias ativas, props, modo, contador de rodadas, carta atual, histórico.
- **Animações**: framer-motion (fade/scale/swipe entre cartas).
- **Validação**: zod (safe word obrigatória, ≥1 categoria ativa antes de jogar).

## Estrutura de arquivos

```text
src/
  routes/
    __root.tsx          (head SEO, sem nav visível)
    index.tsx           (Setup)
    play.tsx            (Arena)
    aftercare.tsx       (Aftercare)
  data/
    challenges.ts       (JSON embutido com tipagem)
  lib/
    engine.ts           (gerador de desafios: standard + combinado + injeção de props + locais)
    store.ts            (Zustand)
  components/
    SafeWordButton.tsx  (botão flutuante vermelho persistente)
    ChallengeCard.tsx   (carta animada com badge de categoria/intensidade)
    CountdownTimer.tsx  (timer integrado quando o desafio tem duração)
    CategoryToggle.tsx  (switch neon com borda glow por categoria)
    PropChip.tsx        (chips selecionáveis de props)
  styles.css            (tokens dark room + cores de categoria em oklch)
```

## Tela 1 — Setup (`/`)

- **Header**: "DARK ROOM" em uppercase tracking-wide, subtítulo discreto.
- **Safe Word**: input grande, alta visibilidade, obrigatório (validação zod min 2 chars). Salvo no store.
- **Categorias** (7 toggles com cor neon própria por categoria):
  - B — Amarras & Contenção
  - D — Disciplina & Dinâmicas de Poder
  - Sensory — Privação & Estímulos
  - S/M — Impacto & Temperatura
  - K — Fetiches & Adoração Corporal
  - Ângulos & Encaixes
  - Endurance — Resistência
- **Props disponíveis** (chips toggle): Venda, Gelos, Cordas/Faixas, Vela de Massagem, Paddle/Palmatória, Pluma/Pincel, Mordaça, Gravata/Lenço, Almofada.
- **Modo**: switch entre "Modo Padrão" e "Modo Combinado".
- **CTA**: "INICIAR SESSÃO" (desabilitado se faltar Safe Word ou nenhuma categoria ativa) → `/play`.

## Tela 2 — Arena (`/play`)

- **Top bar minimalista**: contador de rodadas concluídas + badge da categoria atual.
- **Carta central** (ChallengeCard):
  - Borda neon com cor da categoria sorteada (ou gradiente das duas no modo combinado).
  - Nome da categoria em uppercase + intensidade (baixa/média/alta — derivada por heurística do tipo de ação).
  - Texto do desafio gerado pelo engine.
  - CountdownTimer renderizado automaticamente se o texto mencionar duração ("2 minutos", "3 minutos", "5 minutos", "10 minutos", "30 segundos") — regex extrai e inicia.
  - Animação fade + slight scale na entrada; swipe horizontal ao "Pular".
- **Botões de ação** (parte inferior):
  - "CONCLUÍDO" → incrementa contador, sorteia próxima.
  - "PULAR / TROCAR" → re-rola sem incrementar.
- **Safe Word flutuante** (SafeWordButton): canto inferior, vermelho neon pulsante, sempre visível. Tap → confirmação rápida → limpa estado de jogo (mantém setup) → redireciona `/aftercare`.

## Tela 3 — Aftercare (`/aftercare`)

- Tom acolhedor, mínimo, sem neon agressivo (acento suave).
- Texto de apoio: respiração, hidratação, contato físico de conforto, validação mútua.
- Botão "Voltar ao Setup" → `/`.

## Engine (`lib/engine.ts`)

```ts
type CategoryKey = keyof typeof challenges.categorias;

function drawChallenge(active: CategoryKey[], mode: 'standard'|'combined', props: string[]): {
  text: string;
  categories: CategoryKey[];
  durationSeconds?: number;
}
```

- **Standard**: escolhe 1 categoria ativa aleatória, 1 ação aleatória. Se categoria for `impact_sensacoes`, concatena ação + local aleatório do array `locais`.
- **Combined**: escolhe 2 categorias ativas distintas (fallback para standard se só houver 1 ativa), sorteia 1 ação de cada, junta com separador " + " ou " • " e nova linha.
- **Injeção de props**: substitui placeholders genéricos ("faixa", "tecido", "vela de massagem", "paddle", "venda", etc.) pelos props efetivamente selecionados; se prop necessário não está disponível, descarta a ação e sorteia de novo (até N tentativas).
- **Extração de duração**: regex em pt-BR captura "X minutos|segundos" → retorna `durationSeconds` para o timer.
- **Anti-repetição**: mantém últimos 5 IDs sorteados no store, evita repetir.

## Design system (`styles.css`)

Tokens em `oklch`, tema dark forçado:

- `--background`: oklch(0 0 0) — preto puro
- `--foreground`: oklch(0.96 0 0)
- `--muted-foreground`: oklch(0.6 0 0)
- `--border`: oklch(0.2 0 0)
- `--safe-word`: oklch(0.62 0.25 25) — vermelho neon
- Cores por categoria (acentos neon):
  - bondage: oklch(0.7 0.2 290) — violeta
  - disciplina: oklch(0.75 0.18 60) — âmbar
  - sensory: oklch(0.75 0.18 200) — ciano
  - impact: oklch(0.7 0.25 15) — vermelho-rosa
  - fetiches: oklch(0.7 0.22 330) — magenta
  - posicoes: oklch(0.78 0.18 150) — verde-menta
  - endurance: oklch(0.78 0.18 90) — lima
- Sombras glow: `box-shadow: 0 0 24px color-mix(in oklab, var(--cat-color) 40%, transparent)`.

**Tipografia**: headers em "Space Grotesk" uppercase tracking-widest; corpo em "Inter" — importados via `@import` no `styles.css` (Google Fonts).

## SEO & metadata

- `__root.tsx`: title "Dark Room", description neutra/discreta, sem og:image (conteúdo sensível, evitar preview).
- `noindex` meta para evitar indexação.
- Aviso de conteúdo adulto na entrada (modal one-time, aceite salvo em localStorage).

## Detalhes técnicos

- **Sem backend / sem analytics**: tudo client-side, `sessionStorage` para persistir setup durante refresh.
- **Acessibilidade**: contraste alto (preto + neon), foco visível, botão Safe Word com `aria-label` claro, `role="alert"` na transição para aftercare.
- **Responsivo mobile-first** (viewport atual 390px): carta ocupa ~85vh em mobile, max-width 480px em desktop.
- **Dependências novas**: `zustand`, `framer-motion`, `zod` (já presente em forms shadcn).

## Aviso

O conteúdo do JSON é explícito e voltado para adultos consentâneos. O app inclui gate de idade/consentimento na primeira visita e Safe Word obrigatório como salvaguarda primária. Não há moderação ou edição do texto fornecido — será embutido como está.
