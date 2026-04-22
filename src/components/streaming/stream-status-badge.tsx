import { Radio, Clock3, PlayCircle, MoonStar } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { PublicStreamConfig } from "@/lib/stream/get-public-stream-config";

type StreamStatus = PublicStreamConfig["status"];

const statusMap: Record<
  StreamStatus,
  {
    label: string;
    className: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  live: {
    label: "En vivo",
    className:
      "border border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
    icon: Radio,
  },
  upcoming: {
    label: "Próximamente",
    className:
      "border border-amber-500/30 bg-amber-500/10 text-amber-300",
    icon: Clock3,
  },
  replay: {
    label: "Replay",
    className:
      "border border-violet-500/30 bg-violet-500/10 text-violet-300",
    icon: PlayCircle,
  },
  offline: {
    label: "Offline",
    className:
      "border border-white/10 bg-white/[0.03] text-zinc-300",
    icon: MoonStar,
  },
};

type StreamStatusBadgeProps = {
  status: StreamStatus;
};

export function StreamStatusBadge({
  status,
}: Readonly<StreamStatusBadgeProps>) {
  const meta = statusMap[status];
  const Icon = meta.icon;

  return (
    <Badge className={`gap-2 px-3 py-1 ${meta.className}`}>
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </Badge>
  );
}