import { useState,useEffect } from "react";
import "../../assets/css/profile.css";

const BASE_URL = "http://localhost:5000/api/profile";


export default function AdminProfile() {
  const [profile, setProfile]   = useState(null);
  const [editing, setEditing]   = useState(false);
  const [form, setForm]         = useState({});
  const [toast, setToast]       = useState(false);
  const [pwForm, setPwForm]     = useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError]   = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [showPw, setShowPw]     = useState({ current: false, next: false, confirm: false });

  const showToast = () => { setToast(true); setTimeout(() => setToast(false), 2400); };

  //useEffect for fetching data
  useEffect(() => {
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setProfile({
        name: data.name,
        email: data.email,
        role: data.role,
        station: data.stationName,
        joinDate: data.createdAt?.split("T")[0],
        badge: data.name?.slice(0, 2).toUpperCase(),
      });

      setForm({
        name: data.name,
        email: data.email,
        role: data.role,
        station: data.stationName,
      });

    } catch (err) {
      console.error(err);
    }
  };

  fetchProfile();
}, []);

  const handleSave = async () => {
  if (!form.name.trim() || !form.email.trim()) return;

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
         Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
      }),
    });

    const data = await res.json();

    if (res.status !== 200) {
      alert(data.error || "Update failed");
      return;
    }

    setProfile((prev) => ({
     ...prev,
     name: data.user.name,
     email: data.user.email,
   }));

   setForm((prev) => ({
    ...prev,
    name: data.user.name,
    email: data.user.email,
  }));

    setEditing(false);
    showToast();

  } catch (err) {
    console.error(err);
  }
};
 
  const handlePwChange = async () => {
  setPwError("");

  if (!pwForm.current) {
    setPwError("Enter current password.");
    return;
  }

  if (pwForm.next.length < 6) {
    setPwError("New password must be at least 6 characters.");
    return;
  }

  if (pwForm.next !== pwForm.confirm) {
    setPwError("Passwords do not match.");
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        currentPassword: pwForm.current,
        newPassword: pwForm.next,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setPwError(data.msg || "Password change failed");
      return;
    }

    setPwForm({ current: "", next: "", confirm: "" });
    setPwSuccess(true);
    setTimeout(() => setPwSuccess(false), 2400);

  } catch (err) {
    console.error(err);
  }
};

if (!profile) return <div>Loading...</div>;

  return (
    <div className="ap-root">
      {toast && <div className="ap-toast">✓ Profile updated.</div>}
      {pwSuccess && <div className="ap-toast ap-toast-blue">🔒 Password changed.</div>}

      <div className="ap-header">
        <h1 className="ap-title">Admin Profile</h1>
        <p className="ap-subtitle">Manage your account details</p>
      </div>

      <div className="ap-grid">

        {/* ── Profile Card ── */}
        <div className="ap-card">
          <div className="ap-avatar-row">
            <div className="ap-avatar">{profile.badge}</div>
            <div>
              <p className="ap-name">{profile.name}</p>
              <p className="ap-role">{profile.role} · {profile.station}</p>
              <p className="ap-joined">Joined {profile.joinDate}</p>
            </div>
          </div>

          {!editing ? (
            <>
              <div className="ap-info-list">
                {[
                  { label: "Full Name",    val: profile.name     },
                  { label: "Email",        val: profile.email    },
                  { label: "Role",         val: profile.role     },
                  { label: "Station",      val: profile.station  },
                ].map((r) => (
                  <div key={r.label} className="ap-info-row">
                    <span className="ap-info-label">{r.label}</span>
                    <span className="ap-info-val">{r.val}</span>
                  </div>
                ))}
              </div>
              <button className="ap-edit-btn" onClick={() => { setForm(profile); setEditing(true); }}>
                ✏️ Edit Profile
              </button>
            </>
          ) : (
            <>
              <div className="ap-form">
                {[
                  { key: "name",    label: "Full Name",    ph: "Commander Rhodes" },
                  { key: "email",   label: "Email",        ph: "you@sshms.space"  },
                  { key: "role",    label: "Role",         ph: "Commander"        },
                  { key: "station", label: "Station Name", ph: "ISS-Horizon VII"  },
                ].map(({ key, label, ph }) => (
                  <div key={key} className="ap-form-group">
                    <label className="ap-label">{label}</label>
                    <input
                      className="ap-input"
                      placeholder={ph}
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
              <div className="ap-form-actions">
                <button className="ap-cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
                <button className="ap-save-btn"   onClick={handleSave}>Save Changes</button>
              </div>
            </>
          )}
        </div>

        {/* ── Change Password Card ── */}
        <div className="ap-card">
          <p className="ap-card-title">🔒 Change Password</p>
          <div className="ap-form">
            {[
              { key: "current", label: "Current Password" },
              { key: "next",    label: "New Password"     },
              { key: "confirm", label: "Confirm Password" },
            ].map(({ key, label }) => (
              <div key={key} className="ap-form-group">
                <label className="ap-label">{label}</label>
                <div className="ap-pw-wrap">
                  <input
                    type={showPw[key] ? "text" : "password"}
                    className="ap-input"
                    placeholder="••••••••"
                    value={pwForm[key]}
                    onChange={(e) => { setPwForm({ ...pwForm, [key]: e.target.value }); setPwError(""); }}
                  />
                  <button className="ap-pw-toggle" onClick={() => setShowPw((p) => ({ ...p, [key]: !p[key] }))}>
                    {showPw[key] ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
            ))}
            {pwError && <p className="ap-pw-error">⚠ {pwError}</p>}
          </div>
          <button className="ap-save-btn ap-pw-btn" onClick={handlePwChange}>Update Password</button>
        </div>

      </div>
    </div>
  );
}