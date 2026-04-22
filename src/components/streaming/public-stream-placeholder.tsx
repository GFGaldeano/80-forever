import { Clock3, MoonStar, PlayCircle, Radio } from "lucide-react";

import type { PublicStreamConfig } from "@/lib/stream/get-public-stream-config";

type PublicStreamPlaceholderProps = {
  status: PublicStreamConfig["status"];
  title?: string | null;
  subtitle?: string | null;
  offlineMessage?: string | null;
  nextLiveAt?: string | null;
};

function formatNextLive(nextLiveAt?: string | null) {
  if (!nextLiveAt) return null;

  const date = new Date(nextLiveAt);

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function PublicStreamPlaceholder({
  status,
  title,
  subtitle,
  offlineMessage,
  nextLiveAt,
}: Readonly<PublicStreamPlaceholderProps>) {
  const formattedNextLive = formatNextLive(nextLiveAt);

  const content = {
    live: {
      icon: Radio,
      title: title || "Estamos en vivo",
      description:
        subtitle || "La transmisión está activa, pero todavía no hay un embed válido para mostrar.",
    },
    replay: {
      icon: PlayCircle,
      title: title || "Replay disponible",
      description:
        subtitle || "Hay una repetición configurada, pero todavía no hay un embed válido para mostrar.",
    },
    upcoming: {
      icon: Clock3,
      title: title || "Próxima emisión",
      description:
        offlineMessage ||
        "La próxima emisión ya está programada. Muy pronto vuelve la música que no tiene tiempo.",
    },
    offline: {
      icon: MoonStar,
      title: title || "Canal offline",
      description:
        offlineMessage ||
        "Ahora no estamos al aire. Pronto vuelve una nueva emisión de 80's Forever.",
    },
  }[status];

  const Icon = content.icon;

  return (
    <div className="flex h-full min-h-[320px] flex-col items-center justify-center px-6 py-10 text-center">
      <div className="rounded-full border border-white/10 bg-white/[0.03] p-4">
        <Icon className="h-8 w-8 text-zinc-300" />
      </div>

      <h3 className="mt-5 text-2xl font-semibold text-white">{content.title}</h3>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
        {content.description}
      </p>

      {formattedNextLive ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-zinc-300">
          Próximo vivo: <span className="text-white">{formattedNextLive}</span>
        </div>
      ) : null}
    </div>
  );
}