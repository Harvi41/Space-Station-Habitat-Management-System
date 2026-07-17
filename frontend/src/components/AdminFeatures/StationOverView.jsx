import { useState,useEffect } from "react";
import "../../assets/css/StationOverView.css";

const BASE_URL = "http://localhost:5000/api/resources";



// const INITIAL_RESOURCES = [
//   { id: "oxygen",      label: "Oxygen Level",  icon: "🫧", value: 82,   unit: "%",     max: 100,   category: "life-support", status: "normal",  lastUpdated: "2 min ago",  description: "Cabin O₂ concentration",       thresholdWarn: 60,   thresholdDanger: 40   },
//   { id: "water",       label: "H₂O Level",     icon: "💧", value: 6800, unit: "L",     max: 10000, category: "life-support", status: "normal",  lastUpdated: "5 min ago",  description: "Potable water reserves",        thresholdWarn: 4000, thresholdDanger: 2000 },
//   { id: "food",        label: "Food Supply",   icon: "🍱", value: 340,  unit: "kg",    max: 600,   category: "consumables",  status: "normal",  lastUpdated: "1 hr ago",   description: "Packaged ration stores",        thresholdWarn: 200,  thresholdDanger: 80   },
//   { id: "drinks",      label: "Beverages",     icon: "🧃", value: 210,  unit: "L",     max: 400,   category: "consumables",  status: "normal",  lastUpdated: "1 hr ago",   description: "Non-water liquid rations",      thresholdWarn: 120,  thresholdDanger: 50   },
//   { id: "temperature", label: "Temperature",   icon: "🌡️",value: 21.4, unit: "°C",    max: 30,    category: "environment",  status: "normal",  lastUpdated: "Live",       description: "Cabin ambient temperature",     thresholdWarn: 26,   thresholdDanger: 29,  isTemp: true },
//   { id: "power",       label: "Power Supply",  icon: "⚡", value: 74,   unit: "%",     max: 100,   category: "systems",      status: "normal",  lastUpdated: "Real-time",  description: "Total grid capacity used",      thresholdWarn: 40,   thresholdDanger: 20   },
//   { id: "batteries",   label: "Batteries",     icon: "🔋", value: 58,   unit: "%",     max: 100,   category: "systems",      status: "warning", lastUpdated: "10 min ago", description: "Backup battery bank charge",    thresholdWarn: 60,   thresholdDanger: 30   },
//   { id: "fuel",        label: "Fuel",          icon: "🛢️",value: 3200, unit: "kg",    max: 8000,  category: "propulsion",   status: "warning", lastUpdated: "30 min ago", description: "Propellant reserves",           thresholdWarn: 3500, thresholdDanger: 1500 },
//   { id: "tools",       label: "Tools",         icon: "🔧", value: 47,   unit: "units", max: 60,    category: "equipment",    status: "normal",  lastUpdated: "Yesterday",  description: "Operational equipment count",   thresholdWarn: 20,   thresholdDanger: 10   },
// ];

const CATEGORIES = [
  { key: "all",          label: "All Resources" },
  { key: "life-support", label: "Life Support"  },
  { key: "consumables",  label: "Consumables"   },
  { key: "environment",  label: "Environment"   },
  { key: "systems",      label: "Systems"       },
  { key: "propulsion",   label: "Propulsion"    },
  { key: "equipment",    label: "Equipment"     },
];

const CATEGORY_KEYS = ["life-support","consumables","environment","systems","propulsion","equipment"];

const UNIT_PRESETS = ["%", "L", "kg", "°C", "units", "kW", "bar", "ppm"];

const EMPTY_ADD = {
  label: "", icon: "📊", value: "", unit: "%",
  max: "", category: "systems", description: "",
  thresholdWarn: "", thresholdDanger: "",
};

