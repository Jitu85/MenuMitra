import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import toast, { Toaster } from "react-hot-toast";

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
  en: {
    scanOrder: "Scan & Order",
    selectTable: "Select Your Table",
    tableLabel: "Table Number",
    tablePlaceholder: "Choose table…",
    yourName: "Your Name (Optional)",
    namePlaceholder: "e.g. Rahul",
    notes: "Special Instructions",
    notesPlaceholder: "Any allergies or requests…",
    addToCart: "Add",
    cart: "Your Order",
    emptyCart: "Your cart is empty",
    emptyCartSub: "Add items from the menu above",
    subtotal: "Subtotal",
    placeOrder: "Place Order",
    payNow: "Pay Now",
    choosePayment: "Choose Payment Method",
    payUpi: "Pay via UPI QR",
    payRazorpay: "Pay via Razorpay",
    upiInstructions: "Scan the QR code below using any UPI app",
    upiId: "UPI ID",
    iHavePaid: "I Have Paid ✓",
    orderPlaced: "Order Placed!",
    orderConfirmed: "Payment Confirmed",
    orderNumber: "Order Number",
    thankYou: "Thank you for ordering!",
    thankYouSub: "Your order has been received. Food is being prepared.",
    items: "items",
    veg: "VEG",
    nonVeg: "NON-VEG",
    popular: "Popular",
    search: "Search dishes…",
    allDay: "All Day Menu",
    tableRequired: "Please select a table number before placing your order.",
    processing: "Processing…",
    orderSummary: "Order Summary",
    backToMenu: "← Back to Menu",
    newOrder: "Place New Order",
    tableNo: "Table No.",
    total: "Total",
  },
  hi: {
    scanOrder: "स्कैन और ऑर्डर करें",
    selectTable: "अपनी मेज चुनें",
    tableLabel: "मेज नंबर",
    tablePlaceholder: "मेज चुनें…",
    yourName: "आपका नाम (वैकल्पिक)",
    namePlaceholder: "जैसे राहुल",
    notes: "विशेष निर्देश",
    notesPlaceholder: "कोई एलर्जी या अनुरोध…",
    addToCart: "जोड़ें",
    cart: "आपका ऑर्डर",
    emptyCart: "आपकी कार्ट खाली है",
    emptyCartSub: "ऊपर मेनू से आइटम जोड़ें",
    subtotal: "कुल राशि",
    placeOrder: "ऑर्डर करें",
    payNow: "भुगतान करें",
    choosePayment: "भुगतान का तरीका चुनें",
    payUpi: "UPI QR से भुगतान",
    payRazorpay: "Razorpay से भुगतान",
    upiInstructions: "किसी भी UPI ऐप से नीचे दिया QR स्कैन करें",
    upiId: "UPI आईडी",
    iHavePaid: "मैंने भुगतान कर दिया ✓",
    orderPlaced: "ऑर्डर हो गया!",
    orderConfirmed: "भुगतान की पुष्टि हुई",
    orderNumber: "ऑर्डर नंबर",
    thankYou: "ऑर्डर के लिए धन्यवाद!",
    thankYouSub: "आपका ऑर्डर मिल गया है। खाना तैयार हो रहा है।",
    items: "आइटम",
    veg: "शाकाहारी",
    nonVeg: "मांसाहारी",
    popular: "लोकप्रिय",
    search: "व्यंजन खोजें…",
    allDay: "पूरे दिन का मेनू",
    tableRequired: "ऑर्डर देने से पहले कृपया मेज नंबर चुनें।",
    processing: "प्रक्रिया हो रही है…",
    orderSummary: "ऑर्डर सारांश",
    backToMenu: "← मेनू पर वापस",
    newOrder: "नया ऑर्डर करें",
    tableNo: "मेज नं.",
    total: "कुल",
  }
};

