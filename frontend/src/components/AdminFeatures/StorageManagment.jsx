import { useState } from "react";
import "../../assets/css/StorageMangement.css";

const RESOURCES = ["Food", "Oxygen", "Tools", "Batteries", "Fuel", "Water", "Medical Supplies"];

const INITIAL_MODULES = [
  { id: "MOD-001", name: "Alpha", icon: "α", capacity: 5000, currentLoad: 3200, storedResource: "Food",      status: "active"      },
  { id: "MOD-002", name: "Beta",  icon: "β", capacity: 4000, currentLoad: 3900, storedResource: "Oxygen",    status: "active"      },
  { id: "MOD-003", name: "Gamma", icon: "γ", capacity: 6000, currentLoad: 1500, storedResource: "Tools",     status: "active"      },
  { id: "MOD-004", name: "Delta", icon: "δ", capacity: 3000, currentLoad: 2700, storedResource: "Batteries", status: "maintenance" },
  { id: "MOD-005", name: "Theta", icon: "θ", capacity: 8000, currentLoad: 2100, storedResource: "Fuel",      status: "disabled"    },
];

const STATUS_OPTIONS = ["active", "maintenance", "disabled"];

const RESOURCE_ICONS = {
  "Food": "🍱", "Oxygen": "🫧", "Tools": "🔧",
  "Batteries": "🔋", "Fuel": "🛢️", "Water": "💧", "Medical Supplies": "💊",
};

const GREEK = ["α","β","γ","δ","θ","ε","ζ","η","ι","κ","λ","μ","ν","ξ","ο","π","ρ","σ","τ","υ"];

function getLoadStatus(mod) {
  const pct = (mod.currentLoad / mod.capacity) * 100;
  if (pct >= 90) return "critical";
  if (pct >= 70) return "warning";
  return "normal";
}
function getPct(mod) {
  return Math.min(100, Math.round((mod.currentLoad / mod.capacity) * 100));
}

let moduleCounter = INITIAL_MODULES.length + 1;

