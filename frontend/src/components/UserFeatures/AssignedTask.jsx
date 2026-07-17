import { useState } from "react";
import '../../assets/css/user.css';

const ME = { id: 3, name: "Eng. Marco Reyes", role: "Engineer", avatar: "MR" };

const PRIORITY_META = {
  Low:      { color: "#16a34a", bg: "#dcfce7", border: "#86efac" },
  Medium:   { color: "#d97706", bg: "#fef9c3", border: "#fde047" },
  High:     { color: "#ea580c", bg: "#fff7ed", border: "#fdba74" },
  Critical: { color: "#b91c1c", bg: "#fee2e2", border: "#fca5a5" },
};
const STATUS_META = {
  Pending:       { color: "#6b7280", bg: "#f3f4f6", border: "#d1d5db" },
  "In Progress": { color: "#1d4ed8", bg: "#dbeafe", border: "#93c5fd" },
  Completed:     { color: "#15803d", bg: "#dcfce7", border: "#86efac" },
  Overdue:       { color: "#b91c1c", bg: "#fee2e2", border: "#fca5a5" },
  Cancelled:     { color: "#6b7280", bg: "#f3f4f6", border: "#d1d5db" },
  Closed:        { color: "#374151", bg: "#e5e7eb", border: "#9ca3af" },
};

const today = new Date().toISOString().slice(0, 10);

const INITIAL_TASKS = [
  { id: "TSK-001", title: "Inspect O₂ filtration unit",     description: "Check all filters and replace if needed.",             assignedTo: 3, priority: "High",     status: "In Progress", deadline: "2026-03-15", createdAt: "2026-03-01", note: "" },
  { id: "TSK-005", title: "Fuel line pressure check",       description: "Verify all fuel line pressure readings are nominal.", assignedTo: 3, priority: "High",     status: "Pending",     deadline: "2026-03-20", createdAt: "2026-03-05", note: "" },
  { id: "TSK-008", title: "Module Beta seal inspection",    description: "Inspect all pressure seals on Module Beta.",          assignedTo: 3, priority: "Medium",   status: "Pending",     deadline: "2026-03-25", createdAt: "2026-03-08", note: "" },
  { id: "TSK-009", title: "Coolant system flush",           description: "Flush and refill the secondary coolant loop.",        assignedTo: 3, priority: "Low",      status: "Completed",   deadline: "2026-03-10", createdAt: "2026-03-03", note: "Flushed and refilled successfully." },
  { id: "TSK-010", title: "Emergency drill equipment test", description: "Test all emergency drill equipment and report.",      assignedTo: 3, priority: "Critical", status: "Overdue",     deadline: "2026-03-05", createdAt: "2026-02-28", note: "" },
  { id: "TSK-002", title: "Medical supply audit",           description: "Count and log all medical inventory items.",          assignedTo: 2, priority: "Medium",   status: "Pending",     deadline: "2026-03-18", createdAt: "2026-03-02", note: "" },
];

const isFinal = (status) => ["Completed", "Closed", "Cancelled"].includes(status);

