import { useState } from "react";
import "../../assets/css/Complain.css";

const CREW_MEMBERS = [
  { id: 1, name: "Dr. Anika Sharma",   role: "Medical Officer", avatar: "AS" },
  { id: 2, name: "Eng. Marco Reyes",   role: "Engineer",        avatar: "MR" },
  { id: 3, name: "Dr. Liu Wei",        role: "Scientist",       avatar: "LW" },
  { id: 4, name: "Tech. Sara Okonkwo", role: "Technician",      avatar: "SO" },
  { id: 5, name: "James Harlow",       role: "Cleaning Staff",  avatar: "JH" },
  { id: 6, name: "Eng. Tom Brecker",   role: "Engineer",        avatar: "TB" },
];

const CATEGORIES = ["Technical Issue", "Medical Concern", "Safety Hazard", "Resource Shortage", "Personal", "Other"];

const INITIAL_COMPLAINTS = [
  { id: "CMP-001", crewId: 2, title: "Air circulation fan making noise", category: "Technical Issue", description: "The fan in module Gamma has been making a loud rattling noise for 3 days. It might be a loose bolt but needs inspection.", status: "Open",     priority: "High",   submittedAt: "2026-03-08", replies: [{ from: "admin", message: "We have logged this issue. Engineer Brecker will inspect it tomorrow.", time: "2026-03-09" }] },
  { id: "CMP-002", crewId: 1, title: "Running low on antibiotics",       category: "Resource Shortage", description: "Our antibiotic stock (Amoxicillin) is critically low. We have less than 2 weeks of supply remaining at current usage.", status: "Resolved", priority: "Critical", submittedAt: "2026-03-06", replies: [{ from: "admin", message: "Order placed. New supplies arrive in 5 days. Dr. Sharma please ration existing stock.", time: "2026-03-07" }] },
  { id: "CMP-003", crewId: 4, title: "Loose panel in storage area",      category: "Safety Hazard",   description: "There is a loose panel near storage bay C. It could fall and injure someone. Needs to be fixed urgently.", status: "In Review", priority: "High",   submittedAt: "2026-03-09", replies: [] },
  { id: "CMP-004", crewId: 5, title: "Cleaning supplies running out",    category: "Resource Shortage", description: "We are almost out of disinfectant and mop heads. The station sanitation could be compromised.", status: "Open",     priority: "Medium", submittedAt: "2026-03-10", replies: [] },
  { id: "CMP-005", crewId: 3, title: "Lab equipment calibration issue",  category: "Technical Issue", description: "The spectrometer in the science bay has been giving inconsistent readings. Last calibration was 6 months ago.", status: "Open",     priority: "Medium", submittedAt: "2026-03-11", replies: [] },
  { id: "CMP-006", crewId: 6, title: "Request for additional rest time", category: "Personal",        description: "The current shift schedule leaves less than 6 hours rest. Long term this affects performance and wellbeing.", status: "Closed",   priority: "Low",    submittedAt: "2026-03-03", replies: [{ from: "admin", message: "Schedule reviewed. An updated roster will be issued next week with improved rest periods.", time: "2026-03-05" }] },
];

const STATUS_OPTS  = ["Open", "In Review", "Resolved", "Closed"];
const PRIORITY_META = {
  Low:      { color: "#16a34a", bg: "#dcfce7", border: "#86efac" },
  Medium:   { color: "#d97706", bg: "#fef9c3", border: "#fde047" },
  High:     { color: "#ea580c", bg: "#fff7ed", border: "#fdba74" },
  Critical: { color: "#b91c1c", bg: "#fee2e2", border: "#fca5a5" },
};
const STATUS_META = {
  Open:       { color: "#1d4ed8", bg: "#dbeafe", border: "#93c5fd" },
  "In Review":{ color: "#d97706", bg: "#fef9c3", border: "#fde047" },
  Resolved:   { color: "#15803d", bg: "#dcfce7", border: "#86efac" },
  Closed:     { color: "#6b7280", bg: "#f3f4f6", border: "#d1d5db" },
};

function getCrew(id) { return CREW_MEMBERS.find((c) => c.id === id) || { name: "Unknown", role: "", avatar: "??" }; }

