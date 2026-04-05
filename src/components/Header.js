export default function Header({ onRefresh }) {
const DIAS   = ["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];
const MESES  = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
const now    = new Date();
const hoje   = `${DIAS[now.getDay()]}, ${now.getDate()} de ${MESES[now.getMonth()]} de ${now.getFullYear()}`;

  return (
    <header style={{
      borderBottom: "1px solid var(--border)",
      padding: "20px 36px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "rgba(12,11,9,0.85)",
      backdropFilter: "blur(12px)",
      position: "sticky",
      top: 0,
      zIndex: 10,
    }}>
      <div>
        <h1 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 22,
          fontWeight: 400,
          color: "var(--text)",
          margin: 0,
          letterSpacing: "-0.3px",
        }}>Visão Geral</h1>
        <p style={{ fontSize: 11, color: "var(--muted)", margin: "2px 0 0", textTransform: "capitalize" }}>{hoje}</p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "7px 12px",
          fontSize: 12,
          color: "var(--muted)",
          cursor: "pointer",
        }}>
          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Últimos 30 dias
        </div>

        <button
          onClick={onRefresh ?? (() => window.location.reload())}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "var(--amber)",
            border: "none",
            borderRadius: 8,
            padding: "7px 14px",
            fontSize: 12,
            fontWeight: 600,
            color: "#0c0b09",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={e => e.target.style.opacity = 0.85}
          onMouseLeave={e => e.target.style.opacity = 1}
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Atualizar
        </button>
      </div>
    </header>
  );
}
