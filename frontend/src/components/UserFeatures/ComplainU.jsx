import { useState } from "react";
import '../../assets/css/user.css';

const ME = { id: 2, name: "Eng. Marco Reyes", role: "Engineer", avatar: "MR" };

const CATEGORIES = ["Technical Issue", "Medical Concern", "Safety Hazard", "Resource Shortage", "Personal", "Other"];
const PRIORITIES = ["Low", "Medium", "High", "Critical"];

const PRIORITY_META = {
  Low:      { color: "#16a34a", bg: "#dcfce7", border: "#86efac" },
  Medium:   { color: "#d97706", bg: "#fef9c3", border: "#fde047" },
  High:     { color: "#ea580c", bg: "#fff7ed", border: "#fdba74" },
  Critical: { color: "#b91c1c", bg: "#fee2e2", border: "#fca5a5" },
};
const STATUS_META = {
  Open:        { color: "#1d4ed8", bg: "#dbeafe", border: "#93c5fd" },
  "In Review": { color: "#d97706", bg: "#fef9c3", border: "#fde047" },
  Resolved:    { color: "#15803d", bg: "#dcfce7", border: "#86efac" },
  Closed:      { color: "#6b7280", bg: "#f3f4f6", border: "#d1d5db" },
};

const today = new Date().toISOString().slice(0, 10);
let cmpCounter = 3;

const INITIAL_COMPLAINTS = [
  { id: "CMP-001", crewId: ME.id, title: "Air circulation fan making noise", category: "Technical Issue", description: "The fan in module Gamma has been making a loud rattling noise for 3 days.", priority: "High", status: "Open", submittedAt: "2026-03-08",
    replies: [{ from: "admin", message: "We have logged this issue. Engineer Brecker will inspect it tomorrow.", time: "2026-03-09" }] },
  { id: "CMP-002", crewId: ME.id, title: "Fuel line pressure sensor glitch", category: "Technical Issue", description: "Sensor P-04 on fuel line shows intermittent readings. May need recalibration.", priority: "Medium", status: "In Review", submittedAt: "2026-03-10", replies: [] },
];

// Broadcast messages received from admin
const BROADCASTS = [
  { id: 1, subject: "Monthly safety drill reminder", message: "All crew must attend the mandatory safety drill on March 14 at 09:00. Location: Main Deck.", sentAt: "2026-03-08" },
];

const EMPTY_FORM = { title: "", category: CATEGORIES[0], priority: "Medium", description: "" };