export default function StorageManagement() {
  const [modules, setModules]           = useState(INITIAL_MODULES);
  const [modal, setModal]               = useState(null); // "edit" | "add"
  const [selected, setSelected]         = useState(null);
  const [form, setForm]                 = useState({});
  const [errors, setErrors]             = useState({});
  const [toast, setToast]               = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  };

  const openEdit = (mod) => {
    setSelected(mod);
    setForm({ capacity: mod.capacity, currentLoad: mod.currentLoad, storedResource: mod.storedResource, status: mod.status });
    setErrors({});
    setModal("edit");
  };

  const openAdd = () => {
    setForm({ name: "", capacity: "", currentLoad: "0", storedResource: "Food", status: "active" });
    setErrors({});
    setModal("add");
  };

  const closeModal = () => { setModal(null); setSelected(null); setErrors({}); };

  const validate = (isAdd) => {
    const e = {};
    if (isAdd && !form.name.trim())                                      e.name        = "Module name is required.";
    if (!form.capacity || isNaN(form.capacity) || +form.capacity <= 0)  e.capacity    = "Enter a valid capacity.";
    if (form.currentLoad === "" || isNaN(form.currentLoad) || +form.currentLoad < 0) e.currentLoad = "Enter a valid load.";
    else if (+form.currentLoad > +form.capacity)                         e.currentLoad = "Load cannot exceed capacity.";
    if (!form.storedResource)                                            e.storedResource = "Select a resource.";
    return e;
  };

  const handleSave = () => {
    const e = validate(false);
    if (Object.keys(e).length) { setErrors(e); return; }
    setModules((prev) =>
      prev.map((m) =>
        m.id === selected.id
          ? { ...m, capacity: +form.capacity, currentLoad: +form.currentLoad, storedResource: form.storedResource, status: form.status }
          : m
      )
    );
    closeModal();
    showToast(`Module ${selected.name} updated.`);
  };

  const handleAdd = () => {
    const e = validate(true);
    if (Object.keys(e).length) { setErrors(e); return; }
    const idx  = (moduleCounter - 1) % GREEK.length;
    const id   = `MOD-${String(moduleCounter++).padStart(3, "0")}`;
    setModules((prev) => [
      ...prev,
      { id, name: form.name.trim(), icon: GREEK[idx], capacity: +form.capacity, currentLoad: +form.currentLoad, storedResource: form.storedResource, status: form.status },
    ]);
    closeModal();
    showToast(`Module "${form.name}" added successfully.`);
  };

  const handleToggleStatus = (mod) => {
    const next = mod.status === "active" ? "disabled" : "active";
    setModules((prev) => prev.map((m) => m.id === mod.id ? { ...m, status: next } : m));
    showToast(`${mod.name} set to ${next}.`);
  };

  const filtered    = filterStatus === "all" ? modules : modules.filter((m) => m.status === filterStatus);
  const totalCap    = modules.reduce((s, m) => s + m.capacity, 0);
  const totalLoad   = modules.reduce((s, m) => s + m.currentLoad, 0);
  const activeCount = modules.filter((m) => m.status === "active").length;

  const previewPct = form.capacity > 0 ? Math.min(100, Math.round((+form.currentLoad / +form.capacity) * 100)) : 0;
  const previewLS  = previewPct >= 90 ? "critical" : previewPct >= 70 ? "warning" : "normal";

  return (
    <div className="sm-root">

      {toast && <div className={`sm-toast sm-toast-${toast.type}`}>{toast.msg}</div>}

      {/* ── header ── */}
      <div className="sm-header">
        <div>
          <h1 className="sm-title">Storage Management</h1>
          <p className="sm-subtitle">{modules.length} storage modules · Admin control panel</p>
        </div>
        <button className="sm-add-btn" onClick={openAdd}>+ Add Module</button>
      </div>

      {/* ── summary ── */}
      <div className="sm-summary">
        <div className="sm-sum-card"><span className="sm-sum-icon">📦</span><div><p className="sm-sum-val">{modules.length}</p><p className="sm-sum-lbl">Total Modules</p></div></div>
        <div className="sm-sum-card"><span className="sm-sum-icon">✅</span><div><p className="sm-sum-val">{activeCount}</p><p className="sm-sum-lbl">Active</p></div></div>
        <div className="sm-sum-card"><span className="sm-sum-icon">🗄️</span><div><p className="sm-sum-val">{totalCap.toLocaleString()} <span className="sm-sum-unit">kg</span></p><p className="sm-sum-lbl">Total Capacity</p></div></div>
        <div className="sm-sum-card"><span className="sm-sum-icon">📊</span><div><p className="sm-sum-val">{Math.round((totalLoad / totalCap) * 100)}<span className="sm-sum-unit">%</span></p><p className="sm-sum-lbl">Overall Load</p></div></div>
      </div>

      {/* ── filter ── */}
      <div className="sm-filter-row">
        {["all", "active", "maintenance", "disabled"].map((s) => (
          <button key={s} className={`sm-filter-btn${filterStatus === s ? " active" : ""}`} onClick={() => setFilterStatus(s)}>
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* ── table ── */}
      <div className="sm-table-card">
        <div className="sm-table-top">
          <span className="sm-table-count">{filtered.length} module{filtered.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="sm-table-wrap">
          <table className="sm-table">
            <thead>
              <tr>
                <th>Module</th><th>ID</th><th>Stored Resource</th>
                <th>Capacity</th><th>Current Load</th><th>Utilisation</th>
                <th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((mod) => {
                const pct = getPct(mod);
                const ls  = getLoadStatus(mod);
                return (
                  <tr key={mod.id} className={mod.status !== "active" ? "sm-row-dim" : ""}>
                    <td>
                      <div className="sm-name-cell">
                        <span className="sm-symbol">{mod.icon}</span>
                        <span className="sm-mod-name">Module {mod.name}</span>
                      </div>
                    </td>
                    <td><span className="sm-id-tag">{mod.id}</span></td>
                    <td><div className="sm-res-cell"><span>{RESOURCE_ICONS[mod.storedResource]}</span><span>{mod.storedResource}</span></div></td>
                    <td><span className="sm-num">{mod.capacity.toLocaleString()} kg</span></td>
                    <td><span className="sm-num">{mod.currentLoad.toLocaleString()} kg</span></td>
                    <td>
                      <div className="sm-util-cell">
                        <div className="sm-mini-bar"><div className={`sm-mini-fill sm-bar-${ls}`} style={{ width: `${pct}%` }} /></div>
                        <span className={`sm-util-pct sm-util-${ls}`}>{pct}%</span>
                      </div>
                    </td>
                    <td><span className={`sm-status-badge sm-status-${mod.status}`}>{mod.status}</span></td>
                    <td>
                      <div className="sm-action-row">
                        <button className="sm-btn-edit" onClick={() => openEdit(mod)}>✏️ Edit</button>
                        <button className={`sm-btn-toggle${mod.status === "active" ? " disable" : " enable"}`} onClick={() => handleToggleStatus(mod)}>
                          {mod.status === "active" ? "Disable" : "Enable"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── module cards ── */}
      <h2 className="sm-cards-heading">Module Overview</h2>
      <div className="sm-grid">
        {modules.map((mod, i) => {
          const pct = getPct(mod);
          const ls  = getLoadStatus(mod);
          return (
            <div key={mod.id} className={`sm-card sm-card-${mod.status}`} style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="sm-card-top">
                <div className="sm-card-name-row">
                  <span className="sm-module-symbol">{mod.icon}</span>
                  <div>
                    <p className="sm-module-name">Module {mod.name}</p>
                    <p className="sm-module-id">{mod.id}</p>
                  </div>
                </div>
                <span className={`sm-status-badge sm-status-${mod.status}`}>{mod.status}</span>
              </div>
              <div className="sm-res-row">
                <span>{RESOURCE_ICONS[mod.storedResource]}</span>
                <span className="sm-res-name">{mod.storedResource}</span>
              </div>
              <div className="sm-card-stats">
                <div className="sm-cs"><p className="sm-cs-label">Capacity</p><p className="sm-cs-val">{mod.capacity.toLocaleString()} kg</p></div>
                <div className="sm-cs"><p className="sm-cs-label">Current Load</p><p className="sm-cs-val">{mod.currentLoad.toLocaleString()} kg</p></div>
                <div className="sm-cs"><p className="sm-cs-label">Free Space</p><p className="sm-cs-val">{(mod.capacity - mod.currentLoad).toLocaleString()} kg</p></div>
              </div>
              <div className="sm-bar-row">
                <div className="sm-bar-track"><div className={`sm-bar-fill sm-bar-${ls}`} style={{ width: `${pct}%` }} /></div>
                <span className={`sm-bar-pct sm-util-${ls}`}>{pct}%</span>
              </div>
              <button className="sm-card-edit-btn" onClick={() => openEdit(mod)}>✏️ Edit Module</button>
            </div>
          );
        })}

        {/* ── ghost add card ── */}
        <div className="sm-card-add" onClick={openAdd}>
          <span className="sm-card-add-icon">+</span>
          <p className="sm-card-add-label">Add New Module</p>
        </div>
      </div>

      {/* ============================================================
          MODAL — shared for Add & Edit
      ============================================================ */}
      {(modal === "edit" || modal === "add") && (
        <div className="sm-overlay" onClick={closeModal}>
          <div className="sm-modal" onClick={(e) => e.stopPropagation()}>

            <div className="sm-modal-header">
              <div className="sm-modal-title-row">
                <span className="sm-modal-symbol">{modal === "add" ? "📦" : selected.icon}</span>
                <div>
                  <h2 className="sm-modal-title">{modal === "add" ? "Add New Storage Module" : `Edit — Module ${selected.name}`}</h2>
                  <p className="sm-modal-sub">{modal === "add" ? "Fill in module details below" : selected.id}</p>
                </div>
              </div>
              <button className="sm-modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="sm-modal-body">

              {/* name — add only */}
              {modal === "add" && (
                <div className="sm-form-group">
                  <label className="sm-label">Module Name <span className="sm-req">*</span></label>
                  <input
                    className={`sm-input${errors.name ? " error" : ""}`}
                    placeholder="e.g. Sigma, Epsilon…"
                    value={form.name}
                    onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: "" }); }}
                  />
                  {errors.name && <p className="sm-error">⚠ {errors.name}</p>}
                </div>
              )}

              {/* stored resource */}
              <div className="sm-form-group">
                <label className="sm-label">Stored Resource <span className="sm-req">*</span></label>
                <select
                  className={`sm-input${errors.storedResource ? " error" : ""}`}
                  value={form.storedResource}
                  onChange={(e) => { setForm({ ...form, storedResource: e.target.value }); setErrors({ ...errors, storedResource: "" }); }}
                >
                  <option value="">Select resource…</option>
                  {RESOURCES.map((r) => <option key={r} value={r}>{RESOURCE_ICONS[r]} {r}</option>)}
                </select>
                {errors.storedResource && <p className="sm-error">⚠ {errors.storedResource}</p>}
              </div>

              <div className="sm-form-row">
                <div className="sm-form-group">
                  <label className="sm-label">Capacity (kg) <span className="sm-req">*</span></label>
                  <input type="number" min={1} className={`sm-input${errors.capacity ? " error" : ""}`} placeholder="e.g. 5000"
                    value={form.capacity} onChange={(e) => { setForm({ ...form, capacity: e.target.value }); setErrors({ ...errors, capacity: "" }); }} />
                  {errors.capacity && <p className="sm-error">⚠ {errors.capacity}</p>}
                </div>
                <div className="sm-form-group">
                  <label className="sm-label">Current Load (kg) <span className="sm-req">*</span></label>
                  <input type="number" min={0} className={`sm-input${errors.currentLoad ? " error" : ""}`} placeholder="e.g. 0"
                    value={form.currentLoad} onChange={(e) => { setForm({ ...form, currentLoad: e.target.value }); setErrors({ ...errors, currentLoad: "" }); }} />
                  {errors.currentLoad && <p className="sm-error">⚠ {errors.currentLoad}</p>}
                </div>
              </div>

              {/* status */}
              <div className="sm-form-group">
                <label className="sm-label">Module Status</label>
                <div className="sm-status-opts">
                  {STATUS_OPTIONS.map((s) => (
                    <button key={s} type="button"
                      className={`sm-sopt sm-sopt-${s}${form.status === s ? " selected" : ""}`}
                      onClick={() => setForm({ ...form, status: s })}>
                      {s === "active" ? "✅" : s === "maintenance" ? "🔧" : "🔴"}&nbsp;
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* live preview bar */}
              {+form.capacity > 0 && (
                <div className="sm-preview-bar-wrap">
                  <p className="sm-preview-label">
                    Load preview: {previewPct}% &nbsp;({(+form.capacity - +form.currentLoad).toLocaleString()} kg free)
                  </p>
                  <div className="sm-bar-track">
                    <div className={`sm-bar-fill sm-bar-${previewLS}`} style={{ width: `${previewPct}%` }} />
                  </div>
                </div>
              )}
            </div>

            <div className="sm-modal-footer">
              <button className="sm-btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="sm-btn-save" onClick={modal === "add" ? handleAdd : handleSave}>
                {modal === "add" ? "➕ Add Module" : "💾 Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}