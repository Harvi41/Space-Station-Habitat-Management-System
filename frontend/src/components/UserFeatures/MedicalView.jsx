import '../../assets/css/user.css';

const today = new Date().toISOString().slice(0, 10);

function daysLeft(exp) { return Math.ceil((new Date(exp) - new Date(today)) / (1000 * 60 * 60 * 24)); }
function getES(exp) { const d = daysLeft(exp); return d < 0 ? "expired" : d <= 30 ? "expiring" : "ok"; }

const CATEGORY_ICONS = { "First Aid Kit": "🩺", "Medicine": "💊", "Fire Extinguisher": "🧯", "Radiation Protection Kit": "☢️" };

const ITEMS = [
  { id: "MED-001", name: "Standard First Aid Kit",     category: "First Aid Kit",            quantity: 12,  unit: "kits",    expiryDate: "2027-06-30", location: "Bay A" },
  { id: "MED-002", name: "Advanced Trauma Kit",        category: "First Aid Kit",            quantity: 4,   unit: "kits",    expiryDate: "2026-12-31", location: "Bay A" },
  { id: "MED-003", name: "Paracetamol 500mg",          category: "Medicine",                 quantity: 200, unit: "tablets", expiryDate: "2025-11-15", location: "Bay B" },
  { id: "MED-004", name: "Amoxicillin 250mg",          category: "Medicine",                 quantity: 80,  unit: "capsules",expiryDate: "2026-08-20", location: "Bay B" },
  { id: "MED-005", name: "Ibuprofen 400mg",            category: "Medicine",                 quantity: 150, unit: "tablets", expiryDate: "2026-03-20", location: "Bay B" },
  { id: "MED-006", name: "Morphine Injection",         category: "Medicine",                 quantity: 15,  unit: "vials",   expiryDate: "2025-12-01", location: "Bay B" },
  { id: "MED-007", name: "CO₂ Fire Extinguisher",      category: "Fire Extinguisher",        quantity: 8,   unit: "units",   expiryDate: "2027-01-15", location: "Bay C" },
  { id: "MED-008", name: "Dry Powder Extinguisher",    category: "Fire Extinguisher",        quantity: 5,   unit: "units",   expiryDate: "2026-05-10", location: "Bay C" },
  { id: "MED-009", name: "Radiation Dosimeter",        category: "Radiation Protection Kit", quantity: 20,  unit: "units",   expiryDate: "2027-09-01", location: "Bay D" },
  { id: "MED-010", name: "Lead-lined Protective Suit", category: "Radiation Protection Kit", quantity: 6,   unit: "suits",   expiryDate: "2028-03-01", location: "Bay D" },
  { id: "MED-011", name: "Potassium Iodide Tablets",  category: "Radiation Protection Kit", quantity: 300, unit: "tablets", expiryDate: "2025-09-30", location: "Bay D" },
];

const CATS = ["All", "First Aid Kit", "Medicine", "Fire Extinguisher", "Radiation Protection Kit"];

import { useState } from "react";