export default function CustomerMenu() {
  const { slug } = useParams();
  const [lang, setLang] = useState("en");
  const t = T[lang];

  // Menu states
  const [business, setBusiness] = useState({
    name: "Sharma's Dhaba",
    nameHi: "शर्मा का ढाबा",
    tagline: "Home-style food with love",
    taglineHi: "घर जैसा खाना, प्यार के साथ",
    city: "Patna",
    state: "Bihar",
    tableCount: 12,
    paymentPref: "both",
    upiId: "ramesh@upi",
    slug: slug || "sharmas-dhaba-patna",
  });

  const [categories, setCategories] = useState([
    { id: "all", nameEn: "All", nameHi: "सभी" },
    { id: "CAT1", nameEn: "Main Course", nameHi: "मुख्य व्यंजन" },
    { id: "CAT2", nameEn: "Breads", nameHi: "रोटी" },
    { id: "CAT3", nameEn: "Beverages", nameHi: "पेय पदार्थ" },
    { id: "CAT4", nameEn: "Starters", nameHi: "स्टार्टर" },
    { id: "CAT5", nameEn: "Desserts", nameHi: "मिठाई" },
  ]);

  const [items, setItems] = useState([
    { id: "I1", cat: "CAT1", nameEn: "Dal Makhani", nameHi: "दाल मखनी", descEn: "Creamy black lentil curry", descHi: "मलाईदार काली दाल करी", price: 180, veg: true, photo: "🍛", popular: true },
    { id: "I2", cat: "CAT1", nameEn: "Paneer Butter Masala", nameHi: "पनीर बटर मसाला", descEn: "Cottage cheese in rich tomato gravy", descHi: "पनीर टमाटर की ग्रेवी", price: 220, veg: true, photo: "🧆", popular: true },
    { id: "I3", cat: "CAT1", nameEn: "Chicken Curry", nameHi: "चिकन करी", descEn: "Traditional homestyle chicken curry", descHi: "देसी चिकन करी", price: 280, veg: false, photo: "🍗", popular: false },
    { id: "I4", cat: "CAT1", nameEn: "Mutton Rogan Josh", nameHi: "मटन रोगन जोश", descEn: "Slow-cooked mutton in aromatic spices", descHi: "मसालेदार मटन", price: 380, veg: false, photo: "🥘", popular: false },
    { id: "I5", cat: "CAT2", nameEn: "Butter Naan", nameHi: "बटर नान", descEn: "Soft leavened bread with butter", descHi: "मक्खन के साथ नरम नान", price: 40, veg: true, photo: "🫓", popular: true },
    { id: "I6", cat: "CAT2", nameEn: "Tandoori Roti", nameHi: "तंदूरी रोटी", descEn: "Whole wheat bread from tandoor", descHi: "तंदूर की गेहूं की रोटी", price: 25, veg: true, photo: "🫓", popular: false },
    { id: "I8", cat: "CAT3", nameEn: "Masala Chai", nameHi: "मसाला चाय", descEn: "Indian spiced milk tea", descHi: "भारतीय मसाला चाय", price: 30, veg: true, photo: "☕", popular: true },
    { id: "I9", cat: "CAT3", nameEn: "Lassi (Sweet)", nameHi: "मीठी लस्सी", descEn: "Chilled sweet yoghurt drink", descHi: "ठंडी मीठी लस्सी", price: 60, veg: true, photo: "🥛", popular: false },
    { id: "I11", cat: "CAT4", nameEn: "Paneer Tikka", nameHi: "पनीर टिक्का", descEn: "Grilled cottage cheese with spices", descHi: "मसालेदार ग्रिल्ड पनीर", price: 240, veg: true, photo: "🧆", popular: true },
    { id: "I13", cat: "CAT5", nameEn: "Gulab Jamun", nameHi: "गुलाब जामुन", descEn: "Soft milk dumplings in sugar syrup", descHi: "चाशनी में मीठे गुलाब जामुन", price: 80, veg: true, photo: "🍮", popular: false },
  ]);

  // Loading and error states
  const [loading, setLoading] = useState(true);

  // Cart & UI states
  const [activeCat, setActiveCat] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [cart, setCart] = useState({});
  const [tableNumber, setTableNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [specialNotes, setSpecialNotes] = useState(""); // eslint-disable-line no-unused-vars
  
  // Checkout flow states
  const [checkoutStep, setCheckoutStep] = useState("menu"); // menu | cart | pay | success
  const [paymentMethod, setPaymentMethod] = useState(""); // eslint-disable-line no-unused-vars
  const [completedOrder, setCompletedOrder] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    // Fetch dynamic menu details
    async function loadMenu() {
      try {
        setLoading(true);
        const res = await api.get(`/public/menu/${slug}`);
        if (res.data && res.data.id) {
          const data = res.data;
          setBusiness({
            id: data.id,
            name: data.businessName,
            nameHi: data.businessName,
            tagline: data.businessType ? `Authentic ${data.businessType}` : "Delicious freshly made food",
            taglineHi: data.businessType ? `${data.businessType} का असली स्वाद` : "स्वादिष्ट ताज़ा भोजन",
            city: data.city,
            state: data.state || "",
            tableCount: data.tableCount || 12,
            paymentPref: data.paymentMethodPref || "both",
            upiId: data.upiId || "ramesh@upi",
            slug: slug,
          });

          if (data.categories && data.categories.length > 0) {
            const serverCats = data.categories.map(c => ({
              id: c.id,
              nameEn: c.nameEn,
              nameHi: c.nameHi
            }));
            setCategories([{ id: "all", nameEn: "All", nameHi: "सभी" }, ...serverCats]);

            // Flatten all food items inside the categories
            const serverItems = [];
            data.categories.forEach(c => {
              if (c.items && c.items.length > 0) {
                c.items.forEach(item => {
                  serverItems.push({
                    id: item.id,
                    cat: c.id,
                    nameEn: item.nameEn,
                    nameHi: item.nameHi,
                    descEn: item.descriptionEn || "",
                    descHi: item.descriptionHi || "",
                    price: parseFloat(item.price),
                    veg: item.isVeg,
                    photo: item.photoUrl || "🍛",
                    popular: item.isAvailable
                  });
                });
              }
            });
            setItems(serverItems);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch menu from server, using local fallback Sharma's Dhaba.", err);
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      loadMenu();
    } else {
      setLoading(false);
    }
  }, [slug]);

  const addToCart = (itemId) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
    toast.success("Dish added to your order!");
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const updated = { ...prev };
      if (updated[itemId] <= 1) {
        delete updated[itemId];
      } else {
        updated[itemId] -= 1;
      }
      return updated;
    });
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((sum, [itemId, qty]) => {
      const item = items.find(i => i.id === itemId);
      return sum + (item ? item.price * qty : 0);
    }, 0);
  };

  const getCartCount = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const handlePlaceOrder = () => {
    if (!tableNumber) {
      toast.error(t.tableRequired);
      return;
    }
    setCheckoutStep("pay");
  };

  const handleConfirmPayment = async (method) => {
    setPlacingOrder(true);
    setPaymentMethod(method);

    const orderItems = Object.entries(cart).map(([itemId, qty]) => {
      const item = items.find(i => i.id === itemId);
      return {
        id: itemId,
        nameEn: item.nameEn,
        nameHi: item.nameHi,
        price: item.price,
        qty: qty
      };
    });

    const total = getCartTotal();

    const newOrderPayload = {
      owner_id: business.id,
      table_number: tableNumber,
      customer_name: customerName || "Guest",
      payment_method: method,
      items: orderItems.map(item => ({
        food_item_id: item.id,
        quantity: item.qty,
        unit_price: item.price
      })),
      notes: specialNotes,
      language_used: lang
    };

    try {
      // Post to Express backend
      const res = await api.post('/orders', newOrderPayload);
      const generatedOrder = {
        id: res.data.order?.id || `ORD-${Date.now()}`,
        orderNumber: res.data.order?.order_number || "ORD-PENDING",
        tableNumber: tableNumber,
        items: orderItems,
        total: total,
        paymentMethod: method,
        customerName: customerName || "Guest",
        notes: specialNotes
      };
      setCompletedOrder(generatedOrder);
      setCart({});
      setCheckoutStep("success");
      toast.success("Order Placed Successfully!");
    } catch (error) {
      console.error("Express order placement failed. Simulating local fallback flow...", error);
      // Fallback local simulation for demo purposes
      const simulatedOrder = {
        id: `ORD-${Date.now()}`,
        orderNumber: `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`,
        tableNumber: tableNumber,
        items: orderItems,
        total: total,
        paymentMethod: method,
        customerName: customerName || "Guest",
        notes: specialNotes
      };
      setCompletedOrder(simulatedOrder);
      setCart({});
      setCheckoutStep("success");
      toast.success("Order simulated successfully (local demo fall-back)!");
    } finally {
      setPlacingOrder(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchCat = activeCat === "all" || item.cat === activeCat;
    const matchSearch = !searchQuery || 
      item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.nameHi.includes(searchQuery);
    const matchVeg = !vegOnly || item.veg;
    return matchCat && matchSearch && matchVeg;
  });

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#0F0F0F", display: "flex", justifyContent: "center", alignItems: "center", color: "white" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "40px", marginBottom: "16px", animation: "spin 2s linear infinite" }}>⏳</div>
          <div style={{ fontSize: "16px", fontWeight: "bold" }}>Preparing Bilingual Menu...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFFAF5", color: "#1C1C1E", fontFamily: "'DM Sans', sans-serif" }}>
      <Toaster position="bottom-center" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        
        .cat-pill {
          padding: 8px 18px;
          border-radius: 50px;
          background: white;
          border: 1.5px solid #f0e8df;
          color: #666;
          cursor: pointer;
          font-weight: 700;
          font-size: 13px;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .cat-pill.active {
          background: #E8650A;
          color: white;
          border-color: #E8650A;
          box-shadow: 0 4px 12px rgba(232, 101, 10, 0.3);
        }
        .item-card {
          background: white;
          border-radius: 16px;
          border: 1px solid #f5ede5;
          padding: 16px;
          display: flex;
          gap: 16px;
          align-items: center;
          transition: transform 0.2s ease;
        }
        .item-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(232, 101, 10, 0.05);
        }
        .badge-veg {
          border: 2px solid #2D6A4F;
          border-radius: 3px;
          width: 14px;
          height: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .badge-veg-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #2D6A4F;
        }
        .badge-nonveg {
          border: 2px solid #c0392b;
          border-radius: 3px;
          width: 14px;
          height: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .badge-nonveg-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #c0392b;
        }
      `}</style>

      {/* Header Banner */}
      <header style={{ background: "linear-gradient(135deg, #E8650A, #C9920A)", color: "white", padding: "24px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255, 255, 255, 0.75)" }}>{t.scanOrder}</span>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 900, lineHeight: 1.1, margin: "4px 0 2px" }}>
            {lang === "hi" ? business.nameHi : business.name}
          </h1>
          <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.85)" }}>
            {lang === "hi" ? business.taglineHi : business.tagline}
          </p>
        </div>
        <button onClick={() => setLang(lang === "en" ? "hi" : "en")} style={{ border: "1px solid rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.15)", color: "white", padding: "6px 14px", borderRadius: "50px", fontWeight: 800, cursor: "pointer", fontSize: "12px" }}>
          🌐 {lang === "en" ? "हिंदी" : "English"}
        </button>
      </header>

      {/* RENDER SUCCESS RECEIPT */}
      {checkoutStep === "success" && completedOrder && (
        <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ width: "100%", maxWidth: "420px", background: "white", borderRadius: "20px", border: "1px solid #f0e8df", boxShadow: "0 10px 30px rgba(0,0,0,0.06)", padding: "30px", textAlign: "center" }}>
            <div style={{ fontSize: "50px", marginBottom: "16px" }}>🎉</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: 900, color: "#2D6A4F", marginBottom: "8px" }}>{t.orderPlaced}</h2>
            <p style={{ fontSize: "13px", color: "#666", lineHeight: 1.6, marginBottom: "20px" }}>{t.thankYouSub}</p>
            
            <div style={{ background: "#FFFAF5", borderRadius: "12px", padding: "16px", border: "1.5px dashed #E8650A", textAlign: "left", marginBottom: "20px" }}>
              <div style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>ORDER SUMMARY</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}>
                <span>{t.tableNo} {completedOrder.tableNumber}</span>
                <span>{completedOrder.orderNumber}</span>
              </div>
              <div style={{ height: "1px", background: "#f0e8df", margin: "10px 0" }} />
              {completedOrder.items.map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", margin: "4px 0" }}>
                  <span>{lang === "hi" ? item.nameHi : item.nameEn} x {item.qty}</span>
                  <span style={{ fontWeight: 700 }}>₹{item.price * item.qty}</span>
                </div>
              ))}
              <div style={{ height: "1px", background: "#f0e8df", margin: "10px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: 800 }}>
                <span>{t.total}</span>
                <span style={{ color: "#E8650A" }}>₹{completedOrder.total}</span>
              </div>
            </div>

            <button onClick={() => setCheckoutStep("menu")} style={{ width: "100%", background: "#E8650A", border: "none", color: "white", padding: "12px", borderRadius: "50px", fontWeight: 800, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              {t.newOrder}
            </button>
            <div style={{ fontSize: "10px", color: "#bbb", marginTop: "14px" }}>
              Developed by Abhijit Kumar Misra
            </div>
          </div>
        </div>
      )}

      {/* RENDER CHOOSE PAYMENT */}
      {checkoutStep === "pay" && (
        <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ width: "100%", maxWidth: "420px", background: "white", borderRadius: "20px", border: "1px solid #f0e8df", boxShadow: "0 10px 30px rgba(0,0,0,0.06)", padding: "30px" }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 900, marginBottom: "20px", textAlign: "center" }}>{t.choosePayment}</h2>
            <div style={{ fontSize: "22px", fontWeight: 900, color: "#E8650A", textAlign: "center", marginBottom: "24px" }}>Total: ₹{getCartTotal()}</div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* UPI PAY SIMULATOR */}
              <button onClick={() => handleConfirmPayment("upi")} disabled={placingOrder} style={{ display: "flex", alignItems: "center", justifyItems: "center", gap: 12, padding: "14px", background: "#FFFAF5", border: "1.5px solid #f0e8df", borderRadius: "12px", cursor: "pointer", textAlign: "left" }}>
                <span style={{ fontSize: "28px" }}>📱</span>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#1A1A1A" }}>{t.payUpi}</div>
                  <div style={{ fontSize: "11px", color: "#888" }}>Scan and pay directly using any UPI app</div>
                </div>
              </button>

              {/* RAZORPAY PAY GATEWAY SIMULATOR */}
              <button onClick={() => handleConfirmPayment("razorpay")} disabled={placingOrder} style={{ display: "flex", alignItems: "center", justifyItems: "center", gap: 12, padding: "14px", background: "#FFFAF5", border: "1.5px solid #f0e8df", borderRadius: "12px", cursor: "pointer", textAlign: "left" }}>
                <span style={{ fontSize: "28px" }}>💳</span>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#1A1A1A" }}>{t.payRazorpay}</div>
                  <div style={{ fontSize: "11px", color: "#888" }}>Secure payment with cards, net banking or wallets</div>
                </div>
              </button>
            </div>

            <button onClick={() => setCheckoutStep("menu")} style={{ width: "100%", marginTop: "24px", background: "none", border: "none", color: "#888", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              {t.backToMenu}
            </button>
          </div>
        </div>
      )}

      {/* MAIN MENU TAB */}
      {checkoutStep === "menu" && (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", paddingBottom: "100px" }}>
          
          {/* Table select & Custom details */}
          <div style={{ background: "white", borderRadius: "16px", border: "1px solid #f5ede5", padding: "18px", marginBottom: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "#888", display: "block", marginBottom: "6px" }}>{t.tableLabel} *</label>
              <select value={tableNumber} onChange={e => setTableNumber(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #f0e8df", borderRadius: "8px", outline: "none", fontSize: "13px" }}>
                <option value="">{t.tablePlaceholder}</option>
                {Array.from({ length: business.tableCount }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num.toString()}>Table {num}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "#888", display: "block", marginBottom: "6px" }}>{t.yourName}</label>
              <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder={t.namePlaceholder} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #f0e8df", borderRadius: "8px", outline: "none", fontSize: "13px" }} />
            </div>
          </div>

          {/* Search bar & Veg Only toggle */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px", alignItems: "center" }}>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t.search} style={{ flex: 1, padding: "10px 14px", border: "1.5px solid #f0e8df", borderRadius: "10px", outline: "none", fontSize: "13px" }} />
            <button onClick={() => setVegOnly(!vegOnly)} style={{ background: vegOnly ? "#2D6A4F" : "white", color: vegOnly ? "white" : "#2D6A4F", border: "1.5px solid #2D6A4F", padding: "10px 16px", borderRadius: "10px", fontWeight: 800, fontSize: "12px", cursor: "pointer" }}>
              🌱 Veg Only
            </button>
          </div>

          {/* Categories Horizontal Scroller */}
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "12px", marginBottom: "20px" }}>
            {categories.map(c => (
              <button key={c.id} className={`cat-pill ${activeCat === c.id ? 'active' : ''}`} onClick={() => setActiveCat(c.id)}>
                {lang === "hi" ? c.nameHi : c.nameEn}
              </button>
            ))}
          </div>

          {/* Food items grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filteredItems.map(item => {
              const qty = cart[item.id] || 0;
              return (
                <div key={item.id} className="item-card">
                  <div style={{ fontSize: "36px", width: "56px", height: "56px", background: "#FFFAF5", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>{item.photo}</div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div className={item.veg ? "badge-veg" : "badge-nonveg"}>
                        <div className={item.veg ? "badge-veg-dot" : "badge-nonveg-dot"} />
                      </div>
                      <span style={{ fontSize: "14px", fontWeight: 800 }}>{lang === "hi" ? item.nameHi : item.nameEn}</span>
                      {item.popular && (
                        <span style={{ background: "rgba(232,101,10,0.12)", color: "#E8650A", fontSize: "9px", padding: "2px 6px", borderRadius: "4px", fontWeight: 800 }}>{t.popular}</span>
                      )}
                    </div>
                    <p style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>
                      {lang === "hi" ? item.descHi : item.descEn}
                    </p>
                    <div style={{ fontSize: "14px", fontWeight: 900, color: "#E8650A", marginTop: "6px" }}>₹{item.price}</div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {qty > 0 ? (
                      <div style={{ display: "flex", alignItems: "center", background: "#FFFAF5", border: "1.5px solid #f0e8df", borderRadius: "50px", overflow: "hidden" }}>
                        <button onClick={() => removeFromCart(item.id)} style={{ border: "none", background: "none", color: "#E8650A", padding: "6px 12px", cursor: "pointer", fontWeight: 900 }}>-</button>
                        <span style={{ fontSize: "12px", fontWeight: 800, minWidth: "16px", textAlign: "center" }}>{qty}</span>
                        <button onClick={() => addToCart(item.id)} style={{ border: "none", background: "none", color: "#E8650A", padding: "6px 12px", cursor: "pointer", fontWeight: 900 }}>+</button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(item.id)} style={{ background: "#E8650A", color: "white", border: "none", padding: "8px 18px", borderRadius: "50px", fontWeight: 800, fontSize: "12px", cursor: "pointer" }}>
                        + {t.addToCart}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Floating Cart Drawer Indicator */}
      {getCartCount() > 0 && checkoutStep === "menu" && (
        <div style={{ position: "fixed", bottom: "16px", left: "50%", transform: "translateX(-50%)", width: "90%", maxWidth: "500px", zIndex: 90 }}>
          <div style={{ background: "linear-gradient(135deg, #1C1C1E, #2A2A2E)", color: "white", padding: "16px 20px", borderRadius: "50px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>{getCartCount()} {t.items} added</div>
              <div style={{ fontSize: "16px", fontWeight: 900, color: "#E8650A" }}>Subtotal: ₹{getCartTotal()}</div>
            </div>
            <button onClick={handlePlaceOrder} style={{ background: "linear-gradient(135deg, #E8650A, #C9920A)", border: "none", color: "white", padding: "10px 24px", borderRadius: "50px", fontWeight: 800, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              {t.placeOrder} →
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
