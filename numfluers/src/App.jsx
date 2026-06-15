import { useState, useRef } from "react";
import "./App.css";
import rose from "./assets/rose.jpg";
import alstro from "./assets/alstro.webp";
import mum from "./assets/chrysanthemum.webp";
import daisy from "./assets/daisy.webp";
import delph from "./assets/delph.avif";
import hydra from "./assets/hydrangea.webp";
import lily from "./assets/lily.webp";
import sprayRoses from "./assets/sprayroses.avif";
import statice from "./assets/statice.jpg";
import sunflower from "./assets/sunflower.jpg";

const DEFAULT_FLOWERS = [
  {
    id: 1,
    name: "Rose",
    priceWrapped: 3.5,
    priceDesign: 3.5,
    photo: rose,
    emoji: "🌹",
  },
  {
    id: 2,
    name: "Daisy",
    priceWrapped: 2.0,
    priceDesign: 2.0,
    photo: daisy,
    emoji: "🌼",
  },
  {
    id: 3,
    name: "Delphinium",
    priceWrapped: 2.13,
    priceDesign: 2.13,
    photo: delph,
    emoji: "💜",
  },
  {
    id: 4,
    name: "Lily",
    priceWrapped: 4.13,
    priceDesign: 4.13,
    photo: lily,
    emoji: "🌸",
  },
  {
    id: 5,
    name: "Alstro",
    priceWrapped: 2.0,
    priceDesign: 3.0,
    photo: alstro,
    emoji: "🌺",
  },
  {
    id: 6,
    name: "Sunflower",
    priceWrapped: 2.38,
    priceDesign: 3.33,
    photo: sunflower,
    emoji: "🌻",
  },
  {
    id: 7,
    name: "Statice",
    priceWrapped: 1.5,
    priceDesign: 2.0,
    photo: statice,
    emoji: "🪻",
  },
  {
    id: 8,
    name: "Chrysanthemum",
    priceWrapped: 2.0,
    priceDesign: 3.0,
    photo: mum,
    emoji: "🌷",
  },
  {
    id: 9,
    name: "Hydrangea",
    priceWrapped: 4.0,
    priceDesign: 4.0,
    photo: hydra,
    emoji: "💐",
  },
  {
    id: 10,
    name: "Spray Roses",
    priceWrapped: 2.5,
    priceDesign: 3.0,
    photo: sprayRoses,
    emoji: "🌸",
  },
];

const DEFAULT_CONTAINERS = [
  { id: "c1", name: "Vase", price: 9.99, emoji: "🏺" },
  { id: "c2", name: "Basket", price: 12.0, emoji: "🧺" },
  { id: "c3", name: "Wrapped", price: 0, emoji: "🎁" },
  { id: "c4", name: "Bow", price: 2.5, emoji: "🎀" },
];

