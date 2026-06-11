import { useState, useRef } from "react";

const DEFAULT_FLOWERS = [
  { id: 1, name: "Rose", price: 3.99, photo: null, emoji: "🌹" },
  { id: 2, name: "Tulip", price: 3.49, photo: null, emoji: "🌷" },
  { id: 3, name: "Sunflower", price: 5.99, photo: null, emoji: "🌻" },
  { id: 4, name: "Lily", price: 6.49, photo: null, emoji: "💐" },
  { id: 5, name: "Daisy", price: 2.99, photo: null, emoji: "🌼" },
  { id: 6, name: "Orchid", price: 8.99, photo: null, emoji: "🪷" },
];

const DEFAULT_CONTAINERS = [
  { id: "c1", name: "Vase", price: 8.0, emoji: "🏺" },
  { id: "c2", name: "Basket", price: 12.0, emoji: "🧺" },
  { id: "c3", name: "Wrapped", price: 3.5, emoji: "🎁" },
];

export default function FlowerCalculator() {
  const [flowers, setFlowers] = useState(DEFAULT_FLOWERS);
  const [containers, setContainers] = useState(DEFAULT_CONTAINERS);
  const [cart, setCart] = useState([]); // { id, name, price, emoji/photo, type, qty }
  const [selected, setSelected] = useState(null); // item being keyed in
  const [qtyInput, setQtyInput] = useState("");

  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState("flowers"); // "flowers" | "containers"
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editPhoto, setEditPhoto] = useState(null);

  // Add item modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState("");
  const [addPrice, setAddPrice] = useState("");
  const [addPhoto, setAddPhoto] = useState(null);
  const [addEmoji, setAddEmoji] = useState("");

  const fileRef = useRef();
  const addFileRef = useRef();

  // ── calculator logic ────────────────────────────────────────
  const handleItemTap = (item) => {
    if (selected?.id === item.id && qtyInput === "") {
      commitToCart(item, 1);
      return;
    }
    setSelected(item);
    setQtyInput("");
  };

  const handleDigit = (d) => {
    if (!selected) return;
    setQtyInput((p) => (p === "0" ? d : p + d).slice(0, 3));
  };
  const handleBack = () => {
    if (!selected) return;
    setQtyInput((p) => p.slice(0, -1));
  };
  const handleConfirm = () => {
    if (!selected) return;
    commitToCart(selected, parseInt(qtyInput) || 1);
  };
  const handleClear = () => {
    setSelected(null);
    setQtyInput("");
  };

  const commitToCart = (item, qty) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.id === item.id);
      if (ex)
        return prev.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + qty } : i,
        );
      return [...prev, { ...item, qty }];
    });
    setSelected(null);
    setQtyInput("");
  };

  const removeOne = (id) => {
    setCart((prev) => {
      const item = prev.find((i) => i.id === id);
      if (!item) return prev;
      if (item.qty === 1) return prev.filter((i) => i.id !== id);
      return prev.map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i));
    });
  };

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const pendingTotal = selected
    ? (parseInt(qtyInput) || 1) * selected.price
    : 0;
  const displayLine = selected
    ? `${selected.name}  ×  ${qtyInput || "1"}  =  $${pendingTotal.toFixed(2)}`
    : cart.length === 0
      ? "Select a flower or container…"
      : `Total  $${total.toFixed(2)}`;

  // ── settings helpers ────────────────────────────────────────
  const isFlowerTab = settingsTab === "flowers";
  const editList = isFlowerTab ? flowers : containers;

  const openEdit = (item) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPrice(String(item.price));
    setEditPhoto(item.photo ?? null);
  };

  const saveEdit = () => {
    const price = parseFloat(editPrice) || 0;
    const update = (list) =>
      list.map((f) =>
        f.id === editingId
          ? { ...f, name: editName, price, photo: editPhoto ?? f.photo }
          : f,
      );
    if (isFlowerTab) setFlowers(update);
    else setContainers(update);
    setCart((prev) =>
      prev.map((i) =>
        i.id === editingId
          ? { ...i, name: editName, price, photo: editPhoto ?? i.photo }
          : i,
      ),
    );
    if (selected?.id === editingId)
      setSelected((s) => ({
        ...s,
        name: editName,
        price,
        photo: editPhoto ?? s.photo,
      }));
    setEditingId(null);
  };

  const deleteItem = (id) => {
    if (isFlowerTab) setFlowers((p) => p.filter((f) => f.id !== id));
    else setContainers((p) => p.filter((c) => c.id !== id));
    setCart((p) => p.filter((i) => i.id !== id));
    if (selected?.id === id) handleClear();
    if (editingId === id) setEditingId(null);
  };

  const openAddModal = () => {
    setAddName("");
    setAddPrice("");
    setAddPhoto(null);
    setAddEmoji(isFlowerTab ? "🌸" : "📦");
    setShowAddModal(true);
  };

  const confirmAdd = () => {
    if (!addName.trim()) return;
    const id = `${isFlowerTab ? "f" : "c"}${Date.now()}`;
    const newItem = {
      id,
      name: addName.trim(),
      price: parseFloat(addPrice) || 0,
      photo: addPhoto,
      emoji: addEmoji || (isFlowerTab ? "🌸" : "📦"),
      type: isFlowerTab ? "flower" : "container",
    };
    if (isFlowerTab) setFlowers((p) => [...p, newItem]);
    else setContainers((p) => [...p, newItem]);
    setShowAddModal(false);
  };

  const handleAddPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAddPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setEditPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const numPad = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", "⌫", "✓"];

  return (
    <div style={s.page}>
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=DM+Sans:wght@300;400;500&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.headerTitle}>Bloom & Co.</div>
          <div style={s.headerSub}>Point of Sale</div>
        </div>
        <button
          style={s.settingsBtn}
          onClick={() => {
            setShowSettings(true);
            setSettingsTab("flowers");
          }}
        >
          <SettingsIcon />
        </button>
      </div>

      {/* Display bar */}
      <div style={s.displayBar}>
        <div style={{ ...s.displayText, ...(selected ? s.displayActive : {}) }}>
          {displayLine}
        </div>
        {selected && (
          <button style={s.displayClear} onClick={handleClear}>
            ✕
          </button>
        )}
      </div>

      {/* Body */}
      <div style={s.body}>
        {/* Left: flowers + containers */}
        <div style={s.leftCol}>
          <div style={s.sectionLabel}>Flowers</div>
          <div style={s.flowerGrid}>
            {flowers.map((flower) => {
              const inCart = cart.find((i) => i.id === flower.id)?.qty || 0;
              const isSel = selected?.id === flower.id;
              return (
                <ItemButton
                  key={flower.id}
                  item={flower}
                  inCart={inCart}
                  isSelected={isSel}
                  onTap={handleItemTap}
                  size="flower"
                />
              );
            })}
          </div>
        </div>

        {/* Right: numpad + containers */}
        <div style={s.rightCol}>
          {/* Numpad */}
          <div style={s.numpad}>
            {numPad.map((key) => {
              const isConfirm = key === "✓";
              const isBack = key === "⌫";
              const disabled = !selected;
              return (
                <button
                  key={key}
                  disabled={disabled}
                  style={{
                    ...s.numKey,
                    ...(isConfirm ? s.numKeyConfirm : {}),
                    ...(isBack ? s.numKeyBack : {}),
                    ...(disabled ? s.numKeyDisabled : {}),
                  }}
                  onClick={() =>
                    isConfirm
                      ? handleConfirm()
                      : isBack
                        ? handleBack()
                        : handleDigit(key)
                  }
                >
                  {key}
                </button>
              );
            })}
          </div>

          {/* Containers */}
          <div style={s.sectionLabel}>Containers</div>
          <div style={s.containerGrid}>
            {containers.map((c) => {
              const inCart = cart.find((i) => i.id === c.id)?.qty || 0;
              const isSel = selected?.id === c.id;
              return (
                <ItemButton
                  key={c.id}
                  item={c}
                  inCart={inCart}
                  isSelected={isSel}
                  onTap={handleItemTap}
                  size="container"
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Order summary */}
      <div style={s.cartPanel}>
        <div style={s.cartHeader}>
          <div style={s.cartTitle}>Order</div>
          {cart.length > 0 && (
            <button style={s.clearAll} onClick={() => setCart([])}>
              Clear all
            </button>
          )}
        </div>
        {cart.length === 0 ? (
          <div style={s.cartEmpty}>No items yet</div>
        ) : (
          <div style={s.cartList}>
            {cart.map((item) => (
              <div key={item.id} style={s.cartRow}>
                <span style={s.cartEmoji}>
                  {item.photo ? (
                    <img src={item.photo} alt="" style={s.cartThumb} />
                  ) : (
                    item.emoji
                  )}
                </span>
                <span style={s.cartName}>{item.name}</span>
                <span style={s.cartQty}>×{item.qty}</span>
                <span style={s.cartAmt}>
                  ${(item.price * item.qty).toFixed(2)}
                </span>
                <button style={s.removeBtn} onClick={() => removeOne(item.id)}>
                  −
                </button>
              </div>
            ))}
          </div>
        )}
        {cart.length > 0 && (
          <>
            <div style={s.divider} />
            <div style={s.totalRow}>
              <span style={s.totalLabel}>Total</span>
              <span style={s.totalAmt}>${total.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>

      {/* Settings modal */}
      {showSettings && (
        <div
          style={s.overlay}
          onClick={() => {
            setShowSettings(false);
            setEditingId(null);
          }}
        >
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>Settings</div>
              <button
                style={s.closeBtn}
                onClick={() => {
                  setShowSettings(false);
                  setEditingId(null);
                }}
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div style={s.tabs}>
              {["flowers", "containers"].map((tab) => (
                <button
                  key={tab}
                  style={{
                    ...s.tab,
                    ...(settingsTab === tab ? s.tabActive : {}),
                  }}
                  onClick={() => {
                    setSettingsTab(tab);
                    setEditingId(null);
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div style={s.flowerList}>
              {editList.map((item) => (
                <div key={item.id} style={s.listItem}>
                  {editingId === item.id ? (
                    <div style={s.editForm}>
                      <div
                        style={s.photoUploadArea}
                        onClick={() => fileRef.current.click()}
                      >
                        {editPhoto ? (
                          <img src={editPhoto} alt="" style={s.editPhotoFull} />
                        ) : (
                          <span style={{ fontSize: 40 }}>{item.emoji}</span>
                        )}
                        <div style={s.photoHint}>Tap to change photo</div>
                        <input
                          ref={fileRef}
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={handlePhotoUpload}
                        />
                      </div>
                      <input
                        style={s.editInput}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Name"
                      />
                      <div style={s.priceRow}>
                        <span style={s.dollar}>$</span>
                        <input
                          style={{ ...s.editInput, flex: 1 }}
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Price"
                        />
                      </div>
                      <div style={s.editActions}>
                        <button style={s.saveBtn} onClick={saveEdit}>
                          Save
                        </button>
                        <button
                          style={s.cancelBtn}
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </button>
                        <button
                          style={s.deleteBtn}
                          onClick={() => deleteItem(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={s.listRow}>
                      <div style={s.listLeft}>
                        <div style={s.listThumb}>
                          {item.photo ? (
                            <img
                              src={item.photo}
                              alt=""
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: 10,
                              }}
                            />
                          ) : (
                            <span style={{ fontSize: 26 }}>{item.emoji}</span>
                          )}
                        </div>
                        <div>
                          <div style={s.listName}>{item.name}</div>
                          <div style={s.listPrice}>
                            ${item.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <button style={s.editBtn} onClick={() => openEdit(item)}>
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button style={s.addBtn} onClick={openAddModal}>
              + Add {isFlowerTab ? "Flower" : "Container"}
            </button>
          </div>
        </div>
      )}
      {/* Add Item modal */}
      {showAddModal && (
        <div
          style={{ ...s.overlay, zIndex: 200 }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{ ...s.modal, borderRadius: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>
                Add {isFlowerTab ? "Flower" : "Container"}
              </div>
              <button style={s.closeBtn} onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>

            {/* Photo upload */}
            <div
              style={s.photoUploadArea}
              onClick={() => addFileRef.current.click()}
            >
              {addPhoto ? (
                <img src={addPhoto} alt="" style={s.editPhotoFull} />
              ) : (
                <span style={{ fontSize: 52 }}>{addEmoji}</span>
              )}
              <div style={s.photoHint}>Tap to upload a photo</div>
              <input
                ref={addFileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAddPhotoUpload}
              />
            </div>

            {/* Emoji picker row (quick defaults) */}
            <div style={am.emojiRow}>
              {(isFlowerTab
                ? ["🌹", "🌷", "🌻", "💐", "🌼", "🪷", "🌸", "🌺", "🏵️", "🌾"]
                : ["🏺", "🧺", "🎁", "📦", "🪣", "🫙", "🍶", "🪴"]
              ).map((em) => (
                <button
                  key={em}
                  style={{
                    ...am.emojiBtn,
                    ...(addEmoji === em && !addPhoto ? am.emojiBtnActive : {}),
                  }}
                  onClick={() => {
                    setAddEmoji(em);
                    setAddPhoto(null);
                  }}
                >
                  {em}
                </button>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginTop: 4,
              }}
            >
              <input
                style={s.editInput}
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder={
                  isFlowerTab
                    ? "Flower name (e.g. Peony)"
                    : "Container name (e.g. Box)"
                }
                autoFocus
              />
              <div style={s.priceRow}>
                <span style={s.dollar}>$</span>
                <input
                  style={{ ...s.editInput, flex: 1 }}
                  value={addPrice}
                  onChange={(e) => setAddPrice(e.target.value)}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Price"
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button
                style={s.cancelBtn}
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                style={{ ...s.saveBtn, opacity: addName.trim() ? 1 : 0.4 }}
                onClick={confirmAdd}
                disabled={!addName.trim()}
              >
                Add {isFlowerTab ? "Flower" : "Container"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Reusable item button ────────────────────────────────────────
function ItemButton({ item, inCart, isSelected, onTap, size }) {
  const isSmall = size === "container";
  return (
    <button
      style={{
        ...s.itemBtn,
        ...(isSmall ? s.itemBtnSmall : {}),
        ...(isSelected ? s.itemBtnSelected : {}),
        ...(inCart > 0 && !isSelected ? s.itemBtnInCart : {}),
      }}
      onClick={() => onTap(item)}
    >
      <div style={{ ...s.itemThumb, ...(isSmall ? s.itemThumbSmall : {}) }}>
        {item.photo ? (
          <img src={item.photo} alt={item.name} style={s.itemPhoto} />
        ) : (
          <span style={{ fontSize: isSmall ? 22 : 30 }}>{item.emoji}</span>
        )}
      </div>
      <div style={{ ...s.itemName, ...(isSmall ? s.itemNameSmall : {}) }}>
        {item.name}
      </div>
      <div style={{ ...s.itemPrice, ...(isSmall ? s.itemPriceSmall : {}) }}>
        ${item.price.toFixed(2)}
      </div>
      {inCart > 0 && (
        <div style={{ ...s.badge, ...(isSelected ? s.badgeSelected : {}) }}>
          {inCart}
        </div>
      )}
    </button>
  );
}

const pink = "#e8849a";
const rose = "#7c3f52";

const s = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(160deg,#fdf6f0 0%,#fce8e8 60%,#f5e6f0 100%)",
    fontFamily: "'DM Sans', sans-serif",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 20px 12px",
  },
  headerTitle: {
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: 26,
    fontWeight: 600,
    color: rose,
  },
  headerSub: {
    fontSize: 11,
    color: "#b08090",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  settingsBtn: {
    background: "rgba(124,63,82,0.1)",
    border: "none",
    borderRadius: 12,
    width: 42,
    height: 42,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: rose,
  },

  displayBar: {
    margin: "0 16px 10px",
    background: "#fff",
    borderRadius: 18,
    padding: "14px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 54,
    boxShadow: "0 2px 12px rgba(180,100,120,0.1)",
  },
  displayText: {
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: 20,
    color: "#9a7080",
    flex: 1,
  },
  displayActive: { color: rose, fontWeight: 600, fontSize: 22 },
  displayClear: {
    background: "none",
    border: "none",
    color: "#c0a0a8",
    fontSize: 18,
    cursor: "pointer",
    padding: "0 0 0 10px",
  },

  body: { display: "flex", gap: 10, padding: "0 16px", flex: 1 },

  leftCol: { display: "flex", flexDirection: "column", flex: 1, gap: 6 },
  rightCol: { display: "flex", flexDirection: "column", gap: 6, width: 154 },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#b08090",
    paddingLeft: 2,
  },

  flowerGrid: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 },
  containerGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(1,1fr)",
    gap: 6,
  },

  // shared item button
  itemBtn: {
    background: "#fff",
    border: "2px solid transparent",
    borderRadius: 18,
    padding: "10px 6px 8px",
    cursor: "pointer",
    textAlign: "center",
    position: "relative",
    boxShadow: "0 2px 10px rgba(180,100,120,0.08)",
    transition: "transform 0.12s, border-color 0.12s",
  },
  itemBtnSmall: {
    borderRadius: 14,
    padding: "7px 8px",
    display: "flex",
    alignItems: "center",
    gap: 8,
    textAlign: "left",
  },
  itemBtnSelected: {
    borderColor: pink,
    background: "#fff5f7",
    transform: "scale(1.03)",
    boxShadow: "0 4px 18px rgba(232,132,154,0.3)",
  },
  itemBtnInCart: { borderColor: "rgba(232,132,154,0.35)" },

  itemThumb: {
    width: 52,
    height: 52,
    borderRadius: 14,
    margin: "0 auto 6px",
    background: "linear-gradient(135deg,#fde8ed,#fdf0e8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  itemThumbSmall: {
    width: 34,
    height: 34,
    borderRadius: 10,
    margin: 0,
    flexShrink: 0,
  },
  itemPhoto: { width: "100%", height: "100%", objectFit: "cover" },
  itemName: {
    fontSize: 12,
    fontWeight: 500,
    color: "#5a3040",
    lineHeight: 1.2,
  },
  itemNameSmall: { fontSize: 12, fontWeight: 500, color: "#5a3040", flex: 1 },
  itemPrice: {
    fontSize: 13,
    color: "#b07080",
    fontFamily: "'Cormorant Garamond',serif",
    fontWeight: 600,
  },
  itemPriceSmall: {
    fontSize: 12,
    color: "#b07080",
    fontFamily: "'Cormorant Garamond',serif",
    fontWeight: 600,
    marginLeft: "auto",
  },

  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    background: pink,
    color: "#fff",
    borderRadius: 999,
    minWidth: 20,
    height: 20,
    fontSize: 11,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 4px",
  },
  badgeSelected: { background: rose },

  // numpad
  numpad: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 6,
  },
  numKey: {
    height: 46,
    borderRadius: 12,
    border: "none",
    background: "#fff",
    fontSize: 19,
    fontFamily: "'Cormorant Garamond',serif",
    fontWeight: 600,
    color: rose,
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(180,100,120,0.08)",
    transition: "transform 0.1s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  numKeyConfirm: {
    background: `linear-gradient(135deg,${pink},#e86070)`,
    color: "#fff",
    fontSize: 20,
  },
  numKeyBack: { background: "rgba(232,132,154,0.12)", color: "#c06070" },
  numKeyDisabled: { opacity: 0.3, cursor: "not-allowed" },

  // cart
  cartPanel: {
    margin: "10px 16px 24px",
    background: "#fff",
    borderRadius: 22,
    padding: "16px 18px",
    boxShadow: "0 4px 20px rgba(180,100,120,0.1)",
  },
  cartHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 10,
  },
  cartTitle: {
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: 20,
    fontWeight: 600,
    color: rose,
  },
  clearAll: {
    background: "none",
    border: "none",
    fontSize: 12,
    color: "#c0a0a8",
    cursor: "pointer",
    letterSpacing: "0.04em",
  },
  cartEmpty: {
    color: "#c0a0a8",
    fontSize: 13,
    textAlign: "center",
    padding: "8px 0",
  },
  cartList: { display: "flex", flexDirection: "column", gap: 8 },
  cartRow: { display: "flex", alignItems: "center", gap: 8 },
  cartEmoji: { fontSize: 18, width: 26, textAlign: "center", flexShrink: 0 },
  cartThumb: { width: 26, height: 26, borderRadius: 7, objectFit: "cover" },
  cartName: { flex: 1, fontSize: 14, color: "#5a3040", fontWeight: 500 },
  cartQty: { fontSize: 13, color: "#b08090", minWidth: 28 },
  cartAmt: {
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: 17,
    fontWeight: 600,
    color: rose,
    minWidth: 52,
    textAlign: "right",
  },
  removeBtn: {
    background: "rgba(232,132,154,0.12)",
    border: "none",
    borderRadius: 8,
    width: 26,
    height: 26,
    fontSize: 16,
    cursor: "pointer",
    color: rose,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: { borderTop: "1px dashed rgba(180,120,140,0.2)", margin: "12px 0" },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  totalLabel: {
    fontSize: 12,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#b08090",
  },
  totalAmt: {
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: 32,
    fontWeight: 700,
    color: rose,
  },

  // settings modal
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(80,30,40,0.45)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 100,
  },
  modal: {
    background: "#fff",
    borderRadius: "28px 28px 0 0",
    width: "100%",
    maxWidth: 480,
    padding: 24,
    maxHeight: "85vh",
    overflowY: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: 24,
    fontWeight: 600,
    color: rose,
  },
  closeBtn: {
    background: "rgba(180,120,130,0.12)",
    border: "none",
    borderRadius: 10,
    width: 36,
    height: 36,
    cursor: "pointer",
    color: "#9a5060",
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  tabs: { display: "flex", gap: 8, marginBottom: 16 },
  tab: {
    flex: 1,
    padding: "8px",
    borderRadius: 12,
    border: "none",
    background: "rgba(180,120,140,0.1)",
    color: "#9a6070",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
  },
  tabActive: { background: pink, color: "#fff" },

  flowerList: { display: "flex", flexDirection: "column", gap: 10 },
  listItem: { background: "#fdf6f8", borderRadius: 16, padding: 14 },
  listRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listLeft: { display: "flex", alignItems: "center", gap: 14 },
  listThumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: "linear-gradient(135deg,#fde8ed,#fdf0e8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
  listName: { fontWeight: 500, color: "#5a3040", fontSize: 15 },
  listPrice: {
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: 16,
    color: "#b07080",
    fontWeight: 600,
  },
  editBtn: {
    background: "rgba(232,132,154,0.12)",
    border: "none",
    borderRadius: 10,
    padding: "6px 16px",
    color: rose,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
  },

  editForm: { display: "flex", flexDirection: "column", gap: 10 },
  photoUploadArea: {
    background: "linear-gradient(135deg,#fde8ed,#fdf0e8)",
    borderRadius: 16,
    height: 100,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    gap: 4,
    overflow: "hidden",
    position: "relative",
  },
  editPhotoFull: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    position: "absolute",
    inset: 0,
  },
  photoHint: {
    fontSize: 11,
    color: "#b08090",
    letterSpacing: "0.05em",
    position: "relative",
    zIndex: 1,
  },
  editInput: {
    background: "#fff",
    border: "1.5px solid rgba(180,120,140,0.25)",
    borderRadius: 12,
    padding: "10px 14px",
    fontSize: 15,
    color: "#5a3040",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  priceRow: { display: "flex", alignItems: "center", gap: 6 },
  dollar: {
    color: "#b07080",
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: 20,
    fontWeight: 600,
  },
  editActions: { display: "flex", gap: 8 },
  saveBtn: {
    flex: 1,
    background: pink,
    border: "none",
    borderRadius: 12,
    padding: 10,
    color: "#fff",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  cancelBtn: {
    flex: 1,
    background: "rgba(180,120,140,0.12)",
    border: "none",
    borderRadius: 12,
    padding: 10,
    color: "#9a6070",
    fontSize: 14,
    cursor: "pointer",
  },
  deleteBtn: {
    background: "rgba(220,80,80,0.1)",
    border: "none",
    borderRadius: 12,
    padding: "10px 14px",
    color: "#c05060",
    fontSize: 14,
    cursor: "pointer",
  },
  addBtn: {
    marginTop: 14,
    width: "100%",
    padding: 12,
    background: "linear-gradient(135deg,#f5c6d0,#f5d0c6)",
    border: "none",
    borderRadius: 16,
    color: rose,
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
  },
};

const am = {
  emojiRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    margin: "12px 0 8px",
  },
  emojiBtn: {
    fontSize: 24,
    background: "rgba(180,120,140,0.08)",
    border: "2px solid transparent",
    borderRadius: 12,
    width: 44,
    height: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  emojiBtnActive: {
    borderColor: "#e8849a",
    background: "#fff5f7",
  },
};

function SettingsIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
