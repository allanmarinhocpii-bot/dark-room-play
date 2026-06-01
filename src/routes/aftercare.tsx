import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/aftercare")({
  head: () => ({
    meta: [
      { title: "Dark Room — Aftercare" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AftercarePage,
});

function AftercarePage() {
  return (
    <div className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto max-w-md text-center">
        <p className="font-display text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
          Sessão encerrada
        </p>
        <h1 className="mt-3 font-display text-4xl uppercase tracking-wider text-foreground">
          Aftercare
        </h1>
        <div className="mx-auto mt-4 h-px w-16 bg-border" />

        <p className="mt-8 text-base leading-relaxed text-foreground">
          Respirem juntos. Sem pressa. O jogo acabou — o cuidado começa agora.
        </p>

        <ul className="mt-8 space-y-4 text-left text-sm text-muted-foreground">
          <CareItem
            title="Respiração"
            body="Inspirem fundo pelo nariz por 4 segundos e soltem pela boca por 6. Repitam cinco vezes."
          />
          <CareItem
            title="Toque de conforto"
            body="Abraço prolongado, mãos sobre o peito, contato pele a pele sem expectativa."
          />
          <CareItem
            title="Hidratação"
            body="Água, chá morno ou algo doce. O corpo precisa repor energia."
          />
          <CareItem
            title="Palavras"
            body="Compartilhem o que funcionou, o que surpreendeu e o que vocês querem ajustar da próxima vez."
          />
          <CareItem
            title="Tempo"
            body="Sem retorno imediato à rotina. Reservem ao menos 15 minutos de presença mútua."
          />
        </ul>

        <Link
          to="/"
          className="mt-12 inline-block rounded-md border border-border px-6 py-3 font-display text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
        >
          Voltar ao Setup
        </Link>
      </div>
    </div>
  );
}

function CareItem({ title, body }: { title: string; body: string }) {
  return (
    <li className="rounded-md border border-border bg-card p-4">
      <p className="font-display text-[10px] uppercase tracking-[0.25em] text-foreground">{title}</p>
      <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
    </li>
  );
}
