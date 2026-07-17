import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/pages.css";

const BASE_URL = "http://localhost:5000/api/auth";

export default function SignupPage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [step, setStep] = useState(1); // 1 = station info, 2 = admin info
  const [form, setForm] = useState({
    stationName: "",
    stationCode: "",
    location: "",
    crewCapacity: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  /* ── starfield ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const stars = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      alpha: Math.random(),
      speed: Math.random() * 0.004 + 0.001,
    }));
    let id;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        s.alpha += s.speed;
        if (s.alpha > 1 || s.alpha < 0) s.speed *= -1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(134,239,172,${s.alpha * 0.55})`;
        ctx.fill();
      });
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", resize);
    };
  }, []);

  /* ── helpers ── */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    setErrors({ ...errors, [name]: "" });
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.stationName.trim()) e.stationName = "Station name is required.";
    if (!form.stationCode.trim()) e.stationCode = "Station code is required.";
    else if (!/^[A-Z0-9\-]{3,10}$/.test(form.stationCode.toUpperCase()))
      e.stationCode = "3–10 chars, letters/numbers/dash only.";
    if (!form.location.trim()) e.location = "Location / orbit is required.";
    if (!form.crewCapacity) e.crewCapacity = "Crew capacity is required.";
    else if (isNaN(form.crewCapacity) || +form.crewCapacity < 1)
      e.crewCapacity = "Enter a valid number.";
    return e;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.adminName.trim()) e.adminName = "Admin name is required.";
    if (!form.adminEmail.trim()) e.adminEmail = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.adminEmail)) e.adminEmail = "Enter a valid email.";
    if (!form.adminPassword) e.adminPassword = "Password is required.";
    else if (form.adminPassword.length < 8) e.adminPassword = "Minimum 8 characters.";
    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password.";
    else if (form.confirmPassword !== form.adminPassword)
      e.confirmPassword = "Passwords do not match.";
    if (!form.agreeTerms) e.agreeTerms = "You must agree to the terms.";
    return e;
  };

  const handleNext = () => {
    const errs = validateStep1();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validateStep2();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
         
          stationName: form.stationName,
          stationCode: form.stationCode,
          crewCapacity: Number(form.crewCapacity),
          location: form.location,

          name: form.adminName,
          email: form.adminEmail,
          password: form.adminPassword,
        }),
      });

      const data = await res.json();

      if (res.status !== 200) {
        alert(data.error || data.msg || "Signup failed");
        setLoading(false);
        return;
      }

      // ✅ SUCCESS
      setLoading(false);
      setDone(true);

    } catch (err) {
      console.error(err);
      alert("Server error");
      setLoading(false);
    }
};

  /* ── password strength ── */
  const getStrength = (pwd) => {
    if (!pwd) return { level: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const map = [
      { level: 1, label: "Weak",   color: "#f87171" },
      { level: 2, label: "Fair",   color: "#fb923c" },
      { level: 3, label: "Good",   color: "#facc15" },
      { level: 4, label: "Strong", color: "#4ade80" },
    ];
    return map[score - 1] || { level: 0, label: "", color: "" };
  };
  const strength = getStrength(form.adminPassword);

  /* ── success screen ── */
  if (done) {
    return (
      <div className="signup-success-root">
        <canvas ref={canvasRef} className="stars-canvas" />
        <div className="signup-success-card">
          <div className="success-orbit">
            <span className="success-rocket">🚀</span>
          </div>
          <h2 className="success-heading">Station Registered!</h2>
          <p className="success-sub">
            <strong>{form.stationName}</strong> has been successfully launched
            into the system. Your admin account is ready.
          </p>
          <div className="success-info-row">
            <div className="success-info-item">
              <span className="si-label">Station Code</span>
              <span className="si-value">{form.stationCode.toUpperCase()}</span>
            </div>
            <div className="success-info-item">
              <span className="si-label">Admin</span>
              <span className="si-value">{form.adminName}</span>
            </div>
          </div>
          <button
            className="btn-primary btn-lg w-full"
            onClick={() => navigate("/login")}
          >
            Proceed to Login →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-page-root">
      <canvas ref={canvasRef} className="stars-canvas" />

      {/* back */}
      <button className="login-back-btn" onClick={() => navigate("/login")}>
        ← Back to Login
      </button>

      <div className="signup-split">
        {/* LEFT */}
        <div className="signup-left">
          <div className="signup-left-inner">
            <div className="login-brand">
              <span className="login-brand-icon">⬡</span>
              <span className="login-brand-name">SSHMS</span>
            </div>
            <h2 className="login-left-heading">
              Launch Your<br />
              <span className="login-left-accent">Space Station</span>
            </h2>
            <p className="login-left-sub">
              Register your station and set up an admin account to take full
              control of crew, resources, storage, and mission tasks.
            </p>

            {/* step indicator */}
            <div className="signup-steps-visual">
              <div className={`svs-step ${step >= 1 ? "active" : ""} ${step > 1 ? "done" : ""}`}>
                <div className="svs-circle">{step > 1 ? "✓" : "1"}</div>
                <div className="svs-info">
                  <span className="svs-title">Station Details</span>
                  <span className="svs-sub">Name, code, location</span>
                </div>
              </div>
              <div className="svs-connector" />
              <div className={`svs-step ${step >= 2 ? "active" : ""}`}>
                <div className="svs-circle">2</div>
                <div className="svs-info">
                  <span className="svs-title">Admin Account</span>
                  <span className="svs-sub">Credentials & access</span>
                </div>
              </div>
            </div>

            <div className="signup-left-note">
              <span className="sln-icon">🔐</span>
              <span className="sln-text">
                Your station data is isolated and encrypted. Only your admin
                credentials can access this station's dashboard.
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="signup-right">
          <div className="signup-card">
            {/* progress bar */}
            <div className="signup-progress-wrap">
              <div className="signup-progress-bar">
                <div
                  className="signup-progress-fill"
                  style={{ width: step === 1 ? "50%" : "100%" }}
                />
              </div>
              <span className="signup-progress-label">Step {step} of 2</span>
            </div>

            {/* STEP 1 */}
            {step === 1 && (
              <div className="signup-step-block">
                <div className="signup-step-header">
                  <span className="signup-step-icon">🛰️</span>
                  <div>
                    <h1 className="signup-card-title">Station Details</h1>
                    <p className="signup-card-sub">Tell us about your space station</p>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="stationName">
                    Space Station Name <span className="req">*</span>
                  </label>
                  <input
                    id="stationName"
                    name="stationName"
                    type="text"
                    className={`form-input${errors.stationName ? " error" : ""}`}
                    placeholder="e.g. Orion Base Alpha"
                    value={form.stationName}
                    onChange={handleChange}
                  />
                  {errors.stationName && <p className="form-error">⚠ {errors.stationName}</p>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="stationCode">
                      Station Code <span className="req">*</span>
                    </label>
                    <input
                      id="stationCode"
                      name="stationCode"
                      type="text"
                      className={`form-input${errors.stationCode ? " error" : ""}`}
                      placeholder="e.g. OBA-01"
                      value={form.stationCode}
                      onChange={(e) =>
                        handleChange({
                          target: {
                            name: "stationCode",
                            value: e.target.value.toUpperCase(),
                          },
                        })
                      }
                      maxLength={10}
                    />
                    {errors.stationCode && <p className="form-error">⚠ {errors.stationCode}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="crewCapacity">
                      Crew Capacity <span className="req">*</span>
                    </label>
                    <input
                      id="crewCapacity"
                      name="crewCapacity"
                      type="number"
                      min="1"
                      className={`form-input${errors.crewCapacity ? " error" : ""}`}
                      placeholder="e.g. 12"
                      value={form.crewCapacity}
                      onChange={handleChange}
                    />
                    {errors.crewCapacity && <p className="form-error">⚠ {errors.crewCapacity}</p>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="location">
                    Location / Orbit <span className="req">*</span>
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    className={`form-input${errors.location ? " error" : ""}`}
                    placeholder="e.g. Low Earth Orbit, Mars Orbit"
                    value={form.location}
                    onChange={handleChange}
                  />
                  {errors.location && <p className="form-error">⚠ {errors.location}</p>}
                </div>

                <button
                  type="button"
                  className="btn-primary w-full signup-next-btn"
                  onClick={handleNext}
                >
                  Admin Setup →
                </button>

                <p className="signup-login-hint">
                  Already registered?{" "}
                  <span className="auth-link" onClick={() => navigate("/login")}>
                    Log in here
                  </span>
                </p>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <form onSubmit={handleSubmit} noValidate className="signup-step-block">
                <div className="signup-step-header">
                  <span className="signup-step-icon">👨‍✈️</span>
                  <div>
                    <h1 className="signup-card-title">Admin Account</h1>
                    <p className="signup-card-sub">
                      Set up credentials for{" "}
                      <strong className="text-green">{form.stationName}</strong>
                    </p>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="adminName">
                    Admin Full Name <span className="req">*</span>
                  </label>
                  <input
                    id="adminName"
                    name="adminName"
                    type="text"
                    className={`form-input${errors.adminName ? " error" : ""}`}
                    placeholder="e.g. Commander Jane Doe"
                    value={form.adminName}
                    onChange={handleChange}
                  />
                  {errors.adminName && <p className="form-error">⚠ {errors.adminName}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="adminEmail">
                    Admin Email <span className="req">*</span>
                  </label>
                  <input
                    id="adminEmail"
                    name="adminEmail"
                    type="email"
                    className={`form-input${errors.adminEmail ? " error" : ""}`}
                    placeholder="admin@yourstation.com"
                    value={form.adminEmail}
                    onChange={handleChange}
                  />
                  {errors.adminEmail && <p className="form-error">⚠ {errors.adminEmail}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="adminPassword">
                    Password <span className="req">*</span>
                  </label>
                  <div className="input-password-wrap">
                    <input
                      id="adminPassword"
                      name="adminPassword"
                      type={showPassword ? "text" : "password"}
                      className={`form-input${errors.adminPassword ? " error" : ""}`}
                      placeholder="Min. 8 characters"
                      value={form.adminPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {errors.adminPassword && <p className="form-error">⚠ {errors.adminPassword}</p>}
                  {/* strength meter */}
                  {form.adminPassword && (
                    <div className="strength-meter">
                      <div className="strength-bars">
                        {[1, 2, 3, 4].map((n) => (
                          <div
                            key={n}
                            className="strength-bar"
                            style={{
                              background:
                                n <= strength.level ? strength.color : "var(--gray-100)",
                            }}
                          />
                        ))}
                      </div>
                      <span
                        className="strength-label"
                        style={{ color: strength.color }}
                      >
                        {strength.label}
                      </span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="confirmPassword">
                    Confirm Password <span className="req">*</span>
                  </label>
                  <div className="input-password-wrap">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      className={`form-input${errors.confirmPassword ? " error" : ""}`}
                      placeholder="Re-enter your password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirm(!showConfirm)}
                      tabIndex={-1}
                    >
                      {showConfirm ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {form.confirmPassword && !errors.confirmPassword &&
                    form.confirmPassword === form.adminPassword && (
                      <p className="form-match">✓ Passwords match</p>
                    )}
                  {errors.confirmPassword && (
                    <p className="form-error">⚠ {errors.confirmPassword}</p>
                  )}
                </div>

                {/* terms */}
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      className="checkbox-input"
                      checked={form.agreeTerms}
                      onChange={handleChange}
                    />
                    <span className="checkbox-custom" />
                    <span className="checkbox-text">
                      I agree to the{" "}
                      <span className="auth-link">Terms of Service</span> and{" "}
                      <span className="auth-link">Privacy Policy</span>
                    </span>
                  </label>
                  {errors.agreeTerms && <p className="form-error">⚠ {errors.agreeTerms}</p>}
                </div>

                <div className="signup-form-actions">
                  <button
                    type="button"
                    className="btn-ghost signup-back-step-btn"
                    onClick={() => { setStep(1); setErrors({}); }}
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className={`btn-primary signup-submit-btn${loading ? " loading" : ""}`}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="login-loader">
                        <span className="spinner" /> Launching…
                      </span>
                    ) : (
                      "🚀 Launch Station"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}