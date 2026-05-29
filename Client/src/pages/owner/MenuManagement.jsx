import React, { useState, useEffect } from 'react';
import OwnerLayout from '../../components/OwnerLayout';
import toast, { Toaster } from 'react-hot-toast';
import * as menuService from '../../services/menuService';

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
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemModal, setItemModal] = useState(null);
  const [catModal, setCatModal] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const BLANK_ITEM = { id: null, category_id: "", name: "", description: "", price: "", is_veg: true, is_available: true, photo_url: "🍛" };
  const BLANK_CAT = { id: null, name: "", sort_order: 0 };

  // Load categories and items on mount
  useEffect(() => {
    loadMenuData();
  }, []);

  const loadMenuData = async () => {
    try {
      setLoading(true);
      const catRes = await menuService.getCategories();
      const itemRes = await menuService.getItems();
      
      setCategories(catRes.data || []);
      setItems(itemRes.data || []);
    } catch (e) {
      console.error(e);
      toast.error("❌ Failed to load menu details from database.");
    } finally {
      setLoading(false);
    }
  };

  const saveItem = async (item) => {
    if (!item.name || item.price === "") {
      toast.error("❌ Item name and price are required.");
      return;
    }
    
    try {
      const payload = {
        name: item.name,
        category_id: item.category_id || null,
        description: item.description || "",
        price: Number(item.price),
        photo_url: item.photo_url || "🍛",
        is_veg: item.is_veg,
        is_available: item.is_available,
        sort_order: 0,
      };

      if (item.id) {
        // Update item in database
        await menuService.updateItem(item.id, payload);
        toast.success("✅ Menu item successfully updated in database!");
      } else {
        // Create new item in database
        await menuService.createItem(payload);
        toast.success("✅ New item successfully created in database!");
      }
      setItemModal(null);
      loadMenuData(); // Reload menu
    } catch (e) {
      console.error(e);
      toast.error(e.message || "❌ Failed to save menu item.");
    }
  };

  const deleteItem = async (id) => {
    try {
      await menuService.deleteItem(id);
      toast.success("✅ Item deleted successfully from database.");
      setItemModal(null);
      loadMenuData();
    } catch (e) {
      console.error(e);
      toast.error("❌ Failed to delete menu item.");
    }
  };

  const toggleAvailability = async (item) => {
    try {
      const updatedAvailable = !item.is_available;
      await menuService.updateItem(item.id, { is_available: updatedAvailable });
      toast.success("✅ Availability toggled in database!");
      loadMenuData();
    } catch (e) {
      console.error(e);
      toast.error("❌ Failed to update availability.");
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 1 * 1024 * 1024) {
      return toast.error("❌ File size exceeds 1MB limit.");
    }

    const formData = new FormData();
    formData.append('photo', file);

    try {
      setUploadingPhoto(true);
      const res = await menuService.uploadItemPhoto(formData);
      setItemModal({ ...itemModal, photo_url: res.data.url });
      toast.success("✅ Photo uploaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "❌ Failed to upload photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const saveCat = async (cat) => {
    if (!cat.name) {
      toast.error("❌ Category name is required.");
      return;
    }

    try {
      const payload = {
        name: cat.name,
        sort_order: Number(cat.sort_order || 0),
      };

      if (cat.id) {
        await menuService.updateCategory(cat.id, payload);
        toast.success("✅ Category updated in database.");
      } else {
        await menuService.createCategory(payload);
        toast.success("✅ Category created in database.");
      }
      setCatModal(null);
      loadMenuData();
    } catch (e) {
      console.error(e);
      toast.error("❌ Failed to save category.");
    }
  };

  const deleteCat = async (id) => {
    try {
      await menuService.deleteCategory(id);
      toast.success("✅ Category deleted. Items moved to Uncategorized.");
      setCatModal(null);
      loadMenuData();
    } catch (e) {
      console.error(e);
      toast.error("❌ Failed to delete category.");
    }
  };

  return (
    <OwnerLayout pageTitle="🍽️ Menu Management">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="page-anim">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, marginBottom: 4 }}>Menu Management</h1>
            <p style={{ fontSize: 13, color: "#999" }}>Configure your restaurant catalog, menu items, pricing, and active categories.</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-secondary" onClick={() => setCatModal(BLANK_CAT)}>📂 + Category</button>
            <button className="btn-primary" onClick={() => setItemModal(BLANK_ITEM)}>🍔 + Add Dish</button>
          </div>
        </div>

        {/* Categories Section */}
        <div style={{ marginBottom: 26 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#E8650A", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>📂 Categories</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {categories.map(c => {
              const catItemsCount = items.filter(i => i.category_id === c.id).length;
              return (
                <div key={c.id} className="card" style={{ padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }} onClick={() => setCatModal(c)}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1A1A" }}>{c.name}</div>
                    <div style={{ fontSize: 10, color: "#bbb" }}>{catItemsCount} dish{catItemsCount !== 1 ? 'es' : ''}</div>
                  </div>
                  <span style={{ fontSize: 11, color: "#E8650A" }}>✏️</span>
                </div>
              );
            })}
            {categories.length === 0 && (
              <div style={{ fontSize: 12, color: "#bbb" }}>No active categories created. Click "+ Category" to begin.</div>
            )}
          </div>
        </div>

        {/* Items Listing */}
        <div className="card" style={{ padding: 22, overflowX: "auto" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#E8650A", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16 }}>🍽️ Menu Items Catalog</div>
          
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#bbb" }}>Loading menu from database...</div>
          ) : items.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f5ede5" }}>
                  {["Item Details", "Category", "Price", "Type", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 800, color: "#bbb", textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(item => {
                  const cat = categories.find(c => c.id === item.category_id);
                  return (
                    <tr key={item.id} className="table-row" style={{ borderBottom: "1px solid #f5ede5" }}>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          {item.photo_url && item.photo_url.startsWith('http') ? (
                            <img src={item.photo_url} alt={item.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                          ) : (
                            <span style={{ fontSize: 20 }}>{item.photo_url || "🍛"}</span>
                          )}
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1A1A" }}>{item.name}</div>
                            {item.description && <div style={{ fontSize: 10, color: "#999", marginTop: 2 }}>{item.description}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 12, color: "#666" }}>
                        {cat ? cat.name : <em style={{ color: "#bbb" }}>Uncategorized</em>}
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 800, color: "#1A1A1A" }}>₹{item.price}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: 9, fontWeight: 800, background: item.is_veg ? "rgba(46,204,113,0.12)" : "rgba(231,76,60,0.12)", color: item.is_veg ? "#2ecc71" : "#e74c3c", padding: "3px 6px", borderRadius: 5 }}>
                          {item.is_veg ? "🟢 VEG" : "🔴 NON-VEG"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <button onClick={() => toggleAvailability(item)}
                          style={{ border: "none", background: item.is_available ? "rgba(45,106,79,0.1)" : "rgba(192,57,43,0.1)", color: item.is_available ? "#2D6A4F" : "#c0392b", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                          {item.is_available ? "Available ✓" : "Sold Out ✗"}
                        </button>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <button onClick={() => setItemModal(item)} style={{ background: "none", border: "none", color: "#E8650A", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>✏️ Edit</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: "center", padding: "40px", color: "#bbb" }}>Your menu is completely empty. Click "+ Add Dish" to build your database!</div>
          )}
        </div>

        {/* --- DISH MODAL --- */}
        {itemModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div className="card" style={{ maxWidth: 500, width: "100%", padding: "26px", animation: "modalIn 0.25s ease-out" }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 800, marginBottom: 18 }}>{itemModal.id ? "🍔 Edit Menu Dish" : "🍔 Add New Menu Dish"}</div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#666", display: "block", marginBottom: 5 }}>Item Title *</label>
                  <input value={itemModal.name || ""} onChange={e => setItemModal({ ...itemModal, name: e.target.value })} placeholder="e.g. Butter Naan" style={inputStyle(!itemModal.name)} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#666", display: "block", marginBottom: 5 }}>Category</label>
                  <select value={itemModal.category_id || ""} onChange={e => setItemModal({ ...itemModal, category_id: e.target.value })} style={selectStyle}>
                    <option value="">Uncategorized</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#666", display: "block", marginBottom: 5 }}>Price (₹) *</label>
                  <input type="number" value={itemModal.price} onChange={e => setItemModal({ ...itemModal, price: e.target.value })} placeholder="180" style={inputStyle(itemModal.price === "")} />
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#666", display: "block", marginBottom: 5 }}>Description</label>
                <input value={itemModal.description || ""} onChange={e => setItemModal({ ...itemModal, description: e.target.value })} placeholder="Brief description of the item" style={inputStyle()} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 0.8fr", gap: 12, marginBottom: 20, alignItems: "center" }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#666", display: "block", marginBottom: 5 }}>Food Photo</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {itemModal.photo_url && itemModal.photo_url.startsWith('http') ? (
                      <img src={itemModal.photo_url} alt="Preview" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: 24 }}>{itemModal.photo_url || "🍛"}</span>
                    )}
                    <label style={{ cursor: "pointer", background: "#f5ede5", color: "#E8650A", padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
                      {uploadingPhoto ? "..." : "Upload"}
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} disabled={uploadingPhoto} />
                    </label>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 15 }}>
                  <input type="checkbox" id="isVeg" checked={itemModal.is_veg} onChange={e => setItemModal({ ...itemModal, is_veg: e.target.checked })} style={{ cursor: "pointer" }} />
                  <label htmlFor="isVeg" style={{ fontSize: 12, fontWeight: 700, color: "#333", cursor: "pointer" }}>Is Vegetarian?</label>
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 15 }}>
                  <input type="checkbox" id="isAvailable" checked={itemModal.is_available} onChange={e => setItemModal({ ...itemModal, is_available: e.target.checked })} style={{ cursor: "pointer" }} />
                  <label htmlFor="isAvailable" style={{ fontSize: 12, fontWeight: 700, color: "#333", cursor: "pointer" }}>In Stock?</label>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setItemModal(null)}>Cancel</button>
                {itemModal.id && (
                  <button className="btn-secondary" style={{ flex: 1, borderColor: "#e74c3c", color: "#e74c3c" }} onClick={() => deleteItem(itemModal.id)}>🗑 Delete</button>
                )}
                <button className="btn-primary" style={{ flex: 1.5 }} onClick={() => saveItem(itemModal)}>💾 Save Dish</button>
              </div>
            </div>
          </div>
        )}

        {/* --- CATEGORY MODAL --- */}
        {catModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div className="card" style={{ maxWidth: 440, width: "100%", padding: "26px", animation: "modalIn 0.25s ease-out" }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 800, marginBottom: 18 }}>{catModal.id ? "📂 Edit Category" : "📂 Add New Category"}</div>
              
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#666", display: "block", marginBottom: 5 }}>Category Name *</label>
                <input value={catModal.name || ""} onChange={e => setCatModal({ ...catModal, name: e.target.value })} placeholder="e.g. Main Course" style={inputStyle(!catModal.name)} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#666", display: "block", marginBottom: 5 }}>Sorting Order Weight (Numeric)</label>
                <input type="number" value={catModal.sort_order || 0} onChange={e => setCatModal({ ...catModal, sort_order: e.target.value })} placeholder="0" style={inputStyle()} />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setCatModal(null)}>Cancel</button>
                {catModal.id && (
                  <button className="btn-secondary" style={{ flex: 1, borderColor: "#e74c3c", color: "#e74c3c" }} onClick={() => deleteCat(catModal.id)}>🗑 Delete</button>
                )}
                <button className="btn-primary" style={{ flex: 1.5 }} onClick={() => saveCat(catModal)}>💾 Save Category</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}
