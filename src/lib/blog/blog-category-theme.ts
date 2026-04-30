export function getBlogCategoryBadgeClass(slug?: string | null) {
  switch (slug) {
    case "efemerides":
      return "border border-cyan-500/30 bg-cyan-500/10 text-cyan-300";
    case "noticias":
      return "border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300";
    case "transmisiones":
      return "border border-orange-500/30 bg-orange-500/10 text-orange-300";
    case "especiales":
      return "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    case "comunidad":
      return "border border-violet-500/30 bg-violet-500/10 text-violet-300";
    case "solistas":
    case "solo-artists":
      return "border border-pink-500/30 bg-pink-500/10 text-pink-300";
    default:
      return "border border-white/10 bg-white/[0.03] text-zinc-300";
  }
}

export function getBlogCategoryFilterClass({
  slug,
  active,
}: {
  slug?: string | null;
  active: boolean;
}) {
  if (!active) {
    return "border border-white/10 bg-black/40 text-white hover:bg-white/[0.04]";
  }

  switch (slug) {
    case "efemerides":
      return "border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.16)]";
    case "noticias":
      return "border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300 shadow-[0_0_18px_rgba(217,70,239,0.16)]";
    case "transmisiones":
      return "border border-orange-500/30 bg-orange-500/10 text-orange-300 shadow-[0_0_18px_rgba(249,115,22,0.16)]";
    case "especiales":
      return "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.16)]";
    case "comunidad":
      return "border border-violet-500/30 bg-violet-500/10 text-violet-300 shadow-[0_0_18px_rgba(139,92,246,0.16)]";
    case "solistas":
    case "solo-artists":
      return "border border-pink-500/30 bg-pink-500/10 text-pink-300 shadow-[0_0_18px_rgba(236,72,153,0.16)]";
    default:
      return "border border-fuchsia-400/40 bg-fuchsia-500/10 text-fuchsia-300 shadow-[0_0_18px_rgba(217,70,239,0.18)]";
  }
}