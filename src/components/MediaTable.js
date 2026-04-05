function Skeleton({ w = "100%", h = 14 }) {
  return <div style={{ width: w, height: h, borderRadius: 4, background: "rgba(255,255,255,0.06)", animation: "pulse 1.5s ease-in-out infinite" }} />;
}

const TYPE_MAP = {
  IMAGE:         { label: "Foto",      color: "var(--amber)", bg: "rgba(232,162,50,0.10)" },
  VIDEO:         { label: "Vídeo",     color: "var(--rose)",  bg: "rgba(224,92,106,0.10)" },
  CAROUSEL_ALBUM:{ label: "Carrossel", color: "var(--blue)",  bg: "rgba(91,156,246,0.10)" },
};

const HeartIcon  = () => <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>;
const MsgIcon    = () => <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>;
const EyeIcon    = () => <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>;

function Stat({ icon, value }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--muted)", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>
      {icon}
      {value != null ? Number(value).toLocaleString("pt-BR") : "—"}
    </span>
  );
}

export default function MediaTable({ data, loading }) {
  const posts = Array.isArray(data) ? data : data?.data ?? [];

  const TH = ({ children }) => (
    <th style={{ padding: "10px 20px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'DM Sans', sans-serif" }}>
      {children}
    </th>
  );

  return (
    <section className="fade-up fade-up-5" style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)" }}>
        <div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, fontWeight: 400, color: "var(--text)", margin: 0 }}>Publicações Recentes</h2>
          <p style={{ fontSize: 11, color: "var(--muted)", margin: "3px 0 0" }}>{posts.length} publicações encontradas</p>
        </div>
        <a href="https://instagram.com" target="_blank" rel="noreferrer" style={{
          display: "flex", alignItems: "center", gap: 5,
          fontSize: 12, color: "var(--amber)",
          textDecoration: "none", fontWeight: 500,
        }}>
          Ver no Instagram
          <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
          </svg>
        </a>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <TH>Legenda</TH>
              <TH>Tipo</TH>
              <TH>Engajamento</TH>
              <TH>Alcance</TH>
              <TH>Data</TH>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Skeleton w={40} h={40} />
                      <Skeleton w={180} h={13} />
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px" }}><Skeleton w={60} h={20} /></td>
                  <td style={{ padding: "14px 20px" }}><Skeleton w={80} h={13} /></td>
                  <td style={{ padding: "14px 20px" }}><Skeleton w={50} h={13} /></td>
                  <td style={{ padding: "14px 20px" }}><Skeleton w={70} h={13} /></td>
                </tr>
              ))
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "60px 20px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                  Nenhuma publicação encontrada
                </td>
              </tr>
            ) : posts.map((post, i) => {
              const tipo = TYPE_MAP[post.media_type] ?? { label: post.media_type ?? "—", color: "var(--muted)", bg: "rgba(255,255,255,0.05)" };
              return (
                <tr key={post.id ?? i} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  {/* Caption */}
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, maxWidth: 320 }}>
                      {post.thumbnail_url || post.media_url ? (
                        <img
                          src={post.thumbnail_url ?? post.media_url}
                          alt=""
                          style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", flexShrink: 0, background: "var(--bg3)" }}
                          onError={e => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--bg3)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                          </svg>
                        </div>
                      )}
                      <span className="line-clamp-2" style={{ fontSize: 12, color: "rgba(240,236,228,0.65)", lineHeight: 1.5 }}>
                        {post.caption ? post.caption.slice(0, 90) + (post.caption.length > 90 ? "…" : "") : <em style={{ color: "var(--muted)" }}>Sem legenda</em>}
                      </span>
                    </div>
                  </td>

                  {/* Tipo */}
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", padding: "3px 8px", borderRadius: 20, background: tipo.bg, color: tipo.color }}>
                      {tipo.label}
                    </span>
                  </td>

                  {/* Engajamento */}
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Stat icon={<HeartIcon />} value={post.like_count} />
                      <Stat icon={<MsgIcon />} value={post.comments_count} />
                    </div>
                  </td>

                  {/* Alcance */}
                  <td style={{ padding: "14px 20px" }}>
                    <Stat icon={<EyeIcon />} value={post.reach} />
                  </td>

                  {/* Data */}
                  <td style={{ padding: "14px 20px", fontSize: 11, color: "var(--muted)", fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap" }}>
                    {post.timestamp ? new Date(post.timestamp).toLocaleDateString("pt-BR") : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