function getStatus(r) {
  if (!r || !r.max) return "normal";

  const percent = (r.value / r.max) * 100;
  const warn = (r.thresholdWarn / r.max) * 100;
  const danger = (r.thresholdDanger / r.max) * 100;

  if (percent <= danger) return "danger";
  if (percent <= warn) return "warning";
  return "normal";
}

function getBarPct(r) {
  if (!r || !r.max || r.max === 0) return 0;
  return Math.min(100, (r.value / r.max) * 100);
}
//let idCounter = INITIAL_RESOURCES.length + 1;

export default function StationOverview() {
  const [resources, setResources]   = useState([]);
  const [filter, setFilter]         = useState("all");
  const [editTarget, setEditTarget] = useState(null);
  const [editVal, setEditVal]       = useState("");
  const [editErr, setEditErr]       = useState("");
  const [successId, setSuccessId]   = useState(null);

  // add modal
  const [addModal, setAddModal]     = useState(false);
  const [addForm, setAddForm]       = useState(EMPTY_ADD);
  const [addErrors, setAddErrors]   = useState({});
  const [addToast, setAddToast]     = useState(false);

  const filtered     = filter === "all" ? resources : resources.filter((r) => r.category === filter);
  const dangerCount  = resources.filter((r) => getStatus(r) === "danger").length;
  const warningCount = resources.filter((r) => getStatus(r) === "warning").length;
  const normalCount  = resources.filter((r) => getStatus(r) === "normal").length;

  //fetching resources
const fetchResources = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(BASE_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
  throw new Error("API failed");
}

    const data = await res.json();

    console.log("API DATA:", data); // 🔥 DEBUG

    if (!Array.isArray(data)) {
      console.error("Invalid API response");
      setResources([]);
      return;
    }

    const mapped = data.map((r) => ({
      id: r._id || Math.random(),
      label: r.label || "Unknown",
      icon: "📊",
      value: Number(r.currentValue) || 0,
      unit: r.unit || "%",
      max: Number(r.maxValue) || 100,
      category: r.category || "systems",
      description: r.description || "",
      thresholdWarn: Number(r.warningThreshold) || 0,
      thresholdDanger: Number(r.criticalThreshold) || 0,
      lastUpdated: "Just now",
    }));

    if (mapped.length === 0) {
  setResources([
    {
      id: "demo",
      label: "Demo Resource",
      icon: "📊",
      value: 50,
      unit: "%",
      max: 100,
      category: "systems",
      description: "Demo data",
      thresholdWarn: 40,
      thresholdDanger: 20,
      lastUpdated: "Now",
    },
  ]);
} else {
  setResources(mapped);
}

  } catch (err) {
    console.error("Fetch error:", err);
    setResources([]);
  }
};

