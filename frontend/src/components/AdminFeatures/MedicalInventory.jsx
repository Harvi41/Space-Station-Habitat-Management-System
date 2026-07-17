import { useState,useEffect } from "react";
import "../../assets/css/medical.css";

const BASE_URL = "http://localhost:5000/api/medical";

const CATEGORIES = ["First Aid Kit", "Medicine", "Fire Extinguisher", "Radiation Protection Kit"];

const CATEGORY_ICONS = {
  "First Aid Kit":           "🩺",
  "Medicine":                "💊",
  "Fire Extinguisher":       "🧯",
  "Radiation Protection Kit":"☢️",
};

const today = new Date().toISOString().slice(0, 10);

function daysUntilExpiry(expiry) {
  if (!expiry) return 0;
  const diff = (new Date(expiry) - new Date(today)) / (1000 * 60 * 60 * 24);
  return Math.ceil(diff);
}

function getExpiryStatus(expiry) {
  if (!expiry) return "ok";

  const d = daysUntilExpiry(expiry);
  if (d < 0) return "expired";
  if (d <= 30) return "expiring";
  return "ok";
}

// const INITIAL_ITEMS = [
//   { id: "MED-001", name: "Standard First Aid Kit",      category: "First Aid Kit",            quantity: 12, unit: "kits",    expiryDate: "2027-06-30", location: "Bay A" },
//   { id: "MED-002", name: "Advanced Trauma Kit",         category: "First Aid Kit",            quantity: 4,  unit: "kits",    expiryDate: "2026-12-31", location: "Bay A" },
//   { id: "MED-003", name: "Paracetamol 500mg",           category: "Medicine",                 quantity: 200,unit: "tablets", expiryDate: "2025-11-15", location: "Bay B" },
//   { id: "MED-004", name: "Amoxicillin 250mg",           category: "Medicine",                 quantity: 80, unit: "capsules",expiryDate: "2026-08-20", location: "Bay B" },
//   { id: "MED-005", name: "Ibuprofen 400mg",             category: "Medicine",                 quantity: 150,unit: "tablets", expiryDate: "2026-03-20", location: "Bay B" },
//   { id: "MED-006", name: "Morphine Injection",          category: "Medicine",                 quantity: 15, unit: "vials",   expiryDate: "2025-12-01", location: "Bay B" },
//   { id: "MED-007", name: "CO₂ Fire Extinguisher",       category: "Fire Extinguisher",        quantity: 8,  unit: "units",   expiryDate: "2027-01-15", location: "Bay C" },
//   { id: "MED-008", name: "Dry Powder Extinguisher",     category: "Fire Extinguisher",        quantity: 5,  unit: "units",   expiryDate: "2026-05-10", location: "Bay C" },
//   { id: "MED-009", name: "Radiation Dosimeter",         category: "Radiation Protection Kit", quantity: 20, unit: "units",   expiryDate: "2027-09-01", location: "Bay D" },
//   { id: "MED-010", name: "Lead-lined Protective Suit",  category: "Radiation Protection Kit", quantity: 6,  unit: "suits",   expiryDate: "2028-03-01", location: "Bay D" },
//   { id: "MED-011", name: "Potassium Iodide Tablets",   category: "Radiation Protection Kit", quantity: 300,unit: "tablets", expiryDate: "2025-09-30", location: "Bay D" },
// ];

const EMPTY_FORM = { name: "", category: CATEGORIES[0], quantity: "", unit: "units", expiryDate: "", location: "" };

// let itemCounter = INITIAL_ITEMS.length + 1;

