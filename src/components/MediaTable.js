function Skeleton({ className }) {
  return <div className={`animate-pulse rounded-md bg-white/[0.06] ${className}`} />;
}

function MediaTypeChip({ type }) {
  const styles = {
    IMAGE: "bg-violet-500/10 text-violet-400",
    VIDEO: "bg-pink-500/10 text-pink-400",
    CAROUSEL_ALBUM: "bg-sky-500/10 text-sky-400",
  };
  const labels = {
    IMAGE: "Foto",
    VIDEO: "Vídeo",
    CAROUSEL_ALBUM: "Carrossel",
  };
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${styles[type] ?? "bg-white/5 text-white/40"}`}>
      {labels[type] ?? type ?? "—"}
    </span>
  );
}

function StatBadge({ value, icon }) {
  return (
    <span className="flex items-center gap-1 text-white/50 text-xs">
      {icon}
      {value !== undefined && value !== null ? Number(value).toLocaleString("pt-BR") : "—"}
    </span>
  );
}

const HeartIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);
const CommentIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);
const EyeIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

function SkeletonRows() {
  return (
    <>
      {[...Array(4)].map((_, i) => (
        <tr key={i} className="border-t border-white/[0.05]">
          <td className="px-5 py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
              <Skeleton className="h-3.5 w-40" />
            </div>
          </td>
          <td className="px-5 py-4"><Skeleton className="h-5 w-16" /></td>
          <td className="px-5 py-4"><Skeleton className="h-3.5 w-20" /></td>
          <td className="px-5 py-4"><Skeleton className="h-3.5 w-24" /></td>
          <td className="px-5 py-4"><Skeleton className="h-3.5 w-12" /></td>
        </tr>
      ))}
    </>
  );
}

export default function MediaTable({ data, loading }) {
  const posts = Array.isArray(data) ? data : data?.data ?? [];

  return (
    <section className="rounded-2xl border border-white/[0.07] bg-[#111118] overflow-hidden">
      <div className="px-6 py-5 flex items-center justify-between border-b border-white/[0.06]">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight">Publicações Recentes</h2>
          <p className="text-xs text-white/30 mt-0.5">{posts.length} publicações encontradas</p>
        </div>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium flex items-center gap-1"
        >
          Ver no Instagram
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-white/25 text-[11px] uppercase tracking-widest">
              <th className="px-5 py-3 text-left font-medium">Legenda</th>
              <th className="px-5 py-3 text-left font-medium">Tipo</th>
              <th className="px-5 py-3 text-left font-medium">Engajamento</th>
              <th className="px-5 py-3 text-left font-medium">Alcance</th>
              <th className="px-5 py-3 text-left font-medium">Data</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows />
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center text-white/25 text-sm">
                  Nenhuma publicação encontrada
                </td>
              </tr>
            ) : (
              posts.map((post, i) => (
                <tr
                  key={post.id ?? i}
                  className="border-t border-white/[0.05] hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3 max-w-xs">
                      {post.thumbnail_url || post.media_url ? (
                        <img
                          src={post.thumbnail_url ?? post.media_url}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover shrink-0 bg-white/5"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white/[0.05] shrink-0 flex items-center justify-center text-white/20">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <span className="text-white/70 text-xs leading-relaxed line-clamp-2 group-hover:text-white/90 transition-colors">
                        {post.caption
                          ? post.caption.slice(0, 80) + (post.caption.length > 80 ? "…" : "")
                          : <span className="italic text-white/25">Sem legenda</span>}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <MediaTypeChip type={post.media_type} />
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <StatBadge value={post.like_count} icon={<HeartIcon />} />
                      <StatBadge value={post.comments_count} icon={<CommentIcon />} />
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <StatBadge value={post.reach} icon={<EyeIcon />} />
                  </td>

                  <td className="px-5 py-4 text-white/30 text-xs whitespace-nowrap">
                    {post.timestamp
                      ? new Date(post.timestamp).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}