export default function MedicalView() {
  const [filterCat, setFilterCat] = useState("All");
  const [filterExp, setFilterExp] = useState("All");

  const expiredCount  = ITEMS.filter((i) => getES(i.expiryDate) === "expired").length;
  const expiringCount = ITEMS.filter((i) => getES(i.expiryDate) === "expiring").length;

  const filtered = ITEMS.filter((i) => {
    const mc = filterCat === "All" || i.category === filterCat;
    const me = filterExp === "All" || getES(i.expiryDate) === filterExp;
    return mc && me;
  });

  const catCounts = ["First Aid Kit", "Medicine", "Fire Extinguisher", "Radiation Protection Kit"].reduce((a, c) => {
    a[c] = ITEMS.filter((i) => i.category === c).length; return a;
  }, {});

  return (
    <div className="u-root">
      <div className="u-header">
        <div>
          <h1 className="u-title">Medical Inventory</h1>
          <p className="u-subtitle">View station medical supplies and safety equipment</p>
        </div>
      </div>

      <div className="u-readonly-banner">
        👁️ <span><strong>View only.</strong> Report low stock or issues via the Complaint Center.</span>
      </div>

      {expiredCount  > 0 && <div className="u-alert u-alert-red">🚨 <strong>{expiredCount} expired item{expiredCount > 1 ? "s" : ""}.</strong> Please do not use — notify admin immediately.</div>}
      {expiringCount > 0 && <div className="u-alert u-alert-orange">⚠️ <strong>{expiringCount} item{expiringCount > 1 ? "s" : ""} expiring within 30 days.</strong></div>}

      {/* category cards */}
      <div className="u-summary u-sum-4">
        {["First Aid Kit", "Medicine", "Fire Extinguisher", "Radiation Protection Kit"].map((c) => (
          <div key={c} className="u-sum-card">
            <span className="u-sum-icon">{CATEGORY_ICONS[c]}</span>
            <div><p className="u-sum-val">{catCounts[c]}</p><p className="u-sum-lbl" style={{ fontSize: ".67rem" }}>{c}</p></div>
          </div>
        ))}
      </div>

      {/* filters */}
      <div className="u-filter-row">
        {CATS.map((c) => (
          <button key={c} className={`u-filter-btn${filterCat === c ? " active" : ""}`} onClick={() => setFilterCat(c)}>
            {c === "All" ? "All" : CATEGORY_ICONS[c] + " " + c}
          </button>
        ))}
      </div>
      <div className="u-filter-row" style={{ marginTop: "-.4rem" }}>
        {[["All","All"], ["ok","✅ Valid"], ["expiring","⚠️ Expiring Soon"], ["expired","🔴 Expired"]].map(([v, l]) => (
          <button key={v} className={`u-filter-btn${filterExp === v ? " active" : ""}`} onClick={() => setFilterExp(v)}>{l}</button>
        ))}
      </div>

      {/* table */}
      <div className="u-card">
        <div className="u-card-header">
          <span className="u-card-title">Inventory List</span>
          <span className="u-card-count">{filtered.length} items</span>
        </div>
        {filtered.length === 0 ? (
          <div className="u-empty"><span>💊</span><p>No items.</p></div>
        ) : (
          <div className="u-table-wrap">
            <table className="u-table">
              <thead>
                <tr><th>Item</th><th>Category</th><th>Qty</th><th>Location</th><th>Expiry</th><th>Status</th></tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const es   = getES(item.expiryDate);
                  const days = daysLeft(item.expiryDate);
                  return (
                    <tr key={item.id} style={{ opacity: es === "expired" ? .6 : 1 }}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                          <span style={{ fontSize: "1.1rem" }}>{CATEGORY_ICONS[item.category]}</span>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: ".88rem", color: "var(--gray-900)" }}>{item.name}</p>
                            <p className="u-mono" style={{ fontSize: ".67rem", color: "var(--gray-400)" }}>{item.id}</p>
                          </div>
                        </div>
                      </td>
                      <td><span style={{ fontSize: ".75rem", fontWeight: 600, background: "var(--gray-100)", color: "var(--gray-700)", padding: ".2rem .6rem", borderRadius: 99 }}>{item.category}</span></td>
                      <td><span className="u-mono" style={{ fontWeight: 700 }}>{item.quantity} <span style={{ fontWeight: 400, color: "var(--gray-400)", fontSize: ".75rem" }}>{item.unit}</span></span></td>
                      <td><span className="u-id-tag">{item.location}</span></td>
                      <td><span className="u-mono" style={{ color: es === "expired" ? "#b91c1c" : es === "expiring" ? "#c2410c" : "var(--gray-600)", fontWeight: es !== "ok" ? 700 : 400, textDecoration: es === "expired" ? "line-through" : "none" }}>{item.expiryDate}</span></td>
                      <td>
                        <span className={`u-badge ${es === "ok" ? "u-badge-green" : es === "expiring" ? "u-badge-orange" : "u-badge-red"}`}>
                          {es === "ok" ? `Valid · ${days}d` : es === "expiring" ? `${days}d left` : "Expired"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}