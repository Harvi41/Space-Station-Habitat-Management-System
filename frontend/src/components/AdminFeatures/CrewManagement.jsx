import { useState } from "react";
import "../../assets/css/CrewManagment.css";

/* ── dummy data ── */
const INITIAL_CREW = [
  { id: 1,  name: "Commander Rhodes",    email: "rhodes@sshms.com",   role: "commander",       compartment: "A", status: "active",   joinDate: "2024-01-10", isAdmin: true  },
  { id: 2,  name: "Dr. Anika Sharma",    email: "sharma@sshms.com",   role: "medical_officer", compartment: "B", status: "active",   joinDate: "2024-02-14", isAdmin: false },
  { id: 3,  name: "Eng. Marco Reyes",    email: "reyes@sshms.com",    role: "engineer",        compartment: "A", status: "active",   joinDate: "2024-02-20", isAdmin: false },
  { id: 4,  name: "Dr. Liu Wei",         email: "liu@sshms.com",      role: "scientist",       compartment: "C", status: "active",   joinDate: "2024-03-05", isAdmin: false },
  { id: 5,  name: "Tech. Sara Okonkwo",  email: "okonkwo@sshms.com",  role: "technician",      compartment: "B", status: "active",   joinDate: "2024-03-18", isAdmin: false },
  { id: 6,  name: "James Harlow",        email: "harlow@sshms.com",   role: "cleaning_staff",  compartment: "D", status: "active",   joinDate: "2024-04-01", isAdmin: false },
  { id: 7,  name: "Dr. Priya Nair",      email: "nair@sshms.com",     role: "scientist",       compartment: "C", status: "inactive", joinDate: "2024-04-12", isAdmin: false },
  { id: 8,  name: "Eng. Tom Brecker",    email: "brecker@sshms.com",  role: "engineer",        compartment: "D", status: "active",   joinDate: "2024-05-03", isAdmin: false },
];

const COMPARTMENTS = [
  { key: "A", label: "Compartment A", capacity: 3 },
  { key: "B", label: "Compartment B", capacity: 3 },
  { key: "C", label: "Compartment C", capacity: 2 },
  { key: "D", label: "Compartment D", capacity: 2 },
];

const ROLES = [
  { key: "commander",      label: "Commander",       icon: "🎖️" },
  { key: "engineer",       label: "Engineer",        icon: "⚙️" },
  { key: "medical_officer",label: "Medical Officer", icon: "⚕️" },
  { key: "scientist",      label: "Scientist",       icon: "🔬" },
  { key: "technician",     label: "Technician",      icon: "🔧" },
  { key: "cleaning_staff", label: "Cleaning Staff",  icon: "🧹" },
];

const EMPTY_FORM = { name: "", email: "", role: "", compartment: "", isAdmin: false };

function getRoleInfo(key) {
  return ROLES.find((r) => r.key === key) || { label: key, icon: "👤" };
}
function getCompartmentOccupancy(crew, comp) {
  return crew.filter((c) => c.compartment === comp && c.status === "active").length;
}

