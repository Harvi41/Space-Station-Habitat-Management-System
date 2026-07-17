import '../../assets/css/user.css';

const MODULES = [
  { id: "MOD-001", name: "Alpha", icon: "α", capacity: 5000, currentLoad: 3200, storedResource: "Food",      status: "active"      },
  { id: "MOD-002", name: "Beta",  icon: "β", capacity: 4000, currentLoad: 3900, storedResource: "Oxygen",    status: "active"      },
  { id: "MOD-003", name: "Gamma", icon: "γ", capacity: 6000, currentLoad: 1500, storedResource: "Tools",     status: "active"      },
  { id: "MOD-004", name: "Delta", icon: "δ", capacity: 3000, currentLoad: 2700, storedResource: "Batteries", status: "maintenance" },
  { id: "MOD-005", name: "Theta", icon: "θ", capacity: 8000, currentLoad: 2100, storedResource: "Fuel",      status: "disabled"    },
];

const RESOURCE_ICONS = { Food: "🍱", Oxygen: "🫧", Tools: "🔧", Batteries: "🔋", Fuel: "🛢️", Water: "💧" };

function getPct(m) { return Math.min(100, Math.round((m.currentLoad / m.capacity) * 100)); }
function getLS(m)  { const p = getPct(m); return p >= 90 ? "critical" : p >= 70 ? "warning" : "normal"; }
function barCls(s) { return s === "normal" ? "u-bar-green" : s === "warning" ? "u-bar-orange" : "u-bar-red"; }
function pctCls(s) { return s === "normal" ? { color: "var(--green-700)" } : s === "warning" ? { color: "#c2410c" } : { color: "#b91c1c" }; }

export default function StorageView() {
  const totalCap   = MODULES.reduce((s, m) => s + m.capacity, 0);
  const totalLoad  = MODULES.reduce((s, m) => s + m.currentLoad, 0);
  const activeCount = MODULES.filter((m) => m.status === "active").length;

  return (
    <div className="u-root">
      <div className="u-header">
        <div>
          <h1 className="u-title">Storage Overview</h1>
          <p className="u-subtitle">Current status of all 5 storage modules</p>
        </div>
      </div>

      <div className="u-readonly-banner">
        👁️ <span><strong>View only.</strong> Storage modifications are handled by admin.</span>
      </div>

      {/* summary */}
      <div className="u-summary u-sum-4">
        {[
          { icon: "📦", val: MODULES.length,                              lbl: "Modules"       },
          { icon: "✅", val: activeCount,                                  lbl: "Active"        },
          { icon: "🗄️", val: totalCap.toLocaleString(), unit: "kg",       lbl: "Total Capacity"},
          { icon: "📊", val: Math.round((totalLoad / totalCap) * 100), unit: "%", lbl: "Overall Load" },
        ].map((s) => (
          <div key={s.lbl} className="u-sum-card">
            <span className="u-sum-icon">{s.icon}</span>
            <div><p className="u-sum-val">{s.val}{s.unit && <span className="u-sum-unit"> {s.unit}</span>}</p><p className="u-sum-lbl">{s.lbl}</p></div>
          </div>
        ))}
      </div>

      {/* table */}
      <div className="u-card">
        <div className="u-card-header">
          <span className="u-card-title">Module Details</span>
          <span className="u-card-count">{MODULES.length} modules</span>
        </div>
        <div className="u-table-wrap">
          <table className="u-table">
            <thead>
              <tr>
                <th>Module</th><th>ID</th><th>Resource</th>
                <th>Capacity</th><th>Current Load</th><th>Utilisation</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {MODULES.map((m) => {
                const p  = getPct(m);
                const ls = getLS(m);
                return (
                  <tr key={m.id} style={{ opacity: m.status !== "active" ? .55 : 1 }}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                        <span style={{ width: 32, height: 32, borderRadius: 8, background: "var(--green-50)", border: "1px solid var(--green-200)", color: "var(--green-700)", fontFamily: "serif", fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{m.icon}</span>
                        <span style={{ fontWeight: 700, color: "var(--gray-900)", fontSize: ".88rem" }}>Module {m.name}</span>
                      </div>
                    </td>
                    <td><span className="u-id-tag">{m.id}</span></td>
                    <td><span style={{ display: "flex", alignItems: "center", gap: ".4rem", fontSize: ".87rem" }}>{RESOURCE_ICONS[m.storedResource]} {m.storedResource}</span></td>
                    <td><span className="u-mono">{m.capacity.toLocaleString()} kg</span></td>
                    <td><span className="u-mono">{m.currentLoad.toLocaleString()} kg</span></td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: ".55rem" }}>
                        <div className="u-bar-track" style={{ width: 70 }}><div className={`u-bar-fill ${barCls(ls)}`} style={{ width: `${p}%` }} /></div>
                        <span className="u-mono" style={pctCls(ls)}>{p}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`u-badge ${m.status === "active" ? "u-badge-green" : m.status === "maintenance" ? "u-badge-orange" : "u-badge-gray"}`}>
                        {m.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* module cards */}
      <div className="u-resource-grid">
        {MODULES.map((m, i) => {
          const p  = getPct(m);
          const ls = getLS(m);
          return (
            <div key={m.id} className="u-resource-card" style={{ animationDelay: `${i * 0.05}s`, opacity: m.status !== "active" ? .6 : 1, borderTop: `3px solid ${m.status === "active" ? "var(--green-300)" : m.status === "maintenance" ? "#fb923c" : "var(--gray-300)"}` }}>
              <div className="u-resource-card-top">
                <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                  <span style={{ fontFamily: "serif", fontWeight: 700, fontSize: "1.1rem", color: "var(--green-700)" }}>{m.icon}</span>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: ".88rem", color: "var(--gray-900)", lineHeight: 1.2 }}>Module {m.name}</p>
                    <p className="u-mono" style={{ fontSize: ".67rem", color: "var(--gray-400)" }}>{m.id}</p>
                  </div>
                </div>
                <span className={`u-badge ${m.status === "active" ? "u-badge-green" : m.status === "maintenance" ? "u-badge-orange" : "u-badge-gray"}`}>{m.status}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: ".4rem", fontSize: ".85rem", fontWeight: 600 }}>
                <span>{RESOURCE_ICONS[m.storedResource]}</span><span>{m.storedResource}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: ".4rem", background: "var(--gray-50)", borderRadius: 8, padding: ".6rem .7rem" }}>
                {[["Capacity", `${m.capacity.toLocaleString()} kg`], ["Load", `${m.currentLoad.toLocaleString()} kg`], ["Free", `${(m.capacity - m.currentLoad).toLocaleString()} kg`]].map(([l, v]) => (
                  <div key={l}><p style={{ fontSize: ".65rem", color: "var(--gray-400)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>{l}</p><p className="u-mono" style={{ fontSize: ".78rem", fontWeight: 700 }}>{v}</p></div>
                ))}
              </div>
              <div className="u-resource-bar-row">
                <div className="u-bar-track"><div className={`u-bar-fill ${barCls(ls)}`} style={{ width: `${p}%` }} /></div>
                <span className="u-resource-bar-pct u-mono" style={pctCls(ls)}>{p}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}