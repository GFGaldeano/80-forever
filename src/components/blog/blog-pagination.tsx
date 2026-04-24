import Link from "next/link";

type BlogPaginationProps = {
  currentPage: number;
  totalPages: number;
  basePath?: string;
  query?: Record<string, string | number | undefined>;
};

function buildPageHref(
  basePath: string,
  page: number,
  query?: Record<string, string | number | undefined>
) {
  const searchParams = new URLSearchParams();

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).length > 0) {
        searchParams.set(key, String(value));
      }
    });
  }

  if (page > 1) {
    searchParams.set("page", String(page));
  }

  const queryString = searchParams.toString();

  return queryString ? `${basePath}?${queryString}` : basePath;
}

function getPageNumbers(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: Array<number | "ellipsis-left" | "ellipsis-right"> = [1];

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    pages.push("ellipsis-left");
  }

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (end < totalPages - 1) {
    pages.push("ellipsis-right");
  }

  pages.push(totalPages);

  return pages;
}

export function BlogPagination({
  currentPage,
  totalPages,
  basePath = "/blog",
  query,
}: Readonly<BlogPaginationProps>) {
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <nav
      aria-label="Paginación del blog"
      className="mt-10 flex flex-col items-center gap-4"
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Link
          href={buildPageHref(basePath, currentPage - 1, query)}
          aria-disabled={currentPage === 1}
          className={`inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm transition ${
            currentPage === 1
              ? "pointer-events-none border border-white/10 bg-black/30 text-zinc-600"
              : "border border-white/10 bg-black/40 text-white hover:bg-white/[0.04]"
          }`}
        >
          Anterior
        </Link>

        {pageNumbers.map((item, index) => {
          if (typeof item !== "number") {
            return (
              <span
                key={`${item}-${index}`}
                className="inline-flex h-10 min-w-10 items-center justify-center px-2 text-sm text-zinc-500"
              >
                …
              </span>
            );
          }

          const isActive = item === currentPage;

          return (
            <Link
              key={item}
              href={buildPageHref(basePath, item, query)}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm transition ${
                isActive
                  ? "border border-fuchsia-400/40 bg-fuchsia-500/10 text-fuchsia-300 shadow-[0_0_18px_rgba(217,70,239,0.18)]"
                  : "border border-white/10 bg-black/40 text-white hover:bg-white/[0.04]"
              }`}
            >
              {item}
            </Link>
          );
        })}

        <Link
          href={buildPageHref(basePath, currentPage + 1, query)}
          aria-disabled={currentPage === totalPages}
          className={`inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm transition ${
            currentPage === totalPages
              ? "pointer-events-none border border-white/10 bg-black/30 text-zinc-600"
              : "border border-white/10 bg-black/40 text-white hover:bg-white/[0.04]"
          }`}
        >
          Siguiente
        </Link>
      </div>

      <p className="text-sm text-zinc-500">
        Página {currentPage} de {totalPages}
      </p>
    </nav>
  );
}