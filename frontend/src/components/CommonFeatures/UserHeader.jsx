import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../../assets/css/UserLayout.css';

export default function UserHeader({ crewName = "Eng. Marco Reyes", stationName = "ISS-Horizon VII" }) {
  const navigate = useNavigate();
  const [time, setTime]         = useState(new Date());
  const [dropdown, setDropdown] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const initials = crewName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const utc = time.toUTCString().slice(17, 25) + " UTC";

  return (
    <header className="uh-header">
      {/* left — logo */}
      <div className="uh-left">
        <div className="uh-logo">
          <span className="uh-hex">⬡</span>
          <span className="uh-brand">SSHMS</span>
        </div>
        <span className="uh-sep" />
        <span className="uh-station">{stationName}</span>
      </div>

      

      {/* right — crew badge + dropdown */}
      <div className="uh-right">
        <div className="uh-crew-badge">
          <span className="uh-crew-icon">👨‍🚀</span>
          <span className="uh-crew-label">Crew Member</span>
        </div>

        <div className="uh-avatar-wrap">
          <button className="uh-avatar" onClick={() => setDropdown((p) => !p)}>
            {initials}
          </button>

          {dropdown && (
            <>
              <div className="uh-backdrop" onClick={() => setDropdown(false)} />
              <div className="uh-dropdown">
                <div className="uh-dropdown-info">
                  <div className="uh-dropdown-avatar">{initials}</div>
                  <div>
                    <p className="uh-dropdown-name">{crewName}</p>
                    <p className="uh-dropdown-role">Crew Member</p>
                  </div>
                </div>
                <div className="uh-dropdown-divider" />
                <button className="uh-dropdown-item" onClick={() => { setDropdown(false); navigate("/crew/UserProfile"); }}>
                  👤 My Profile
                </button>
                <button className="uh-dropdown-item" onClick={() => { setDropdown(false); navigate("/crew/UserComplain"); }}>
                  📋 My Complaints
                </button>
                <div className="uh-dropdown-divider" />
                <button className="uh-dropdown-item uh-dropdown-logout" onClick={() => navigate("/login")}>
                  🚪 Log Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}