import { useState } from "react";
import "../../assets/css/TaskManagement.css";

const CREW_MEMBERS = [
  { id: 1, name: "Commander Rhodes",   role: "Commander"       },
  { id: 2, name: "Dr. Anika Sharma",   role: "Medical Officer" },
  { id: 3, name: "Eng. Marco Reyes",   role: "Engineer"        },
  { id: 4, name: "Dr. Liu Wei",        role: "Scientist"       },
  { id: 5, name: "Tech. Sara Okonkwo", role: "Technician"      },
  { id: 6, name: "James Harlow",       role: "Cleaning Staff"  },
  { id: 7, name: "Eng. Tom Brecker",   role: "Engineer"        },
];

const PRIORITIES = ["Low", "Medium", "High", "Critical"];
const STATUSES   = ["Pending", "In Progress", "Completed", "Overdue", "Cancelled", "Closed"];

const today = new Date().toISOString().slice(0, 10);

const INITIAL_TASKS = [
  { id: "TSK-001", title: "Inspect O₂ filtration unit",    description: "Check all filters and replace if needed.",             assignedTo: 3, priority: "High",     status: "In Progress", deadline: "2026-03-15", createdAt: "2026-03-01" },
  { id: "TSK-002", title: "Medical supply audit",          description: "Count and log all medical inventory items.",           assignedTo: 2, priority: "Medium",   status: "Pending",     deadline: "2026-03-18", createdAt: "2026-03-02" },
  { id: "TSK-003", title: "Battery bank maintenance",      description: "Test each cell and report degradation levels.",        assignedTo: 5, priority: "Critical", status: "Overdue",     deadline: "2026-03-05", createdAt: "2026-02-28" },
  { id: "TSK-004", title: "Module Gamma deep clean",       description: "Full sanitation of storage module Gamma.",            assignedTo: 6, priority: "Low",      status: "Completed",   deadline: "2026-03-10", createdAt: "2026-03-01" },
  { id: "TSK-005", title: "Fuel line pressure check",      description: "Verify all fuel line pressure readings are nominal.", assignedTo: 3, priority: "High",     status: "Pending",     deadline: "2026-03-20", createdAt: "2026-03-05" },
  { id: "TSK-006", title: "Crew health evaluations",       description: "Conduct monthly health checks for all crew.",         assignedTo: 2, priority: "Medium",   status: "Closed",      deadline: "2026-03-08", createdAt: "2026-02-25" },
  { id: "TSK-007", title: "Navigation system calibration", description: "Recalibrate nav sensors to latest star map.",         assignedTo: 4, priority: "High",     status: "In Progress", deadline: "2026-03-22", createdAt: "2026-03-06" },
];

const EMPTY_FORM = {
  title: "", description: "", assignedTo: "", priority: "Medium", deadline: "", status: "Pending",
};

const PRIORITY_META = {
  Low:      { color: "#16a34a", bg: "#dcfce7", border: "#86efac" },
  Medium:   { color: "#d97706", bg: "#fef9c3", border: "#fde047" },
  High:     { color: "#ea580c", bg: "#fff7ed", border: "#fdba74" },
  Critical: { color: "#b91c1c", bg: "#fee2e2", border: "#fca5a5" },
};
const STATUS_META = {
  "Pending":     { color: "#6b7280", bg: "#f3f4f6", border: "#d1d5db" },
  "In Progress": { color: "#1d4ed8", bg: "#dbeafe", border: "#93c5fd" },
  "Completed":   { color: "#15803d", bg: "#dcfce7", border: "#86efac" },
  "Overdue":     { color: "#b91c1c", bg: "#fee2e2", border: "#fca5a5" },
  "Cancelled":   { color: "#6b7280", bg: "#f3f4f6", border: "#d1d5db" },
  "Closed":      { color: "#374151", bg: "#e5e7eb", border: "#9ca3af" },
};

function getCrewName(id) {
  const c = CREW_MEMBERS.find((m) => m.id === +id);
  return c ? c.name : "Unassigned";
}
function getCrewRole(id) {
  const c = CREW_MEMBERS.find((m) => m.id === +id);
  return c ? c.role : "";
}
function initials(name) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}
function isOverdue(task) {
  return task.deadline < today && task.status !== "Completed" && task.status !== "Closed" && task.status !== "Cancelled";
}