export default function CrewManagement() {
  const [crew, setCrew]             = useState(INITIAL_CREW);
  const [search, setSearch]         = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterComp, setFilterComp] = useState("all");

  // modal state
  const [modal, setModal]   = useState(null); // "add" | "edit" | "remove" | "admin"
  const [selected, setSelected] = useState(null);
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [toast, setToast]   = useState(null);

  /* ── helpers ── */
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setModal("add");
  };

  const openEdit = (member) => {
    setSelected(member);
    setForm({ name: member.name, email: member.email, role: member.role, compartment: member.compartment, isAdmin: member.isAdmin });
    setErrors({});
    setModal("edit");
  };

  const openRemove = (member) => {
    setSelected(member);
    setModal("remove");
  };

  const openAdmin = (member) => {
    setSelected(member);
    setModal("admin");
  };

  const closeModal = () => { setModal(null); setSelected(null); setErrors({}); };

  /* ── validation ── */
  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name        = "Name is required.";
    if (!form.email.trim())       e.email       = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email.";
    if (!form.role)               e.role        = "Select a role.";
    if (!form.compartment)        e.compartment = "Select a compartment.";
    // check capacity
    if (form.compartment && modal === "add") {
      const comp = COMPARTMENTS.find((c) => c.key === form.compartment);
      const occ  = getCompartmentOccupancy(crew, form.compartment);
      if (occ >= comp.capacity) e.compartment = `Compartment ${form.compartment} is full (${comp.capacity}/${comp.capacity}).`;
    }
    return e;
  };

  /* ── add crew ── */
  const handleAdd = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const newMember = {
      id: Date.now(),
      ...form,
      status: "active",
      joinDate: new Date().toISOString().slice(0, 10),
    };
    setCrew((prev) => [...prev, newMember]);
    closeModal();
    showToast(`${form.name} added to the crew!`);
  };

  /* ── update crew ── */
  const handleUpdate = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setCrew((prev) => prev.map((c) => c.id === selected.id ? { ...c, ...form } : c));
    closeModal();
    showToast(`${form.name}'s details updated.`);
  };

  /* ── remove crew ── */
  const handleRemove = () => {
    setCrew((prev) => prev.filter((c) => c.id !== selected.id));
    closeModal();
    showToast(`${selected.name} removed from crew.`, "warning");
  };

  /* ── toggle admin ── */
  const handleToggleAdmin = () => {
    const becoming = !selected.isAdmin;
    setCrew((prev) => prev.map((c) => c.id === selected.id ? { ...c, isAdmin: becoming } : c));
    closeModal();
    showToast(becoming ? `${selected.name} is now an Admin.` : `${selected.name}'s admin removed.`);
  };

  /* ── toggle active/inactive ── */
  const handleToggleStatus = (member) => {
    const next = member.status === "active" ? "inactive" : "active";
    setCrew((prev) => prev.map((c) => c.id === member.id ? { ...c, status: next } : c));
    showToast(`${member.name} set to ${next}.`);
  };

  /* ── filtered list ── */
  const filtered = crew.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                        c.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = filterRole === "all" || c.role === filterRole;
    const matchComp   = filterComp === "all" || c.compartment === filterComp;
    return matchSearch && matchRole && matchComp;
  });

  const activeCount = crew.filter((c) => c.status === "active").length;
  const adminCount  = crew.filter((c) => c.isAdmin).length;

  return (
    <div className="cm-root">

      {/* toast */}
      {toast && (
        <div className={`cm-toast cm-toast-${toast.type}`}>{toast.msg}</div>
      )}

      {/* ── page header ── */}
      <div className="cm-header">
        <div>
          <h1 className="cm-title">Crew Management</h1>
          <p className="cm-subtitle">Manage station personnel, roles & compartments</p>
        </div>
        <button className="cm-add-btn" onClick={openAdd}>
          + Add Crew Member
        </button>
      </div>

      {/* ── summary strip ── */}
      <div className="cm-summary">
        <div className="cm-sum-card">
          <span className="cm-sum-icon">👨‍🚀</span>
          <div><p className="cm-sum-val">{crew.length}</p><p className="cm-sum-lbl">Total Crew</p></div>
        </div>
        <div className="cm-sum-card">
          <span className="cm-sum-icon">✅</span>
          <div><p className="cm-sum-val">{activeCount}</p><p className="cm-sum-lbl">Active</p></div>
        </div>
        <div className="cm-sum-card">
          <span className="cm-sum-icon">🔴</span>
          <div><p className="cm-sum-val">{crew.length - activeCount}</p><p className="cm-sum-lbl">Inactive</p></div>
        </div>
        <div className="cm-sum-card">
          <span className="cm-sum-icon">🛡️</span>
          <div><p className="cm-sum-val">{adminCount}</p><p className="cm-sum-lbl">Admins</p></div>
        </div>
      </div>

      {/* ── compartment occupancy ── */}
      <div className="cm-compartments">
        {COMPARTMENTS.map((comp) => {
          const occ = getCompartmentOccupancy(crew, comp.key);
          const pct = (occ / comp.capacity) * 100;
          const full = occ >= comp.capacity;
          return (
            <div key={comp.key} className={`cm-comp-card${full ? " cm-comp-full" : ""}`}>
              <div className="cm-comp-top">
                <span className="cm-comp-label">{comp.label}</span>
                <span className={`cm-comp-badge${full ? " full" : ""}`}>
                  {full ? "Full" : "Available"}
                </span>
              </div>
              <p className="cm-comp-occ">{occ} / {comp.capacity}</p>
              <div className="cm-comp-bar">
                <div className="cm-comp-fill" style={{ width: `${pct}%`, background: full ? "#f87171" : "var(--green-400)" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── filters ── */}
      <div className="cm-filters">
        <div className="cm-search-wrap">
          <span className="cm-search-icon">🔍</span>
          <input
            className="cm-search"
            placeholder="Search crew by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && <button className="cm-search-clear" onClick={() => setSearch("")}>✕</button>}
        </div>
        <select className="cm-select" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
          <option value="all">All Roles</option>
          {ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
        </select>
        <select className="cm-select" value={filterComp} onChange={(e) => setFilterComp(e.target.value)}>
          <option value="all">All Compartments</option>
          {COMPARTMENTS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
      </div>

      {/* ── crew table ── */}
      <div className="cm-table-card">
        <div className="cm-table-header">
          <span className="cm-table-count">{filtered.length} member{filtered.length !== 1 ? "s" : ""}</span>
        </div>
        {filtered.length === 0 ? (
          <div className="cm-empty">
            <span>👨‍🚀</span>
            <p>No crew members found.</p>
          </div>
        ) : (
          <div className="cm-table-wrap">
            <table className="cm-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th>Compartment</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((member) => {
                  const roleInfo = getRoleInfo(member.role);
                  return (
                    <tr key={member.id} className={member.status === "inactive" ? "cm-row-inactive" : ""}>
                      {/* member info */}
                      <td>
                        <div className="cm-member-cell">
                          <div className="cm-avatar">
                            {member.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="cm-member-name">
                              {member.name}
                              {member.isAdmin && <span className="cm-admin-tag">Admin</span>}
                            </p>
                            <p className="cm-member-email">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      {/* role */}
                      <td>
                        <span className="cm-role-pill">
                          {roleInfo.icon} {roleInfo.label}
                        </span>
                      </td>
                      {/* compartment */}
                      <td>
                        <span className="cm-comp-pill">
                          Comp. {member.compartment}
                        </span>
                      </td>
                      {/* status */}
                      <td>
                        <button
                          className={`cm-status-toggle cm-status-${member.status}`}
                          onClick={() => handleToggleStatus(member)}
                          title="Click to toggle status"
                        >
                          {member.status === "active" ? "● Active" : "○ Inactive"}
                        </button>
                      </td>
                      {/* joined */}
                      <td>
                        <span className="cm-date">{member.joinDate}</span>
                      </td>
                      {/* actions */}
                      <td>
                        <div className="cm-action-btns">
                          <button className="cm-btn-edit" onClick={() => openEdit(member)} title="Edit">✏️</button>
                          <button className="cm-btn-admin" onClick={() => openAdmin(member)} title={member.isAdmin ? "Remove Admin" : "Make Admin"}>
                            {member.isAdmin ? "🔓" : "🛡️"}
                          </button>
                          <button className="cm-btn-remove" onClick={() => openRemove(member)} title="Remove">🗑️</button>
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

      {/* ===================== MODALS ===================== */}

      {/* ADD / EDIT MODAL */}
      {(modal === "add" || modal === "edit") && (
        <div className="cm-overlay" onClick={closeModal}>
          <div className="cm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cm-modal-header">
              <h2 className="cm-modal-title">
                {modal === "add" ? "➕ Add Crew Member" : "✏️ Edit Crew Member"}
              </h2>
              <button className="cm-modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="cm-modal-body">
              <div className="cm-form-row">
                <div className="cm-form-group">
                  <label className="cm-label">Full Name <span className="cm-req">*</span></label>
                  <input
                    className={`cm-input${errors.name ? " error" : ""}`}
                    placeholder="e.g. Eng. John Smith"
                    value={form.name}
                    onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: "" }); }}
                  />
                  {errors.name && <p className="cm-error">⚠ {errors.name}</p>}
                </div>
                <div className="cm-form-group">
                  <label className="cm-label">Email <span className="cm-req">*</span></label>
                  <input
                    className={`cm-input${errors.email ? " error" : ""}`}
                    placeholder="crew@station.com"
                    value={form.email}
                    onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: "" }); }}
                  />
                  {errors.email && <p className="cm-error">⚠ {errors.email}</p>}
                </div>
              </div>

              <div className="cm-form-row">
                <div className="cm-form-group">
                  <label className="cm-label">Role <span className="cm-req">*</span></label>
                  <select
                    className={`cm-select-input${errors.role ? " error" : ""}`}
                    value={form.role}
                    onChange={(e) => { setForm({ ...form, role: e.target.value }); setErrors({ ...errors, role: "" }); }}
                  >
                    <option value="">Select role…</option>
                    {ROLES.map((r) => <option key={r.key} value={r.key}>{r.icon} {r.label}</option>)}
                  </select>
                  {errors.role && <p className="cm-error">⚠ {errors.role}</p>}
                </div>
                <div className="cm-form-group">
                  <label className="cm-label">Compartment <span className="cm-req">*</span></label>
                  <select
                    className={`cm-select-input${errors.compartment ? " error" : ""}`}
                    value={form.compartment}
                    onChange={(e) => { setForm({ ...form, compartment: e.target.value }); setErrors({ ...errors, compartment: "" }); }}
                  >
                    <option value="">Select compartment…</option>
                    {COMPARTMENTS.map((c) => {
                      const occ  = getCompartmentOccupancy(crew, c.key);
                      const full = occ >= c.capacity && (modal === "add" || selected?.compartment !== c.key);
                      return (
                        <option key={c.key} value={c.key} disabled={full}>
                          {c.label} ({occ}/{c.capacity}){full ? " — Full" : ""}
                        </option>
                      );
                    })}
                  </select>
                  {errors.compartment && <p className="cm-error">⚠ {errors.compartment}</p>}
                </div>
              </div>

              <div className="cm-form-group">
                <label className="cm-checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.isAdmin}
                    onChange={(e) => setForm({ ...form, isAdmin: e.target.checked })}
                    className="cm-checkbox"
                  />
                  <span className="cm-checkbox-custom" />
                  <span className="cm-checkbox-text">🛡️ Grant Admin privileges</span>
                </label>
              </div>
            </div>
            <div className="cm-modal-footer">
              <button className="cm-btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="cm-btn-save" onClick={modal === "add" ? handleAdd : handleUpdate}>
                {modal === "add" ? "Add Member" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REMOVE CONFIRM */}
      {modal === "remove" && selected && (
        <div className="cm-overlay" onClick={closeModal}>
          <div className="cm-modal cm-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="cm-modal-header">
              <h2 className="cm-modal-title">🗑️ Remove Crew Member</h2>
              <button className="cm-modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="cm-modal-body cm-confirm-body">
              <div className="cm-confirm-avatar">
                {selected.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <p className="cm-confirm-name">{selected.name}</p>
              <p className="cm-confirm-role">{getRoleInfo(selected.role).icon} {getRoleInfo(selected.role).label} · Compartment {selected.compartment}</p>
              <p className="cm-confirm-msg">
                Are you sure you want to remove this crew member? This action cannot be undone.
              </p>
            </div>
            <div className="cm-modal-footer">
              <button className="cm-btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="cm-btn-danger" onClick={handleRemove}>Yes, Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN TOGGLE CONFIRM */}
      {modal === "admin" && selected && (
        <div className="cm-overlay" onClick={closeModal}>
          <div className="cm-modal cm-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="cm-modal-header">
              <h2 className="cm-modal-title">
                {selected.isAdmin ? "🔓 Remove Admin" : "🛡️ Grant Admin Access"}
              </h2>
              <button className="cm-modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="cm-modal-body cm-confirm-body">
              <div className="cm-confirm-avatar">
                {selected.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <p className="cm-confirm-name">{selected.name}</p>
              <p className="cm-confirm-role">{getRoleInfo(selected.role).icon} {getRoleInfo(selected.role).label}</p>
              <p className="cm-confirm-msg">
                {selected.isAdmin
                  ? `This will remove admin privileges from ${selected.name}. They will only have crew-level access.`
                  : `This will grant ${selected.name} full admin access to manage the station, crew, and resources.`}
              </p>
            </div>
            <div className="cm-modal-footer">
              <button className="cm-btn-cancel" onClick={closeModal}>Cancel</button>
              <button className={selected.isAdmin ? "cm-btn-danger" : "cm-btn-save"} onClick={handleToggleAdmin}>
                {selected.isAdmin ? "Remove Admin" : "Grant Admin"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}