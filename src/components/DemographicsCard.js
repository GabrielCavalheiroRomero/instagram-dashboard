const COUNTRY_NAMES = {
  BR: "Brasil", PT: "Portugal", US: "EUA", AR: "Argentina",
  JP: "Japão", DE: "Alemanha", FR: "França", ES: "Espanha",
  IT: "Itália", GB: "Reino Unido", MX: "México", CO: "Colômbia",
  CL: "Chile", PE: "Peru", UY: "Uruguai", PY: "Paraguai",
  IE: "Irlanda", ID: "Indonésia", DO: "Rep. Dominicana", KH: "Camboja",
};

function Skeleton({ w = "100%", h = 16 }) {
  return <div style={{ width: w, height: h, borderRadius: 6, background: "rgba(255,255,255,0.06)", animation: "pulse 1.5s ease-in-out infinite" }} />;
}

function Bar({ value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.6s ease" }} />
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>{title}</p>
      {children}
    </div>
  );
}

export default function DemographicsCard({ demographics, loading }) {
  if (!demographics && !loading) return null;

  const { age = [], gender = [], city = [], country = [] } = demographics ?? {};

  const total = gender.reduce((s, g) => s + g.value, 0);
  const genderLabel = { F: "Feminino", M: "Masculino", U: "Não informado" };
  const genderColor = { F: "#e05c6a", M: "#5b9cf6", U: "var(--muted)" };

  const ageMax    = Math.max(...age.map(a => a.value), 1);
  const cityMax   = Math.max(...city.map(c => c.value), 1);
  const countryMax = Math.max(...country.map(c => c.value), 1);

  const pct = (v) => total > 0 ? `${((v / total) * 100).toFixed(1)}%` : "—";

  return (
    <section className="fade-up fade-up-5" style={{
      background: "var(--bg2)",
      border: "1px solid var(--border)",
      borderRadius: 14,
      padding: "22px 28px",
    }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, fontWeight: 400, color: "var(--text)", margin: 0 }}>
          Dados Demográficos
        </h2>
        <p style={{ fontSize: 11, color: "var(--muted)", margin: "3px 0 0" }}>
          Perfil dos {total > 0 ? total.toLocaleString("pt-BR") : "—"} seguidores
        </p>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[1,2,3,4].map(i => <Skeleton key={i} h={60} />)}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>

          {/* Gênero */}
          <Section title="Gênero">
            {gender.map(g => (
              <div key={g.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: "var(--text)", width: 100, flexShrink: 0 }}>
                  {genderLabel[g.label] ?? g.label}
                </span>
                <Bar value={g.value} max={total} color={genderColor[g.label] ?? "var(--amber)"} />
                <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "var(--muted)", width: 44, textAlign: "right", flexShrink: 0 }}>
                  {pct(g.value)}
                </span>
              </div>
            ))}
          </Section>

          {/* Faixa etária */}
          <Section title="Faixa Etária">
            {age.map(a => (
              <div key={a.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: "var(--text)", width: 60, flexShrink: 0 }}>{a.label}</span>
                <Bar value={a.value} max={ageMax} color="var(--amber)" />
                <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "var(--muted)", width: 44, textAlign: "right", flexShrink: 0 }}>
                  {a.value.toLocaleString("pt-BR")}
                </span>
              </div>
            ))}
          </Section>

          {/* Top cidades */}
          <Section title="Top Cidades">
            {city.slice(0, 8).map(c => (
              <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: "var(--text)", width: 160, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.label.split(",")[0]}
                </span>
                <Bar value={c.value} max={cityMax} color="var(--teal)" />
                <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "var(--muted)", width: 44, textAlign: "right", flexShrink: 0 }}>
                  {c.value.toLocaleString("pt-BR")}
                </span>
              </div>
            ))}
          </Section>

          {/* Países */}
          <Section title="Países">
            {country.map(c => (
              <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: "var(--text)", width: 100, flexShrink: 0 }}>
                  {COUNTRY_NAMES[c.label] ?? c.label}
                </span>
                <Bar value={c.value} max={countryMax} color="var(--blue)" />
                <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "var(--muted)", width: 44, textAlign: "right", flexShrink: 0 }}>
                  {c.value.toLocaleString("pt-BR")}
                </span>
              </div>
            ))}
          </Section>

        </div>
      )}
    </section>
  );
}