export default function MedicalInventory() {
  const [items, setItems]           = useState([]);
  const [modal, setModal]           = useState(null); // "add" | "edit" | "remove"
  const [selected, setSelected]     = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [errors, setErrors]         = useState({});
  const [toast, setToast]           = useState(null);
  const [filterCat, setFilterCat]   = useState("All");
  const [filterExp, setFilterExp]   = useState("All"); // "All"|"expired"|"expiring"|"ok"
  const [search, setSearch]         = useState("");
  const [qtyEdit, setQtyEdit]       = useState({}); // { id: newQty }

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  };

  //FETCHING ITEMS FROM BACKEND
  const fetchItems = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
  console.error("No token found");
}

    const res = await fetch(BASE_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
  const err = await res.json();
  throw new Error(err.error || "Request failed");
}

    const data = await res.json();
        if (!Array.isArray(data)) {
      console.error("Invalid API response", data);
      setItems([]);
      return;
    }

    const mapped = data.map((i) => ({
      id: i._id,
      name: i.name,
      category: i.category,
      quantity: i.quantity,
      unit: i.unit,
      expiryDate: i.expiryDate ? i.expiryDate.slice(0, 10) : "",
      location: i.location,
    }));

    setItems(mapped);

  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  fetchItems();
}, []);

  const openAdd = () => { setForm(EMPTY_FORM); setErrors({}); setModal("add"); };
  const openEdit = (item) => {
    setSelected(item);
    setForm({ name: item.name, category: item.category, quantity: item.quantity, unit: item.unit, expiryDate: item.expiryDate, location: item.location });
    setErrors({});
    setModal("edit");
  };
  const openRemove = (item) => { setSelected(item); setModal("remove"); };
  const closeModal = () => { setModal(null); setSelected(null); setErrors({}); };

  const validate = () => {
    const e = {};
    if (!form.name.trim())     e.name     = "Item name is required.";
    if (!form.quantity || isNaN(form.quantity) || +form.quantity < 0) e.quantity = "Enter valid quantity.";
    if (!form.expiryDate)      e.expiryDate = "Expiry date is required.";
    if (!form.location.trim()) e.location = "Location is required.";
    return e;
  };

  const handleAdd = async () => {
  const e = validate();
  if (Object.keys(e).length) { setErrors(e); return; }

  try {
    const token = localStorage.getItem("token");

    await fetch(`${BASE_URL}/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: form.name,
        category: form.category,
        quantity: +form.quantity,
        unit: form.unit,
        expiryDate: form.expiryDate,
        location: form.location,
      }),
    });

    fetchItems(); // 🔥 refresh
    closeModal();
    showToast(`"${form.name}" added`);

  } catch (err) {
    console.error(err);
  }
};
  
const handleUpdate = async () => {
  const e = validate();
  if (Object.keys(e).length) { setErrors(e); return; }

  try {
    const token = localStorage.getItem("token");

    await fetch(`${BASE_URL}/${selected.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: form.name,
        category: form.category,
        quantity: +form.quantity,
        unit: form.unit,
        expiryDate: form.expiryDate,
        location: form.location,
      }),
    });

    fetchItems();
    closeModal();
    showToast(`"${form.name}" updated`);

  } catch (err) {
    console.error(err);
  }
};

  const handleRemove = async () => {
  try {
    const token = localStorage.getItem("token");

    await fetch(`${BASE_URL}/${selected.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchItems();
    closeModal();
    showToast(`"${selected.name}" removed`, "warning");

  } catch (err) {
    console.error(err);
  }
};

  // quick inline quantity update
  const handleQtyChange = (id, val) => setQtyEdit((p) => ({ ...p, [id]: val }));
  const handleQtySave = async (item) => {
  const val = +qtyEdit[item.id];
  if (isNaN(val) || val < 0) return;

  try {
    const token = localStorage.getItem("token");

    await fetch(`${BASE_URL}/${item.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...item,
        quantity: val,
      }),
    });

    fetchItems();

    setQtyEdit((p) => {
      const n = { ...p };
      delete n[item.id];
      return n;
    });

    showToast(`Quantity updated`);

  } catch (err) {
    console.error(err);
  }
};

  // remove all expired
  const removeAllExpired = async () => {
  try {
    const expiredItems = items.filter(
      (i) => getExpiryStatus(i.expiryDate) === "expired"
    );

    const token = localStorage.getItem("token");

    await Promise.all(
      expiredItems.map((i) =>
        fetch(`${BASE_URL}/${i.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      )
    );

    fetchItems();

    showToast(`${expiredItems.length} expired removed`, "warning");

  } catch (err) {
    console.error(err);
  }
};

  const filtered = items.filter((i) => {
    const matchCat    = filterCat === "All" || i.category === filterCat;
    const matchExp    = filterExp === "All" || getExpiryStatus(i.expiryDate) === filterExp;
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchExp && matchSearch;
  });

  // summary counts
  const expiredCount  = items.filter((i) => getExpiryStatus(i.expiryDate) === "expired").length;
  const expiringCount = items.filter((i) => getExpiryStatus(i.expiryDate) === "expiring").length;
  const catCounts     = CATEGORIES.reduce((a, c) => { a[c] = items.filter((i) => i.category === c).length; return a; }, {});

  return (
    <div className="mi-root">
      {toast && <div className={`mi-toast mi-toast-${toast.type}`}>{toast.msg}</div>}

      {/* header */}
      <div className="mi-header">
        <div>
          <h1 className="mi-title">Medical Inventory</h1>
          <p className="mi-subtitle">Track supplies, medicines & safety equipment</p>
        </div>
        <div className="mi-header-actions">
          {expiredCount > 0 && (
            <button className="mi-remove-expired-btn" onClick={removeAllExpired}>
              🗑 Remove All Expired ({expiredCount})
            </button>
          )}
          <button className="mi-add-btn" onClick={openAdd}>+ Add Item</button>
        </div>
      </div>

      {/* category summary */}
      <div className="mi-cat-summary">
        {CATEGORIES.map((c) => (
          <div key={c} className="mi-cat-card">
            <span className="mi-cat-icon">{CATEGORY_ICONS[c]}</span>
            <div>
              <p className="mi-cat-val">{catCounts[c]}</p>
              <p className="mi-cat-lbl">{c}</p>
            </div>
          </div>
        ))}
      </div>

      {/* alert banners */}
      {expiredCount > 0 && (
        <div className="mi-alert mi-alert-danger">
          🚨 <strong>{expiredCount} item{expiredCount !== 1 ? "s have" : " has"} expired.</strong> Please remove or replace immediately.
        </div>
      )}
      {expiringCount > 0 && (
        <div className="mi-alert mi-alert-warning">
          ⚠️ <strong>{expiringCount} item{expiringCount !== 1 ? "s are" : " is"} expiring.</strong> Schedule restocking.
        </div>
      )}

      {/* filters */}
      <div className="mi-filters">
        <div className="mi-search-wrap">
          <span className="mi-search-icon">🔍</span>
          <input className="mi-search" placeholder="Search items…" value={search} onChange={(e) => setSearch(e.target.value)} />
          {search && <button className="mi-search-clear" onClick={() => setSearch("")}>✕</button>}
        </div>
        <div className="mi-filter-group">
          {["All", ...CATEGORIES].map((c) => (
            <button key={c} className={`mi-filter-btn${filterCat === c ? " active" : ""}`} onClick={() => setFilterCat(c)}>
              {c === "All" ? "All Categories" : CATEGORY_ICONS[c] + " " + c}
            </button>
          ))}
        </div>
        <div className="mi-filter-group">
          {[["All","All"], ["ok","✅ Valid"], ["expiring","⚠️ Expiring Soon"], ["expired","🔴 Expired"]].map(([v, l]) => (
            <button key={v} className={`mi-filter-btn${filterExp === v ? " active" : ""}`} onClick={() => setFilterExp(v)}>{l}</button>
          ))}
        </div>
      </div>

      {/* table */}
      <div className="mi-table-card">
        <div className="mi-table-top">
          <span className="mi-table-count">{filtered.length} item{filtered.length !== 1 ? "s" : ""}</span>
        </div>
        {filtered.length === 0 ? (
          <div className="mi-empty"><span>💊</span><p>No items found.</p></div>
        ) : (
          <div className="mi-table-wrap">
            <table className="mi-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Location</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const es    = getExpiryStatus(item.expiryDate);
                  const days  = daysUntilExpiry(item.expiryDate);
                  const qVal  = qtyEdit[item.id] !== undefined ? qtyEdit[item.id] : item.quantity;
                  const dirty = qtyEdit[item.id] !== undefined;
                  return (
                    <tr key={item.id} className={es === "expired" ? "mi-row-expired" : ""}>
                      <td>
                        <div className="mi-item-cell">
                          <span className="mi-item-icon">{CATEGORY_ICONS[item.category]}</span>
                          <div>
                            <p className="mi-item-name">{item.name}</p>
                            <p className="mi-item-id">{item.id}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className="mi-cat-pill">{item.category}</span></td>
                      <td>
                        <div className="mi-qty-cell">
                          <input
                            type="number"
                            className="mi-qty-input"
                            value={qVal}
                            min={0}
                            onChange={(e) => handleQtyChange(item.id, e.target.value)}
                          />
                          <span className="mi-qty-unit">{item.unit}</span>
                          {dirty && (
                            <button className="mi-qty-save" onClick={() => handleQtySave(item)}>✓</button>
                          )}
                        </div>
                      </td>
                      <td><span className="mi-location">{item.location}</span></td>
                      <td><span className={`mi-expiry mi-expiry-${es}`}>{item.expiryDate}</span></td>
                      <td>
                        <span className={`mi-exp-badge mi-exp-${es}`}>
                          {es === "expired"  ? "Expired"                   : ""}
                          {es === "expiring" ? `Expires in ${days}d`       : ""}
                          {es === "ok"       ? `Valid · ${days}d left`     : ""}
                        </span>
                      </td>
                      <td>
                        <div className="mi-action-row">
                          <button className="mi-btn-edit"   onClick={() => openEdit(item)}   title="Edit">✏️</button>
                          <button className="mi-btn-remove" onClick={() => openRemove(item)} title="Remove">🗑️</button>
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

      {/* ADD / EDIT MODAL */}
      {(modal === "add" || modal === "edit") && (
        <div className="mi-overlay" onClick={closeModal}>
          <div className="mi-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mi-modal-header">
              <h2 className="mi-modal-title">{modal === "add" ? "➕ Add Medical Item" : "✏️ Edit Item"}</h2>
              <button className="mi-modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="mi-modal-body">
              <div className="mi-form-group mi-full">
                <label className="mi-label">Item Name <span className="mi-req">*</span></label>
                <input className={`mi-input${errors.name ? " error" : ""}`} placeholder="e.g. Paracetamol 500mg"
                  value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: "" }); }} />
                {errors.name && <p className="mi-error">⚠ {errors.name}</p>}
              </div>
              <div className="mi-form-row">
                <div className="mi-form-group">
                  <label className="mi-label">Category</label>
                  <select className="mi-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
                  </select>
                </div>
                <div className="mi-form-group">
                  <label className="mi-label">Location <span className="mi-req">*</span></label>
                  <input className={`mi-input${errors.location ? " error" : ""}`} placeholder="e.g. Bay A"
                    value={form.location} onChange={(e) => { setForm({ ...form, location: e.target.value }); setErrors({ ...errors, location: "" }); }} />
                  {errors.location && <p className="mi-error">⚠ {errors.location}</p>}
                </div>
              </div>
              <div className="mi-form-row">
                <div className="mi-form-group">
                  <label className="mi-label">Quantity <span className="mi-req">*</span></label>
                  <input type="number" min={0} className={`mi-input${errors.quantity ? " error" : ""}`} placeholder="e.g. 50"
                    value={form.quantity} onChange={(e) => { setForm({ ...form, quantity: e.target.value }); setErrors({ ...errors, quantity: "" }); }} />
                  {errors.quantity && <p className="mi-error">⚠ {errors.quantity}</p>}
                </div>
                <div className="mi-form-group">
                  <label className="mi-label">Unit</label>
                  <input className="mi-input" placeholder="e.g. tablets, kits, units"
                    value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
                </div>
              </div>
              <div className="mi-form-group mi-full">
                <label className="mi-label">Expiry Date <span className="mi-req">*</span></label>
                <input type="date" className={`mi-input${errors.expiryDate ? " error" : ""}`}
                  value={form.expiryDate} onChange={(e) => { setForm({ ...form, expiryDate: e.target.value }); setErrors({ ...errors, expiryDate: "" }); }} />
                {errors.expiryDate && <p className="mi-error">⚠ {errors.expiryDate}</p>}
              </div>
            </div>
            <div className="mi-modal-footer">
              <button className="mi-btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="mi-btn-save" onClick={modal === "add" ? handleAdd : handleUpdate}>
                {modal === "add" ? "Add Item" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REMOVE CONFIRM */}
      {modal === "remove" && selected && (
        <div className="mi-overlay" onClick={closeModal}>
          <div className="mi-modal mi-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="mi-modal-header">
              <h2 className="mi-modal-title">🗑️ Remove Item</h2>
              <button className="mi-modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="mi-modal-body mi-confirm-body">
              <span className="mi-confirm-icon">{CATEGORY_ICONS[selected.category]}</span>
              <p className="mi-confirm-name">{selected.name}</p>
              <p className="mi-confirm-sub">{selected.id} · {selected.quantity} {selected.unit}</p>
              <p className="mi-confirm-msg">Remove this item from the inventory? This cannot be undone.</p>
            </div>
            <div className="mi-modal-footer">
              <button className="mi-btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="mi-btn-danger" onClick={handleRemove}>Yes, Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}