export default function AssignedTask() {
  const [tasks, setTasks] = useState(
    INITIAL_TASKS
      .filter((t) => t.assignedTo === ME.id)
      .map((t) =>
        t.deadline < today && !isFinal(t.status) ? { ...t, status: "Overdue" } : t
      )
  );

  const [filter, setFilter]     = useState("All");
  const [selected, setSelected] = useState(null);
  const [modal, setModal]       = useState(null);   // task being finished
  const [noteText, setNoteText] = useState("");
  const [toast, setToast]       = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const openFinish = (e, task) => {
    e.stopPropagation();
    setNoteText("");
    setModal(task);
  };

  const handleFinish = () => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === modal.id ? { ...t, status: "Completed", note: noteText.trim() } : t
      )
    );
    if (selected?.id === modal.id)
      setSelected((p) => ({ ...p, status: "Completed", note: noteText.trim() }));
    showToast(`"${modal.title}" marked as completed. Admin notified.`);
    setModal(null);
  };

  const filtered = filter === "All" ? tasks : tasks.filter((t) => t.status === filter);

  const counts = ["Pending", "In Progress", "Completed", "Overdue"].reduce((a, s) => {
    a[s] = tasks.filter((t) => t.status === s).length;
    return a;
  }, {});

  return (
    <div className="u-root">

      {/* ── toast ── */}
      {toast && (
        <div style={{
          position: "fixed", top: 76, right: "1.4rem", zIndex: 500,
          padding: ".7rem 1.2rem", borderRadius: 10, fontWeight: 600,
          fontSize: ".87rem", background: "var(--green-500)", color: "#fff",
          boxShadow: "0 6px 20px rgba(0,0,0,.12)", maxWidth: 320,
          fontFamily: "var(--font-body)", animation: "u-toast .25s ease",
        }}>
          ✓ {toast}
        </div>
      )}

      {/* ── page header ── */}
      <div className="u-header">
        <div>
          <h1 className="u-title">My Tasks</h1>
          <p className="u-subtitle">Tasks assigned to you by admin</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: ".7rem", background: "var(--white)", border: "1.5px solid var(--gray-100)", borderRadius: 12, padding: ".6rem 1rem" }}>
          <div className="u-avatar u-avatar-sm">{ME.avatar}</div>
          <div>
            <p style={{ fontSize: ".82rem", fontWeight: 700, color: "var(--gray-900)", lineHeight: 1.2 }}>{ME.name}</p>
            <p style={{ fontSize: ".72rem", color: "var(--gray-400)" }}>{ME.role}</p>
          </div>
        </div>
      </div>

      <div className="u-readonly-banner">
        👁️ <span><strong>View only.</strong> Click <strong>"🏁 Finish Task"</strong> to notify admin once you've completed a task.</span>
      </div>

      {/* ── summary ── */}
      <div className="u-summary u-sum-4">
        {[
          { icon: "📋", val: tasks.length,             lbl: "Total"       },
          { icon: "🕐", val: counts["Pending"],         lbl: "Pending"     },
          { icon: "⚙️", val: counts["In Progress"],     lbl: "In Progress" },
          { icon: "✅", val: counts["Completed"],       lbl: "Completed"   },
        ].map((s) => (
          <div key={s.lbl} className="u-sum-card">
            <span className="u-sum-icon">{s.icon}</span>
            <div><p className="u-sum-val">{s.val}</p><p className="u-sum-lbl">{s.lbl}</p></div>
          </div>
        ))}
      </div>

      {/* ── overdue alert ── */}
      {counts["Overdue"] > 0 && (
        <div className="u-alert u-alert-red">
          🚨 <strong>You have {counts["Overdue"]} overdue task{counts["Overdue"] > 1 ? "s" : ""}.</strong> Please complete and mark them finished ASAP.
        </div>
      )}

      {/* ── filter ── */}
      <div className="u-filter-row">
        {["All", "Pending", "In Progress", "Completed", "Overdue"].map((s) => (
          <button key={s} className={`u-filter-btn${filter === s ? " active" : ""}`} onClick={() => setFilter(s)}>{s}</button>
        ))}
      </div>

      {/* ── task cards ── */}
      {filtered.length === 0 ? (
        <div className="u-empty"><span>✅</span><p>No tasks in this category.</p></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
          {filtered.map((task) => {
            const pm     = PRIORITY_META[task.priority];
            const sm     = STATUS_META[task.status];
            const isOver = task.status === "Overdue";
            const isDone = isFinal(task.status);
            const isOpen = selected?.id === task.id;

            return (
              <div
                key={task.id}
                onClick={() => setSelected(isOpen ? null : task)}
                style={{
                  background: "var(--white)",
                  border: `1.5px solid ${isDone ? "var(--green-200)" : isOpen ? "#93c5fd" : isOver ? "#fca5a5" : "var(--gray-100)"}`,
                  borderRadius: 14, padding: "1.1rem 1.3rem",
                  cursor: "pointer", transition: "all .2s",
                  boxShadow: isOpen ? "0 0 0 3px rgba(59,130,246,.1)" : "none",
                  opacity: task.status === "Cancelled" ? .6 : 1,
                }}
              >
                {/* top row — title + badges */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: ".8rem", marginBottom: ".55rem" }}>
                  <p style={{ fontWeight: 700, fontSize: ".95rem", color: "var(--gray-900)", lineHeight: 1.3, flex: 1 }}>
                    {isDone && <span style={{ marginRight: ".3rem" }}>✅</span>}{task.title}
                  </p>
                  <div style={{ display: "flex", gap: ".4rem", flexShrink: 0 }}>
                    <span className="u-badge" style={{ color: pm.color, background: pm.bg, border: `1px solid ${pm.border}` }}>{task.priority}</span>
                    <span className="u-badge" style={{ color: sm.color, background: sm.bg, border: `1px solid ${sm.border}` }}>{task.status}</span>
                  </div>
                </div>

                {/* meta row — id, deadline, finish button */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: ".6rem" }}>
                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                    <span className="u-mono" style={{ fontSize: ".72rem", color: "var(--gray-400)" }}>{task.id}</span>
                    <span style={{ fontSize: ".78rem", color: isOver ? "#b91c1c" : "var(--gray-500)", fontWeight: isOver ? 700 : 500 }}>
                      {isOver ? "⏰" : "📅"} Deadline: {task.deadline}
                    </span>
                    <span style={{ fontSize: ".78rem", color: "var(--gray-400)" }}>Created {task.createdAt}</span>
                  </div>

                  {/* ── FINISH TASK BUTTON ── shown only for non-final tasks */}
                  {!isDone && (
                    <button
                      onClick={(e) => openFinish(e, task)}
                      style={{
                        display: "flex", alignItems: "center", gap: ".35rem",
                        padding: ".38rem .95rem", fontSize: ".8rem", fontWeight: 700,
                        background: isOver ? "#ef4444" : "var(--green-500)",
                        color: "#fff", border: "none", borderRadius: 8,
                        cursor: "pointer", fontFamily: "var(--font-body)",
                        boxShadow: `0 2px 8px ${isOver ? "rgba(239,68,68,.35)" : "rgba(34,197,94,.3)"}`,
                        transition: "transform .12s, opacity .15s",
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
                      onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                    >
                      🏁 Finish Task
                    </button>
                  )}
                </div>

                {/* ── expanded section ── */}
                {isOpen && (
                  <div style={{ marginTop: ".85rem", paddingTop: ".85rem", borderTop: "1px solid var(--gray-100)", display: "flex", flexDirection: "column", gap: ".65rem" }}>
                    <p style={{ fontSize: ".87rem", color: "var(--gray-700)", lineHeight: 1.65, background: "var(--gray-50)", borderRadius: 8, padding: ".75rem .95rem", border: "1px solid var(--gray-100)" }}>
                      {task.description}
                    </p>

                    {task.status === "Completed" && task.note && (
                      <div style={{ background: "var(--green-50)", border: "1px solid var(--green-200)", borderRadius: 8, padding: ".65rem .95rem" }}>
                        <p style={{ fontSize: ".72rem", fontWeight: 700, color: "var(--green-700)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: ".25rem" }}>Your completion note</p>
                        <p style={{ fontSize: ".85rem", color: "var(--green-900)", lineHeight: 1.55 }}>{task.note}</p>
                      </div>
                    )}

                    {task.status === "Completed" && (
                      <p style={{ fontSize: ".8rem", color: "var(--green-700)", fontWeight: 600 }}>
                        ✅ Marked as completed · Admin has been notified.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================
          FINISH TASK MODAL
      ============================================================ */}
      {modal && (
        <div
          onClick={() => setModal(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.45)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", backdropFilter: "blur(4px)" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "var(--white)", borderRadius: 18, width: "100%", maxWidth: 460, boxShadow: "0 20px 50px rgba(0,0,0,.15)", border: "1px solid var(--gray-100)", overflow: "hidden" }}
          >
            {/* header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.1rem 1.4rem", borderBottom: "1px solid var(--gray-100)", background: "var(--gray-50)" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--gray-900)" }}>🏁 Mark as Finished</h2>
              <button
                onClick={() => setModal(null)}
                style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--gray-200)", border: "none", color: "var(--gray-500)", fontSize: ".8rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >✕</button>
            </div>

            {/* body */}
            <div style={{ padding: "1.3rem 1.4rem", display: "flex", flexDirection: "column", gap: "1rem" }}>

              {/* task info pill */}
              <div style={{ background: "var(--gray-50)", border: "1px solid var(--gray-100)", borderRadius: 10, padding: ".85rem 1rem" }}>
                <p style={{ fontSize: ".72rem", fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: ".35rem" }}>Task</p>
                <p style={{ fontWeight: 700, fontSize: ".95rem", color: "var(--gray-900)", marginBottom: ".45rem" }}>{modal.title}</p>
                <div style={{ display: "flex", gap: ".45rem", alignItems: "center" }}>
                  <span className="u-badge" style={{ color: PRIORITY_META[modal.priority].color, background: PRIORITY_META[modal.priority].bg, border: `1px solid ${PRIORITY_META[modal.priority].border}` }}>{modal.priority}</span>
                  <span className="u-mono" style={{ fontSize: ".7rem", color: "var(--gray-400)" }}>{modal.id} · Deadline {modal.deadline}</span>
                </div>
              </div>

              {/* note textarea */}
              <div style={{ display: "flex", flexDirection: "column", gap: ".3rem" }}>
                <label style={{ fontSize: ".82rem", fontWeight: 600, color: "var(--gray-700)" }}>
                  Completion Note &nbsp;<span style={{ color: "var(--gray-400)", fontWeight: 400, fontSize: ".78rem" }}>(optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. All filters replaced, O₂ readings normal. No anomalies detected."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  style={{ padding: ".62rem .9rem", border: "1.5px solid var(--gray-200)", borderRadius: 9, fontSize: ".9rem", fontFamily: "var(--font-body)", color: "var(--gray-900)", resize: "vertical", outline: "none", lineHeight: 1.5, minHeight: 80, transition: "border-color .2s" }}
                  onFocus={(e) => e.target.style.borderColor = "var(--green-400)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--gray-200)"}
                />
                <p style={{ fontSize: ".74rem", color: "var(--gray-400)" }}>This note will be visible to admin.</p>
              </div>
            </div>

            {/* footer */}
            <div style={{ display: "flex", gap: ".65rem", justifyContent: "flex-end", padding: ".9rem 1.4rem", borderTop: "1px solid var(--gray-100)", background: "var(--gray-50)" }}>
              <button
                onClick={() => setModal(null)}
                style={{ padding: ".55rem 1.1rem", fontSize: ".87rem", fontWeight: 600, border: "1.5px solid var(--gray-200)", borderRadius: 9, background: "var(--white)", color: "var(--gray-700)", cursor: "pointer", fontFamily: "var(--font-body)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleFinish}
                style={{ padding: ".55rem 1.3rem", fontSize: ".87rem", fontWeight: 700, background: "var(--green-500)", color: "#fff", border: "none", borderRadius: 9, cursor: "pointer", fontFamily: "var(--font-body)", boxShadow: "0 3px 10px rgba(34,197,94,.25)", display: "flex", alignItems: "center", gap: ".4rem" }}
              >
                ✅ Confirm &amp; Notify Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}