export default function FlowerCalculator() {
  const [flowers, setFlowers] = useState(DEFAULT_FLOWERS);
  const [containers, setContainers] = useState(DEFAULT_CONTAINERS);
  const [cart, setCart] = useState([]);
  const [selected, setSelected] = useState(null);
  const [qtyInput, setQtyInput] = useState("");
  const [mode, setMode] = useState("wrapped");

  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState("flowers");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editWrapped, setEditWrapped] = useState("");
  const [editDesign, setEditDesign] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editPhoto, setEditPhoto] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState("");
  const [addWrapped, setAddWrapped] = useState("");
  const [addDesign, setAddDesign] = useState("");
  const [addPrice, setAddPrice] = useState("");
  const [addPhoto, setAddPhoto] = useState(null);
  const [addEmoji, setAddEmoji] = useState("");

  const fileRef = useRef();
  const addFileRef = useRef();

  const activePrice = (flower) =>
    mode === "design" ? flower.priceDesign : flower.priceWrapped;

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
    const price = item.type === "container" ? item.price : activePrice(item);
    const cartItem = { ...item, price, qty };
    setCart((prev) => {
      const ex = prev.find((i) => i.id === item.id);
      if (ex)
        return prev.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + qty } : i,
        );
      return [...prev, cartItem];
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
  const pendingPrice = selected
    ? selected.type === "container"
      ? selected.price
      : activePrice(selected)
    : 0;
  const pendingTotal = selected ? (parseInt(qtyInput) || 1) * pendingPrice : 0;
  const displayLine = selected
    ? `${selected.name}  ×  ${qtyInput || "1"}  =  $${pendingTotal.toFixed(2)}`
    : cart.length === 0
      ? "Select a flower or container…"
      : `Total  $${total.toFixed(2)}`;

  const isFlowerTab = settingsTab === "flowers";
  const editList = isFlowerTab ? flowers : containers;

  const openEdit = (item) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPhoto(item.photo ?? null);
    if (isFlowerTab) {
      setEditWrapped(String(item.priceWrapped));
      setEditDesign(String(item.priceDesign));
    } else setEditPrice(String(item.price));
  };

  const saveEdit = () => {
    if (isFlowerTab) {
      const priceWrapped = parseFloat(editWrapped) || 0;
      const priceDesign = parseFloat(editDesign) || 0;
      setFlowers((prev) =>
        prev.map((f) =>
          f.id === editingId
            ? {
                ...f,
                name: editName,
                priceWrapped,
                priceDesign,
                photo: editPhoto ?? f.photo,
              }
            : f,
        ),
      );
      setCart((prev) =>
        prev.map((i) =>
          i.id === editingId
            ? {
                ...i,
                name: editName,
                priceWrapped,
                priceDesign,
                photo: editPhoto ?? i.photo,
              }
            : i,
        ),
      );
      if (selected?.id === editingId)
        setSelected((s) => ({
          ...s,
          name: editName,
          priceWrapped,
          priceDesign,
          photo: editPhoto ?? s.photo,
        }));
    } else {
      const price = parseFloat(editPrice) || 0;
      setContainers((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? { ...c, name: editName, price, photo: editPhoto ?? c.photo }
            : c,
        ),
      );
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
    }
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
    setAddWrapped("");
    setAddDesign("");
    setAddPrice("");
    setAddPhoto(null);
    setAddEmoji(isFlowerTab ? "🌸" : "📦");
    setShowAddModal(true);
  };

  const confirmAdd = () => {
    if (!addName.trim()) return;
    const id = `${isFlowerTab ? "f" : "c"}${Date.now()}`;
    const newItem = isFlowerTab
      ? {
          id,
          name: addName.trim(),
          priceWrapped: parseFloat(addWrapped) || 0,
          priceDesign: parseFloat(addDesign) || 0,
          photo: addPhoto,
          emoji: addEmoji || "🌸",
        }
      : {
          id,
          name: addName.trim(),
          price: parseFloat(addPrice) || 0,
          photo: addPhoto,
          emoji: addEmoji || "📦",
          type: "container",
        };
    if (isFlowerTab) setFlowers((p) => [...p, newItem]);
    else setContainers((p) => [...p, newItem]);
    setShowAddModal(false);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setEditPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleAddPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAddPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const numPad = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", "⌫", "✓"];

  return (
    <div className="page">
      {/* Header */}
      <div className="header">
        <div>
          <div className="header-title">Numfluers</div>
          <div className="header-sub">Flower Calculator</div>
        </div>
        <div className="header-right">
          <div className="mode-toggle">
            <button
              className={`mode-btn${mode === "wrapped" ? " mode-btn--active" : ""}`}
              onClick={() => setMode("wrapped")}
            >
              Wrapped
            </button>
            <button
              className={`mode-btn${mode === "design" ? " mode-btn--active" : ""}`}
              onClick={() => setMode("design")}
            >
              Design
            </button>
          </div>
          <button
            className="settings-btn"
            onClick={() => {
              setShowSettings(true);
              setSettingsTab("flowers");
            }}
          >
            <SettingsIcon />
          </button>
        </div>
      </div>

      {/* Display bar */}
      <div className="display-bar">
        <div className={`display-text${selected ? " display-active" : ""}`}>
          {displayLine}
        </div>
        {selected && (
          <button className="display-clear" onClick={handleClear}>
            ✕
          </button>
        )}
      </div>

      {/* Body */}
      <div className="body">
        {/* Left: scrollable flowers */}
        <div className="left-col">
          <div className="section-label">Flowers</div>
          <div className="flower-scroll">
            <div className="flower-grid">
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
                    displayPrice={activePrice(flower)}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: numpad + containers */}
        <div className="right-col">
          <div className="numpad">
            {numPad.map((key) => {
              const isConfirm = key === "✓";
              const isBack = key === "⌫";
              const disabled = !selected;
              let cls = "num-key";
              if (isConfirm) cls += " num-key--confirm";
              if (isBack) cls += " num-key--back";
              if (disabled) cls += " num-key--disabled";
              return (
                <button
                  key={key}
                  className={cls}
                  disabled={disabled}
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

          <div className="section-label">Containers</div>
          <div className="container-grid">
            {containers.map((c) => {
              const inCart = cart.find((i) => i.id === c.id)?.qty || 0;
              const isSel = selected?.id === c.id;
              return (
                <ItemButton
                  key={c.id}
                  item={{ ...c, type: "container" }}
                  inCart={inCart}
                  isSelected={isSel}
                  onTap={handleItemTap}
                  size="container"
                  displayPrice={c.price}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Cart */}
      <div className="cart-panel">
        <div className="cart-header">
          <div className="cart-title">Order</div>
          {cart.length > 0 && (
            <button className="clear-all" onClick={() => setCart([])}>
              Clear all
            </button>
          )}
        </div>
        {cart.length === 0 ? (
          <div className="cart-empty">No items yet</div>
        ) : (
          <div className="cart-list">
            {cart.map((item) => (
              <div key={item.id} className="cart-row">
                <span className="cart-emoji">
                  {item.photo ? (
                    <img src={item.photo} alt="" className="cart-thumb" />
                  ) : (
                    item.emoji
                  )}
                </span>
                <span className="cart-name">{item.name}</span>
                <span className="cart-qty">×{item.qty}</span>
                <span className="cart-amt">
                  ${(item.price * item.qty).toFixed(2)}
                </span>
                <button
                  className="remove-btn"
                  onClick={() => removeOne(item.id)}
                >
                  −
                </button>
              </div>
            ))}
          </div>
        )}
        {cart.length > 0 && (
          <>
            <div className="divider" />
            <div className="total-row">
              <span className="total-label">Total</span>
              <span className="total-amt">${total.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>

      {/* Settings modal */}
      {showSettings && (
        <div
          className="overlay"
          onClick={() => {
            setShowSettings(false);
            setEditingId(null);
          }}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Settings</div>
              <button
                className="close-btn"
                onClick={() => {
                  setShowSettings(false);
                  setEditingId(null);
                }}
              >
                ✕
              </button>
            </div>
            <div className="tabs">
              {["flowers", "containers"].map((tab) => (
                <button
                  key={tab}
                  className={`tab${settingsTab === tab ? " tab--active" : ""}`}
                  onClick={() => {
                    setSettingsTab(tab);
                    setEditingId(null);
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="flower-list">
              {editList.map((item) => (
                <div key={item.id} className="list-item">
                  {editingId === item.id ? (
                    <div className="edit-form">
                      <div
                        className="photo-upload-area"
                        onClick={() => fileRef.current.click()}
                      >
                        {editPhoto ? (
                          <img
                            src={editPhoto}
                            alt=""
                            className="edit-photo-full"
                          />
                        ) : (
                          <span style={{ fontSize: 40 }}>{item.emoji}</span>
                        )}
                        <div className="photo-hint">Tap to change photo</div>
                        <input
                          ref={fileRef}
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={handlePhotoUpload}
                        />
                      </div>
                      <input
                        className="edit-input"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Name"
                      />
                      {isFlowerTab ? (
                        <div className="dual-price-row">
                          <div className="price-row">
                            <span className="dollar">$</span>
                            <input
                              className="edit-input price-input"
                              value={editWrapped}
                              onChange={(e) => setEditWrapped(e.target.value)}
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="Wrapped price"
                            />
                          </div>
                          <div className="price-row">
                            <span className="dollar">$</span>
                            <input
                              className="edit-input price-input"
                              value={editDesign}
                              onChange={(e) => setEditDesign(e.target.value)}
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="Design price"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="price-row">
                          <span className="dollar">$</span>
                          <input
                            className="edit-input price-input"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Price"
                          />
                        </div>
                      )}
                      <div className="edit-actions">
                        <button className="save-btn" onClick={saveEdit}>
                          Save
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => deleteItem(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="list-row">
                      <div className="list-left">
                        <div className="list-thumb">
                          {item.photo ? (
                            <img
                              src={item.photo}
                              alt=""
                              className="list-thumb-img"
                            />
                          ) : (
                            <span style={{ fontSize: 26 }}>{item.emoji}</span>
                          )}
                        </div>
                        <div>
                          <div className="list-name">{item.name}</div>
                          {isFlowerTab ? (
                            <div className="list-price">
                              W: ${item.priceWrapped.toFixed(2)} · D: $
                              {item.priceDesign.toFixed(2)}
                            </div>
                          ) : (
                            <div className="list-price">
                              ${item.price.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        className="edit-btn"
                        onClick={() => openEdit(item)}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button className="add-btn" onClick={openAddModal}>
              + Add {isFlowerTab ? "Flower" : "Container"}
            </button>
          </div>
        </div>
      )}

      {/* Add modal */}
      {showAddModal && (
        <div
          className="overlay overlay--top"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="modal modal--centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title">
                Add {isFlowerTab ? "Flower" : "Container"}
              </div>
              <button
                className="close-btn"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>
            <div
              className="photo-upload-area"
              onClick={() => addFileRef.current.click()}
            >
              {addPhoto ? (
                <img src={addPhoto} alt="" className="edit-photo-full" />
              ) : (
                <span style={{ fontSize: 52 }}>{addEmoji}</span>
              )}
              <div className="photo-hint">Tap to upload a photo</div>
              <input
                ref={addFileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAddPhotoUpload}
              />
            </div>
            <div className="emoji-row">
              {(isFlowerTab
                ? [
                    "🌹",
                    "🌷",
                    "🌻",
                    "💐",
                    "🌼",
                    "🪷",
                    "🌸",
                    "🌺",
                    "🏵️",
                    "🌾",
                    "💜",
                    "🪻",
                  ]
                : ["🏺", "🧺", "🎁", "📦", "🪣", "🫙", "🍶", "🪴", "🎀"]
              ).map((em) => (
                <button
                  key={em}
                  className={`emoji-btn${addEmoji === em && !addPhoto ? " emoji-btn--active" : ""}`}
                  onClick={() => {
                    setAddEmoji(em);
                    setAddPhoto(null);
                  }}
                >
                  {em}
                </button>
              ))}
            </div>
            <div className="add-fields">
              <input
                className="edit-input"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder={
                  isFlowerTab
                    ? "Flower name (e.g. Peony)"
                    : "Container name (e.g. Box)"
                }
                autoFocus
              />
              {isFlowerTab ? (
                <div className="dual-price-row">
                  <div className="price-row">
                    <span className="dollar">$</span>
                    <input
                      className="edit-input price-input"
                      value={addWrapped}
                      onChange={(e) => setAddWrapped(e.target.value)}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Wrapped price"
                    />
                  </div>
                  <div className="price-row">
                    <span className="dollar">$</span>
                    <input
                      className="edit-input price-input"
                      value={addDesign}
                      onChange={(e) => setAddDesign(e.target.value)}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Design price"
                    />
                  </div>
                </div>
              ) : (
                <div className="price-row">
                  <span className="dollar">$</span>
                  <input
                    className="edit-input price-input"
                    value={addPrice}
                    onChange={(e) => setAddPrice(e.target.value)}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Price"
                  />
                </div>
              )}
            </div>
            <div className="add-modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                className="save-btn"
                style={{ opacity: addName.trim() ? 1 : 0.4 }}
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

function ItemButton({ item, inCart, isSelected, onTap, size, displayPrice }) {
  const isSmall = size === "container";
  let cls = "item-btn";
  if (isSmall) cls += " item-btn--small";
  if (isSelected) cls += " item-btn--selected";
  if (inCart > 0 && !isSelected) cls += " item-btn--in-cart";

  return (
    <button className={cls} onClick={() => onTap(item)}>
      <div className={`item-thumb${isSmall ? " item-thumb--small" : ""}`}>
        {item.photo ? (
          <img src={item.photo} alt={item.name} className="item-photo" />
        ) : (
          <span style={{ fontSize: isSmall ? 20 : 30 }}>{item.emoji}</span>
        )}
      </div>
      <div className={`item-name${isSmall ? " item-name--small" : ""}`}>
        {item.name}
      </div>
      <div className={`item-price${isSmall ? " item-price--small" : ""}`}>
        ${displayPrice.toFixed(2)}
      </div>
      {inCart > 0 && (
        <div className={`badge${isSelected ? " badge--selected" : ""}`}>
          {inCart}
        </div>
      )}
    </button>
  );
}

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
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
