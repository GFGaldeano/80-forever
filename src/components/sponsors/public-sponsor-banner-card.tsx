import Image from "next/image";

import type { PublicSponsorAsset } from "@/lib/sponsors/get-public-sponsor-assets";

type PublicSponsorBannerCardProps = {
  asset: PublicSponsorAsset;
};

function getAssetLink(asset: PublicSponsorAsset) {
  return "link_url" in asset
    ? ((asset as { link_url?: string | null }).link_url ?? null)
    : null;
}

export function PublicSponsorBannerCard({
  asset,
}: Readonly<PublicSponsorBannerCardProps>) {
  const linkUrl = getAssetLink(asset);

  const content = (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80">
      <div className="relative aspect-[21/9] w-full overflow-hidden bg-black">
        <Image
          src={asset.asset_url}
          alt={`Sponsor asset ${asset.id}`}
          fill
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-cover transition duration-500 group-hover:scale-[1.015]"
        />
      </div>
    </div>
  );

  if (!linkUrl) {
    return content;
  }

  return (
    <a
      href={linkUrl}
      target="_blank"
      rel="noreferrer"
      className="block"
    >
      {content}
    </a>
  );
}