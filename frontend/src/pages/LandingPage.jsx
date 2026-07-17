import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/pages.css";



export default function LandingPage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      alpha: 1,
      speed: 0,
    }));

    let animId;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        s.alpha += s.speed;
        if (s.alpha > 1 || s.alpha < 0) s.speed *= -1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(134, 239, 172, ${s.alpha * 0.6})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    }
    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="landing-root">
      <canvas ref={canvasRef} className="stars-canvas" />

      {/* NAV */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <span className="nav-icon">⬡</span>
          <span className="nav-title">SSHMS</span>
        </div>
        <div className="nav-actions">
          <button className="btn-ghost" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="btn-primary" onClick={() => navigate("/signup")}>
            Sign Up
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-badge">
          <span className="badge-dot" />
          ORBITAL OPERATIONS PLATFORM
        </div>
        <h1 className="hero-heading">
          Space Station
          <br />
          <span className="hero-accent">Habitat Management</span>
          <br />
          System
        </h1>
        <p className="hero-sub">
          A unified command interface for crew coordination, resource
          monitoring, storage control, and mission-critical task management —
          all from a single, intelligent platform.
        </p>
        <div className="hero-cta">
          <button className="btn-primary btn-lg" onClick={() => navigate("/signup")}>
            Get Started
          </button>
          <button className="btn-outline btn-lg" onClick={() => navigate("/login")}>
            Mission Control Login →
          </button>
        </div>

        {/* STATS */}
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-num">5</span>
            <span className="stat-label">Storage Modules</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-num">Real-time</span>
            <span className="stat-label">Resource Tracking</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-num">2</span>
            <span className="stat-label">Access Roles</span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section">
        <p className="section-label">PLATFORM MODULES</p>
        <h2 className="section-heading">Everything the station needs</h2>
        <div className="features-grid">
          {features.map((f, i) => (
            <div className="feature-card" key={i} style={{ "--i": i }}>
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ROLES */}
      <section className="roles-section">
        <p className="section-label">ACCESS LEVELS</p>
        <h2 className="section-heading">Built for every role on board</h2>
        <div className="roles-grid">
          <div className="role-card role-crew">
            <div className="role-header">
              <span className="role-badge crew">CREW MEMBER</span>
            </div>
            <ul className="role-list">
              <li>View resource levels (total / consumed)</li>
              <li>Start & complete assigned tasks</li>
              <li>Access medical supplies info</li>
              <li>Check storage unit status</li>
              <li>Submit complaints via panel</li>
            </ul>
          </div>
          <div className="role-card role-admin">
            <div className="role-header">
              <span className="role-badge admin">ADMIN</span>
            </div>
            <ul className="role-list">
              <li>Full crew management (add / update / remove)</li>
              <li>Manage resource quantity & stock</li>
              <li>Oversee all storage modules</li>
              <li>Create & assign tasks with deadlines</li>
              <li>Manage medical inventory</li>
              <li>View system logs & complaints</li>
            </ul>
          </div>
        </div>
      </section>




      {/* FOOTER */}
      <footer className="landing-footer">
        <span className="nav-icon"> ⬡ </span>
        <span>SSHMS · Space Station Habitat Management System</span>
        
      </footer>
    </div>
  );
}

const features = [
  {
    icon: "🛰️",
    title: "Station Overview",
    desc: "Monitor O₂, H₂O, fuel, temperature, power supplies, and active crew count in real time with threshold alerts.",
  },
  {
    icon: "👨‍🚀",
    title: "Crew Management",
    desc: "Add, update, and assign roles to crew members. Activate or deactivate crew and manage compartment assignments.",
  },
  {
    icon: "📦",
    title: "Storage Modules",
    desc: "Manage Alpha, Beta, Gamma, Delta, and Theta storage units. Track capacity, load, and stored resource type.",
  },
  {
    icon: "✅",
    title: "Task Management",
    desc: "Full task lifecycle: create, assign, prioritize, set deadlines, and track status from pending to completed.",
  },
  {
    icon: "💊",
    title: "Medical Inventory",
    desc: "Track first aid kits, medicines, fire extinguishers, and radiation kits. Check expiry dates and restock alerts.",
  },
  {
    icon: "📋",
    title: "Complaint Panel",
    desc: "Crew members can submit issues directly to admins. Admins review and resolve complaints from a central panel.",
  },
];