let cmpCounter = INITIAL_COMPLAINTS.length + 1;

const today = new Date().toISOString().slice(0, 10);

export default function Complain() {
  const [complaints, setComplaints]         = useState(INITIAL_COMPLAINTS);
  const [selected, setSelected]             = useState(null);
  const [replyText, setReplyText]           = useState("");
  const [statusChange, setStatusChange]     = useState({});
  const [toast, setToast]                   = useState(null);
  const [filterStatus, setFilterStatus]     = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [search, setSearch]                 = useState("");

  // broadcast
  const [broadcast, setBroadcast] = useState({ subject: "", message: "" });
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [sentMessages, setSentMessages]   = useState([
    { id: 1, subject: "Monthly safety drill reminder", message: "All crew must attend the mandatory safety drill on March 14 at 09:00. Location: Main Deck.", sentAt: "2026-03-08", sentBy: "Commander Rhodes" },
  ]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  };

  /* ── reply ── */
  const handleReply = () => {
    if (!replyText.trim()) return;
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === selected.id
          ? { ...c, replies: [...c.replies, { from: "admin", message: replyText.trim(), time: today }] }
          : c
      )
    );
    setSelected((prev) => ({
      ...prev,
      replies: [...prev.replies, { from: "admin", message: replyText.trim(), time: today }],
    }));
    setReplyText("");
    showToast("Reply sent.");
  };

  /* ── status change ── */
  const handleStatusSave = (id) => {
    const ns = statusChange[id];
    if (!ns) return;
    setComplaints((prev) => prev.map((c) => c.id === id ? { ...c, status: ns } : c));
    if (selected?.id === id) setSelected((p) => ({ ...p, status: ns }));
    setStatusChange((p) => { const n = { ...p }; delete n[id]; return n; });
    showToast("Status updated.");
  };

  /* ── broadcast ── */
  const handleBroadcast = () => {
    if (!broadcast.subject.trim() || !broadcast.message.trim()) return;
    const newMsg = { id: Date.now(), subject: broadcast.subject, message: broadcast.message, sentAt: today, sentBy: "Commander Rhodes" };
    setSentMessages((p) => [newMsg, ...p]);
    setBroadcast({ subject: "", message: "" });
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 3000);
    showToast("Message broadcast to all crew members!");
  };

  const filtered = complaints.filter((c) => {
    const matchS = filterStatus   === "All" || c.status   === filterStatus;
    const matchP = filterPriority === "All" || c.priority === filterPriority;
    const crew   = getCrew(c.crewId);
    const matchQ = c.title.toLowerCase().includes(search.toLowerCase()) ||
                   crew.name.toLowerCase().includes(search.toLowerCase()) ||
                   c.category.toLowerCase().includes(search.toLowerCase());
    return matchS && matchP && matchQ;
  });

  const openCount     = complaints.filter((c) => c.status === "Open").length;
  const unrepliedCount= complaints.filter((c) => c.replies.length === 0).length;

  return (
    <div className="cc-root">
      {toast && <div className={`cc-toast cc-toast-${toast.type}`}>{toast.msg}</div>}

      {/* header */}
      <div className="cc-header">
        <div>
          <h1 className="cc-title">Complaint Center</h1>
          <p className="cc-subtitle">Review crew complaints and send station broadcasts</p>
        </div>
      </div>

      {/* summary */}
      <div className="cc-summary">
        {[
          { icon: "📋", val: complaints.length, lbl: "Total"       },
          { icon: "🔵", val: openCount,         lbl: "Open"        },
          { icon: "💬", val: unrepliedCount,    lbl: "No Reply Yet"},
          { icon: "✅", val: complaints.filter((c) => c.status === "Resolved").length, lbl: "Resolved" },
        ].map((s) => (
          <div key={s.lbl} className="cc-sum-card">
            <span className="cc-sum-icon">{s.icon}</span>
            <div>
              <p className="cc-sum-val">{s.val}</p>
              <p className="cc-sum-lbl">{s.lbl}</p>
            </div>
          </div>
        ))}
      </div>

      {/* main 2-col layout */}
      <div className="cc-layout">

        {/* ── LEFT: complaint list ── */}
        <div className="cc-left">
          {/* filters */}
          <div className="cc-filters">
            <div className="cc-search-wrap">
              <span className="cc-search-icon">🔍</span>
              <input className="cc-search" placeholder="Search complaints…" value={search} onChange={(e) => setSearch(e.target.value)} />
              {search && <button className="cc-search-clear" onClick={() => setSearch("")}>✕</button>}
            </div>
            <div className="cc-filter-row">
              {["All", ...STATUS_OPTS].map((s) => (
                <button key={s} className={`cc-filter-btn${filterStatus === s ? " active" : ""}`} onClick={() => setFilterStatus(s)}>{s}</button>
              ))}
            </div>
            <div className="cc-filter-row">
              {["All", "Low", "Medium", "High", "Critical"].map((p) => (
                <button key={p} className={`cc-filter-btn${filterPriority === p ? " active" : ""}`} onClick={() => setFilterPriority(p)}>{p}</button>
              ))}
            </div>
          </div>

          {/* complaint cards */}
          <div className="cc-list">
            {filtered.length === 0 ? (
              <div className="cc-empty"><span>📋</span><p>No complaints found.</p></div>
            ) : (
              filtered.map((c) => {
                const crew = getCrew(c.crewId);
                const pm   = PRIORITY_META[c.priority];
                const sm   = STATUS_META[c.status];
                const isActive = selected?.id === c.id;
                return (
                  <div
                    key={c.id}
                    className={`cc-card${isActive ? " cc-card-active" : ""}`}
                    onClick={() => { setSelected(c); setReplyText(""); }}
                  >
                    <div className="cc-card-top">
                      <div className="cc-card-meta">
                        <span className="cc-badge" style={{ color: sm.color, background: sm.bg, border: `1px solid ${sm.border}` }}>{c.status}</span>
                        <span className="cc-badge" style={{ color: pm.color, background: pm.bg, border: `1px solid ${pm.border}` }}>{c.priority}</span>
                      </div>
                      <span className="cc-card-date">{c.submittedAt}</span>
                    </div>
                    <p className="cc-card-title">{c.title}</p>
                    <div className="cc-card-crew">
                      <div className="cc-mini-avatar">{crew.avatar}</div>
                      <span>{crew.name} · {crew.role}</span>
                    </div>
                    <div className="cc-card-footer">
                      <span className="cc-cat-tag">{c.category}</span>
                      <span className="cc-reply-count">
                        {c.replies.length === 0 ? "⚪ No reply" : `💬 ${c.replies.length} repl${c.replies.length !== 1 ? "ies" : "y"}`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT: detail / broadcast ── */}
        <div className="cc-right">

          {selected ? (
            <div className="cc-detail">
              {/* complaint header */}
              <div className="cc-detail-header">
                <div className="cc-detail-title-row">
                  <p className="cc-detail-title">{selected.title}</p>
                  <button className="cc-detail-close" onClick={() => setSelected(null)}>✕</button>
                </div>
                <div className="cc-detail-meta">
                  <span className="cc-badge" style={{ color: STATUS_META[selected.status].color, background: STATUS_META[selected.status].bg, border: `1px solid ${STATUS_META[selected.status].border}` }}>{selected.status}</span>
                  <span className="cc-badge" style={{ color: PRIORITY_META[selected.priority].color, background: PRIORITY_META[selected.priority].bg, border: `1px solid ${PRIORITY_META[selected.priority].border}` }}>{selected.priority}</span>
                  <span className="cc-cat-tag">{selected.category}</span>
                  <span className="cc-detail-id">{selected.id}</span>
                </div>
              </div>

              {/* crew info */}
              <div className="cc-crew-row">
                <div className="cc-crew-avatar">{getCrew(selected.crewId).avatar}</div>
                <div>
                  <p className="cc-crew-name">{getCrew(selected.crewId).name}</p>
                  <p className="cc-crew-role">{getCrew(selected.crewId).role} · Submitted {selected.submittedAt}</p>
                </div>
              </div>

              {/* description */}
              <div className="cc-description">{selected.description}</div>

              {/* status changer */}
              {selected.status !== "Closed" && (
                <div className="cc-status-row">
                  <label className="cc-status-label">Update Status:</label>
                  <select
                    className="cc-status-select"
                    value={statusChange[selected.id] ?? selected.status}
                    onChange={(e) => setStatusChange((p) => ({ ...p, [selected.id]: e.target.value }))}
                  >
                    {STATUS_OPTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {statusChange[selected.id] && statusChange[selected.id] !== selected.status && (
                    <button className="cc-status-save-btn" onClick={() => handleStatusSave(selected.id)}>Save</button>
                  )}
                </div>
              )}

              {/* replies thread */}
              <div className="cc-thread">
                <p className="cc-thread-heading">Conversation ({selected.replies.length})</p>
                {selected.replies.length === 0 ? (
                  <p className="cc-no-replies">No replies yet. Be the first to respond.</p>
                ) : (
                  selected.replies.map((r, i) => (
                    <div key={i} className={`cc-reply cc-reply-${r.from}`}>
                      <div className="cc-reply-from">
                        {r.from === "admin" ? "🛡️ Admin (You)" : `👤 ${getCrew(selected.crewId).name}`}
                        <span className="cc-reply-time">{r.time}</span>
                      </div>
                      <p className="cc-reply-text">{r.message}</p>
                    </div>
                  ))
                )}
              </div>

              {/* reply box */}
              {selected.status !== "Closed" && (
                <div className="cc-reply-box">
                  <textarea
                    className="cc-reply-input"
                    placeholder="Type your reply to the crew member…"
                    value={replyText}
                    rows={3}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="cc-reply-actions">
                    <button className="cc-send-btn" onClick={handleReply} disabled={!replyText.trim()}>
                      Send Reply ➤
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="cc-no-select">
              <span>📋</span>
              <p>Select a complaint to view details and reply</p>
            </div>
          )}
        </div>
      </div>

      {/* ── BROADCAST SECTION ── */}
      <div className="cc-broadcast-section">
        <div className="cc-broadcast-header">
          <div>
            <h2 className="cc-broadcast-title">📢 Broadcast Message</h2>
            <p className="cc-broadcast-sub">Send a message to all crew members instantly</p>
          </div>
        </div>

        <div className="cc-broadcast-layout">
          {/* compose form */}
          <div className="cc-broadcast-form">
            <div className="cc-form-group">
              <label className="cc-label">Subject</label>
              <input
                className="cc-input"
                placeholder="e.g. Safety drill reminder"
                value={broadcast.subject}
                onChange={(e) => setBroadcast({ ...broadcast, subject: e.target.value })}
              />
            </div>
            <div className="cc-form-group">
              <label className="cc-label">Message</label>
              <textarea
                className="cc-input cc-textarea"
                placeholder="Write your message to all crew members…"
                rows={4}
                value={broadcast.message}
                onChange={(e) => setBroadcast({ ...broadcast, message: e.target.value })}
              />
            </div>
            <div className="cc-broadcast-crew-preview">
              <p className="cc-bcp-label">Will be sent to {CREW_MEMBERS.length} crew members:</p>
              <div className="cc-bcp-avatars">
                {CREW_MEMBERS.map((m) => (
                  <div key={m.id} className="cc-bcp-chip">
                    <div className="cc-bcp-avatar">{m.avatar}</div>
                    <span>{m.name.split(" ").slice(-1)[0]}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              className="cc-broadcast-btn"
              onClick={handleBroadcast}
              disabled={!broadcast.subject.trim() || !broadcast.message.trim()}
            >
              {broadcastSent ? "✓ Sent!" : "📢 Send to All Crew"}
            </button>
          </div>

          {/* sent messages history */}
          <div className="cc-sent-history">
            <p className="cc-sent-heading">Previously Sent ({sentMessages.length})</p>
            {sentMessages.length === 0 ? (
              <p className="cc-no-replies">No broadcasts sent yet.</p>
            ) : (
              sentMessages.map((m) => (
                <div key={m.id} className="cc-sent-card">
                  <div className="cc-sent-card-top">
                    <p className="cc-sent-subject">{m.subject}</p>
                    <span className="cc-sent-date">{m.sentAt}</span>
                  </div>
                  <p className="cc-sent-msg">{m.message}</p>
                  <p className="cc-sent-by">— {m.sentBy}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}