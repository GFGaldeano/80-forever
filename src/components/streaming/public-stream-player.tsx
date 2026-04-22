import type { PublicStreamConfig } from "@/lib/stream/get-public-stream-config";
import { PublicStreamPlaceholder } from "@/components/streaming/public-stream-placeholder";

type PublicStreamPlayerProps = {
  stream: PublicStreamConfig | null;
};

export function PublicStreamPlayer({
  stream,
}: Readonly<PublicStreamPlayerProps>) {
  const status = stream?.status ?? "offline";
  const hasEmbed =
    (status === "live" || status === "replay") && Boolean(stream?.embed_url);

  return (
    <section className="overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950/80 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_20px_80px_rgba(0,0,0,0.55)]">
      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-xs uppercase tracking-[0.24em] text-zinc-500 [font-family:var(--font-orbitron)]">
          Señal principal
        </p>
      </div>

      <div className="bg-black">
        {hasEmbed ? (
          <div className="aspect-video">
            <iframe
              title={stream?.title || "80's Forever"}
              src={stream?.embed_url ?? ""}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : (
          <PublicStreamPlaceholder
            status={status}
            title={stream?.title}
            subtitle={stream?.subtitle}
            offlineMessage={stream?.offline_message}
            nextLiveAt={stream?.next_live_at}
          />
        )}
      </div>
    </section>
  );
}