useEffect(() => {
  fetchResources();
}, []);

  /* ── edit ── */
  const openEdit = (r) => { setEditTarget(r); setEditVal(String(r.value)); setEditErr(""); };

  const handleSave = async () => {
  const num = parseFloat(editVal);

  if (isNaN(num) || num < 0) {
    setEditErr("Enter a valid positive number.");
    return;
  }

  try {
    const token = localStorage.getItem("token");

    await fetch(`${BASE_URL}/${editTarget.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentValue: num,
      }),
    });

    fetchResources(); // 🔥 ALWAYS REFRESH

    setSuccessId(editTarget.id);
    setTimeout(() => setSuccessId(null), 2200);
    setEditTarget(null);

  } catch (err) {
    console.error(err);
  }
};

  const quickAdjust = async (id, delta) => {
  const r = resources.find((x) => x.id === id);
  if (!r) return;

  const newVal = Math.min(r.max, Math.max(0, r.value + delta));

  const token = localStorage.getItem("token");

  await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      currentValue: newVal,
    }),
  });

  fetchResources();
};

  /* ── add item ── */
  const validateAdd = () => {
    const e = {};
    if (!addForm.label.trim())                                           e.label         = "Label is required.";
    if (!addForm.value && addForm.value !== 0)                          e.value         = "Enter a current value.";
    else if (isNaN(+addForm.value) || +addForm.value < 0)              e.value         = "Enter a valid number.";
    if (!addForm.max || isNaN(+addForm.max) || +addForm.max <= 0)      e.max           = "Enter a valid max value.";
    else if (+addForm.value > +addForm.max)                             e.value         = "Value cannot exceed max.";
    if (!addForm.thresholdWarn || isNaN(+addForm.thresholdWarn))       e.thresholdWarn = "Enter warning threshold.";
    if (!addForm.thresholdDanger || isNaN(+addForm.thresholdDanger))   e.thresholdDanger = "Enter critical threshold.";
    if (!addForm.description.trim())                                    e.description   = "Add a short description.";
    return e;
  };

  const handleAddSave = async () => {
  const e = validateAdd();
  if (Object.keys(e).length) {
    setAddErrors(e);
    return;
  }

  try {
    const token = localStorage.getItem("token");

    await fetch(`${BASE_URL}/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        label: addForm.label,
        description: addForm.description,
        currentValue: +addForm.value,
        maxValue: +addForm.max,
        unit: addForm.unit,
        category: addForm.category,
        warningThreshold: +addForm.thresholdWarn,
        criticalThreshold: +addForm.thresholdDanger,
      }),
    });

    fetchResources(); // 🔥 refresh UI

    setAddModal(false);
    setAddForm(EMPTY_ADD);
    setAddErrors({});
    setAddToast(true);
    setTimeout(() => setAddToast(false), 2600);

  } catch (err) {
    console.error(err);
  }
};

  const closeAdd = () => { setAddModal(false); setAddForm(EMPTY_ADD); setAddErrors({}); };

  return (
    <div className="so-root">

      {/* ── toast ── */}
      {addToast && (
        <div style={{ position: "fixed", top: 76, right: "1.4rem", zIndex: 600, padding: ".7rem 1.2rem", borderRadius: 10, fontWeight: 600, fontSize: ".87rem", background: "var(--green-500)", color: "#fff", boxShadow: "0 6px 20px rgba(0,0,0,.12)", fontFamily: "var(--font-body)" }}>
          ✓ New resource item added.
        </div>
      )}

      {/* ── page header ── */}
      <div className="so-header">
        <div>
          <h1 className="so-title">Station Overview</h1>
          <p className="so-subtitle">Live resource monitoring · Orion Base Alpha</p>
        </div>
        <div className="so-header-actions">
          {/* ADD ITEM BUTTON */}
          <button className="so-add-btn" onClick={() => { setAddForm(EMPTY_ADD); setAddErrors({}); setAddModal(true); }}>
            + Add Item
          </button>
          <div className="so-live-badge">
            <span className="so-live-dot" />
            Live Monitoring
          </div>
        </div>
      </div>

      {/* ── summary strip ── */}
      <div className="so-summary-strip">
        <div className="so-summary-card so-summary-normal">
          <span className="so-summary-icon">✅</span>
          <div><p className="so-summary-val">{normalCount}</p><p className="so-summary-lbl">Normal</p></div>
        </div>
        <div className="so-summary-card so-summary-warning">
          <span className="so-summary-icon">⚠️</span>
          <div><p className="so-summary-val">{warningCount}</p><p className="so-summary-lbl">Warning</p></div>
        </div>
        <div className="so-summary-card so-summary-danger">
          <span className="so-summary-icon">🔴</span>
          <div><p className="so-summary-val">{dangerCount}</p><p className="so-summary-lbl">Critical</p></div>
        </div>
        <div className="so-summary-card so-summary-total">
          <span className="so-summary-icon">📊</span>
          <div><p className="so-summary-val">{resources.length}</p><p className="so-summary-lbl">Total Resources</p></div>
        </div>
      </div>

      {dangerCount > 0 && (
        <div className="so-alert-banner">
          <span>🚨</span>
          <span><strong>{dangerCount} resource{dangerCount > 1 ? "s are" : " is"} at critical level.</strong> Immediate action required.</span>
        </div>
      )}

      {/* ── category filter ── */}
      <div className="so-filter-row">
        {CATEGORIES.map((c) => (
          <button key={c.key} className={`so-filter-btn${filter === c.key ? " active" : ""}`} onClick={() => setFilter(c.key)}>
            {c.label}
          </button>
        ))}
      </div>



      <div className="so-grid">
  {filtered.length === 0 ? (
    <p style={{ padding: "2rem" }}>No resources found</p>
  ) : (
    filtered.map((r, i) => {
      const status = getStatus(r);
      const barPct = getBarPct(r);
      const isOk = successId === r.id;
      const step = r.unit === "%" ? 1 : Math.ceil(r.max / 100);

      return (
        <div
          key={r.id}
          className={`so-card so-card-${status}`}
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <div className="so-card-top">
                <div className="so-card-icon-wrap"><span className="so-card-icon">{r.icon}</span></div>
                <div className="so-card-meta">
                  <span className={`so-status-badge so-badge-${status}`}>
                    {status === "normal" ? "Normal" : status === "warning" ? "Warning" : "Critical"}
                  </span>
                  <span className="so-updated">{r.lastUpdated}</span>
                </div>
              </div>

              <div className="so-card-value-row">
                <span className="so-card-value">{typeof r.value === "number" && !Number.isInteger(r.value) ? r.value.toFixed(1) : r.value}</span>
                <span className="so-card-unit">{r.unit}</span>
              </div>

              <p className="so-card-label">{r.label}</p>
              <p className="so-card-desc">{r.description}</p>

              <div className="so-bar-wrap">
                <div className="so-bar-track">
                  <div className={`so-bar-fill so-bar-${status}`} style={{ width: `${barPct}%` }} />
                </div>
                <span className="so-bar-pct">{Math.round(barPct)}%</span>
              </div>

              <p className="so-card-max">Max: {r.max} {r.unit}</p>
              {isOk && <div className="so-card-success">✓ Updated</div>}

              <div className="so-card-actions">
                <button className="so-adj-btn so-adj-minus" onClick={() => quickAdjust(r.id, -step)} title={`Decrease by ${step}`}>−</button>
                <button className="so-edit-btn" onClick={() => openEdit(r)}>✏️ Modify</button>
                <button className="so-adj-btn so-adj-plus"  onClick={() => quickAdjust(r.id, +step)} title={`Increase by ${step}`}>+</button>
              </div>
        </div>
      );
    })
  )}
</div>

      {/* ============================================================
          EDIT MODAL
      ============================================================ */}
      {editTarget && (
        <div className="so-modal-overlay" onClick={() => setEditTarget(null)}>
          <div className="so-modal" onClick={(e) => e.stopPropagation()}>
            <div className="so-modal-header">
              <div className="so-modal-title-row">
                <span className="so-modal-icon">{editTarget.icon}</span>
                <div>
                  <h2 className="so-modal-title">Modify {editTarget.label}</h2>
                  <p className="so-modal-sub">{editTarget.description}</p>
                </div>
              </div>
              <button className="so-modal-close" onClick={() => setEditTarget(null)}>✕</button>
            </div>
            <div className="so-modal-body">
              <div className="so-modal-current">
                <span className="so-mc-label">Current Value</span>
                <span className="so-mc-val">
                  {typeof editTarget.value === "number" && !Number.isInteger(editTarget.value) ? editTarget.value.toFixed(1) : editTarget.value}{" "}
                  <span className="so-mc-unit">{editTarget.unit}</span>
                </span>
              </div>
              <div className="so-modal-slider-wrap">
                <label className="so-modal-label">Set New Value<span className="so-modal-unit-hint"> ({editTarget.unit})</span></label>
                <input type="range" min={0} max={editTarget.max} step={editTarget.isTemp ? 0.1 : 1} value={editVal || 0}
                  onChange={(e) => { setEditVal(e.target.value); setEditErr(""); }} className="so-slider" />
                <div className="so-slider-labels">
                  <span>0</span>
                  <span className="so-slider-midlabel">{parseFloat(editVal || 0).toFixed(editTarget.isTemp ? 1 : 0)} {editTarget.unit}</span>
                  <span>{editTarget.max}</span>
                </div>
              </div>
              <div className="so-modal-input-wrap">
                <label className="so-modal-label">Or type exact value</label>
                <div className="so-modal-input-row">
                  <input type="number" className={`so-modal-input${editErr ? " error" : ""}`} value={editVal}
                    min={0} max={editTarget.max} step={editTarget.isTemp ? 0.1 : 1}
                    onChange={(e) => { setEditVal(e.target.value); setEditErr(""); }} placeholder={`0 – ${editTarget.max}`} />
                  <span className="so-modal-unit-tag">{editTarget.unit}</span>
                </div>
                {editErr && <p className="so-modal-error">⚠ {editErr}</p>}
              </div>
              <div className="so-modal-thresholds">
                <div className="so-thresh-item so-thresh-warn">
                  <span className="so-thresh-dot warn" />
                  <span>Warning below {editTarget.thresholdWarn} {editTarget.unit}</span>
                </div>
                <div className="so-thresh-item so-thresh-danger">
                  <span className="so-thresh-dot danger" />
                  <span>Critical below {editTarget.thresholdDanger} {editTarget.unit}</span>
                </div>
              </div>
            </div>
            <div className="so-modal-footer">
              <button className="so-modal-cancel" onClick={() => setEditTarget(null)}>Cancel</button>
              <button className="so-modal-save" onClick={handleSave}>💾 Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          ADD ITEM MODAL
      ============================================================ */}
      {addModal && (
        <div className="so-modal-overlay" onClick={closeAdd}>
          <div className="so-modal so-modal-add" onClick={(e) => e.stopPropagation()}>

            <div className="so-modal-header">
              <div className="so-modal-title-row">
                <span className="so-modal-icon">📊</span>
                <div>
                  <h2 className="so-modal-title">Add New Resource Item</h2>
                  <p className="so-modal-sub">Define a new station resource to monitor</p>
                </div>
              </div>
              <button className="so-modal-close" onClick={closeAdd}>✕</button>
            </div>

            <div className="so-modal-body so-add-body">

              {/* row 1 — icon + label */}
              <div className="so-add-row">
                <div className="so-add-group" style={{ flex: "0 0 80px" }}>
                  <label className="so-modal-label">Icon</label>
                  <input
                    className="so-modal-input so-icon-input"
                    placeholder="🔧"
                    value={addForm.icon}
                    maxLength={2}
                    onChange={(e) => setAddForm({ ...addForm, icon: e.target.value })}
                  />
                </div>
                <div className="so-add-group" style={{ flex: 1 }}>
                  <label className="so-modal-label">Resource Label <span className="so-req">*</span></label>
                  <input
                    className={`so-modal-input${addErrors.label ? " error" : ""}`}
                    placeholder="e.g. CO₂ Level"
                    value={addForm.label}
                    onChange={(e) => { setAddForm({ ...addForm, label: e.target.value }); setAddErrors({ ...addErrors, label: "" }); }}
                  />
                  {addErrors.label && <p className="so-modal-error">⚠ {addErrors.label}</p>}
                </div>
              </div>

              {/* row 2 — description */}
              <div className="so-add-group">
                <label className="so-modal-label">Description <span className="so-req">*</span></label>
                <input
                  className={`so-modal-input${addErrors.description ? " error" : ""}`}
                  placeholder="e.g. Carbon dioxide concentration in cabin air"
                  value={addForm.description}
                  onChange={(e) => { setAddForm({ ...addForm, description: e.target.value }); setAddErrors({ ...addErrors, description: "" }); }}
                />
                {addErrors.description && <p className="so-modal-error">⚠ {addErrors.description}</p>}
              </div>

              {/* row 3 — value, unit, max */}
              <div className="so-add-row">
                <div className="so-add-group">
                  <label className="so-modal-label">Current Value <span className="so-req">*</span></label>
                  <input type="number" min={0}
                    className={`so-modal-input${addErrors.value ? " error" : ""}`}
                    placeholder="e.g. 0.04"
                    value={addForm.value}
                    onChange={(e) => { setAddForm({ ...addForm, value: e.target.value }); setAddErrors({ ...addErrors, value: "" }); }}
                  />
                  {addErrors.value && <p className="so-modal-error">⚠ {addErrors.value}</p>}
                </div>
                <div className="so-add-group">
                  <label className="so-modal-label">Unit</label>
                  <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap" }}>
                    {UNIT_PRESETS.map((u) => (
                      <button key={u} type="button"
                        onClick={() => setAddForm({ ...addForm, unit: u })}
                        className={`so-unit-pill${addForm.unit === u ? " selected" : ""}`}>
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="so-add-group">
                  <label className="so-modal-label">Max Value <span className="so-req">*</span></label>
                  <input type="number" min={1}
                    className={`so-modal-input${addErrors.max ? " error" : ""}`}
                    placeholder="e.g. 100"
                    value={addForm.max}
                    onChange={(e) => { setAddForm({ ...addForm, max: e.target.value }); setAddErrors({ ...addErrors, max: "" }); }}
                  />
                  {addErrors.max && <p className="so-modal-error">⚠ {addErrors.max}</p>}
                </div>
              </div>

              {/* row 4 — warn + danger thresholds */}
              <div className="so-add-row">
                <div className="so-add-group">
                  <label className="so-modal-label">⚠️ Warning Below <span className="so-req">*</span></label>
                  <input type="number" min={0}
                    className={`so-modal-input${addErrors.thresholdWarn ? " error" : ""}`}
                    placeholder="e.g. 60"
                    value={addForm.thresholdWarn}
                    onChange={(e) => { setAddForm({ ...addForm, thresholdWarn: e.target.value }); setAddErrors({ ...addErrors, thresholdWarn: "" }); }}
                  />
                  {addErrors.thresholdWarn && <p className="so-modal-error">⚠ {addErrors.thresholdWarn}</p>}
                </div>
                <div className="so-add-group">
                  <label className="so-modal-label">🔴 Critical Below <span className="so-req">*</span></label>
                  <input type="number" min={0}
                    className={`so-modal-input${addErrors.thresholdDanger ? " error" : ""}`}
                    placeholder="e.g. 40"
                    value={addForm.thresholdDanger}
                    onChange={(e) => { setAddForm({ ...addForm, thresholdDanger: e.target.value }); setAddErrors({ ...addErrors, thresholdDanger: "" }); }}
                  />
                  {addErrors.thresholdDanger && <p className="so-modal-error">⚠ {addErrors.thresholdDanger}</p>}
                </div>
              </div>

              {/* row 5 — category */}
              <div className="so-add-group">
                <label className="so-modal-label">Category</label>
                <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap" }}>
                  {CATEGORY_KEYS.map((c) => (
                    <button key={c} type="button"
                      onClick={() => setAddForm({ ...addForm, category: c })}
                      className={`so-unit-pill${addForm.category === c ? " selected" : ""}`}>
                      {c.replace("-", " ")}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <div className="so-modal-footer">
              <button className="so-modal-cancel" onClick={closeAdd}>Cancel</button>
              <button className="so-modal-save" onClick={handleAddSave}>➕ Add Resource</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}