export default function Complain() {
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [errors, setErrors]         = useState({});
  const [modal, setModal]           = useState(false);
  const [selected, setSelected]     = useState(null);
  const [toast, setToast]           = useState(null);
  const [tab, setTab]               = useState("my"); // "my" | "broadcast"
  const [filterStatus, setFilterStatus] = useState("All");

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 2600); };

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = "Title is required.";
    if (!form.description.trim()) e.description = "Please describe the issue.";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const id = `CMP-${String(cmpCounter++).padStart(3, "0")}`;
    const newC = { id, crewId: ME.id, ...form, status: "Open", submittedAt: today, replies: [] };
    setComplaints((p) => [newC, ...p]);
    setForm(EMPTY_FORM);
    setErrors({});
    setModal(false);
    showToast("Complaint submitted successfully.");
  };

  const myComplaints = complaints.filter((c) => c.crewId === ME.id);
  const filtered = filterStatus === "All" ? myComplaints : myComplaints.filter((c) => c.status === filterStatus);

  return (
    <div className="u-root">
      {toast && <div className={`u-toast u-toast-${toast.type}`}>{toast.msg}</div>}

      <div className="u-header">
        <div>
          <h1 className="u-title">Complaint Center</h1>
          <p className="u-subtitle">Submit and track your complaints · View admin broadcasts</p>
        </div>
        <button className="u-btn-primary" onClick={() => setModal(true)}>+ New Complaint</button>
      </div>

      {/* tabs */}
      <div style={{ display: "flex", gap: ".5rem", marginBottom: "1.3rem", borderBottom: "2px solid var(--gray-100)", paddingBottom: ".1rem" }}>
        {[["my", `📋 My Complaints (${myComplaints.length})`], ["broadcast", `📢 Admin Broadcasts (${BROADCASTS.length})`]].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            style={{ padding: ".5rem 1.1rem", fontWeight: 700, fontSize: ".88rem", background: "none", border: "none", cursor: "pointer", color: tab === v ? "var(--green-600)" : "var(--gray-500)", fontFamily: "var(--font-body)", borderBottom: tab === v ? "2.5px solid var(--green-500)" : "2.5px solid transparent", marginBottom: "-2px", transition: "color .15s" }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* ── MY COMPLAINTS ── */}
      {tab === "my" && (
        <>
          {/* summary */}
          <div className="u-summary u-sum-4" style={{ marginBottom: "1.1rem" }}>
            {[
              { icon: "📋", val: myComplaints.length,                                          lbl: "Total"       },
              { icon: "🔵", val: myComplaints.filter((c) => c.status === "Open").length,        lbl: "Open"        },
              { icon: "🔍", val: myComplaints.filter((c) => c.status === "In Review").length,   lbl: "In Review"   },
              { icon: "✅", val: myComplaints.filter((c) => c.status === "Resolved").length,    lbl: "Resolved"    },
            ].map((s) => (
              <div key={s.lbl} className="u-sum-card">
                <span className="u-sum-icon">{s.icon}</span>
                <div><p className="u-sum-val">{s.val}</p><p className="u-sum-lbl">{s.lbl}</p></div>
              </div>
            ))}
          </div>

          <div className="u-filter-row">
            {["All", "Open", "In Review", "Resolved", "Closed"].map((s) => (
              <button key={s} className={`u-filter-btn${filterStatus === s ? " active" : ""}`} onClick={() => setFilterStatus(s)}>{s}</button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="u-empty"><span>📋</span><p>No complaints yet. Submit one if you have an issue.</p></div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
              {filtered.map((c) => {
                const pm = PRIORITY_META[c.priority];
                const sm = STATUS_META[c.status];
                const isOpen = selected?.id === c.id;
                return (
                  <div key={c.id} style={{ background: "var(--white)", border: `1.5px solid ${isOpen ? "var(--green-400)" : "var(--gray-100)"}`, borderRadius: 14, overflow: "hidden", transition: "border-color .2s", boxShadow: isOpen ? "0 0 0 3px rgba(34,197,94,.1)" : "none" }}>
                    {/* card header */}
                    <div
                      style={{ padding: "1rem 1.3rem", cursor: "pointer" }}
                      onClick={() => setSelected(isOpen ? null : c)}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: ".8rem", marginBottom: ".5rem" }}>
                        <p style={{ fontWeight: 700, fontSize: ".95rem", color: "var(--gray-900)", lineHeight: 1.3, flex: 1 }}>{c.title}</p>
                        <div style={{ display: "flex", gap: ".35rem", flexShrink: 0 }}>
                          <span className="u-badge" style={{ color: pm.color, background: pm.bg, border: `1px solid ${pm.border}` }}>{c.priority}</span>
                          <span className="u-badge" style={{ color: sm.color, background: sm.bg, border: `1px solid ${sm.border}` }}>{c.status}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                        <span style={{ fontSize: ".75rem", background: "var(--gray-100)", color: "var(--gray-600)", padding: ".18rem .55rem", borderRadius: 99, fontWeight: 600 }}>{c.category}</span>
                        <span className="u-mono" style={{ fontSize: ".72rem", color: "var(--gray-400)" }}>{c.id}</span>
                        <span style={{ fontSize: ".75rem", color: "var(--gray-400)" }}>📅 {c.submittedAt}</span>
                        {c.replies.length > 0 && <span style={{ fontSize: ".75rem", color: "var(--green-700)", fontWeight: 600 }}>💬 {c.replies.length} repl{c.replies.length > 1 ? "ies" : "y"} from admin</span>}
                      </div>
                    </div>

                    {/* expanded */}
                    {isOpen && (
                      <div style={{ borderTop: "1px solid var(--gray-100)", padding: "1rem 1.3rem", display: "flex", flexDirection: "column", gap: ".8rem" }}>
                        <p style={{ fontSize: ".87rem", color: "var(--gray-700)", lineHeight: 1.65, background: "var(--gray-50)", borderRadius: 8, padding: ".75rem .95rem", border: "1px solid var(--gray-100)" }}>{c.description}</p>

                        {/* replies */}
                        {c.replies.length > 0 && (
                          <div style={{ display: "flex", flexDirection: "column", gap: ".55rem" }}>
                            <p style={{ fontSize: ".75rem", fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: ".07em" }}>Admin Response{c.replies.length > 1 ? "s" : ""}</p>
                            {c.replies.map((r, i) => (
                              <div key={i} style={{ background: "var(--green-50)", border: "1px solid var(--green-200)", borderRadius: 10, padding: ".7rem .95rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".3rem" }}>
                                  <span style={{ fontSize: ".75rem", fontWeight: 700, color: "var(--green-700)" }}>🛡️ Admin</span>
                                  <span className="u-mono" style={{ fontSize: ".68rem", color: "var(--gray-400)" }}>{r.time}</span>
                                </div>
                                <p style={{ fontSize: ".87rem", color: "var(--gray-800)", lineHeight: 1.55 }}>{r.message}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {c.replies.length === 0 && (
                          <p style={{ fontSize: ".82rem", color: "var(--gray-400)", fontStyle: "italic" }}>⏳ Awaiting admin response.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── BROADCASTS ── */}
      {tab === "broadcast" && (
        <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
          {BROADCASTS.length === 0 ? (
            <div className="u-empty"><span>📢</span><p>No broadcasts yet.</p></div>
          ) : (
            BROADCASTS.map((b) => (
              <div key={b.id} style={{ background: "var(--white)", border: "1.5px solid var(--gray-100)", borderLeft: "4px solid var(--green-400)", borderRadius: 14, padding: "1.1rem 1.3rem" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: ".8rem", marginBottom: ".55rem" }}>
                  <p style={{ fontWeight: 700, fontSize: ".95rem", color: "var(--gray-900)" }}>{b.subject}</p>
                  <span className="u-mono" style={{ fontSize: ".72rem", color: "var(--gray-400)", flexShrink: 0 }}>{b.sentAt}</span>
                </div>
                <p style={{ fontSize: ".87rem", color: "var(--gray-700)", lineHeight: 1.65 }}>{b.message}</p>
                <p style={{ fontSize: ".75rem", color: "var(--gray-400)", marginTop: ".6rem", fontStyle: "italic" }}>— Broadcast from Admin</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── SUBMIT MODAL ── */}
      {modal && (
        <div className="u-overlay" onClick={() => setModal(false)}>
          <div className="u-modal" onClick={(e) => e.stopPropagation()}>
            <div className="u-modal-header">
              <h2 className="u-modal-title">📋 Submit New Complaint</h2>
              <button className="u-modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="u-modal-body">

              <div className="u-form-group">
                <label className="u-label">Title <span className="u-req">*</span></label>
                <input className={`u-input${errors.title ? " error" : ""}`} placeholder="Brief summary of the issue"
                  value={form.title} onChange={(e) => { setForm({ ...form, title: e.target.value }); setErrors({ ...errors, title: "" }); }} />
                {errors.title && <p className="u-error">⚠ {errors.title}</p>}
              </div>

              <div className="u-form-row">
                <div className="u-form-group">
                  <label className="u-label">Category</label>
                  <select className="u-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="u-form-group">
                  <label className="u-label">Priority</label>
                  <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap", paddingTop: ".1rem" }}>
                    {PRIORITIES.map((p) => {
                      const pm = PRIORITY_META[p];
                      return (
                        <button key={p} type="button"
                          style={{ padding: ".32rem .75rem", fontSize: ".78rem", fontWeight: 700, borderRadius: 99, cursor: "pointer", fontFamily: "var(--font-body)", transition: "all .15s", border: `1.5px solid ${form.priority === p ? pm.border : "var(--gray-200)"}`, color: form.priority === p ? pm.color : "var(--gray-500)", background: form.priority === p ? pm.bg : "var(--white)" }}
                          onClick={() => setForm({ ...form, priority: p })}
                        >{p}</button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="u-form-group">
                <label className="u-label">Description <span className="u-req">*</span></label>
                <textarea className={`u-input u-textarea${errors.description ? " error" : ""}`} rows={4}
                  placeholder="Describe the issue in detail. Include location, time, and any relevant observations."
                  value={form.description} onChange={(e) => { setForm({ ...form, description: e.target.value }); setErrors({ ...errors, description: "" }); }} />
                {errors.description && <p className="u-error">⚠ {errors.description}</p>}
                <p className="u-hint">Be as specific as possible so admin can respond quickly.</p>
              </div>
            </div>

            <div className="u-modal-footer">
              <button className="u-btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="u-btn-primary" onClick={handleSubmit}>Submit Complaint</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}