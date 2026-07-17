import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/pages.css";

const BASE_URL = "http://localhost:5000/api/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [form, setForm] = useState({
    stationName: "",
    email: "",
    password: "",
    role: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

  /* ── validation ── */
  const validate = () => {
    const e = {};
    if (!form.stationName.trim()) e.stationName = "Station name is required.";
    if (!form.role) e.role = "Please select your role.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 6) e.password = "Minimum 6 characters.";
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleRoleSelect = (role) => {
    setForm({ ...form, role });
    setErrors({ ...errors, role: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (res.status !== 200) {
        alert(data.msg || data.error || "Login failed");
        setLoading(false);
        return;
      }

      // ✅ STORE TOKEN
      localStorage.setItem("token", data.token);

      // ✅ STORE USER
      localStorage.setItem("user", JSON.stringify(data.user));

      setLoading(false);

      if (form.role !== data.user.role) {
        alert("Wrong role selected");
        setLoading(false);
        return;
}

      // ✅ ROLE-BASED REDIRECT
      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/crew/dashboard");
      }

    } catch (err) {
      console.error(err);
      alert("Server error");
      setLoading(false);
    }
};

  return (
    <div className="login-page-root">
      <canvas ref={canvasRef} className="stars-canvas" />

      <button className="login-back-btn" onClick={() => navigate("/")}>
        ← Back to Home
      </button>

      <div className="login-split">

        {/* ── LEFT PANEL ── */}
        <div className="login-left">
          <div className="login-left-inner">
            <div className="login-brand">
              <span className="login-brand-icon">⬡</span>
              <span className="login-brand-name">SSHMS</span>
            </div>
            <h2 className="login-left-heading">
              Mission Control<br />
              <span className="login-left-accent">Access Portal</span>
            </h2>
            <p className="login-left-sub">
              Log in to manage your space station — monitor resources, coordinate
              crew, oversee storage, and run operations from one unified platform.
            </p>
            <div className="login-features-list">
              {leftFeatures.map((f, i) => (
                <div className="login-feature-item" key={i}>
                  <span className="lf-icon">{f.icon}</span>
                  <span className="lf-text">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="login-right">
          <div className="login-card">

            <div className="login-card-header">
              <h1 className="login-card-title">Welcome back</h1>
              <p className="login-card-sub">Sign in to your station dashboard</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>

              {/* Space Station Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="stationName">
                  <span className="label-icon">🛰️</span> Space Station Name
                </label>
                <input
                  id="stationName"
                  name="stationName"
                  type="text"
                  className={`form-input${errors.stationName ? " error" : ""}`}
                  placeholder="e.g. Orion Base Alpha"
                  value={form.stationName}
                  onChange={handleChange}
                  autoComplete="organization"
                />
                {errors.stationName && (
                  <p className="form-error">⚠ {errors.stationName}</p>
                )}
              </div>

              {/* Role Selector */}
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🎖️</span> Login As
                </label>
                <div className="role-selector">
                  <button
                    type="button"
                    className={`role-option${form.role === "admin" ? " selected" : ""}${errors.role ? " role-error" : ""}`}
                    onClick={() => handleRoleSelect("admin")}
                  >
                    <span className="role-option-icon">🧑‍💼</span>
                    <div className="role-option-info">
                      <span className="role-option-label">Admin</span>
                      <span className="role-option-desc">Full station control</span>
                    </div>
                    {form.role === "admin" && <span className="role-check">✓</span>}
                  </button>
                  <button
                    type="button"
                    className={`role-option${form.role === "crew" ? " selected" : ""}${errors.role ? " role-error" : ""}`}
                    onClick={() => handleRoleSelect("crew")}
                  >
                    <span className="role-option-icon">👨‍🚀</span>
                    <div className="role-option-info">
                      <span className="role-option-label">Crew Member</span>
                      <span className="role-option-desc">View tasks & resources</span>
                    </div>
                    {form.role === "crew" && <span className="role-check">✓</span>}
                  </button>
                </div>
                {errors.role && <p className="form-error">⚠ {errors.role}</p>}
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  <span className="label-icon">✉️</span> Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`form-input${errors.email ? " error" : ""}`}
                  placeholder={
                    form.role === "crew"
                      ? "crew@station.com"
                      : "admin@station.com"
                  }
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="form-error">⚠ {errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="form-group">
                <div className="login-label-row">
                  <label className="form-label" htmlFor="password">
                    <span className="label-icon">🔒</span> Password
                  </label>
                  <button
                    type="button"
                    className="forgot-link"
                    onClick={() => navigate("/forgot-password")}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="input-password-wrap">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className={`form-input${errors.password ? " error" : ""}`}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
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
                {errors.password && (
                  <p className="form-error">⚠ {errors.password}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className={`btn-primary w-full login-submit-btn${loading ? " loading" : ""}`}
                disabled={loading}
              >
                {loading ? (
                  <span className="login-loader">
                    <span className="spinner" /> Authenticating…
                  </span>
                ) : form.role === "admin" ? (
                  "Login as Admin →"
                ) : form.role === "crew" ? (
                  "Login as Crew Member →"
                ) : (
                  "Login to Station →"
                )}
              </button>
            </form>

            {/* divider */}
            <div className="login-divider">
              <span className="divider-line" />
              <span className="divider-text">New to the platform?</span>
              <span className="divider-line" />
            </div>

            {/* signup prompt */}
            <div className="login-signup-prompt">
              <p className="signup-prompt-text">
                Don't have an existing space station registered?
              </p>
              <button
                className="btn-outline w-full signup-redirect-btn"
                onClick={() => navigate("/signup")}
              >
                🚀 Register a New Station
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

const leftFeatures = [
  { icon: "📡", text: "Real-time resource & O₂ monitoring" },
  { icon: "👨‍🚀", text: "Full crew lifecycle management" },
  { icon: "📦", text: "Multi-module storage control" },
  { icon: "✅", text: "Task assignment & tracking" },
  { icon: "💊", text: "Medical inventory & expiry alerts" },
];