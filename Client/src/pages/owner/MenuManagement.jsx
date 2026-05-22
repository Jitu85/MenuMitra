import React, { useState } from 'react';
import OwnerLayout from '../../components/OwnerLayout';
import toast, { Toaster } from 'react-hot-toast';

const INIT_CATEGORIES = [
  { id: "CAT1", name: "Main Course", nameHi: "मुख्य व्यंजन", items: 6 },
  { id: "CAT2", name: "Breads", nameHi: "रोटी / ब्रेड", items: 4 },
  { id: "CAT3", name: "Beverages", nameHi: "पेय पदार्थ", items: 5 },
];

const INIT_ITEMS = [
  { id: "ITM001", categoryId: "CAT1", nameEn: "Dal Makhani", nameHi: "दाल मखनी", descEn: "Creamy black lentil curry", descHi: "मलाईदार दाल करी", price: 180, isVeg: true, isAvailable: true, photo: "🍛", sales: 142 },
  { id: "ITM002", categoryId: "CAT1", nameEn: "Paneer Butter Masala", nameHi: "पनीर बटर मसाला", descEn: "Cottage cheese in rich tomato gravy", descHi: "पनीर टमाटर की ग्रेवी में", price: 220, isVeg: true, isAvailable: true, photo: "🧆", sales: 98 },
  { id: "ITM003", categoryId: "CAT1", nameEn: "Chicken Curry", nameHi: "चिकन करी", descEn: "Traditional homestyle chicken curry", descHi: "देसी चिकन करी", price: 280, isVeg: false, isAvailable: true, photo: "🍗", sales: 211 },
  { id: "ITM005", categoryId: "CAT2", nameEn: "Butter Naan", nameHi: "बटर नान", descEn: "Soft leavened bread with butter", descHi: "मक्खन के साथ नरम नान", price: 40, isVeg: true, isAvailable: true, photo: "🫓", sales: 289 },
  { id: "ITM006", categoryId: "CAT2", nameEn: "Tandoori Roti", nameHi: "तंदूरी रोटी", descEn: "Whole wheat bread from tandoor", descHi: "तंदूर की गेहूं की रोटी", price: 25, isVeg: true, isAvailable: true, photo: "🫓", sales: 334 },
];

const inputStyle = (err) => ({
  width: "100%", padding: "11px 14px",
  border: `1.5px solid ${err ? "#e74c3c" : "#e8ddd4"}`,
  borderRadius: 10, fontSize: 13, color: "#1A1A1A",
  background: "white", fontFamily: "'DM Sans',sans-serif",
  outline: "none", transition: "border-color 0.2s",
});

const selectStyle = {
  width: "100%", padding: "11px 14px",
  border: "1.5px solid #e8ddd4", borderRadius: 10,
  fontSize: 13, color: "#1A1A1A", background: "white",
  fontFamily: "'DM Sans',sans-serif", outline: "none",
  appearance: "none", cursor: "pointer",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7' viewBox='0 0 10 7'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23E8650A' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: 32,
};