let taskCounter = INITIAL_TASKS.length + 1;

export default function TaskManagement() {
  const [tasks, setTasks]           = useState(INITIAL_TASKS);
  const [modal, setModal]           = useState(null); // "create" | "edit" | "view" | "confirm"
  const [selected, setSelected]     = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // "close" | "cancel"
  const [form, setForm]             = useState(EMPTY_FORM);
  const [errors, setErrors]         = useState({});
  const [toast, setToast]           = useState(null);
  const [filterStatus, setFilterStatus]     = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [search, setSearch]         = useState("");

  /* ── toast ── */
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  /* ── modal helpers ── */
  const openCreate = () => { setForm(EMPTY_FORM); setErrors({}); setModal("create"); };
  const openEdit   = (task) => {
    setSelected(task);
    setForm({ title: task.title, description: task.description, assignedTo: task.assignedTo, priority: task.priority, deadline: task.deadline, status: task.status });
    setErrors({});
    setModal("edit");
  };
  const openView   = (task) => { setSelected(task); setModal("view"); };
  const openConfirm = (task, action) => { setSelected(task); setConfirmAction(action); setModal("confirm"); };
  const closeModal  = () => { setModal(null); setSelected(null); setErrors({}); setConfirmAction(null); };

  /* ── validation ── */
  const validate = () => {
    const e = {};
    if (!form.title.trim())   e.title      = "Title is required.";
    if (!form.assignedTo)     e.assignedTo = "Assign to a crew member.";
    if (!form.deadline)       e.deadline   = "Set a deadline.";
    return e;
  };

  /* ── create ── */
  const handleCreate = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const id = `TSK-${String(taskCounter++).padStart(3, "0")}`;
    setTasks((prev) => [{ id, ...form, assignedTo: +form.assignedTo, createdAt: today }, ...prev]);
    closeModal();
    showToast(`Task "${form.title}" created.`);
  };

  /* ── update ── */
  const handleUpdate = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setTasks((prev) => prev.map((t) =>
      t.id === selected.id ? { ...t, ...form, assignedTo: +form.assignedTo } : t
    ));
    closeModal();
    showToast(`Task updated.`);
  };

  /* ── quick status change ── */
  const handleStatusChange = (taskId, newStatus) => {
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: newStatus } : t));
    showToast(`Task marked as "${newStatus}".`);
  };

  /* ── close / cancel confirm ── */
  const handleConfirmAction = () => {
    const newStatus = confirmAction === "close" ? "Closed" : "Cancelled";
    setTasks((prev) => prev.map((t) => t.id === selected.id ? { ...t, status: newStatus } : t));
    closeModal();
    showToast(`Task ${newStatus.toLowerCase()}.`, confirmAction === "cancel" ? "warning" : "success");
  };

  /* ── auto-mark overdue ── */
  const displayTasks = tasks.map((t) =>
    isOverdue(t) && t.status === "Pending" ? { ...t, status: "Overdue" } : t
  );

  /* ── filtered ── */
  const filtered = displayTasks.filter((t) => {
    const matchSearch   = t.title.toLowerCase().includes(search.toLowerCase()) ||
                          getCrewName(t.assignedTo).toLowerCase().includes(search.toLowerCase());
    const matchStatus   = filterStatus   === "All" || t.status   === filterStatus;
    const matchPriority = filterPriority === "All" || t.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  /* ── counts ── */
  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = displayTasks.filter((t) => t.status === s).length;
    return acc;
  }, {});

  return (
    <div className="tm-root">

      {toast && <div className={`tm-toast tm-toast-${toast.type}`}>{toast.msg}</div>}

      {/* ── header ── */}
      <div className="tm-header">
        <div>
          <h1 className="tm-title">Task Management</h1>
          <p className="tm-subtitle">Create, assign and track all station tasks</p>
        </div>
        <button className="tm-create-btn" onClick={openCreate}>+ Create Task</button>
      </div>

      {/* ── status summary ── */}
      <div className="tm-summary">
        {[
          { label: "Total",       val: displayTasks.length, icon: "📋" },
          { label: "Pending",     val: counts["Pending"],     icon: "🕐" },
          { label: "In Progress", val: counts["In Progress"], icon: "⚙️" },
          { label: "Completed",   val: counts["Completed"],   icon: "✅" },
          { label: "Overdue",     val: counts["Overdue"],     icon: "🔴" },
          { label: "Closed",      val: counts["Closed"],      icon: "🔒" },
        ].map((s) => (
          <div className="tm-sum-card" key={s.label}>
            <span className="tm-sum-icon">{s.icon}</span>
            <div>
              <p className="tm-sum-val">{s.val}</p>
              <p className="tm-sum-lbl">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── filters ── */}
      <div className="tm-filters">
        <div className="tm-search-wrap">
          <span className="tm-search-icon">🔍</span>
          <input
            className="tm-search"
            placeholder="Search by title or assignee…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && <button className="tm-search-clear" onClick={() => setSearch("")}>✕</button>}
        </div>

        <div className="tm-filter-group">
          <span className="tm-filter-label">Status:</span>
          {["All", ...STATUSES].map((s) => (
            <button
              key={s}
              className={`tm-filter-btn${filterStatus === s ? " active" : ""}`}
              onClick={() => setFilterStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="tm-filter-group">
          <span className="tm-filter-label">Priority:</span>
          {["All", ...PRIORITIES].map((p) => (
            <button
              key={p}
              className={`tm-filter-btn${filterPriority === p ? " active" : ""}`}
              onClick={() => setFilterPriority(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── task table ── */}
      <div className="tm-table-card">
        <div className="tm-table-top">
          <span className="tm-table-count">{filtered.length} task{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="tm-empty">
            <span>📋</span>
            <p>No tasks found.</p>
          </div>
        ) : (
          <div className="tm-table-wrap">
            <table className="tm-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Assigned To</th>
                  <th>Priority</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((task) => {
                  const pm  = PRIORITY_META[task.priority];
                  const sm  = STATUS_META[task.status];
                  const isFinal = ["Completed","Closed","Cancelled"].includes(task.status);
                  return (
                    <tr key={task.id} className={isFinal ? "tm-row-dim" : ""}>

                      {/* task title */}
                      <td>
                        <div className="tm-title-cell">
                          <p className="tm-task-title">{task.title}</p>
                          <p className="tm-task-id">{task.id} · Created {task.createdAt}</p>
                        </div>
                      </td>

                      {/* assignee */}
                      <td>
                        <div className="tm-assignee-cell">
                          <div className="tm-assignee-avatar">
                            {initials(getCrewName(task.assignedTo))}
                          </div>
                          <div>
                            <p className="tm-assignee-name">{getCrewName(task.assignedTo)}</p>
                            <p className="tm-assignee-role">{getCrewRole(task.assignedTo)}</p>
                          </div>
                        </div>
                      </td>

                      {/* priority */}
                      <td>
                        <span className="tm-badge" style={{ color: pm.color, background: pm.bg, border: `1px solid ${pm.border}` }}>
                          {task.priority}
                        </span>
                      </td>

                      {/* deadline */}
                      <td>
                        <span className={`tm-deadline${task.deadline < today && !isFinal ? " overdue" : ""}`}>
                          {task.deadline}
                        </span>
                      </td>

                      {/* status */}
                      <td>
                        {!isFinal ? (
                          <select
                            className="tm-status-select"
                            value={task.status}
                            style={{ color: sm.color, background: sm.bg, borderColor: sm.border }}
                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          >
                            {["Pending", "In Progress", "Completed", "Overdue"].map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="tm-badge" style={{ color: sm.color, background: sm.bg, border: `1px solid ${sm.border}` }}>
                            {task.status}
                          </span>
                        )}
                      </td>

                      {/* actions */}
                      <td>
                        <div className="tm-action-row">
                          <button className="tm-btn-view"   onClick={() => openView(task)}   title="View">👁️</button>
                          {!isFinal && (
                            <>
                              <button className="tm-btn-edit"   onClick={() => openEdit(task)}   title="Edit">✏️</button>
                              <button className="tm-btn-close"  onClick={() => openConfirm(task, "close")}  title="Close">🔒</button>
                              <button className="tm-btn-cancel" onClick={() => openConfirm(task, "cancel")} title="Cancel">✕</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================
          MODALS
      ============================================================ */}

      {/* CREATE / EDIT MODAL */}
      {(modal === "create" || modal === "edit") && (
        <div className="tm-overlay" onClick={closeModal}>
          <div className="tm-modal" onClick={(e) => e.stopPropagation()}>

            <div className="tm-modal-header">
              <h2 className="tm-modal-title">
                {modal === "create" ? "➕ Create New Task" : "✏️ Edit Task"}
              </h2>
              <button className="tm-modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="tm-modal-body">

              {/* title */}
              <div className="tm-form-group tm-full">
                <label className="tm-label">Task Title <span className="tm-req">*</span></label>
                <input
                  className={`tm-input${errors.title ? " error" : ""}`}
                  placeholder="e.g. Inspect O₂ filtration unit"
                  value={form.title}
                  onChange={(e) => { setForm({ ...form, title: e.target.value }); setErrors({ ...errors, title: "" }); }}
                />
                {errors.title && <p className="tm-error">⚠ {errors.title}</p>}
              </div>

              {/* description */}
              <div className="tm-form-group tm-full">
                <label className="tm-label">Description</label>
                <textarea
                  className="tm-input tm-textarea"
                  placeholder="Optional task details…"
                  value={form.description}
                  rows={3}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="tm-form-row">
                {/* assign to */}
                <div className="tm-form-group">
                  <label className="tm-label">Assign To <span className="tm-req">*</span></label>
                  <select
                    className={`tm-input${errors.assignedTo ? " error" : ""}`}
                    value={form.assignedTo}
                    onChange={(e) => { setForm({ ...form, assignedTo: e.target.value }); setErrors({ ...errors, assignedTo: "" }); }}
                  >
                    <option value="">Select crew member…</option>
                    {CREW_MEMBERS.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
                    ))}
                  </select>
                  {errors.assignedTo && <p className="tm-error">⚠ {errors.assignedTo}</p>}
                </div>

                {/* priority */}
                <div className="tm-form-group">
                  <label className="tm-label">Priority</label>
                  <div className="tm-priority-opts">
                    {PRIORITIES.map((p) => {
                      const pm = PRIORITY_META[p];
                      return (
                        <button
                          key={p}
                          type="button"
                          className={`tm-popt${form.priority === p ? " selected" : ""}`}
                          style={form.priority === p ? { color: pm.color, background: pm.bg, borderColor: pm.border } : {}}
                          onClick={() => setForm({ ...form, priority: p })}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="tm-form-row">
                {/* deadline */}
                <div className="tm-form-group">
                  <label className="tm-label">Deadline <span className="tm-req">*</span></label>
                  <input
                    type="date"
                    className={`tm-input${errors.deadline ? " error" : ""}`}
                    value={form.deadline}
                    min={today}
                    onChange={(e) => { setForm({ ...form, deadline: e.target.value }); setErrors({ ...errors, deadline: "" }); }}
                  />
                  {errors.deadline && <p className="tm-error">⚠ {errors.deadline}</p>}
                </div>

                {/* status (edit only) */}
                {modal === "edit" && (
                  <div className="tm-form-group">
                    <label className="tm-label">Status</label>
                    <select
                      className="tm-input"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      {["Pending", "In Progress", "Completed", "Overdue", "Cancelled", "Closed"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="tm-modal-footer">
              <button className="tm-btn-cancel-modal" onClick={closeModal}>Cancel</button>
              <button className="tm-btn-save" onClick={modal === "create" ? handleCreate : handleUpdate}>
                {modal === "create" ? "Create Task" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {modal === "view" && selected && (
        <div className="tm-overlay" onClick={closeModal}>
          <div className="tm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tm-modal-header">
              <h2 className="tm-modal-title">📋 Task Details</h2>
              <button className="tm-modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="tm-modal-body">
              <div className="tm-view-grid">
                <div className="tm-view-item tm-full">
                  <p className="tm-view-label">Title</p>
                  <p className="tm-view-val tm-view-title">{selected.title}</p>
                </div>
                {selected.description && (
                  <div className="tm-view-item tm-full">
                    <p className="tm-view-label">Description</p>
                    <p className="tm-view-val">{selected.description}</p>
                  </div>
                )}
                <div className="tm-view-item">
                  <p className="tm-view-label">Task ID</p>
                  <p className="tm-view-val tm-mono">{selected.id}</p>
                </div>
                <div className="tm-view-item">
                  <p className="tm-view-label">Created On</p>
                  <p className="tm-view-val tm-mono">{selected.createdAt}</p>
                </div>
                <div className="tm-view-item">
                  <p className="tm-view-label">Assigned To</p>
                  <div className="tm-assignee-cell" style={{ marginTop: ".2rem" }}>
                    <div className="tm-assignee-avatar">{initials(getCrewName(selected.assignedTo))}</div>
                    <div>
                      <p className="tm-assignee-name">{getCrewName(selected.assignedTo)}</p>
                      <p className="tm-assignee-role">{getCrewRole(selected.assignedTo)}</p>
                    </div>
                  </div>
                </div>
                <div className="tm-view-item">
                  <p className="tm-view-label">Deadline</p>
                  <p className={`tm-view-val tm-mono${selected.deadline < today ? " tm-overdue-text" : ""}`}>{selected.deadline}</p>
                </div>
                <div className="tm-view-item">
                  <p className="tm-view-label">Priority</p>
                  <span className="tm-badge" style={{ color: PRIORITY_META[selected.priority].color, background: PRIORITY_META[selected.priority].bg, border: `1px solid ${PRIORITY_META[selected.priority].border}` }}>
                    {selected.priority}
                  </span>
                </div>
                <div className="tm-view-item">
                  <p className="tm-view-label">Status</p>
                  <span className="tm-badge" style={{ color: STATUS_META[selected.status].color, background: STATUS_META[selected.status].bg, border: `1px solid ${STATUS_META[selected.status].border}` }}>
                    {selected.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="tm-modal-footer">
              {!["Completed","Closed","Cancelled"].includes(selected.status) && (
                <>
                  <button className="tm-btn-close-task"  onClick={() => { closeModal(); setTimeout(() => openConfirm(selected, "close"),  50); }}>🔒 Close Task</button>
                  <button className="tm-btn-cancel-task" onClick={() => { closeModal(); setTimeout(() => openConfirm(selected, "cancel"), 50); }}>✕ Cancel Task</button>
                  <button className="tm-btn-save" onClick={() => { closeModal(); setTimeout(() => openEdit(selected), 50); }}>✏️ Edit</button>
                </>
              )}
              {["Completed","Closed","Cancelled"].includes(selected.status) && (
                <button className="tm-btn-cancel-modal" onClick={closeModal}>Close</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM: CLOSE / CANCEL */}
      {modal === "confirm" && selected && (
        <div className="tm-overlay" onClick={closeModal}>
          <div className="tm-modal tm-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="tm-modal-header">
              <h2 className="tm-modal-title">
                {confirmAction === "close" ? "🔒 Close Task" : "✕ Cancel Task"}
              </h2>
              <button className="tm-modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="tm-modal-body tm-confirm-body">
              <p className="tm-confirm-task-title">{selected.title}</p>
              <p className="tm-confirm-msg">
                {confirmAction === "close"
                  ? "Are you sure you want to close this task? It will be marked as Closed and no further changes can be made."
                  : "Are you sure you want to cancel this task? It will be marked as Cancelled."}
              </p>
            </div>
            <div className="tm-modal-footer">
              <button className="tm-btn-cancel-modal" onClick={closeModal}>Go Back</button>
              <button
                className={confirmAction === "cancel" ? "tm-btn-danger" : "tm-btn-save"}
                onClick={handleConfirmAction}
              >
                {confirmAction === "close" ? "Yes, Close" : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}