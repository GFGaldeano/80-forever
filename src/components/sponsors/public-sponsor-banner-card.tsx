import type { PublicSponsorAsset } from "@/lib/sponsors/get-public-sponsor-assets";

type PublicSponsorBannerCardProps = {
  asset: PublicSponsorAsset;
};

export function PublicSponsorBannerCard({
  asset,
}: Readonly<PublicSponsorBannerCardProps>) {
  const content = (
    <div className="group relative overflow-hidden rounded-[26px] border border-white/10 bg-black">
      <div className="aspect-[21/9] bg-[#000000]">
        <img
          src={asset.asset_url}
          alt={asset.sponsor_name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.01]"
          loading="eager"
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent px-4 pb-4 pt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-400 [font-family:var(--font-orbitron)]">
              Sponsor
            </p>
            <p className="mt-1 text-sm font-medium text-white">
              {asset.sponsor_name}
            </p>
          </div>

          <div className="rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[11px] text-zinc-300 backdrop-blur-sm">
            {asset.placement.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );

  if (asset.resolved_link_url) {
    return (
      <a
        href={asset.resolved_link_url}
        target="_blank"
        rel="noreferrer"
        className="block"
        aria-label={`Abrir sponsor ${asset.sponsor_name}`}
      >
        {content}
      </a>
    );
  }

  return content;
}