export default function MenuManagement() {
  const [categories, setCategories] = useState(INIT_CATEGORIES);
  const [items, setItems] = useState(INIT_ITEMS);
  const [itemModal, setItemModal] = useState(null);
  const [catModal, setCatModal] = useState(null);


  const BLANK_ITEM = { id: null, categoryId: "CAT1", nameEn: "", nameHi: "", descEn: "", descHi: "", price: "", isVeg: true, isAvailable: true, photo: "🍛" };

  const saveItem = (item) => {
    if (!item.nameEn || !item.price) {
      toast.error("Name and price are required.");
      return;
    }
    if (item.id) {
      setItems(prev => prev.map(i => i.id === item.id ? { ...item, price: Number(item.price) } : i));
      toast.success("Item updated successfully.");
    } else {
      const newItem = { ...item, id: "ITM" + Date.now(), price: Number(item.price), sales: 0 };
      setItems(prev => [...prev, newItem]);
      toast.success("New item added to your menu.");
    }
    setItemModal(null);
  };

  const deleteItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    toast.success("Item removed from menu.");
    setItemModal(null);
  };

  const toggleAvailability = (id) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, isAvailable: !i.isAvailable } : i));
    toast.success("Availability updated.");
  };

  const saveCat = (cat) => {
    if (!cat.name) {
      toast.error("Category name is required.");
      return;
    }
    if (cat.id) {
      setCategories(prev => prev.map(c => c.id === cat.id ? cat : c));
      toast.success("Category updated.");
    } else {
      setCategories(prev => [...prev, { ...cat, id: "CAT" + Date.now(), items: 0 }]);
      toast.success("Category created.");
    }
    setCatModal(null);
  };

  const deleteCat = (id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setItems(prev => prev.filter(i => i.categoryId !== id));
    toast.success("Category and its items removed.");
    setCatModal(null);
  };

  return (
    <OwnerLayout pageTitle="🍽️ Menu Management">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="page-anim">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, marginBottom: 4 }}>Menu Management</h1>
            <p style={{ fontSize: 13, color: "#999" }}>{items.length} items across {categories.length} categories</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-ghost" onClick={() => setCatModal({ id: null, name: "", nameHi: "" })}>+ Add Category</button>
            <button className="btn-primary" onClick={() => setItemModal({ ...BLANK_ITEM })}>+ Add Item</button>
          </div>
        </div>

        {/* Category tags */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
          {categories.map(cat => (
            <div key={cat.id} style={{ display: "flex", alignItems: "center", background: "white", border: "1px solid #f0e8df", borderRadius: 20, overflow: "hidden" }}>
              <span style={{ padding: "7px 14px", fontSize: 12, fontWeight: 700, color: "#555" }}>{cat.name}</span>
              <button onClick={() => setCatModal({ ...cat })} style={{ padding: "7px 10px", background: "rgba(232,101,10,0.07)", border: "none", cursor: "pointer", fontSize: 12, color: "#E8650A" }}>✏️</button>
            </div>
          ))}
        </div>

        {/* Items Grouped By Categories */}
        {categories.map(cat => {
          const catItems = items.filter(i => i.categoryId === cat.id);
          return (
            <div key={cat.id} style={{ marginBottom: 28 }}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 800, marginBottom: 12 }}>{cat.name} <span style={{ fontSize: 12, color: "#999", fontWeight: "normal" }}>({cat.nameHi})</span></h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {catItems.map(item => (
                  <div key={item.id} className="card" style={{ padding: 16, display: "flex", gap: 12, position: "relative" }}>
                    <span style={{ fontSize: 32 }}>{item.photo}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: "bold" }}>{item.nameEn}</span>
                        <span style={{ fontSize: 11, color: item.isVeg ? "#2D6A4F" : "#c0392b" }}>{item.isVeg ? "🟢" : "🔴"}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{item.descEn}</div>
                      <div style={{ fontSize: 13, fontWeight: "bold", color: "#E8650A", marginTop: 8 }}>₹{item.price}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                      <button onClick={() => setItemModal({ ...item })} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>✏️</button>
                      <button onClick={() => toggleAvailability(item.id)} style={{ background: item.isAvailable ? "#2D6A4F" : "#c0392b", border: "none", color: "white", padding: "4px 8px", borderRadius: 6, fontSize: 10, cursor: "pointer", fontWeight: "bold" }}>
                        {item.isAvailable ? "Available" : "Stock Out"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Item Modal */}
        {itemModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 8000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: "white", borderRadius: 24, padding: "32px", maxWidth: 500, width: "100%" }}>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900, marginBottom: 20 }}>{itemModal.id ? "Edit Item" : "Add New Item"}</h2>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: "bold", color: "#666", display: "block", marginBottom: 6 }}>Icon / Emoji</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["🍛", "🍗", "🥘", "🧆", "🫓", "☕", "🥛", "🍮"].map(e => (
                    <button key={e} onClick={() => setItemModal(m => ({ ...m, photo: e }))} style={{ width: 36, height: 36, fontSize: 18, border: itemModal.photo === e ? "2px solid #E8650A" : "1.5px solid #ccc", background: "white", borderRadius: 8, cursor: "pointer" }}>{e}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: "bold", color: "#666", display: "block", marginBottom: 4 }}>Name (EN)</label>
                  <input value={itemModal.nameEn} onChange={e => setItemModal(m => ({ ...m, nameEn: e.target.value }))} style={inputStyle(false)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: "bold", color: "#666", display: "block", marginBottom: 4 }}>नाम (HI)</label>
                  <input value={itemModal.nameHi} onChange={e => setItemModal(m => ({ ...m, nameHi: e.target.value }))} style={inputStyle(false)} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: "bold", color: "#666", display: "block", marginBottom: 4 }}>Price (₹)</label>
                  <input type="number" value={itemModal.price} onChange={e => setItemModal(m => ({ ...m, price: e.target.value }))} style={inputStyle(false)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: "bold", color: "#666", display: "block", marginBottom: 4 }}>Category</label>
                  <select value={itemModal.categoryId} onChange={e => setItemModal(m => ({ ...m, categoryId: e.target.value }))} style={selectStyle}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, margin: "18px 0 0" }}>
                {itemModal.id && (
                  <button onClick={() => deleteItem(itemModal.id)} style={{ padding: "10px 18px", background: "rgba(192,57,43,0.08)", color: "#c0392b", border: "1px solid rgba(192,57,43,0.2)", borderRadius: 50, cursor: "pointer" }}>Delete</button>
                )}
                <button onClick={() => setItemModal(null)} style={{ flex: 1, padding: "10px", border: "none", background: "#f5f0eb", borderRadius: 50, cursor: "pointer" }}>Cancel</button>
                <button onClick={() => saveItem(itemModal)} className="btn-primary" style={{ flex: 2 }}>Save</button>
              </div>
            </div>
          </div>
        )}

        {/* Category Modal */}
        {catModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 8000, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "white", borderRadius: 22, padding: 28, maxWidth: 380, width: "100%" }}>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 900, marginBottom: 16 }}>{catModal.id ? "Edit Category" : "Add Category"}</h2>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: "bold", color: "#666", display: "block", marginBottom: 4 }}>Name (EN)</label>
                <input value={catModal.name} onChange={e => setCatModal(m => ({ ...m, name: e.target.value }))} style={inputStyle(false)} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: "bold", color: "#666", display: "block", marginBottom: 4 }}>नाम (HI)</label>
                <input value={catModal.nameHi} onChange={e => setCatModal(m => ({ ...m, nameHi: e.target.value }))} style={inputStyle(false)} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {catModal.id && (
                  <button onClick={() => deleteCat(catModal.id)} style={{ padding: "10px 16px", background: "rgba(192,57,43,0.08)", color: "#c0392b", border: "none", borderRadius: 50, cursor: "pointer" }}>🗑️</button>
                )}
                <button onClick={() => setCatModal(null)} style={{ flex: 1, padding: "10px", border: "none", background: "#f5f0eb", borderRadius: 50, cursor: "pointer" }}>Cancel</button>
                <button onClick={() => saveCat(catModal)} className="btn-primary" style={{ flex: 2 }}>Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}
