import '../../assets/css/user.css';

const RESOURCES = [
  { icon: "🫧", label: "Oxygen",       value: 82,   unit: "%",   desc: "Cabin O₂ level",        status: "normal"   },
  { icon: "💧", label: "Water",        value: 6800, unit: "L",   desc: "Potable water reserve",  status: "normal"   },
  { icon: "🍱", label: "Food Supply",  value: 340,  unit: "kg",  desc: "Total ration stock",     status: "normal"   },
  { icon: "🥤", label: "Beverages",    value: 210,  unit: "L",   desc: "Beverage reserves",      status: "normal"   },
  { icon: "🌡️", label: "Temperature", value: 21.4, unit: "°C",  desc: "Habitat temperature",    status: "normal"   },
  { icon: "⚡", label: "Power Supply", value: 74,   unit: "%",   desc: "Main power grid",        status: "normal"   },
  { icon: "🔋", label: "Batteries",   value: 58,   unit: "%",   desc: "Backup battery bank",    status: "warning"  },
  { icon: "🛢️", label: "Fuel",        value: 3200, unit: "kg",  desc: "Propulsion fuel reserve",status: "warning"  },
  { icon: "🔧", label: "Tools",        value: 47,   unit: "pcs", desc: "Equipment inventory",    status: "normal"   },
];

const MAX = { Oxygen: 100, Water: 10000, "Food Supply": 500, Beverages: 400, Temperature: 30, "Power Supply": 100, Batteries: 100, Fuel: 5000, Tools: 60 };

const STATUS_META = {
  normal:   { badge: "u-badge-green",  label: "Normal",  dot: "u-dot-green"  },
  warning:  { badge: "u-badge-orange", label: "Warning", dot: "u-dot-orange" },
  critical: { badge: "u-badge-red",    label: "Critical",dot: "u-dot-red"    },
};

function barColor(s) { return s === "normal" ? "u-bar-green" : s === "warning" ? "u-bar-orange" : "u-bar-red"; }
function pct(r) { return Math.min(100, Math.round((r.value / (MAX[r.label] || r.value)) * 100)); }

export default function StationView() {
  const criticalCount = RESOURCES.filter((r) => r.status === "critical").length;
  const warningCount  = RESOURCES.filter((r) => r.status === "warning").length;

  return (
    <div className="u-root">
      <div className="u-header">
        <div>
          <h1 className="u-title">Station Overview</h1>
          <p className="u-subtitle">Live status of all habitat systems</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
          <span className="u-dot u-dot-green" />
          <span style={{ fontSize: ".82rem", fontWeight: 600, color: "var(--gray-500)" }}>Station Online</span>
        </div>
      </div>

      <div className="u-readonly-banner">
        👁️ <span><strong>View only.</strong> Contact admin to report any anomalies.</span>
      </div>

      {/* alerts */}
      {criticalCount > 0 && <div className="u-alert u-alert-red">🚨 <strong>{criticalCount} critical system{criticalCount > 1 ? "s" : ""} detected.</strong> Notify admin immediately.</div>}
      {warningCount  > 0 && <div className="u-alert u-alert-orange">⚠️ <strong>{warningCount} system{warningCount > 1 ? "s" : ""} at warning level.</strong> Monitor closely.</div>}

      {/* summary strip */}
      <div className="u-summary u-sum-4" style={{ marginBottom: "1.4rem" }}>
        {[
          { icon: "📡", val: RESOURCES.length,                               lbl: "Systems"  },
          { icon: "✅", val: RESOURCES.filter((r) => r.status === "normal").length,   lbl: "Normal"   },
          { icon: "⚠️", val: warningCount,                                   lbl: "Warning"  },
          { icon: "🔴", val: criticalCount,                                  lbl: "Critical" },
        ].map((s) => (
          <div key={s.lbl} className="u-sum-card">
            <span className="u-sum-icon">{s.icon}</span>
            <div><p className="u-sum-val">{s.val}</p><p className="u-sum-lbl">{s.lbl}</p></div>
          </div>
        ))}
      </div>

      {/* resource cards */}
      <div className="u-resource-grid">
        {RESOURCES.map((r, i) => {
          const p  = pct(r);
          const sm = STATUS_META[r.status];
          return (
            <div key={r.label} className="u-resource-card" style={{ animationDelay: `${i * 0.05}s`, borderTop: `3px solid ${r.status === "normal" ? "var(--green-300)" : r.status === "warning" ? "#fb923c" : "#ef4444"}` }}>
              <div className="u-resource-card-top">
                <span className="u-resource-icon-wrap">{r.icon}</span>
                <span className={`u-badge ${sm.badge}`}>{sm.label}</span>
              </div>
              <div>
                <p className="u-resource-val">{r.value}<span style={{ fontSize: ".9rem", color: "var(--gray-400)", marginLeft: "2px" }}>{r.unit}</span></p>
                <p className="u-resource-label">{r.label}</p>
                <p className="u-resource-desc">{r.desc}</p>
              </div>
              <div className="u-resource-bar-row">
                <div className="u-bar-track"><div className={`u-bar-fill ${barColor(r.status)}`} style={{ width: `${p}%` }} /></div>
                <span className="u-resource-bar-pct u-mono">{p}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}