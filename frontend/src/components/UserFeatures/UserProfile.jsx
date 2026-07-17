import { useState } from "react";
import '../../assets/css/user.css';

const INITIAL = {
  name:        "Eng. Marco Reyes",
  email:       "marco.reyes@sshms.space",
  role:        "Engineer",
  compartment: "Bay B",
  joinDate:    "2024-03-10",
  status:      "active",
  avatar:      "MR",
  station:     "ISS-Horizon VII",
};

export default function UserProfile() {
  const [profile, setProfile]     = useState(INITIAL);
  const [editing, setEditing]     = useState(false);
  const [form, setForm]           = useState(INITIAL);
  const [toast, setToast]         = useState(null);
  const [pwForm, setPwForm]       = useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError]     = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [showPw, setShowPw]       = useState({ current: false, next: false, confirm: false });

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 2500); };

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    setProfile(form);
    setEditing(false);
    showToast("Profile updated.");
  };

  const handlePwSave = () => {
    setPwError("");
    if (!pwForm.current)          { setPwError("Enter your current password."); return; }
    if (pwForm.next.length < 6)   { setPwError("New password must be at least 6 characters."); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError("Passwords do not match."); return; }
    setPwForm({ current: "", next: "", confirm: "" });
    setPwSuccess(true);
    setTimeout(() => setPwSuccess(false), 2500);
    showToast("Password changed.", "success");
  };

  return (
    <div className="u-root">
      {toast && <div className={`u-toast u-toast-${toast.type}`}>✓ {toast.msg}</div>}

      <div className="u-header">
        <div>
          <h1 className="u-title">My Profile</h1>
          <p className="u-subtitle">Your crew member account details</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", maxWidth: 820, alignItems: "start" }}>

        {/* ── Profile Card ── */}
        <div style={{ background: "var(--white)", border: "1.5px solid var(--gray-100)", borderRadius: 16, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.1rem" }}>

          {/* avatar row */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div className="u-avatar u-avatar-lg">{profile.avatar}</div>
            <div>
              <p style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--gray-900)" }}>{profile.name}</p>
              <p style={{ fontSize: ".8rem", color: "var(--gray-500)", marginTop: ".12rem" }}>{profile.role} · {profile.station}</p>
              <span className={`u-badge ${profile.status === "active" ? "u-badge-green" : "u-badge-gray"}`} style={{ marginTop: ".35rem", display: "inline-block" }}>{profile.status}</span>
            </div>
          </div>

          {!editing ? (
            <>
              <div className="u-info-grid">
                {[
                  { label: "Full Name",    val: profile.name        },
                  { label: "Email",        val: profile.email       },
                  { label: "Role",         val: profile.role        },
                  { label: "Compartment", val: profile.compartment  },
                  { label: "Joined",       val: profile.joinDate    },
                  { label: "Station",      val: profile.station     },
                ].map((r) => (
                  <div key={r.label} className="u-info-row">
                    <span className="u-info-label">{r.label}</span>
                    <span className="u-info-val">{r.val}</span>
                  </div>
                ))}
              </div>
              <button className="u-btn-ghost" style={{ alignSelf: "flex-start", borderColor: "var(--green-300)", color: "var(--green-700)", background: "var(--green-50)" }}
                onClick={() => { setForm(profile); setEditing(true); }}>
                ✏️ Edit Profile
              </button>
            </>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
                {[
                  { key: "name",  label: "Full Name", ph: "Your name"       },
                  { key: "email", label: "Email",      ph: "you@sshms.space" },
                ].map(({ key, label, ph }) => (
                  <div key={key} className="u-form-group">
                    <label className="u-label">{label}</label>
                    <input className="u-input" placeholder={ph} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                  </div>
                ))}
                <div className="u-form-group">
                  <label className="u-label">Role</label>
                  <input className="u-input" value={form.role} disabled style={{ background: "var(--gray-50)", color: "var(--gray-400)", cursor: "not-allowed" }} />
                  <p className="u-hint">Role is assigned by admin.</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: ".6rem" }}>
                <button className="u-btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
                <button className="u-btn-primary" onClick={handleSave}>Save</button>
              </div>
            </>
          )}
        </div>

        {/* ── Change Password ── */}
        <div style={{ background: "var(--white)", border: "1.5px solid var(--gray-100)", borderRadius: 16, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--gray-800)" }}>🔒 Change Password</p>

          <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
            {[
              { key: "current", label: "Current Password" },
              { key: "next",    label: "New Password"     },
              { key: "confirm", label: "Confirm Password" },
            ].map(({ key, label }) => (
              <div key={key} className="u-form-group">
                <label className="u-label">{label}</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPw[key] ? "text" : "password"}
                    className="u-input"
                    placeholder="••••••••"
                    style={{ paddingRight: "2.6rem" }}
                    value={pwForm[key]}
                    onChange={(e) => { setPwForm({ ...pwForm, [key]: e.target.value }); setPwError(""); }}
                  />
                  <button
                    onClick={() => setShowPw((p) => ({ ...p, [key]: !p[key] }))}
                    style={{ position: "absolute", right: ".65rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", fontSize: ".88rem", cursor: "pointer" }}
                  >
                    {showPw[key] ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pwError   && <p style={{ fontSize: ".78rem", color: "#ef4444", fontWeight: 500 }}>⚠ {pwError}</p>}
          {pwSuccess && <p style={{ fontSize: ".78rem", color: "var(--green-700)", fontWeight: 600 }}>✅ Password changed successfully.</p>}

          <button className="u-btn-primary" style={{ alignSelf: "flex-start" }} onClick={handlePwSave}>
            Update Password
          </button>
        </div>

      </div>
    </div>
  );
}