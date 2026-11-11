/*====================================
FFKIPAS BY MUHLIS
PREMIUM JS V4
====================================*/

/* ===========================
RESET HISTORY SAAT SESSION BARU
=========================== */
if (!sessionStorage.getItem("loaded")) {
    localStorage.removeItem("trxHistory");
    sessionStorage.setItem("loaded", "true");
}

/* ===========================
PREMIUM TOAST
=========================== */
function showToast(title, message, type = "success") {
    const toast = document.getElementById("toast");
    if (!toast) return;

    const icon = toast.querySelector(".toast-icon");
    const titleEl = document.getElementById("toastTitle");
    const msgEl = document.getElementById("toastMsg");

    toast.classList.remove("show", "error", "warning");

    if (type === "error") {
        toast.classList.add("error");
        if (icon) icon.textContent = "✕";
    } else if (type === "warning") {
        toast.classList.add("warning");
        if (icon) icon.textContent = "!";
    } else {
        if (icon) icon.textContent = "✓";
    }

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;

    // force reflow then show
    void toast.offsetWidth;
    toast.classList.add("show");

    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3200);
}

/* ===========================
UNLOCK PAGE (fix stuck overlays)
=========================== */
function unlockPage() {
    document.body.style.overflow = "";
    document.body.style.pointerEvents = "";

    const ids = [
        ["sideMenu", "open"],
        ["menuOverlay", "show"],
        ["searchPanel", "show"],
        ["searchOverlay", "show"],
        ["popup", "active"],
        ["processing", "active"],
        ["invoice", "active"],
        ["chatMenu", "show"],
        ["groupChatPanel", "show"],
        ["groupChatOverlay", "show"],
        ["downloadHowToPopup", "active"],
        ["ffOldChoice", "active"]
    ];
    ids.forEach(([id, cls]) => {
        const el = document.getElementById(id);
        if (el) el.classList.remove(cls);
    });

    const menuBtn = document.getElementById("menuBtn");
    const searchBtn = document.getElementById("searchBtn");
    const chatToggle = document.getElementById("chatToggle");
    if (menuBtn) menuBtn.classList.remove("active");
    if (searchBtn) searchBtn.classList.remove("active");
    if (chatToggle) chatToggle.classList.remove("active");
}

// pastikan overlay tidak nyangkut saat load
window.addEventListener("load", () => {
    unlockPage();
});

// ESC nutup semua
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        unlockPage();
        if (typeof closeSideMenu === "function") closeSideMenu();
        if (typeof closeSearch === "function") closeSearch();
        if (typeof closeChatMenu === "function") closeChatMenu();
    }
});

/* ===========================
HEADER BUTTONS + SIDE MENU
=========================== */
const menuBtn = document.getElementById("menuBtn");
const sideMenu = document.getElementById("sideMenu");
const menuOverlay = document.getElementById("menuOverlay");
const menuClose = document.getElementById("menuClose");

function openSideMenu() {
    if (sideMenu) sideMenu.classList.add("open");
    if (menuOverlay) menuOverlay.classList.add("show");
    if (menuBtn) menuBtn.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeSideMenu() {
    if (sideMenu) sideMenu.classList.remove("open");
    if (menuOverlay) menuOverlay.classList.remove("show");
    if (menuBtn) menuBtn.classList.remove("active");
    // jangan kunci body kalau search masih terbuka
    if (!document.getElementById("searchPanel")?.classList.contains("show")) {
        document.body.style.overflow = "";
    }
}

if (menuBtn) {
    menuBtn.onclick = (e) => {
        e.stopPropagation();
        if (sideMenu && sideMenu.classList.contains("open")) {
            closeSideMenu();
        } else {
            openSideMenu();
        }
    };
}

if (menuClose) menuClose.onclick = closeSideMenu;
if (menuOverlay) menuOverlay.onclick = closeSideMenu;

/* ===========================
CLEAN URL (tanpa #)
Contoh: muhlishkipas.my.id/history
=========================== */
const SECTION_PATHS = {
    home: "/",
    download: "/download",
    topup: "/topup",
    cekakun: "/cekakun",
    history: "/history"
};
const PATH_TO_SECTION = {
    "": "home",
    "/": "home",
    "/home": "home",
    "/download": "download",
    "/topup": "topup",
    "/cekakun": "cekakun",
    "/cek": "cekakun",
    "/history": "history",
    "/riwayat": "history"
};

function sectionFromPath(pathname) {
    let p = String(pathname || "/").split("?")[0].split("#")[0];
    // hilangkan /index.html kalau ada
    p = p.replace(/\/index\.html$/i, "") || "/";
    p = p.replace(/\/+$/, "") || "/";
    if (p !== "/") p = p.toLowerCase();
    return PATH_TO_SECTION[p] || null;
}

function getHeaderOffset() {
    const header = document.querySelector(".header") || document.querySelector("header");
    return (header ? header.offsetHeight : 68) + 12;
}

function scrollToSectionEl(el, smooth) {
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.pageYOffset - getHeaderOffset();
    window.scrollTo({
        top: Math.max(0, top),
        behavior: smooth ? "smooth" : "auto"
    });
}

function navigateToSection(sectionId, opts = {}) {
    const { push = true, smooth = true } = opts;
    const target = document.getElementById(sectionId);
    if (!target) return false;

    if (push) {
        const path = SECTION_PATHS[sectionId] || "/";
        try {
            history.pushState({ section: sectionId }, "", path);
        } catch (e) { /* ignore */ }
    }

    // scroll beberapa kali — layout/gambar bisa geser tinggi halaman
    const delays = smooth ? [80, 250] : [50, 150, 400, 800];
    delays.forEach((ms, i) => {
        setTimeout(() => scrollToSectionEl(target, smooth && i === 0), ms);
    });

    return true;
}

function applyRouteFromLocation() {
    let sectionId = null;

    // 1) Query ?go=history (paling andal lewat 404.html GitHub Pages)
    try {
        const params = new URLSearchParams(location.search || "");
        const go = params.get("go");
        if (go && document.getElementById(go) && SECTION_PATHS[go]) {
            sectionId = go;
            try {
                history.replaceState({ section: sectionId }, "", SECTION_PATHS[sectionId]);
            } catch (e) {}
        }
    } catch (e) {}

    // 2) sessionStorage fallback
    if (!sectionId) {
        try {
            const saved = sessionStorage.getItem("spa_redirect");
            if (saved) {
                sessionStorage.removeItem("spa_redirect");
                const pathOnly = saved.split("?")[0].split("#")[0];
                sectionId = sectionFromPath(pathOnly);
                if (sectionId) {
                    try {
                        history.replaceState({ section: sectionId }, "", SECTION_PATHS[sectionId] || pathOnly);
                    } catch (e) {}
                }
            }
        } catch (e) {}
    }

    // 3) hash lama
    if (!sectionId && location.hash && location.hash.length > 1) {
        const hid = location.hash.slice(1);
        if (document.getElementById(hid) && SECTION_PATHS[hid]) {
            sectionId = hid;
            try {
                history.replaceState({ section: hid }, "", SECTION_PATHS[hid]);
            } catch (e) {}
        }
    }

    // 4) pathname (/history, /download, ...) — setelah pushState / refresh yang rewrite
    if (!sectionId) {
        sectionId = sectionFromPath(location.pathname);
    }

    if (sectionId && sectionId !== "home") {
        navigateToSection(sectionId, { push: false, smooth: false });
        return sectionId;
    }
    return null;
}

window.addEventListener("popstate", (e) => {
    const sid = (e.state && e.state.section) || sectionFromPath(location.pathname) || "home";
    if (sid === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
    }
    navigateToSection(sid, { push: false, smooth: true });
});

// Saat load: scroll ke section (ulang beberapa kali biar tidak loncat balik)
function bootRoute() {
    const run = () => applyRouteFromLocation();
    setTimeout(run, 40);
    setTimeout(run, 200);
    window.addEventListener("load", () => {
        setTimeout(run, 80);
        setTimeout(run, 350);
        setTimeout(run, 700);
    });
}
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootRoute);
} else {
    bootRoute();
}

document.querySelectorAll(".side-link").forEach(link => {
    link.addEventListener("click", (e) => {
        const href = link.getAttribute("href") || "";
        let sectionId = null;
        if (href.startsWith("#") && href.length > 1) {
            sectionId = href.slice(1);
        } else if (href.startsWith("/")) {
            sectionId = sectionFromPath(href);
        }
        if (sectionId && document.getElementById(sectionId)) {
            e.preventDefault();
            closeSideMenu();
            navigateToSection(sectionId, { push: true, smooth: true });
        } else {
            closeSideMenu();
        }
    });
});

// Link internal lain (logo, tombol kalkulator, dll)
document.querySelectorAll('a[href^="#"]').forEach(link => {
    if (link.classList.contains("side-link")) return;
    link.addEventListener("click", (e) => {
        const href = link.getAttribute("href") || "";
        if (href.length < 2) return;
        const sectionId = href.slice(1);
        if (SECTION_PATHS[sectionId] && document.getElementById(sectionId)) {
            e.preventDefault();
            navigateToSection(sectionId, { push: true, smooth: true });
        }
    });
});

const searchBtn = document.getElementById("searchBtn");
const searchPanel = document.getElementById("searchPanel");
const searchOverlay = document.getElementById("searchOverlay");
const searchClose = document.getElementById("searchClose");
const globalSearch = document.getElementById("globalSearch");
const searchEmpty = document.getElementById("searchEmpty");

function openSearch() {
    closeSideMenu();
    if (searchPanel) searchPanel.classList.add("show");
    if (searchOverlay) searchOverlay.classList.add("show");
    if (searchBtn) searchBtn.classList.add("active");
    document.body.style.overflow = "hidden";
    setTimeout(() => {
        if (globalSearch) {
            globalSearch.value = "";
            globalSearch.focus();
            filterSearch("");
        }
    }, 50);
}

function closeSearch() {
    if (searchPanel) searchPanel.classList.remove("show");
    if (searchOverlay) searchOverlay.classList.remove("show");
    if (searchBtn) searchBtn.classList.remove("active");
    if (!document.getElementById("sideMenu")?.classList.contains("open")) {
        document.body.style.overflow = "";
    }
}

function filterSearch(query) {
    const q = (query || "").trim().toLowerCase();
    let visible = 0;
    document.querySelectorAll(".search-item").forEach(item => {
        const text = item.textContent.toLowerCase();
        const match = !q || text.includes(q);
        item.classList.toggle("hidden-item", !match);
        if (match) visible++;
    });
    if (searchEmpty) searchEmpty.style.display = visible === 0 ? "block" : "none";
}

if (searchBtn) {
    searchBtn.onclick = (e) => {
        e.stopPropagation();
        if (searchPanel && searchPanel.classList.contains("show")) {
            closeSearch();
        } else {
            openSearch();
        }
    };
}

if (searchClose) searchClose.onclick = closeSearch;
if (searchOverlay) searchOverlay.onclick = closeSearch;

if (globalSearch) {
    globalSearch.addEventListener("input", () => filterSearch(globalSearch.value));
    globalSearch.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeSearch();
        if (e.key === "Enter") {
            e.preventDefault();
            const first = document.querySelector(".search-item:not(.hidden-item)");
            if (first) first.click();
        }
    });
}

document.querySelectorAll(".search-item").forEach(item => {
    item.addEventListener("click", () => {
        const targetId = item.dataset.target;
        closeSearch();
        if (targetId) navigateToSection(targetId, { push: true, smooth: true });
    });
});

/* ===========================
COUNTER — TOTAL DOWNLOAD (realtime Firebase)
=========================== */
const counter = document.getElementById("counter");
const DOWNLOAD_BASE = 0; // mulai dari 0
let downloadCountShown = 0;
let downloadCountAnimId = null;
let downloadStatsReady = false;

function animateDownloadCount(to) {
    if (!counter) return;
    const target = Math.max(0, Math.floor(Number(to) || 0));
    if (downloadCountAnimId) cancelAnimationFrame(downloadCountAnimId);

    const from = downloadCountShown;
    if (from === target) {
        counter.textContent = target.toLocaleString("id-ID");
        return;
    }
    // lompat besar → animasi cepat; naik 1–2 → langsung
    const diff = target - from;
    const duration = Math.min(1800, Math.max(400, Math.abs(diff) * 0.08));
    const start = performance.now();

    function step(now) {
        const t = Math.min(1, (now - start) / duration);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - t, 3);
        const val = Math.round(from + diff * eased);
        downloadCountShown = val;
        counter.textContent = val.toLocaleString("id-ID");
        if (t < 1) {
            downloadCountAnimId = requestAnimationFrame(step);
        } else {
            downloadCountShown = target;
            counter.textContent = target.toLocaleString("id-ID");
            downloadCountAnimId = null;
        }
    }
    downloadCountAnimId = requestAnimationFrame(step);
}

function initDownloadStats() {
    if (downloadStatsReady || !gcDb || !gcReady) return;
    downloadStatsReady = true;

    const ref = gcDb.ref("ffkipas_stats/totalDownloads");

    // Seed 0 hanya kalau path belum ada sama sekali
    ref.once("value").then((snap) => {
        if (snap.val() == null) {
            ref.set(0).catch(() => {});
        }
    }).catch(() => {});

    ref.on("value", (snap) => {
        const n = Number(snap.val());
        if (!Number.isFinite(n) || n < 0) return;
        animateDownloadCount(n);
    });
}

/** Naikkan total download (dipanggil saat user benar-benar download) */
function bumpDownloadCount(by = 1) {
    if (!gcDb || !gcReady) return;
    const ref = gcDb.ref("ffkipas_stats/totalDownloads");
    const add = Math.max(1, Math.floor(Number(by) || 1));
    ref.transaction((cur) => {
        const base = (typeof cur === "number" && cur >= 0) ? cur : DOWNLOAD_BASE;
        return base + add;
    }).catch(() => {});
    if (typeof trackDownloaderHit === "function") trackDownloaderHit();
}

// Fallback animasi lokal sebelum Firebase siap
if (counter) {
    counter.textContent = "0";
    animateDownloadCount(0);
}

/* ===========================
SCROLL ANIMATION
=========================== */
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll(".download-card, .game-card").forEach(el => {
    el.classList.add("hidden");
    observer.observe(el);
});

/* ===========================
HEADER SCROLL
=========================== */
const header = document.querySelector(".header") || document.querySelector("header");
window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
});

/* ===========================
DOWNLOAD ADS (3x klik)
=========================== */
const adLink = "https://ardance.org/4/7390f2d0c006f1597d4c085f2dcf948f";

document.querySelectorAll(".download-card a").forEach(btn => {
    // Skip kalkulator (internal link)
    if (btn.classList.contains("calc-btn") || btn.getAttribute("href")?.startsWith("#")) {
        return;
    }

    let clickCount = 0;
    const downloadLink = btn.getAttribute("href");
    const originalText = btn.innerHTML;

    btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        clickCount++;

        if (clickCount <= 2) {
            try {
                window.open(adLink, "_blank");
            } catch (err) {}
            btn.innerHTML = `Klik ${3 - clickCount}x Lagi`;
            btn.style.opacity = "0.9";
        } else {
            btn.innerHTML = "⏳ Membuka...";
            // hitung 1 download realtime
            if (typeof bumpDownloadCount === "function") bumpDownloadCount(1);
            window.location.href = downloadLink;
            // reset after a while if user stays
            setTimeout(() => {
                clickCount = 0;
                btn.innerHTML = originalText;
                btn.style.opacity = "1";
            }, 4000);
        }
    });
});

/* ===========================
TOPUP DEMO
=========================== */
const gameItems = {
    "FREE FIRE": {
        banner: "assets/banner/freefire.webp",
        uid: "Masukkan UID",
        diamondIcon: "assets/diamond-crystal.png",
        items: [
            { name: "70", price: 10000 },
            { name: "140", price: 20000 },
            { name: "210", price: 30000 },
            { name: "355", price: 50000 },
            { name: "425", price: 60000 },
            { name: "500", price: 70000 },
            { name: "720", price: 100000 },
            { name: "1000", price: 140000 },
            { name: "1450", price: 200000 },
            { name: "2000", price: 270000 },
            { name: "3640", price: 480000 },
            { name: "7290", price: 950000 }
        ]
    },
    "MOBILE LEGENDS": {
        banner: "assets/banner/mlbb.webp",
        uid: "Masukkan User ID",
        items: [
            { name: "86", price: 15000, icon: "assets/mlbb/d1.png" },
            { name: "172", price: 30000, icon: "assets/mlbb/d2.png" },
            { name: "257", price: 50000, icon: "assets/mlbb/d2.png" },
            { name: "344", price: 65000, icon: "assets/mlbb/d3.png" },
            { name: "429", price: 80000, icon: "assets/mlbb/d3.png" },
            { name: "514", price: 95000, icon: "assets/mlbb/d4.png" },
            { name: "706", price: 150000, icon: "assets/mlbb/d4.png" },
            { name: "1050", price: 200000, icon: "assets/mlbb/d5.png" },
            { name: "2195", price: 400000, icon: "assets/mlbb/d5.png" },
            { name: "3688", price: 650000, icon: "assets/mlbb/d6.png" },
            { name: "5532", price: 950000, icon: "assets/mlbb/d6.png" }
        ]
    },
    "PUBG MOBILE": {
        banner: "assets/banner/pubg.webp",
        uid: "Masukkan Character ID",
        items: [
            { name: "60", price: 16000, icon: "assets/pubg/uc60.png" },
            { name: "325", price: 75000, icon: "assets/pubg/uc325.png" },
            { name: "660", price: 149000, icon: "assets/pubg/uc660.png" },
            { name: "1800", price: 390000, icon: "assets/pubg/uc3850.png" },
            { name: "3850", price: 790000, icon: "assets/pubg/uc3850.png" },
            { name: "8100", price: 1590000, icon: "assets/pubg/uc8100.png" }
        ]
    },
    "ROBLOX": {
        banner: "assets/banner/roblox.webp",
        uid: "Masukkan Username",
        items: [
            { name: "80 Robux", price: 15000 },
            { name: "400 Robux", price: 70000 },
            { name: "800 Robux", price: 140000 },
            { name: "1700 Robux", price: 280000 }
        ]
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const popup = document.getElementById("popup");
    const closePopup = document.getElementById("closePopup");
    const popupTitle = document.getElementById("popupTitle");
    const summaryGame = document.getElementById("summaryGame");
    const summaryUid = document.getElementById("summaryUid");
    const summaryItem = document.getElementById("summaryItem");
    const summaryPay = document.getElementById("summaryPay");
    const summaryPrice = document.getElementById("summaryPrice");
    const uidInput = document.getElementById("uidInput");
    const serverInput = document.getElementById("serverInput");
    const totalPrice = document.getElementById("totalPrice");
    const diamondGrid = document.getElementById("diamondGrid");
    const uidCheck = document.getElementById("uidCheck");
    const uidCheckStatus = document.getElementById("uidCheckStatus");
    const uidCheckName = document.getElementById("uidCheckName");
    let activeTopupGame = "";
    let uidCheckTimer = null;
    let uidCheckSeq = 0;

    function resetUidCheck() {
        if (uidCheck) {
            uidCheck.className = "uid-check";
            uidCheck.removeAttribute("hidden");
        }
        if (uidCheckStatus) uidCheckStatus.textContent = "";
        if (uidCheckName) uidCheckName.textContent = "";
    }

    function setUidCheck(state, status, name) {
        if (!uidCheck) {
            console.warn("uidCheck element missing");
            return;
        }
        uidCheck.removeAttribute("hidden");
        uidCheck.className = "uid-check show " + (state || "");
        if (uidCheckStatus) uidCheckStatus.textContent = status || "";
        if (uidCheckName) uidCheckName.textContent = name || "";
    }

    async function lookupTopupNickname() {
        const game = activeTopupGame || (popupTitle && popupTitle.textContent) || "";
        const id = (uidInput && uidInput.value || "").trim();
        const server = (serverInput && serverInput.value || "").trim();
        const seq = ++uidCheckSeq;

        if (!id) {
            resetUidCheck();
            return;
        }

        // PUBG / Roblox belum ada API
        if (/PUBG/i.test(game) || /ROBLOX/i.test(game)) {
            resetUidCheck();
            return;
        }

        if (/MOBILE LEGENDS|MLBB/i.test(game)) {
            if (!server) {
                setUidCheck("loading", "Zone ID", "Isi Zone ID dulu…");
                return;
            }
            setUidCheck("loading", "Mengecek", "Sedang cek akun…");
            try {
                const url = "https://api.isan.eu.org/nickname/ml?id=" + encodeURIComponent(id) + "&server=" + encodeURIComponent(server);
                const res = await fetch(url);
                if (seq !== uidCheckSeq) return;
                const data = await res.json().catch(() => null);
                if (seq !== uidCheckSeq) return;
                if (data && data.success && data.name) {
                    setUidCheck("ok", "Nickname ditemukan", data.name);
                    if (summaryUid) summaryUid.textContent = id + " (" + data.name + ")";
                } else {
                    setUidCheck("err", "Gagal", "ID tidak ditemukan");
                }
            } catch (e) {
                if (seq !== uidCheckSeq) return;
                setUidCheck("err", "Gagal", "Tidak bisa cek ID");
            }
            return;
        }

        if (/FREE FIRE|FF\b/i.test(game)) {
            setUidCheck("loading", "Mengecek", "Sedang cek akun…");
            try {
                const url = "https://api.isan.eu.org/nickname/ff?id=" + encodeURIComponent(id);
                const res = await fetch(url);
                if (seq !== uidCheckSeq) return;
                const data = await res.json().catch(() => null);
                if (seq !== uidCheckSeq) return;
                if (data && data.success && data.name) {
                    setUidCheck("ok", "Nickname ditemukan", data.name);
                    if (summaryUid) summaryUid.textContent = id + " (" + data.name + ")";
                } else {
                    setUidCheck("err", "Gagal", "ID tidak ditemukan");
                }
            } catch (e) {
                if (seq !== uidCheckSeq) return;
                setUidCheck("err", "Gagal", "Tidak bisa cek ID");
            }
            return;
        }

        resetUidCheck();
    }

    function scheduleUidCheck() {
        if (uidCheckTimer) clearTimeout(uidCheckTimer);
        uidCheckTimer = setTimeout(lookupTopupNickname, 550);
    }

    function renderDiamond(game) {
        activeTopupGame = game || "";
        resetUidCheck();

        if (!diamondGrid) return;
        const data = gameItems[game];
        if (!data) return;

        // banner dihapus
        if (uidInput) uidInput.placeholder = data.uid;

        diamondGrid.innerHTML = "";
        const defaultIcon = data.diamondIcon || null;
        data.items.forEach(item => {
            const icon = item.icon || defaultIcon;
            const label = icon
                ? `<img class="diamond-icon" src="${icon}" alt=""><b>${item.name}</b>`
                : `<b>${item.name}</b>`;
            const n = Number(item.name) || 0;
            let badge = "";
            let extraCls = "";
            // highlight paket populer / best value
            if (game === "FREE FIRE" && (n === 720 || n === 1450)) {
              badge = '<span class="dm-badge hot">Hot</span>';
              extraCls = " dm-hot";
            } else if (game === "FREE FIRE" && (n === 355 || n === 2000)) {
              badge = '<span class="dm-badge best">Best</span>';
              extraCls = " dm-best";
            } else if (game === "MOBILE LEGENDS" && (n === 514 || n === 1050)) {
              badge = '<span class="dm-badge hot">Hot</span>';
              extraCls = " dm-hot";
            } else if (game === "MOBILE LEGENDS" && (n === 344 || n === 2195)) {
              badge = '<span class="dm-badge best">Best</span>';
              extraCls = " dm-best";
            } else if (game === "PUBG MOBILE" && (n === 660 || n === 1800)) {
              badge = '<span class="dm-badge hot">Hot</span>';
              extraCls = " dm-hot";
            } else if (game === "PUBG MOBILE" && n === 325) {
              badge = '<span class="dm-badge best">Best</span>';
              extraCls = " dm-best";
            } else if (game === "ROBLOX" && n >= 800) {
              badge = '<span class="dm-badge best">Best</span>';
              extraCls = " dm-best";
            }
            diamondGrid.innerHTML += `
                <div class="diamond-card${extraCls}" data-price="${item.price}" data-label="${item.name}">
                    ${badge}
                    <div class="diamond-label">${label}</div>
                    <span class="diamond-price"><small>Rp</small>${item.price.toLocaleString("id-ID")}</span>
                </div>
            `;
        });

        if (serverInput) {
            if (game === "MOBILE LEGENDS") {
                serverInput.style.display = "block";
                serverInput.placeholder = "Masukkan Zone ID";
            } else {
                serverInput.style.display = "none";
            }
        }
        bindDiamondEvents();
    }

    function bindDiamondEvents() {
        document.querySelectorAll(".diamond-card").forEach(card => {
            card.onclick = () => {
                document.querySelectorAll(".diamond-card").forEach(c => c.classList.remove("active"));
                card.classList.add("active");
                const price = Number(card.dataset.price);
                if (totalPrice) totalPrice.textContent = "Rp" + price.toLocaleString("id-ID");
                if (summaryPrice) summaryPrice.textContent = "Rp" + price.toLocaleString("id-ID");
                if (summaryItem) {
                    const nm = card.dataset.label || (card.querySelector("b") && card.querySelector("b").textContent) || "";
                    summaryItem.textContent = nm;
                }
            };
        });
    }

    const addCustom = document.getElementById("addCustomTopup");
    if (addCustom) {
        addCustom.onclick = () => {
            const value = Number(document.getElementById("customDiamond").value);
            if (!value) {
                alert("Masukkan jumlah terlebih dahulu!");
                return;
            }
            const price = value * 200;
            summaryItem.textContent = "💎 " + value;
            summaryPrice.textContent = "Rp" + price.toLocaleString("id-ID");
            totalPrice.textContent = "Rp" + price.toLocaleString("id-ID");
        };
    }

    if (!popup || !closePopup) return;

    const topupAdLink = "https://ardance.org/4/7390f2d0c006f1597d4c085f2dcf948f";

    document.querySelectorAll(".game-card").forEach(card => {
        const btn = card.querySelector("button");
        if (!btn) return;

        btn.onclick = () => {
            const key = "topup_" + (card.dataset.game || "game");
            let clicks = Number(localStorage.getItem(key) || 0);

            if (clicks < 1) {
                localStorage.setItem(key, clicks + 1);
                window.open(topupAdLink, "_blank");
                return;
            }
            localStorage.removeItem(key);

            popup.classList.add("active");
            if (popupTitle) popupTitle.textContent = card.dataset.game || "";
            if (summaryGame) summaryGame.textContent = card.dataset.game || "";
            // banner dihapus
            activeTopupGame = card.dataset.game || "";
            if (uidInput) uidInput.value = "";
            if (serverInput) serverInput.value = "";
            if (summaryUid) summaryUid.textContent = "-";
            renderDiamond(card.dataset.game);
        };
    });

    closePopup.onclick = () => popup.classList.remove("active");
    popup.onclick = (e) => {
        if (e.target === popup) popup.classList.remove("active");
    };

    if (uidInput) {
        uidInput.oninput = () => {
            if (summaryUid) summaryUid.textContent = uidInput.value || "-";
            scheduleUidCheck();
        };
        uidInput.addEventListener("blur", () => lookupTopupNickname());
    }
    if (serverInput) {
        serverInput.oninput = () => {
            scheduleUidCheck();
        };
        serverInput.addEventListener("blur", () => lookupTopupNickname());
    }

    document.querySelectorAll(".pay-card").forEach(card => {
        card.onclick = () => {
            document.querySelectorAll(".pay-card").forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            if (summaryPay) summaryPay.textContent = card.dataset.pay || "-";
        };
    });

    const buyBtn = document.getElementById("buyBtn");
    const invoice = document.getElementById("invoice");
    const processing = document.getElementById("processing");
    const loadingTitle = document.getElementById("loadingTitle");
    const loadingDesc = document.getElementById("loadingDesc");
    const closeInvoice = document.getElementById("closeInvoice");
    const copyInvoice = document.getElementById("copyInvoice");
    const downloadInvoice = document.getElementById("downloadInvoice");

    function set(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    }

    if (buyBtn) {
        buyBtn.onclick = () => {
            const activeDiamond = document.querySelector(".diamond-card.active");
            const customDiamond = Number(document.getElementById("customDiamond")?.value || 0);
            const activePay = document.querySelector(".pay-card.active");

            if (!uidInput.value.trim()) {
                alert("⚠️ Masukkan UID terlebih dahulu!");
                uidInput.focus();
                return;
            }
            if (serverInput.style.display !== "none" && !serverInput.value.trim()) {
                alert("⚠️ Masukkan Zone ID!");
                serverInput.focus();
                return;
            }
            if (!activeDiamond && customDiamond <= 0) {
                alert("⚠️ Pilih nominal atau masukkan Nominal Bebas!");
                return;
            }
            if (!activePay) {
                alert("⚠️ Pilih Metode Pembayaran!");
                return;
            }

            buyBtn.disabled = true;
            buyBtn.innerHTML = "⏳ Memproses...";

            if (activeDiamond) {
                summaryItem.textContent = activeDiamond.querySelector("b").textContent;
            } else {
                summaryItem.textContent = "💎 " + customDiamond;
            }

            set("invoiceGame", summaryGame?.textContent || "-");
            set("invoiceUid", summaryUid?.textContent || "-");
            set("invoiceItem", summaryItem?.textContent || "-");
            set("invoicePay", summaryPay?.textContent || "-");
            set("invoicePrice", summaryPrice?.textContent || "Rp0");

            const invNum = "INV-" + Math.floor(Math.random() * 900000 + 100000);
            set("invoiceNumber", invNum);
            set("invoiceDate", new Date().toLocaleString("id-ID"));

            const history = JSON.parse(localStorage.getItem("trxHistory") || "[]");
            history.unshift({
                invoice: invNum,
                game: summaryGame.textContent,
                uid: summaryUid.textContent,
                item: summaryItem.textContent,
                pay: summaryPay.textContent,
                price: summaryPrice.textContent,
                date: new Date().toLocaleString("id-ID")
            });
            if (history.length > 2) history.length = 2;
            localStorage.setItem("trxHistory", JSON.stringify(history));
            if (typeof renderTrxHistory === "function") renderTrxHistory();

            processing.classList.add("active");
            let progress = 0;
            const bar = document.getElementById("progressBar");
            const text = document.getElementById("progressText");
            const loadingTitle = document.getElementById("loadingTitle");
            const loadingDesc = document.getElementById("loadingDesc");
            const procSteps = document.getElementById("procSteps");

            function setProcStep(n) {
                if (!procSteps) return;
                procSteps.querySelectorAll(".proc-step").forEach((el) => {
                    const s = Number(el.getAttribute("data-s") || 0);
                    el.classList.remove("active", "done");
                    if (s < n) el.classList.add("done");
                    else if (s === n) el.classList.add("active");
                });
            }
            setProcStep(1);
            if (loadingTitle) loadingTitle.textContent = "Mengecek UID...";
            if (loadingDesc) loadingDesc.textContent = "Sedang memverifikasi akun.";

            const timer = setInterval(() => {
                progress += 3;
                if (progress > 100) progress = 100;
                if (bar) bar.style.width = progress + "%";
                if (text) text.textContent = progress + "%";
                if (progress >= 100) clearInterval(timer);
            }, 55);

            setTimeout(() => {
                setProcStep(2);
                if (loadingTitle) loadingTitle.textContent = "Memproses Pembayaran...";
                if (loadingDesc) loadingDesc.textContent = "Menghubungkan gateway.";
            }, 900);

            setTimeout(() => {
                setProcStep(3);
                if (loadingTitle) loadingTitle.textContent = "Membuat Invoice...";
                if (loadingDesc) loadingDesc.textContent = "Hampir selesai.";
            }, 1700);

            setTimeout(() => {
                if (bar) bar.style.width = "100%";
                if (text) text.textContent = "100%";
                processing.classList.remove("active");
                if (invoice) invoice.classList.add("active");

                const status = document.getElementById("invoiceStatus");
                if (status) {
                    status.className = "inv-stamp stamp-process";
                    status.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Proses';
                    setTimeout(() => {
                        status.className = "inv-stamp stamp-paid";
                        status.innerHTML = '<i class="fa-solid fa-coins"></i> Lunas';
                    }, 2800);
                    setTimeout(() => {
                        status.className = "inv-stamp stamp-done";
                        status.innerHTML = '<i class="fa-solid fa-gem"></i> Terkirim';
                    }, 4800);
                }
            }, 2800);
        };
    }

    if (copyInvoice) {
        copyInvoice.onclick = () => {
            const text = `Invoice : ${document.getElementById("invoiceNumber").textContent}
Game : ${document.getElementById("invoiceGame").textContent}
UID : ${document.getElementById("invoiceUid").textContent}
Item : ${document.getElementById("invoiceItem").textContent}
Pembayaran : ${document.getElementById("invoicePay").textContent}
Total : ${document.getElementById("invoicePrice").textContent}`;
            navigator.clipboard.writeText(text);
            copyInvoice.innerHTML = "✅ Tersalin";
            setTimeout(() => {
                copyInvoice.innerHTML = "📋 Salin Invoice";
            }, 2000);
        };
    }

    if (downloadInvoice) {
        downloadInvoice.onclick = () => window.print();
    }

    if (closeInvoice) {
        closeInvoice.onclick = () => {
            invoice.classList.remove("active");
            processing.classList.remove("active");
            buyBtn.disabled = false;
            buyBtn.innerHTML = "BELI SEKARANG";
            const progressBar = document.getElementById("progressBar");
            const progressText = document.getElementById("progressText");
            if (progressBar) progressBar.style.width = "0%";
            if (progressText) progressText.textContent = "0%";
            if (loadingTitle) loadingTitle.innerHTML = "🔍 Mengecek UID...";
            if (loadingDesc) loadingDesc.innerHTML = "Sedang memverifikasi akun.";
        };
    }
});

/* ===========================
HISTORY — Premium cards
=========================== */
function historyGameIcon(game) {
    const g = String(game || "").toUpperCase();
    if (g.includes("FREE FIRE") || g.includes("FF")) return "fa-fire";
    if (g.includes("MOBILE") || g.includes("ML")) return "fa-mobile-screen";
    if (g.includes("PUBG")) return "fa-crosshairs";
    if (g.includes("ROBLOX")) return "fa-cube";
    if (g.includes("VIP") || g.includes("FFKIPAS")) return "fa-crown";
    return "fa-receipt";
}

function renderTrxHistory() {
    const historyList = document.getElementById("historyList");
    if (!historyList) return;
    const esc = (typeof escapeHtml === "function")
        ? escapeHtml
        : (s) => String(s == null ? "" : s)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;")
            .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    let data = [];
    try {
        data = JSON.parse(localStorage.getItem("trxHistory") || "[]") || [];
    } catch (e) {
        data = [];
    }
    if (Array.isArray(data) && data.length > 2) data = data.slice(0, 2);
    if (!Array.isArray(data) || !data.length) {
        historyList.innerHTML = `
            <div class="history-empty">
                <i class="fa-solid fa-receipt"></i>
                <strong>Belum ada transaksi</strong>
                <span>Riwayat top up akan muncul di sini.</span>
            </div>`;
        return;
    }
    historyList.innerHTML = data.map((item) => {
        const inv = esc(item.invoice || "-");
        const game = esc(item.game || "-");
        const uid = esc(item.uid || "-");
        const itm = esc(item.item || "-");
        const pay = esc(item.pay || "-");
        const price = esc(item.price || "-");
        const date = esc(item.date || "-");
        const icon = historyGameIcon(item.game);
        return `
        <article class="history-card" data-inv="${inv}">
            <div class="hc-top">
                <div class="hc-icon"><i class="fa-solid ${icon}"></i></div>
                <div class="hc-head">
                    <strong class="hc-inv">${inv}</strong>
                    <span class="hc-date"><i class="fa-regular fa-clock"></i> ${date}</span>
                </div>
                <span class="hc-badge">Selesai</span>
            </div>
            <div class="hc-grid">
                <div class="hc-cell"><span>Game</span><b>${game}</b></div>
                <div class="hc-cell"><span>UID / ID</span><b>${uid}</b></div>
                <div class="hc-cell"><span>Nominal</span><b>${itm}</b></div>
                <div class="hc-cell"><span>Pembayaran</span><b>${pay}</b></div>
            </div>
            <div class="hc-foot">
                <div class="hc-price">${price}</div>
                <button type="button" class="hc-copy" data-copy="${inv}" title="Salin invoice">
                    <i class="fa-regular fa-copy"></i> Salin ID
                </button>
            </div>
        </article>`;
    }).join("");

    historyList.querySelectorAll(".hc-copy").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const val = btn.getAttribute("data-copy") || "";
            let ok = false;
            if (typeof copyTextToClipboard === "function") {
                ok = await copyTextToClipboard(val);
            } else {
                try {
                    await navigator.clipboard.writeText(val);
                    ok = true;
                } catch (err) {}
            }
            if (ok) {
                const old = btn.innerHTML;
                btn.innerHTML = '<i class="fa-solid fa-check"></i> Tersalin';
                if (typeof showToast === "function") showToast("Tersalin", val);
                setTimeout(() => { btn.innerHTML = old; }, 1400);
            }
        });
    });
}

renderTrxHistory();

/* ===========================
SLIDER — 2 gambar, geser otomatis, bisa diklik & digeser
=========================== */
(function initSlider() {
    const track = document.getElementById("sliderTrack");
    const dotsBox = document.getElementById("sliderDots");
    if (!track) return;
    const slides = track.querySelectorAll(".slide");
    const dots = dotsBox ? dotsBox.querySelectorAll("button") : [];
    const total = slides.length;
    const DELAY = 4500;
    let index = 0;
    let timer = null;

    function go(i) {
        index = (i + total) % total;
        track.style.transform = "translateX(" + (-index * 100) + "%)";
        dots.forEach((d, n) => d.classList.toggle("active", n === index));
    }
    function start() {
        stop();
        timer = setInterval(() => go(index + 1), DELAY);
    }
    function stop() {
        if (timer) { clearInterval(timer); timer = null; }
    }

    dots.forEach((d, n) => d.addEventListener("click", () => { go(n); start(); }));

    // geser dengan jari / mouse
    let startX = 0, startY = 0, dx = 0, dragging = false, moved = false;
    track.addEventListener("pointerdown", (e) => {
        dragging = true; moved = false; dx = 0;
        track.dataset.moved = "0";
        startX = e.clientX; startY = e.clientY;
        stop();
    });
    track.addEventListener("pointermove", (e) => {
        if (!dragging) return;
        dx = e.clientX - startX;
        if (Math.abs(dx) > 8) { moved = true; track.dataset.moved = "1"; }
    });
    function endDrag() {
        if (!dragging) return;
        dragging = false;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        start();
    }
    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);
    track.addEventListener("pointerleave", endDrag);

    // klik slide (kalau tadi digeser, jangan dianggap klik)
    track.addEventListener("click", (e) => {
        if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);

    // slide 2: buka pilihan download FF Old 2020
    const ffOldSlide = document.getElementById("slideFfOld");
    if (ffOldSlide) {
        ffOldSlide.addEventListener("click", () => {
            const btn = document.getElementById("ffOldOpen");
            if (btn) btn.click();
        });
    }

    // hemat baterai: berhenti saat tab disembunyikan / kursor di atas slider
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) stop(); else start();
    });
    track.addEventListener("mouseenter", stop);
    track.addEventListener("mouseleave", () => { if (!dragging) start(); });

    go(0);
    start();
})();

/* ===========================
FLOATING CHAT
=========================== */
const chatToggle = document.getElementById("chatToggle");
const chatMenu = document.getElementById("chatMenu");

function closeChatMenu() {
    if (chatMenu) chatMenu.classList.remove("show");
    if (chatToggle) chatToggle.classList.remove("active");
    const gcOpen = document.getElementById("groupChatPanel")?.classList.contains("show");
    setChatLabelVisible(!gcOpen);
}

const chatFabLabel = document.getElementById("chatFabLabel");
function setChatLabelVisible(v) {
    if (chatFabLabel) {
        chatFabLabel.style.opacity = v ? "1" : "0";
        chatFabLabel.style.visibility = v ? "visible" : "hidden";
    }
}

if (chatToggle && chatMenu) {
    chatToggle.onclick = (e) => {
        e.stopPropagation();
        const open = chatMenu.classList.toggle("show");
        chatToggle.classList.toggle("active", open);
        setChatLabelVisible(!open);
    };

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".floating-chat")) {
            closeChatMenu();
        }
    });
}

/* ===========================
ACCOUNT CHECK
=========================== */

/* ===========================
GROUP CHAT (Firebase Realtime)
=========================== */
/*
  SETUP FIREBASE (wajib, gratis):
  1. https://console.firebase.google.com → Create project
  2. Build → Realtime Database → Create (test mode dulu)
  3. Project settings → Your apps → Web → copy firebaseConfig
  4. Tempel di bawah mengganti nilai firebaseConfig
  5. Rules (Realtime Database → Rules) untuk production:
     {
       "rules": {
         "ffkipas_chat": {
           ".read": true,
           ".write": "auth != null || true",
           ".indexOn": ["ts"]
         },
         "ffkipas_presence": {
           ".read": true,
           ".write": true
         },
         "ffkipas_stats": {
           ".read": true,
           ".write": true
         }
       }
     }
     (test mode: ".read": true, ".write": true — ganti dalam 30 hari)
     Presence: path "ffkipas_presence". Stats download: path "ffkipas_stats".
*/

const firebaseConfig = {
    apiKey: "AIzaSyDVPQp8Zp8T01-FdxGxm01qmmDwr-8YfOA",
    authDomain: "ffkipas-a1e66.firebaseapp.com",
    databaseURL: "https://ffkipas-a1e66-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "ffkipas-a1e66",
    storageBucket: "ffkipas-a1e66.firebasestorage.app",
    messagingSenderId: "406272446222",
    appId: "1:406272446222:web:0b23bd18a894a6300f915f",
    measurementId: "G-FV428R4NMC"
};

const groupChatPanel = document.getElementById("groupChatPanel");
const groupChatOverlay = document.getElementById("groupChatOverlay");
const groupChatClose = document.getElementById("groupChatClose");
const openGroupChatBtn = document.getElementById("openGroupChat");
const gcMessages = document.getElementById("gcMessages");
const gcEmpty = document.getElementById("gcEmpty");
const gcNameBar = document.getElementById("gcNameBar");
const gcForm = document.getElementById("gcForm");
const gcNameInput = document.getElementById("gcNameInput");
const gcSaveName = document.getElementById("gcSaveName");
const gcInput = document.getElementById("gcInput");
const gcReplyBar = document.getElementById("gcReplyBar");
const gcReplyName = document.getElementById("gcReplyName");
const gcReplyText = document.getElementById("gcReplyText");
const gcReplyCancel = document.getElementById("gcReplyCancel");

let gcDb = null;
let gcReady = false;
let gcName = localStorage.getItem("ff_chat_name") || "";
let gcAvatar = localStorage.getItem("ff_chat_avatar") || "";
let gcLastSend = 0;
let gcReplyTo = null; // { id, name, text, image? }
let gcMsgCache = {};  // id -> message (untuk scroll ke pesan asli)
let gcForceScrollBottom = true; // true saat buka chat / kirim pesan sendiri

// Session unik per browser — buat klaim nama
let gcSessionId = localStorage.getItem("ff_chat_sid") || "";
if (!gcSessionId) {
    gcSessionId = Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    localStorage.setItem("ff_chat_sid", gcSessionId);
}
// Nama dipegang 48 jam sejak last activity (bisa diganti orang lain setelah itu)
const GC_NAME_HOLD_MS = 48 * 60 * 60 * 1000;

function normalizeChatName(n) {
    return String(n || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function nameKey(n) {
    // Firebase key tidak boleh . # $ [ ] /
    return normalizeChatName(n).replace(/[.#$\[\]\/]/g, "_");
}

/** Klaim nama unik di Firebase. Return { ok, reason? } */
async function claimChatName(newName) {
    if (!gcDb || !gcReady) return { ok: false, reason: "offline" };
    const trimmed = String(newName || "").trim().slice(0, 16);
    if (trimmed.length < 2) return { ok: false, reason: "invalid" };

    const key = nameKey(trimmed);
    if (!key) return { ok: false, reason: "invalid" };

    const ref = gcDb.ref("ffkipas_chat_names/" + key);
    const oldKey = gcName ? nameKey(gcName) : "";

    try {
        const tx = await ref.transaction((current) => {
            const now = Date.now();
            if (current && current.sid && current.sid !== gcSessionId) {
                // masih dipegang orang lain & belum expired
                if (current.ts && (now - current.ts) < GC_NAME_HOLD_MS) {
                    return; // abort
                }
            }
            return {
                name: trimmed,
                sid: gcSessionId,
                ts: now,
                avatar: gcAvatar || ""
            };
        });

        if (!tx.committed) {
            return { ok: false, reason: "taken" };
        }

        // lepaskan nama lama kalau ganti nama
        if (oldKey && oldKey !== key) {
            try {
                const oldRef = gcDb.ref("ffkipas_chat_names/" + oldKey);
                await oldRef.transaction((current) => {
                    if (current && current.sid === gcSessionId) return null;
                    return current;
                });
            } catch (e) { /* ignore */ }
        }

        return { ok: true };
    } catch (err) {
        console.error("claimChatName", err);
        return { ok: false, reason: "error" };
    }
}

/** Perpanjang hold nama (dipanggil saat kirim pesan / buka chat) */
function touchChatName() {
    if (!gcDb || !gcReady || !gcName) return;
    const key = nameKey(gcName);
    if (!key) return;
    const data = {
        name: gcName,
        sid: gcSessionId,
        ts: Date.now()
    };
    if (gcAvatar) data.avatar = gcAvatar;
    gcDb.ref("ffkipas_chat_names/" + key).update(data).catch(() => {});
}

function updateAvatarPreview() {
    const preview = document.getElementById("gcAvatarPreview");
    const btn = document.getElementById("gcAvatarBtn");
    const icon = document.getElementById("gcAvatarIcon");
    if (!preview || !btn) return;
    if (gcAvatar) {
        preview.src = gcAvatar;
        preview.style.display = "block";
        btn.classList.add("has-avatar");
        if (icon) icon.style.display = "none";
    } else {
        preview.src = "";
        preview.style.display = "none";
        btn.classList.remove("has-avatar");
        if (icon) icon.style.display = "";
    }
}

function avatarHtml(m) {
    const url = (m && m.avatar) ? String(m.avatar) : "";
    if (url && /^https?:\/\//i.test(url)) {
        return `<img class="gc-msg-avatar" src="${escapeHtml(url)}" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling&&(this.nextElementSibling.style.display='flex')"><div class="gc-msg-avatar placeholder" style="display:none">${escapeHtml((m.name || "?")[0].toUpperCase())}</div>`;
    }
    const letter = ((m && m.name) ? m.name : "?")[0].toUpperCase();
    return `<div class="gc-msg-avatar placeholder">${escapeHtml(letter)}</div>`;
}

/* ===========================
   ADMIN BADGE
   Tambah / ubah nama admin di array di bawah.
   Cocokkan dengan nama panggilan yang dipakai di chat.
=========================== */
// Huruf besar/kecil & spasi tidak masalah
const GC_ADMIN_NAMES = [
    "muhlis",
    "mas dinzz",
    "tiktok si yusuf",
    "jack ganteng",
    "mas rehan",
    "lucky tamvan"
];
const GC_ADMIN_BADGE_SRC = "assets/admin-badge.png";

function isAdminName(name) {
    if (!name) return false;
    const n = normalizeChatName(name); // trim + lower + spasi rapi
    if (!n) return false;
    if (GC_ADMIN_NAMES.some(a => normalizeChatName(a) === n)) return true;
    // cadangan tanpa spasi: "muhlis kipas" == "muhliskipas"
    const compact = n.replace(/\s+/g, "");
    return GC_ADMIN_NAMES.some(a => normalizeChatName(a).replace(/\s+/g, "") === compact);
}

function adminBadgeHtml(name) {
    if (!isAdminName(name)) return "";
    return `<span class="gc-admin-badge" title="Admin" style="display:inline-flex;align-items:center;gap:3px;max-height:14px;overflow:hidden;vertical-align:middle">
        <img src="${GC_ADMIN_BADGE_SRC}" alt="Admin" width="12" height="12" style="width:12px!important;height:12px!important;max-width:12px!important;max-height:12px!important;object-fit:contain;display:inline-block;border-radius:3px;flex-shrink:0">
        <span class="gc-admin-label">Admin</span>
    </span>`;
}

function scrollGcToBottom(smooth) {
    if (!gcMessages) return;
    requestAnimationFrame(() => {
        gcMessages.scrollTop = gcMessages.scrollHeight;
        // sekali lagi setelah layout/gambar settle
        setTimeout(() => {
            if (gcMessages) gcMessages.scrollTop = gcMessages.scrollHeight;
        }, smooth ? 80 : 30);
    });
}

function openGroupChat() {
    if (typeof closeChatMenu === "function") closeChatMenu();
    if (groupChatPanel) groupChatPanel.classList.add("show");
    if (groupChatOverlay) groupChatOverlay.classList.add("show");
    setChatLabelVisible(false);
    gcForceScrollBottom = true;
    scrollGcToBottom(true);
    if (gcName) {
        if (gcNameBar) gcNameBar.style.display = "none";
        if (gcForm) gcForm.style.display = "flex";
        if (gcInput) setTimeout(() => gcInput.focus(), 100);
        touchChatName();
    } else {
        if (gcNameBar) gcNameBar.style.display = "flex";
        if (gcForm) gcForm.style.display = "none";
        if (gcNameInput) setTimeout(() => gcNameInput.focus(), 100);
    }
}

function closeGroupChat() {
    if (groupChatPanel) groupChatPanel.classList.remove("show");
    if (groupChatOverlay) groupChatOverlay.classList.remove("show");
    setChatLabelVisible(true);
    clearReply();
}

if (openGroupChatBtn) {
    openGroupChatBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openGroupChat();
    });
}
if (groupChatClose) groupChatClose.onclick = closeGroupChat;
if (groupChatOverlay) groupChatOverlay.onclick = closeGroupChat;

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function formatTime(ts) {
    try {
        const d = new Date(ts);
        return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
        return "";
    }
}

function snippetText(m, maxLen = 60) {
    if (m.text && m.text.trim()) {
        const t = m.text.trim();
        return t.length > maxLen ? t.slice(0, maxLen) + "…" : t;
    }
    if (m.image) return "📷 Gambar";
    return "Pesan";
}

function setReply(msg) {
    if (!msg || !gcName) {
        showToast("Nama", "Isi nama dulu sebelum membalas", "warning");
        return;
    }
    gcReplyTo = {
        id: msg.id || "",
        name: msg.name || "Anon",
        text: snippetText(msg, 80),
        image: !!msg.image
    };
    if (gcReplyName) gcReplyName.textContent = gcReplyTo.name;
    if (gcReplyText) gcReplyText.textContent = gcReplyTo.text;
    if (gcReplyBar) gcReplyBar.style.display = "flex";
    if (gcInput) {
        gcInput.placeholder = "Balas " + gcReplyTo.name + "...";
        setTimeout(() => gcInput.focus(), 50);
    }
}

function clearReply() {
    gcReplyTo = null;
    if (gcReplyBar) gcReplyBar.style.display = "none";
    if (gcReplyName) gcReplyName.textContent = "";
    if (gcReplyText) gcReplyText.textContent = "";
    if (gcInput) gcInput.placeholder = "Tulis pesan...";
}

if (gcReplyCancel) {
    gcReplyCancel.onclick = (e) => {
        e.preventDefault();
        clearReply();
        if (gcInput) gcInput.focus();
    };
}

function renderMessages(list) {
    if (!gcMessages) return;
    if (!list || !list.length) {
        gcMessages.innerHTML = '<div class="gc-empty" id="gcEmpty">Belum ada pesan. Jadi yang pertama!</div>';
        gcMsgCache = {};
        return;
    }

    // keep scroll position if user is near bottom, atau force saat buka chat
    const wasNearBottom = gcForceScrollBottom ||
        (gcMessages.scrollHeight - gcMessages.scrollTop - gcMessages.clientHeight < 120);

    gcMsgCache = {};
    list.forEach(m => { if (m.id) gcMsgCache[m.id] = m; });

    gcMessages.innerHTML = list.map(m => {
        const me = m.name === gcName ? " me" : "";
        const displayName = m.name || "Anon";
        let replyHtml = "";
        if (m.replyTo && (m.replyTo.name || m.replyTo.text)) {
            const rRaw = m.replyTo.name || "Anon";
            const rName = escapeHtml(rRaw);
            const rText = escapeHtml(m.replyTo.text || (m.replyTo.image ? "📷 Gambar" : "Pesan"));
            const rId = m.replyTo.id ? ` data-reply-id="${escapeHtml(m.replyTo.id)}"` : "";
            const rBadge = adminBadgeHtml(rRaw);
            replyHtml = `<div class="gc-msg-reply"${rId} title="Lihat pesan asli">
                <div class="gc-msg-reply-body">
                    <span class="gc-msg-reply-name">${rName}${rBadge}</span>
                    <span class="gc-msg-reply-text">${rText}</span>
                </div>
            </div>`;
        }

        let body = "";
        if (m.image) {
            body += `<img class="gc-msg-img" src="${escapeHtml(m.image)}" alt="gambar" loading="lazy" onclick="window.open(this.src,'_blank')">`;
        }
        if (m.text) {
            body += `<div class="gc-msg-text">${escapeHtml(m.text)}</div>`;
        }
        if (!body) body = `<div class="gc-msg-text"></div>`;

        const msgId = m.id ? escapeHtml(m.id) : "";
        const badge = adminBadgeHtml(displayName);
        return `<div class="gc-msg-row${(m.bot || m.name === "FFKIPAS BOT") ? " is-bot" : ""}${me}" data-id="${msgId}">
            ${avatarHtml(m)}
            <div class="gc-msg">
                <div class="gc-msg-name">${escapeHtml(displayName)}${badge}</div>
                ${replyHtml}
                ${body}
                <div class="gc-msg-time">${formatTime(m.ts)}</div>
                <div class="gc-msg-actions">
                    <button type="button" class="gc-reply-btn" data-reply-id="${msgId}" title="Balas">
                        <i class="fa-solid fa-reply"></i> Balas
                    </button>
                </div>
            </div>
        </div>`;
    }).join("");

    // bind reply buttons
    gcMessages.querySelectorAll(".gc-reply-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = btn.getAttribute("data-reply-id");
            const msg = id && gcMsgCache[id];
            if (msg) setReply(msg);
        });
    });

    // click quote to scroll to original (if still in list)
    gcMessages.querySelectorAll(".gc-msg-reply[data-reply-id]").forEach(el => {
        el.addEventListener("click", (e) => {
            e.stopPropagation();
            const id = el.getAttribute("data-reply-id");
            if (!id) return;
            const target = gcMessages.querySelector(`.gc-msg-row[data-id="${id}"]`);
            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "center" });
                target.style.transition = "box-shadow 0.3s";
                target.style.boxShadow = "0 0 0 2px rgba(255,77,31,0.6)";
                setTimeout(() => { target.style.boxShadow = ""; }, 1500);
            }
        });
    });

    if (wasNearBottom) {
        scrollGcToBottom(false);
        gcForceScrollBottom = false;
    }
}

function initGroupChat() {
    if (typeof firebase === "undefined") {
        console.warn("Firebase SDK belum load");
        return;
    }
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey.indexOf("PASTE_") === 0) {
        console.warn("Firebase config belum diisi");
        return;
    }
    try {
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        gcDb = firebase.database();
        gcReady = true;

        const ref = gcDb.ref("ffkipas_chat").orderByChild("ts").limitToLast(80);
        ref.on("value", (snap) => {
            const val = snap.val() || {};
            const list = Object.keys(val).map(k => ({ id: k, ...val[k] }))
                .sort((a, b) => (a.ts || 0) - (b.ts || 0));

            // Notif grup: pesan baru (bukan milik sendiri)
            if (typeof gcNotifReady !== "undefined" && gcNotifReady) {
                list.forEach(m => {
                    if (!m.id || (gcKnownMsgIds && gcKnownMsgIds.has(m.id))) return;
                    if (gcKnownMsgIds) gcKnownMsgIds.add(m.id);
                    const fromMe = gcName && m.name &&
                        typeof normalizeChatName === "function" &&
                        normalizeChatName(m.name) === normalizeChatName(gcName);
                    if (fromMe) return;
                    const preview = m.text
                        ? String(m.text).slice(0, 80)
                        : (m.image ? "📷 Gambar" : "Pesan baru");
                    if (typeof notifyUser === "function") {
                        notifyUser(
                            "Grup FFKIPAS · " + (m.name || "Anon"),
                            preview,
                            {
                                kind: "group",
                                tag: "ffkipas-group",
                                panelId: "groupChatPanel",
                                onClick: () => {
                                    if (typeof openGroupChat === "function") openGroupChat();
                                }
                            }
                        );
                    }
                });
            } else {
                list.forEach(m => { if (m.id && gcKnownMsgIds) gcKnownMsgIds.add(m.id); });
                setTimeout(() => { gcNotifReady = true; }, 900);
            }

            renderMessages(list);
        });

        // Live pengunjung online (presence)
        initSitePresence();
        // Total download realtime
        initDownloadStats();
        if (typeof initLeaderboard === "function") initLeaderboard();

        // Re-klaim nama yang tersimpan di browser ini
        if (gcName) {
            claimChatName(gcName).then((res) => {
                if (!res.ok && res.reason === "taken") {
                    // nama sudah diambil orang lain → reset
                    gcName = "";
                    localStorage.removeItem("ff_chat_name");
                    if (gcNameBar) gcNameBar.style.display = "flex";
                    if (gcForm) gcForm.style.display = "none";
                    showToast("Nama terpakai", "Nama kamu sudah dipakai orang lain. Pilih nama baru.", "warning");
                } else if (res.ok) {
                    touchChatName();
                }
            });
        }
    } catch (err) {
        console.error("Firebase init error", err);
        gcReady = false;
    }
}

/* ===========================
SITE PRESENCE — berapa orang online di web
=========================== */
let presenceReady = false;
let presenceHeartbeat = null;
const PRESENCE_STALE_MS = 90 * 1000; // anggap offline kalau >90 detik tanpa heartbeat

function updateOnlineUI(count) {
    const n = Math.max(0, Number(count) || 0);
    const el = document.getElementById("onlineCounter");
    if (el) {
        el.textContent = n.toLocaleString("id-ID");
    }
    const label = document.getElementById("gcOnlineLabel");
    if (label) {
        label.textContent = n > 0
            ? (n + " online")
            : "Online";
    }
}

function countFreshPresence(val) {
    if (!val || typeof val !== "object") return 0;
    const now = Date.now();
    let count = 0;
    Object.keys(val).forEach((k) => {
        const row = val[k];
        if (!row) return;
        const ts = typeof row.ts === "number" ? row.ts : 0;
        // ServerValue.TIMESTAMP kadang belum ter-resolve di cache lokal — tetap hitung
        if (!ts || (now - ts) < PRESENCE_STALE_MS) count++;
    });
    return count;
}

function initSitePresence() {
    if (presenceReady || !gcDb || !gcReady) return;
    presenceReady = true;

    const sid = gcSessionId || (
        Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
    );
    const myRef = gcDb.ref("ffkipas_presence/" + sid);
    const connectedRef = gcDb.ref(".info/connected");

    const writePresence = () => {
        myRef.set({
            ts: Date.now(),
            sid: sid,
            path: (location.pathname || "/").slice(0, 40)
        }).catch(() => {});
    };

    connectedRef.on("value", (snap) => {
        if (snap.val() !== true) return;
        // Hapus otomatis saat tab/browser ditutup
        myRef.onDisconnect().remove().catch(() => {});
        writePresence();
    });

    // Heartbeat supaya entry tidak stale (kalau onDisconnect gagal)
    if (presenceHeartbeat) clearInterval(presenceHeartbeat);
    presenceHeartbeat = setInterval(() => {
        if (!gcReady || !gcDb) return;
        if (document.hidden) return;
        writePresence();
    }, 25000);

    document.addEventListener("visibilitychange", () => {
        if (!document.hidden && gcReady) writePresence();
    });

    // Hitung semua yang masih fresh
    gcDb.ref("ffkipas_presence").on("value", (snap) => {
        const val = snap.val() || {};
        updateOnlineUI(countFreshPresence(val));
    });

    // Tampilkan minimal 1 (diri sendiri) sebelum data server datang
    updateOnlineUI(1);
}

if (gcSaveName) {
    gcSaveName.onclick = async () => {
        const n = (gcNameInput?.value || "").trim().slice(0, 16);
        if (n.length < 2) {
            showToast("Nama", "Minimal 2 huruf ya", "warning");
            return;
        }

        // sama dengan nama sekarang → langsung masuk
        if (gcName && normalizeChatName(gcName) === normalizeChatName(n)) {
            if (gcNameBar) gcNameBar.style.display = "none";
            if (gcForm) gcForm.style.display = "flex";
            if (gcInput) gcInput.focus();
            if (gcSaveName) gcSaveName.textContent = "Masuk";
            touchChatName();
            return;
        }

        if (!gcReady || !gcDb) {
            showToast("Belum siap", "Chat belum terhubung, coba lagi", "warning");
            return;
        }

        const prevText = gcSaveName.textContent;
        gcSaveName.disabled = true;
        gcSaveName.textContent = "...";

        const res = await claimChatName(n);

        gcSaveName.disabled = false;
        gcSaveName.textContent = prevText || "Masuk";

        if (!res.ok) {
            if (res.reason === "taken") {
                showToast("Nama terpakai", "\"" + n + "\" sudah dipakai orang lain", "warning");
            }
            return;
        }

        gcName = n;
        localStorage.setItem("ff_chat_name", n);
        if (gcNameBar) gcNameBar.style.display = "none";
        if (gcForm) gcForm.style.display = "flex";
        if (gcInput) gcInput.focus();
        if (gcSaveName) gcSaveName.textContent = "Masuk";
        showToast("Nama disimpan", "Halo, " + n + "!");
    };
}

const gcRenameBtn = document.getElementById("gcRenameBtn");
if (gcRenameBtn) {
    gcRenameBtn.addEventListener("click", () => {
        if (gcNameBar) gcNameBar.style.display = "flex";
        if (gcForm) gcForm.style.display = "none";
        if (gcNameInput) {
            gcNameInput.value = gcName || "";
            gcNameInput.focus();
            gcNameInput.select();
        }
        if (gcSaveName) gcSaveName.textContent = "Simpan";
        clearReply();
    });
}

if (gcForm) {
    gcForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!gcReady || !gcDb) {
            showToast(
                "Belum siap",
                "Admin belum pasang Firebase. Isi firebaseConfig di script.js",
                "warning"
            );
            return;
        }
        if (!gcName) {
            showToast("Nama", "Isi nama dulu", "warning");
            return;
        }
        const text = (gcInput?.value || "").trim().slice(0, 200);
        if (!text) return;

        const now = Date.now();
        if (now - gcLastSend < 1200) {
            showToast("Pelan-pelan", "Jangan spam ya", "warning");
            return;
        }
        gcLastSend = now;

        const payload = {
            name: gcName,
            text: text,
            ts: now
        };
        if (gcAvatar) payload.avatar = gcAvatar;
        if (gcReplyTo) {
            payload.replyTo = {
                id: gcReplyTo.id || "",
                name: gcReplyTo.name || "Anon",
                text: gcReplyTo.text || "",
                image: !!gcReplyTo.image
            };
        }

        gcForceScrollBottom = true;
        gcDb.ref("ffkipas_chat").push(payload).then(() => {
            if (gcInput) gcInput.value = "";
            clearReply();
            touchChatName();
            scrollGcToBottom(false);
            if (typeof maybeGroupAutoReply === "function") maybeGroupAutoReply(text);
        }).catch((err) => {
            console.error(err);
        });
    });
}

// init after load
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGroupChat);
} else {
    initGroupChat();
}

/* Kirim gambar via ImgBB (gratis) */
// Ambil API key di https://api.imgbb.com — login → Add API key
const IMGBB_API_KEY = "aeeb26ddbc98f81adde8f60ae5680595";

const gcImageBtn = document.getElementById("gcImageBtn");
const gcImageInput = document.getElementById("gcImageInput");

if (gcImageBtn && gcImageInput) {
    gcImageBtn.addEventListener("click", () => {
        if (!gcName) {
            showToast("Nama", "Isi nama dulu", "warning");
            return;
        }
        if (!IMGBB_API_KEY || IMGBB_API_KEY.indexOf("PASTE_") === 0) {
            showToast("Belum siap", "Isi IMGBB_API_KEY di script.js dulu", "warning");
            return;
        }
        gcImageInput.click();
    });

    gcImageInput.addEventListener("change", async () => {
        const file = gcImageInput.files && gcImageInput.files[0];
        gcImageInput.value = "";
        if (!file) return;

        if (!gcReady || !gcDb) {
            showToast("Belum siap", "Chat belum terhubung", "warning");
            return;
        }
        if (!file.type.startsWith("image/")) {
            showToast("File", "Cuma boleh gambar", "warning");
            return;
        }
        if (file.size > 3 * 1024 * 1024) {
            showToast("Terlalu besar", "Maksimal 3MB", "warning");
            return;
        }

        const now = Date.now();
        if (now - gcLastSend < 1500) {
            showToast("Pelan-pelan", "Jangan spam ya", "warning");
            return;
        }
        gcLastSend = now;

        gcImageBtn.disabled = true;
        const oldIcon = gcImageBtn.innerHTML;
        gcImageBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

        try {
            const formData = new FormData();
            formData.append("image", file);

            const res = await fetch("https://api.imgbb.com/1/upload?key=" + encodeURIComponent(IMGBB_API_KEY), {
                method: "POST",
                body: formData
            });
            const json = await res.json();
            if (!json.success || !json.data || !json.data.url) {
                throw new Error(json.error?.message || "Upload gagal");
            }

            const imgPayload = {
                name: gcName,
                text: "",
                image: json.data.url,
                ts: Date.now()
            };
            if (gcAvatar) imgPayload.avatar = gcAvatar;
            if (gcReplyTo) {
                imgPayload.replyTo = {
                    id: gcReplyTo.id || "",
                    name: gcReplyTo.name || "Anon",
                    text: gcReplyTo.text || "",
                    image: !!gcReplyTo.image
                };
            }
            gcForceScrollBottom = true;
            await gcDb.ref("ffkipas_chat").push(imgPayload);
            clearReply();
            touchChatName();
            scrollGcToBottom(false);
        } catch (err) {
            console.error(err);
        }

        gcImageBtn.disabled = false;
        gcImageBtn.innerHTML = oldIcon;
    });
}

/* ===========================
   CUSTOM PROFILE (AVATAR)
=========================== */
const gcAvatarBtn = document.getElementById("gcAvatarBtn");
const gcAvatarInput = document.getElementById("gcAvatarInput");

updateAvatarPreview();

if (gcAvatarBtn && gcAvatarInput) {
    gcAvatarBtn.addEventListener("click", () => {
        if (!IMGBB_API_KEY || IMGBB_API_KEY.indexOf("PASTE_") === 0) {
            showToast("Belum siap", "Isi IMGBB_API_KEY di script.js dulu", "warning");
            return;
        }
        gcAvatarInput.click();
    });

    gcAvatarInput.addEventListener("change", async () => {
        const file = gcAvatarInput.files && gcAvatarInput.files[0];
        gcAvatarInput.value = "";
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            showToast("File", "Cuma boleh gambar", "warning");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            showToast("Terlalu besar", "Foto profil maksimal 2MB", "warning");
            return;
        }

        const oldHtml = gcAvatarBtn.innerHTML;
        gcAvatarBtn.disabled = true;
        gcAvatarBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

        try {
            const formData = new FormData();
            formData.append("image", file);
            const res = await fetch("https://api.imgbb.com/1/upload?key=" + encodeURIComponent(IMGBB_API_KEY), {
                method: "POST",
                body: formData
            });
            const json = await res.json();
            if (!json.success || !json.data || !json.data.url) {
                throw new Error(json.error?.message || "Upload gagal");
            }

            gcAvatar = (json.data.thumb && json.data.thumb.url) || json.data.url;
            localStorage.setItem("ff_chat_avatar", gcAvatar);
            updateAvatarPreview();
            touchChatName();
            showToast("Profil", "Foto profil disimpan");
        } catch (err) {
            console.error(err);
            gcAvatarBtn.innerHTML = oldHtml;
            updateAvatarPreview();
        }
        gcAvatarBtn.disabled = false;
    });
}

// ESC closes group chat too
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeGroupChat();
});

/* ===========================
   HELPER — format rupiah + status admin online
=========================== */
/* Admin Online / Offline (jam operasional WIB) */
function getWibParts(date) {
    try {
        const fmt = new Intl.DateTimeFormat("en-GB", {
            timeZone: "Asia/Jakarta",
            hour: "numeric",
            minute: "numeric",
            hour12: false,
            weekday: "short"
        });
        const parts = fmt.formatToParts(date || new Date());
        const map = {};
        parts.forEach(p => { map[p.type] = p.value; });
        return {
            hour: Number(map.hour || 0),
            minute: Number(map.minute || 0),
            weekday: map.weekday || ""
        };
    } catch (e) {
        const d = date || new Date();
        return { hour: d.getHours(), minute: d.getMinutes(), weekday: "" };
    }
}

function isAdminOnlineNow() {
    const { hour } = getWibParts();
    // 09:00 – 23:00 WIB
    return hour >= 9 && hour < 23;
}

function updateAdminOnlineUI() {
    const online = isAdminOnlineNow();
    const textEl = document.getElementById("adminStatusText");
    const dotEl = document.getElementById("adminStatusDot");
    const footer = document.querySelector(".chat-menu-footer");
    if (textEl) {
        textEl.textContent = online ? "Online" : "Offline";
        textEl.classList.toggle("online", online);
        textEl.classList.toggle("offline", !online);
    }
    if (dotEl) {
        dotEl.classList.toggle("offline", !online);
        dotEl.classList.toggle("online", online);
    }
    if (footer) {
        footer.innerHTML = online
            ? '<i class="fa-solid fa-shield-halved"></i> Admin online · biasanya 5–15 menit'
            : '<i class="fa-solid fa-moon"></i> Admin offline · jam 09.00–23.00 WIB';
    }
}

/* ===========================
NOTIF SUARA (beda nada VIP vs GRUP) + DESKTOP
=========================== */
function getNotifAudioCtx() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!getNotifAudioCtx._ctx) getNotifAudioCtx._ctx = new Ctx();
    return getNotifAudioCtx._ctx;
}

function unlockNotifAudio() {
    try {
        const ctx = getNotifAudioCtx();
        if (!ctx) return;
        if (ctx.state === "suspended") ctx.resume().catch(() => {});
        if (!unlockNotifAudio._done) {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            g.gain.value = 0.00001;
            o.connect(g);
            g.connect(ctx.destination);
            o.start();
            o.stop(ctx.currentTime + 0.01);
            unlockNotifAudio._done = true;
        }
    } catch (e) {}
}

["pointerdown", "touchstart", "keydown", "click"].forEach(ev => {
    document.addEventListener(ev, () => {
        unlockNotifAudio();
        ensureDesktopNotifPermission();
    }, { passive: true });
});

/** type: "group" */
function playNotifSound(type) {
    try {
        const ctx = getNotifAudioCtx();
        if (!ctx) return;
        const run = () => {
            const t0 = ctx.currentTime;
            // GRUP = 3 nada naik
            const notes = [
                    { at: 0, freq: 523, dur: 0.12 },
                    { at: 0.14, freq: 659, dur: 0.12 },
                    { at: 0.28, freq: 784, dur: 0.16 }
                  ];
            notes.forEach(({ at, freq, dur }) => {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.type = "triangle";
                o.frequency.value = freq;
                const start = t0 + at;
                g.gain.setValueAtTime(0.0001, start);
                g.gain.exponentialRampToValueAtTime(0.2, start + 0.015);
                g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
                o.connect(g);
                g.connect(ctx.destination);
                o.start(start);
                o.stop(start + dur + 0.02);
            });
        };
        if (ctx.state === "suspended") ctx.resume().then(run).catch(() => {});
        else run();
    } catch (e) {
        console.warn("notif sound", e);
    }
}

function playGroupNotifSound() { playNotifSound("group"); }

let _notifPermAsked = false;
function ensureDesktopNotifPermission() {
    if (!("Notification" in window)) return Promise.resolve(false);
    if (Notification.permission === "granted") return Promise.resolve(true);
    if (Notification.permission === "denied") return Promise.resolve(false);
    if (_notifPermAsked) return Promise.resolve(false);
    _notifPermAsked = true;
    return Notification.requestPermission().then(p => p === "granted").catch(() => false);
}

function showDesktopNotif(title, body, opts = {}) {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    try {
        const n = new Notification(title || "FFKIPAS", {
            body: body || "",
            icon: opts.icon || "assets/logo.png",
            badge: "assets/favicon.png",
            tag: opts.tag || "ffkipas-notif",
            renotify: true,
            silent: false
        });
        n.onclick = () => {
            try { window.focus(); } catch (e) {}
            if (typeof opts.onClick === "function") opts.onClick();
            n.close();
        };
        setTimeout(() => { try { n.close(); } catch (e) {} }, 8000);
    } catch (e) {}
}

function notifyUser(title, body, opts = {}) {
    if (opts.sound !== false) playGroupNotifSound();
    const panel = opts.panelId ? document.getElementById(opts.panelId) : null;
    const panelOpen = !!(panel && panel.classList.contains("show"));
    if (document.hidden || !panelOpen || opts.forceDesktop) {
        showDesktopNotif(title, body, opts);
    }
}

let gcKnownMsgIds = new Set();
let gcNotifReady = false;

async function copyTextToClipboard(text) {
    const t = String(text || "").trim();
    if (!t) return false;
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(t);
            return true;
        }
    } catch (e) {}
    try {
        const ta = document.createElement("textarea");
        ta.value = t;
        ta.style.cssText = "position:fixed;left:-9999px;top:0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
    } catch (e) {
        return false;
    }
}

/* Cara Download */
const downloadHowToPopup = document.getElementById("downloadHowToPopup");
const closeDownloadHowToBtn = document.getElementById("closeDownloadHowTo");
const downloadHowToCloseBtn = document.getElementById("downloadHowToCloseBtn");
function openDownloadHowTo(kind) {
    if (typeof closeChatMenu === "function") closeChatMenu();
    if (downloadHowToPopup) {
        downloadHowToPopup.setAttribute("data-howto", kind === "ffkipas" ? "ffkipas" : "ffold");
        downloadHowToPopup.classList.add("active");
    }
}
function closeDownloadHowTo() {
    if (downloadHowToPopup) downloadHowToPopup.classList.remove("active");
}
document.querySelectorAll(".open-download-howto").forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openDownloadHowTo(btn.getAttribute("data-howto"));
    });
});
if (closeDownloadHowToBtn) closeDownloadHowToBtn.onclick = closeDownloadHowTo;
if (downloadHowToCloseBtn) downloadHowToCloseBtn.onclick = closeDownloadHowTo;
if (downloadHowToPopup) {
    downloadHowToPopup.onclick = (e) => {
        if (e.target === downloadHowToPopup) closeDownloadHowTo();
    };
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closeDownloadHowTo();
    }
});

/* Admin online status */
updateAdminOnlineUI();
setInterval(updateAdminOnlineUI, 60 * 1000);

/* Video tutorial — stop video (iframe) saat popup ditutup */
(function initTutorialVideo() {
  const box = document.getElementById("tutorialVideoBox");
  const popup = document.getElementById("downloadHowToPopup");
  if (!box) return;

  function pauseTutorial() {
    box.querySelectorAll("iframe").forEach(iframe => {
      if (!iframe.src) return;
      const src = iframe.src;
      iframe.src = "";
      iframe.src = src;
    });
  }

  const closeBtn = document.getElementById("closeDownloadHowTo");
  const okBtn = document.getElementById("downloadHowToCloseBtn");
  if (closeBtn) closeBtn.addEventListener("click", pauseTutorial);
  if (okBtn) okBtn.addEventListener("click", pauseTutorial);
  if (popup) {
    popup.addEventListener("click", (e) => {
      if (e.target === popup) pauseTutorial();
    });
  }
})();

/* ===========================
AUTO REPLY BOT (GRUP)
=========================== */
const GC_BOT_NAME = "FFKIPAS BOT";
const GC_AUTO_REPLIES = [
  {
    keys: ["harga", "price", "berapa", "bayar"],
    reply: "Nominal top up game muncul pas pilih diamond/UC."
  },
  {
    keys: ["cara", "tutorial", "pasang", "install", "download"],
    reply: "Cara pasang: klik tombol Cara Download di section Download → tonton video + ikuti langkah. Download file: klik 3x (iklan) sampai link terbuka."
  },
  {
    keys: ["admin", "whatsapp", "telegram", "hubungi"],
    reply: "Chat admin: tombol chat kanan bawah → WhatsApp / Telegram / Saluran WA."
  },
  {
    keys: ["halo", "hai", "hello", "assalam"],
    reply: "Halo member admin, untuk yang mau download ffkipas ada di localconfig ya."
  }
];
let gcBotLast = 0;

function maybeGroupAutoReply(userText) {
  if (!gcDb || !gcReady) return;
  const raw = String(userText || "").trim();
  if (!raw) return;
  const t = " " + raw.toLowerCase() + " ";
  const now = Date.now();
  if (now - gcBotLast < 4000) return;

  for (const rule of GC_AUTO_REPLIES) {
    const hit = rule.keys.some(k => t.includes(String(k).toLowerCase()));
    if (!hit) continue;
    gcBotLast = now;
    setTimeout(() => {
      if (!gcDb || !gcReady) return;
      gcDb.ref("ffkipas_chat").push({
        name: GC_BOT_NAME,
        text: rule.reply,
        ts: Date.now(),
        bot: true
      }).catch(() => {});
    }, 700);
    break;
  }
}

/* ===========================
LEADERBOARD DOWNLOADER
=========================== */
function safeDownloaderKey(name) {
  return String(name || "anonim")
    .toLowerCase()
    .replace(/[.#$\[\]\/]/g, "_")
    .slice(0, 24) || "anonim";
}

function trackDownloaderHit() {
  if (!gcDb || !gcReady) return;
  let name = "";
  try {
    name = (localStorage.getItem("ff_chat_name") || "").trim();
  } catch (e) {}
  if (!name) name = "Anonim";
  name = name.slice(0, 16);
  const key = safeDownloaderKey(name);
  const ref = gcDb.ref("ffkipas_stats/downloaders/" + key);
  ref.transaction((cur) => {
    if (!cur || typeof cur !== "object") {
      return { name: name, count: 1, last: Date.now() };
    }
    return {
      name: cur.name || name,
      count: (Number(cur.count) || 0) + 1,
      last: Date.now()
    };
  }).catch(() => {});
}

function renderLeaderboard(data) {
  const box = document.getElementById("lbList");
  if (!box) return;
  const esc = (typeof escapeHtml === "function")
    ? escapeHtml
    : (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const list = Object.keys(data || {}).map(k => {
    const v = data[k] || {};
    return {
      name: v.name || k,
      count: Number(v.count) || 0,
      last: v.last || 0
    };
  }).filter(x => x.count > 0)
    .sort((a, b) => b.count - a.count || b.last - a.last)
    .slice(0, 6);

  if (!list.length) {
    box.innerHTML = '<div class="lb-empty">Belum ada data leaderboard.</div>';
    return;
  }
  box.innerHTML = list.map((row, i) => {
    const rank = i + 1;
    const cls = rank === 1 ? "top1" : (rank === 2 ? "top2" : (rank === 3 ? "top3" : ""));
    const crown = rank === 1
      ? '<span class="lb-crown" title="Top 1"><i class="fa-solid fa-crown"></i></span>'
      : '';
    const nameHtml = rank === 1
      ? `<div class="lb-name"><span class="lb-title">Raja Download</span>${esc(row.name)}</div>`
      : `<div class="lb-name">${esc(row.name)}</div>`;
    return `<div class="lb-row ${cls}">
      <div class="lb-rank">${rank === 1 ? '<i class="fa-solid fa-crown"></i>' : rank}</div>
      ${nameHtml}
      <div class="lb-count">${row.count.toLocaleString("id-ID")} DL</div>
      ${crown}
    </div>`;
  }).join("");
}

function initLeaderboard() {
  if (!gcDb || !gcReady) return;
  const ref = gcDb.ref("ffkipas_stats/downloaders");
  ref.on("value", (snap) => {
    renderLeaderboard(snap.val() || {});
  });
}

/* ===========================
ITEM CATALOG — FreeFireHub style
https://freefirehub.com/cosmetics
=========================== */
// Free Fire assets: gunakan sumber yang sama dengan ItemID2 milik 0xMe.
const FF_ITEM_IMG = "https://raw.githubusercontent.com/0xme/ff-resources/refs/heads/main/pngs/300x300/";
// Asset SKIN FF baru — gambar skin diambil langsung berdasarkan Item ID.
// Icon Gender/Mode/Time tetap memakai FF_ITEM_IMG (0xMe).
const FF_SKIN_IMG = "https://ffitems.devhubx.org/items/";
let ffAssetPreconnected = false;
function preconnectFfAssets() {
  if (ffAssetPreconnected || !document.head) return;
  ffAssetPreconnected = true;
  const link = document.createElement("link");
  link.rel = "preconnect";
  link.href = "https://ffitems.devhubx.org";
  link.crossOrigin = "";
  document.head.appendChild(link);
}
const FF_ITEM_JSON = "https://raw.githubusercontent.com/0xMe/ItemID2/main/assets/itemData.json";
const FF_ITEM_CDN_JSON = "https://raw.githubusercontent.com/0xMe/ItemID2/main/assets/cdn.json";
const FF_ITEM_LIST_JSON = "https://raw.githubusercontent.com/0xme/ff-resources/refs/heads/main/pngs/300x300/list.json";

let ffItemMap = null;
let ffItemMapPromise = null;
let ffItemCdnMap = null;
let ffItemList = null;

function loadFfItemMap() {
  if (ffItemMap && ffItemCdnMap && ffItemList) {
    return Promise.resolve(ffItemMap);
  }
  if (ffItemMapPromise) return ffItemMapPromise;

  ffItemMapPromise = Promise.all([
    fetch(FF_ITEM_JSON, { cache: "force-cache" }).then((r) => {
      if (!r.ok) throw new Error("itemData HTTP " + r.status);
      return r.json();
    }),
    fetch(FF_ITEM_CDN_JSON, { cache: "force-cache" }).then((r) => {
      if (!r.ok) throw new Error("cdn HTTP " + r.status);
      return r.json();
    }),
    fetch(FF_ITEM_LIST_JSON, { cache: "force-cache" }).then((r) => {
      if (!r.ok) throw new Error("icon list HTTP " + r.status);
      return r.json();
    })
  ])
    .then(([data, cdnData, listData]) => {
      const map = Object.create(null);

      for (const x of Array.isArray(data) ? data : []) {
        const id = String(x.itemID != null ? x.itemID : "").trim();
        if (!id) continue;

        const name = String(x.description || "").trim() || ("Item " + id);
        const icon = String(x.icon || "").trim();
        const type = String(x.itemType || x.collectionType || "").toUpperCase();
        const ct = String(x.collectionType || "").toUpperCase();

        if (!map[id] || name.length > String(map[id].name || "").length) {
          map[id] = { name, icon, type, ct };
        }
      }

      const cdnMap = Object.create(null);
      if (Array.isArray(cdnData)) {
        for (const obj of cdnData) {
          if (!obj || typeof obj !== "object") continue;
          for (const [id, url] of Object.entries(obj)) {
            if (id && url) cdnMap[String(id)] = String(url);
          }
        }
      } else if (cdnData && typeof cdnData === "object") {
        for (const [id, url] of Object.entries(cdnData)) {
          if (id && url) cdnMap[String(id)] = String(url);
        }
      }

      ffItemMap = map;
      ffItemCdnMap = cdnMap;
      ffItemList = new Set(
        (Array.isArray(listData) ? listData : [])
          .map((x) => String(x || "").trim())
          .filter(Boolean)
      );

      return map;
    })
    .catch((e) => {
      console.warn("0xMe ItemID2 asset catalog load failed", e);
      ffItemMap = Object.create(null);
      ffItemCdnMap = Object.create(null);
      ffItemList = new Set();
      return ffItemMap;
    });

  return ffItemMapPromise;
}
function labelFromMeta(meta, id) {
  const s = String(id);
  const ct = meta ? String(meta.ct || "").toUpperCase() : "";
  const t = meta ? String(meta.type || "").toUpperCase() : "";
  if (ct === "WEAPON_SKIN" || t.includes("WEAPON") || s.startsWith("907")) return "Senjata";
  if (ct === "GAMEBAG" || s.startsWith("904") || s.startsWith("208")) return "Tas";
  if (ct === "PARACHUTE" || s.startsWith("209")) return "Parasut";
  if (s.startsWith("102") || s.startsWith("101") || t.includes("AVATAR") || t.includes("FACE")) return "Karakter";
  if (s.startsWith("203")) return "Atasan";
  if (s.startsWith("204")) return "Bawahan";
  if (s.startsWith("205")) return "Sepatu";
  if (s.startsWith("211") || s.startsWith("214")) return "Kepala";
  if (t.includes("PET") || ct.includes("PET")) return "Pet";
  if (t.includes("BANNER") || ct.includes("BANNER")) return "Banner";
  if (t.includes("CLOTH")) return "Baju";
  return "Item";
}

function resolveFfItem(id) {
  const key = String(id == null ? "" : id).trim();
  if (!key || key === "0" || !/^\d+$/.test(key) || key.length < 6) return null;

  const meta = (ffItemMap && ffItemMap[key]) || null;
  const name = meta && meta.name ? meta.name : null;

  // Metadata 0xMe tetap dipakai agar nama/kategori item tidak hilang.
  if (!name && !ffItemCdnMap?.[key] && !key.startsWith("907") && !key.startsWith("904")) {
    return null;
  }

  const displayName = name || ("Item " + key);

  // GAMBAR SKIN/ITEM sekarang dari ffitems.devhubx.org berdasarkan Item ID.
  // Tidak mengubah icon Gender, Bahasa, Mode, Rank, Time Active, Time Online.
  const urls = [FF_SKIN_IMG + encodeURIComponent(key)];

  return {
    id: key,
    name: displayName,
    label: labelFromMeta(meta, key),
    urls: [...new Set(urls)]
  };
}

function collectEquippedIds(data) {
  const ids = [];
  const seen = new Set();
  const push = (v) => {
    if (v == null || v === "") return;
    if (typeof v === "object") {
      push(v.SkinId || v.skinId || v.ItemId || v.itemId || v.ClothesId);
      return;
    }
    const n = String(v).trim();
    if (!n || n === "0" || !/^\d+$/.test(n) || n.length < 6) return;
    if (seen.has(n)) return;
    seen.add(n);
    ids.push(n);
  };
  const profile = (data && data.ProfileInfo) || {};
  const info = (data && data.BasicInfo) || {};
  const pet = (data && data.PetInfo) || {};

  push(profile.CharacterId);
  const clothes = profile.Clothes || profile.clothes || [];
  if (Array.isArray(clothes)) clothes.forEach(push);

  [info.WeaponSkinShows, info.weaponSkinShows, profile.WeaponSkinShows].forEach((arr) => {
    if (Array.isArray(arr)) arr.forEach(push);
  });
  push(pet.SkinId || pet.skinId);
  push(info.BannerId || info.bannerId);
  push(info.AvatarId || info.avatarId);
  return ids;
}

/** Kumpulin skill yang lagi dipakai (beda pool ID dari item kosmetik,
 *  jadi di-resolve pakai resolveFfSkill, bukan resolveFfItem). */
function collectEquippedSkills(data) {
  const profile = (data && data.ProfileInfo) || {};
  const list =
    profile.EquippedSkills ||
    profile.equippedSkills ||
    profile.equipedSkills ||
    [];
  const out = [];
  const seen = new Set();
  const SLOT_MARKERS = new Set(["1", "2", "3", "8", "16"]);
  if (Array.isArray(list)) {
    list.forEach((s) => {
      if (s == null) return;
      const raw =
        typeof s === "object"
          ? s.SkillId != null
            ? s.SkillId
            : s.skillId != null
              ? s.skillId
              : s.id
          : s;
      const id = String(raw == null ? "" : raw).trim();
      if (!id || id === "0" || !/^\d+$/.test(id) || seen.has(id)) return;
      if (SLOT_MARKERS.has(id)) return;
      if (id.length < 3) return;
      seen.add(id);
      out.push(id);
    });
  }
  return out;
}

/** Mapping Skill ID → nama (semua varian 01/03/04/05/06). */
const FF_SKILL_NAMES = {
  101: "Olivia",
  103: "Olivia",
  104: "Olivia",
  105: "Olivia",
  106: "Olivia",
  201: "Kelly",
  203: "Kelly",
  204: "Kelly",
  205: "Kelly",
  206: "Kelly",
  301: "Ford",
  303: "Ford",
  304: "Ford",
  305: "Ford",
  306: "Ford",
  401: "Andrew",
  403: "Andrew",
  404: "Andrew",
  405: "Andrew",
  406: "Andrew",
  501: "Nikita",
  503: "Nikita",
  504: "Nikita",
  505: "Nikita",
  506: "Nikita",
  601: "Misha",
  603: "Misha",
  604: "Misha",
  605: "Misha",
  606: "Misha",
  701: "Maxim",
  703: "Maxim",
  704: "Maxim",
  705: "Maxim",
  706: "Maxim",
  801: "Kla",
  803: "Kla",
  804: "Kla",
  805: "Kla",
  806: "Kla",
  901: "Paloma",
  903: "Paloma",
  904: "Paloma",
  905: "Paloma",
  906: "Paloma",
  1001: "Miguel",
  1003: "Miguel",
  1004: "Miguel",
  1005: "Miguel",
  1006: "Miguel",
  1101: "Caroline",
  1103: "Caroline",
  1104: "Caroline",
  1105: "Caroline",
  1106: "Caroline",
  1201: "Wukong",
  1203: "Wukong",
  1204: "Wukong",
  1205: "Wukong",
  1206: "Wukong",
  1301: "Antonio",
  1303: "Antonio",
  1304: "Antonio",
  1305: "Antonio",
  1306: "Antonio",
  1401: "Moco",
  1403: "Moco",
  1404: "Moco",
  1405: "Moco",
  1406: "Moco",
  1501: "Hayato",
  1503: "Hayato",
  1504: "Hayato",
  1505: "Hayato",
  1506: "Hayato",
  1701: "Laura",
  1703: "Laura",
  1704: "Laura",
  1705: "Laura",
  1706: "Laura",
  1801: "Rafael",
  1803: "Rafael",
  1804: "Rafael",
  1805: "Rafael",
  1806: "Rafael",
  1901: "A124",
  1903: "A124",
  1904: "A124",
  1905: "A124",
  1906: "A124",
  2001: "Joseph",
  2003: "Joseph",
  2004: "Joseph",
  2005: "Joseph",
  2006: "Joseph",
  2101: "Shani",
  2103: "Shani",
  2104: "Shani",
  2105: "Shani",
  2106: "Shani",
  2201: "Alok",
  2203: "Alok",
  2204: "Alok",
  2205: "Alok",
  2206: "Alok",
  2301: "Alvaro",
  2303: "Alvaro",
  2304: "Alvaro",
  2305: "Alvaro",
  2306: "Alvaro",
  2401: "Notora",
  2403: "Notora",
  2404: "Notora",
  2405: "Notora",
  2406: "Notora",
  2501: "Kelly (Awaken)",
  2503: "Kelly (Awaken)",
  2504: "Kelly (Awaken)",
  2505: "Kelly (Awaken)",
  2506: "Kelly (Awaken)",
  2601: "Steffie",
  2603: "Steffie",
  2604: "Steffie",
  2605: "Steffie",
  2606: "Steffie",
  2701: "Jota",
  2703: "Jota",
  2704: "Jota",
  2705: "Jota",
  2706: "Jota",
  2801: "Kapella",
  2803: "Kapella",
  2804: "Kapella",
  2805: "Kapella",
  2806: "Kapella",
  2901: "Luqueta",
  2903: "Luqueta",
  2904: "Luqueta",
  2905: "Luqueta",
  2906: "Luqueta",
  3001: "Wolfrahh",
  3003: "Wolfrahh",
  3004: "Wolfrahh",
  3005: "Wolfrahh",
  3006: "Wolfrahh",
  3101: "Clu",
  3103: "Clu",
  3104: "Clu",
  3105: "Clu",
  3106: "Clu",
  3201: "Hayato (Awaken)",
  3203: "Hayato (Awaken)",
  3204: "Hayato (Awaken)",
  3205: "Hayato (Awaken)",
  3206: "Hayato (Awaken)",
  3301: "Jai",
  3303: "Jai",
  3304: "Jai",
  3305: "Jai",
  3306: "Jai",
  3401: "K",
  3403: "K",
  3404: "K",
  3405: "K",
  3406: "K",
  3501: "Dasha",
  3503: "Dasha",
  3504: "Dasha",
  3505: "Dasha",
  3506: "Dasha",
  3601: "Going Berserk",
  3603: "Going Berserk",
  3604: "Going Berserk",
  3605: "Going Berserk",
  3606: "Going Berserk",
  3701: "K (Awaken)",
  3703: "K (Awaken)",
  3704: "K (Awaken)",
  3705: "K (Awaken)",
  3706: "K (Awaken)",
  3801: "Chrono",
  3803: "Chrono",
  3804: "Chrono",
  3805: "Chrono",
  3806: "Chrono",
  3901: "Nano Nerves",
  3903: "Nano Nerves",
  3904: "Nano Nerves",
  3905: "Nano Nerves",
  3906: "Nano Nerves",
  4001: "Skyler",
  4003: "Skyler",
  4004: "Skyler",
  4005: "Skyler",
  4006: "Skyler",
  4101: "Shirou",
  4103: "Shirou",
  4104: "Shirou",
  4105: "Shirou",
  4106: "Shirou",
  4201: "Andrew (Awaken)",
  4203: "Andrew (Awaken)",
  4204: "Andrew (Awaken)",
  4205: "Andrew (Awaken)",
  4206: "Andrew (Awaken)",
  4301: "Maro",
  4303: "Maro",
  4304: "Maro",
  4305: "Maro",
  4306: "Maro",
  4401: "Xayne",
  4403: "Xayne",
  4404: "Xayne",
  4405: "Xayne",
  4406: "Xayne",
  4501: "D-Bee",
  4503: "D-Bee",
  4504: "D-Bee",
  4505: "D-Bee",
  4506: "D-Bee",
  4601: "Thiva",
  4603: "Thiva",
  4604: "Thiva",
  4605: "Thiva",
  4606: "Thiva",
  4701: "Dimitri",
  4703: "Dimitri",
  4704: "Dimitri",
  4705: "Dimitri",
  4706: "Dimitri",
  4801: "Moco (Awaken)",
  4803: "Moco (Awaken)",
  4804: "Moco (Awaken)",
  4805: "Moco (Awaken)",
  4806: "Moco (Awaken)",
  4901: "Leon",
  4903: "Leon",
  4904: "Leon",
  4905: "Leon",
  4906: "Leon",
  5001: "Otho",
  5003: "Otho",
  5004: "Otho",
  5005: "Otho",
  5006: "Otho",
  5101: "Jai",
  5103: "Jai",
  5104: "Jai",
  5105: "Jai",
  5106: "Jai",
  5201: "Nairi",
  5203: "Nairi",
  5204: "Nairi",
  5205: "Nairi",
  5206: "Nairi",
  5301: "Luna",
  5303: "Luna",
  5304: "Luna",
  5305: "Luna",
  5306: "Luna",
  5401: "Kenta",
  5403: "Kenta",
  5404: "Kenta",
  5405: "Kenta",
  5406: "Kenta",
  5501: "Homer",
  5503: "Homer",
  5504: "Homer",
  5505: "Homer",
  5506: "Homer",
  5601: "Iris",
  5603: "Iris",
  5604: "Iris",
  5605: "Iris",
  5606: "Iris",
  5701: "J. Biebs",
  5703: "J. Biebs",
  5704: "J. Biebs",
  5705: "J. Biebs",
  5706: "J. Biebs",
  5801: "Tatsuya",
  5803: "Tatsuya",
  5804: "Tatsuya",
  5805: "Tatsuya",
  5806: "Tatsuya",
  5901: "Stunt Double",
  5903: "Stunt Double",
  5904: "Stunt Double",
  5905: "Stunt Double",
  5906: "Stunt Double",
  6001: "Santino",
  6003: "Santino",
  6004: "Santino",
  6005: "Santino",
  6006: "Santino",
  6101: "J. Biebs (Awaken)",
  6103: "J. Biebs (Awaken)",
  6104: "J. Biebs (Awaken)",
  6105: "J. Biebs (Awaken)",
  6106: "J. Biebs (Awaken)",
  6201: "Orion",
  6203: "Orion",
  6204: "Orion",
  6205: "Orion",
  6206: "Orion",
  6301: "Alvaro (Awaken)",
  6303: "Alvaro (Awaken)",
  6304: "Alvaro (Awaken)",
  6305: "Alvaro (Awaken)",
  6306: "Alvaro (Awaken)",
  6501: "Sonia",
  6503: "Sonia",
  6504: "Sonia",
  6505: "Sonia",
  6506: "Sonia",
  6601: "Suzy",
  6603: "Suzy",
  6604: "Suzy",
  6605: "Suzy",
  6606: "Suzy",
  6701: "Ignis",
  6703: "Ignis",
  6704: "Ignis",
  6705: "Ignis",
  6706: "Ignis",
  6801: "Ryden",
  6803: "Ryden",
  6804: "Ryden",
  6805: "Ryden",
  6806: "Ryden",
  6901: "Kairos",
  6903: "Kairos",
  6904: "Kairos",
  6905: "Kairos",
  6906: "Kairos",
  7001: "Kassie",
  7003: "Kassie",
  7004: "Kassie",
  7005: "Kassie",
  7006: "Kassie",
  7101: "Oscar",
  7103: "Oscar",
  7104: "Oscar",
  7105: "Oscar",
  7106: "Oscar",
  7201: "Nero",
  7203: "Nero",
  7204: "Nero",
  7205: "Nero",
  7206: "Nero",
  7301: "A-Patroa",
  7303: "A-Patroa",
  7304: "A-Patroa",
  7305: "A-Patroa",
  7306: "A-Patroa",
  7401: "Koda",
  7403: "Koda",
  7404: "Koda",
  7405: "Koda",
  7406: "Koda",
  7501: "Rin",
  7503: "Rin",
  7504: "Rin",
  7505: "Rin",
  7506: "Rin",
  7601: "Morse",
  7603: "Morse",
  7604: "Morse",
  7605: "Morse",
  7606: "Morse",
  7701: "Lila",
  7703: "Lila",
  7704: "Lila",
  7705: "Lila",
  7706: "Lila",
  7801: "Ray",
  7803: "Ray",
  7804: "Ray",
  7805: "Ray",
  7806: "Ray",
  7901: "Saber",
  7903: "Saber",
  7904: "Saber",
  7905: "Saber",
  7906: "Saber",
  22016: "Alok (Awaken)",
  22011: "Alok (Awaken)",
  500106: "Olivia",
  8888: "Special",
  9999: "Special",
};

/** Skill ID → Character item ID (portrait carecter/). */
const FF_SKILL_CHAR_ID = {
  101: "101000005",
  103: "101000005",
  104: "101000005",
  105: "101000005",
  106: "101000005",
  201: "101000006",
  203: "101000006",
  204: "101000006",
  205: "101000006",
  206: "101000006",
  301: "102000006",
  303: "102000006",
  304: "102000006",
  305: "102000006",
  306: "102000006",
  401: "102000005",
  403: "102000005",
  404: "102000005",
  405: "102000005",
  406: "102000005",
  501: "101000007",
  503: "101000007",
  504: "101000007",
  505: "101000007",
  506: "101000007",
  601: "101000008",
  603: "101000008",
  604: "101000008",
  605: "101000008",
  606: "101000008",
  701: "102000007",
  703: "102000007",
  704: "102000007",
  705: "102000007",
  706: "102000007",
  801: "102000008",
  803: "102000008",
  804: "102000008",
  805: "102000008",
  806: "102000008",
  901: "101000009",
  903: "101000009",
  904: "101000009",
  905: "101000009",
  906: "101000009",
  1001: "102000009",
  1003: "102000009",
  1004: "102000009",
  1005: "102000009",
  1006: "102000009",
  1101: "101000010",
  1103: "101000010",
  1104: "101000010",
  1105: "101000010",
  1106: "101000010",
  1201: "102000011",
  1203: "102000011",
  1204: "102000011",
  1205: "102000011",
  1206: "102000011",
  1301: "102000010",
  1303: "102000010",
  1304: "102000010",
  1305: "102000010",
  1306: "102000010",
  1401: "101000011",
  1403: "101000011",
  1404: "101000011",
  1405: "101000011",
  1406: "101000011",
  1501: "102000012",
  1503: "102000012",
  1504: "102000012",
  1505: "102000012",
  1506: "102000012",
  1701: "101000012",
  1703: "101000012",
  1704: "101000012",
  1705: "101000012",
  1706: "101000012",
  1801: "102000013",
  1803: "102000013",
  1804: "102000013",
  1805: "102000013",
  1806: "102000013",
  1901: "101000013",
  1903: "101000013",
  1904: "101000013",
  1905: "101000013",
  1906: "101000013",
  2001: "102000014",
  2003: "102000014",
  2004: "102000014",
  2005: "102000014",
  2006: "102000014",
  2101: "101000014",
  2103: "101000014",
  2104: "101000014",
  2105: "101000014",
  2106: "101000014",
  2201: "102000015",
  2203: "102000015",
  2204: "102000015",
  2205: "102000015",
  2206: "102000015",
  2301: "102000016",
  2303: "102000016",
  2304: "102000016",
  2305: "102000016",
  2306: "102000016",
  2401: "101000016",
  2403: "101000016",
  2404: "101000016",
  2405: "101000016",
  2406: "101000016",
  2501: "101000015",
  2503: "101000015",
  2504: "101000015",
  2505: "101000015",
  2506: "101000015",
  2601: "101000017",
  2603: "101000017",
  2604: "101000017",
  2605: "101000017",
  2606: "101000017",
  2701: "102000017",
  2703: "102000017",
  2704: "102000017",
  2705: "102000017",
  2706: "102000017",
  2801: "101000018",
  2803: "101000018",
  2804: "101000018",
  2805: "101000018",
  2806: "101000018",
  2901: "102000018",
  2903: "102000018",
  2904: "102000018",
  2905: "102000018",
  2906: "102000018",
  3001: "102000019",
  3003: "102000019",
  3004: "102000019",
  3005: "102000019",
  3006: "102000019",
  3101: "101000019",
  3103: "101000019",
  3104: "101000019",
  3105: "101000019",
  3106: "101000019",
  3201: "102000020",
  3203: "102000020",
  3204: "102000020",
  3205: "102000020",
  3206: "102000020",
  3301: "102000021",
  3303: "102000021",
  3304: "102000021",
  3305: "102000021",
  3306: "102000021",
  3401: "102000022",
  3403: "102000022",
  3404: "102000022",
  3405: "102000022",
  3406: "102000022",
  3501: "101000020",
  3503: "101000020",
  3504: "101000020",
  3505: "101000020",
  3506: "101000020",
  3601: "102000023",
  3603: "102000023",
  3604: "102000023",
  3605: "102000023",
  3606: "102000023",
  3701: "102000022",
  3703: "102000022",
  3704: "102000022",
  3705: "102000022",
  3706: "102000022",
  3801: "102000024",
  3803: "102000024",
  3804: "102000024",
  3805: "102000024",
  3806: "102000024",
  3901: "101000013",
  3903: "101000013",
  3904: "101000013",
  3905: "101000013",
  3906: "101000013",
  4001: "102000025",
  4003: "102000025",
  4004: "102000025",
  4005: "102000025",
  4006: "102000025",
  4101: "102000026",
  4103: "102000026",
  4104: "102000026",
  4105: "102000026",
  4106: "102000026",
  4201: "102000027",
  4203: "102000027",
  4204: "102000027",
  4205: "102000027",
  4206: "102000027",
  4301: "102000028",
  4303: "102000028",
  4304: "102000028",
  4305: "102000028",
  4306: "102000028",
  4401: "101000022",
  4403: "101000022",
  4404: "101000022",
  4405: "101000022",
  4406: "101000022",
  4501: "102000029",
  4503: "102000029",
  4504: "102000029",
  4505: "102000029",
  4506: "102000029",
  4601: "102000030",
  4603: "102000030",
  4604: "102000030",
  4605: "102000030",
  4606: "102000030",
  4701: "102000031",
  4703: "102000031",
  4704: "102000031",
  4705: "102000031",
  4706: "102000031",
  4801: "101000023",
  4803: "101000023",
  4804: "101000023",
  4805: "101000023",
  4806: "101000023",
  4901: "102000032",
  4903: "102000032",
  4904: "102000032",
  4905: "102000032",
  4906: "102000032",
  5001: "102000033",
  5003: "102000033",
  5004: "102000033",
  5005: "102000033",
  5006: "102000033",
  5101: "103000002",
  5103: "103000002",
  5104: "103000002",
  5105: "103000002",
  5106: "103000002",
  5201: "102000034",
  5203: "102000034",
  5204: "102000034",
  5205: "102000034",
  5206: "102000034",
  5301: "101000026",
  5303: "101000026",
  5304: "101000026",
  5305: "101000026",
  5306: "101000026",
  5401: "102000036",
  5403: "102000036",
  5404: "102000036",
  5405: "102000036",
  5406: "102000036",
  5501: "102000037",
  5503: "102000037",
  5504: "102000037",
  5505: "102000037",
  5506: "102000037",
  5601: "101000025",
  5603: "101000025",
  5604: "101000025",
  5605: "101000025",
  5606: "101000025",
  5701: "102000038",
  5703: "102000038",
  5704: "102000038",
  5705: "102000038",
  5706: "102000038",
  5801: "102000039",
  5803: "102000039",
  5804: "102000039",
  5805: "102000039",
  5806: "102000039",
  5901: "102000023",
  5903: "102000023",
  5904: "102000023",
  5905: "102000023",
  5906: "102000023",
  6001: "102000040",
  6003: "102000040",
  6004: "102000040",
  6005: "102000040",
  6006: "102000040",
  6101: "103000003",
  6103: "103000003",
  6104: "103000003",
  6105: "103000003",
  6106: "103000003",
  6201: "102000041",
  6203: "102000041",
  6204: "102000041",
  6205: "102000041",
  6206: "102000041",
  6301: "102000042",
  6303: "102000042",
  6304: "102000042",
  6305: "102000042",
  6306: "102000042",
  6501: "101000027",
  6503: "101000027",
  6504: "101000027",
  6505: "101000027",
  6506: "101000027",
  6601: "101000028",
  6603: "101000028",
  6604: "101000028",
  6605: "101000028",
  6606: "101000028",
  6701: "102000044",
  6703: "102000044",
  6704: "102000044",
  6705: "102000044",
  6706: "102000044",
  6801: "102000045",
  6803: "102000045",
  6804: "102000045",
  6805: "102000045",
  6806: "102000045",
  6901: "102000046",
  6903: "102000046",
  6904: "102000046",
  6905: "102000046",
  6906: "102000046",
  7001: "101000049",
  7003: "101000049",
  7004: "101000049",
  7005: "101000049",
  7006: "101000049",
  7101: "101000050",
  7103: "101000050",
  7104: "101000050",
  7105: "101000050",
  7106: "101000050",
  7201: "102000051",
  7203: "102000051",
  7204: "102000051",
  7205: "102000051",
  7206: "102000051",
  7301: "103000004",
  7303: "103000004",
  7304: "103000004",
  7305: "103000004",
  7306: "103000004",
  7401: "102000052",
  7403: "102000052",
  7404: "102000052",
  7405: "102000052",
  7406: "102000052",
  7501: "101000053",
  7503: "101000053",
  7504: "101000053",
  7505: "101000053",
  7506: "101000053",
  7601: "102000054",
  7603: "102000054",
  7604: "102000054",
  7605: "102000054",
  7606: "102000054",
  7701: "102000055",
  7703: "102000055",
  7704: "102000055",
  7705: "102000055",
  7706: "102000055",
  7801: "102000056",
  7803: "102000056",
  7804: "102000056",
  7805: "102000056",
  7806: "102000056",
  7901: "102000056",
  7903: "102000056",
  7904: "102000056",
  7905: "102000056",
  7906: "102000056",
  22016: "102000043",
  22011: "102000043",
  500106: "101000021",
};

const FF_SKILL_ICON_BASE =
  "https://raw.githubusercontent.com/90xExe/FreeFireAllIconBy90x/main/SKILLS/";
const FF_CHAR_IMG_BASE =
  "https://raw.githubusercontent.com/90xExe/FreeFireAllIconBy90x/main/carecter/";

/** Cari nama skill: exact → prefix family (2503→2506→Kelly Awaken). */
function lookupFfSkillName(key) {
  if (FF_SKILL_NAMES[key]) return FF_SKILL_NAMES[key];
  const n = Number(key);
  if (FF_SKILL_NAMES[n]) return FF_SKILL_NAMES[n];
  // family: 2503 → try 2506, 2501, 2505
  if (/^\d+$/.test(key) && key.length >= 3) {
    const base = key.slice(0, -2);
    for (const suf of ["06", "01", "05", "04", "03"]) {
      const k = base + suf;
      if (FF_SKILL_NAMES[k]) return FF_SKILL_NAMES[k];
    }
  }
  return null;
}

function lookupFfSkillCharId(key) {
  if (FF_SKILL_CHAR_ID[key]) return FF_SKILL_CHAR_ID[key];
  const n = Number(key);
  if (FF_SKILL_CHAR_ID[n]) return FF_SKILL_CHAR_ID[n];
  if (/^\d+$/.test(key) && key.length >= 3) {
    const base = key.slice(0, -2);
    for (const suf of ["06", "01", "05", "04", "03"]) {
      const k = base + suf;
      if (FF_SKILL_CHAR_ID[k]) return FF_SKILL_CHAR_ID[k];
    }
  }
  return "";
}

/** Resolve skill ID → nama + portrait + icon. */
function resolveFfSkill(id) {
  const key = String(id == null ? "" : id).trim();
  if (!key || key === "0" || !/^\d+$/.test(key)) return null;

  let name = lookupFfSkillName(key);
  const charId = lookupFfSkillCharId(key);
  const metaSkill = (ffItemMap && ffItemMap[key]) || null;
  const metaChar = charId && ffItemMap ? ffItemMap[charId] : null;
  if (!name && metaSkill && metaSkill.name) name = metaSkill.name;
  if (!name && metaChar && metaChar.name) name = metaChar.name;
  if (!name) name = "Skill " + key;

  const icon =
    (metaSkill && metaSkill.icon && String(metaSkill.icon).trim()) ||
    (metaChar && metaChar.icon && String(metaChar.icon).trim()) ||
    "";

  const urls = [];
  if (charId) {
    urls.push(FF_CHAR_IMG_BASE + charId + ".png");
    urls.push(FF_ITEM_IMG + charId + ".png");
  }
  // coba icon skill exact + family 06
  urls.push(FF_SKILL_ICON_BASE + key + ".png");
  if (key.length >= 3) {
    const fam06 = key.slice(0, -2) + "06";
    if (fam06 !== key) urls.push(FF_SKILL_ICON_BASE + fam06 + ".png");
  }
  if (icon && icon !== "NONE") urls.push(FF_ITEM_IMG + icon + ".png");
  if (ffItemCdnMap) {
    if (ffItemCdnMap[key]) urls.push(ffItemCdnMap[key]);
    if (charId && ffItemCdnMap[charId]) urls.push(ffItemCdnMap[charId]);
  }
  if (!urls.length) urls.push(FF_ITEM_IMG + "UI_EPFP_unknown.png");

  return { id: key, name, label: "Skill", urls: [...new Set(urls)] };
}

function skinPlaceholder(name) {
  const n = String(name || "Item").slice(0, 10);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect fill="#2d333c" width="96" height="96"/><text x="50%" y="50%" fill="#9ba4b1" font-family="sans-serif" font-size="11" text-anchor="middle" dy=".3em">${n.replace(/[<>&]/g, "")}</text></svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

/** Nama outfit/weapon dari FFxAPI (string, bukan ID numerik). */
function collectNamedGear(data) {
  const profile = (data && data.ProfileInfo) || {};
  const out = [];
  const pushNames = (arr, label) => {
    if (!Array.isArray(arr)) return;
    arr.forEach((n) => {
      const s = String(n || "").trim();
      if (!s || /^default$/i.test(s)) return;
      out.push({ id: s, name: s, label: label, urls: [skinPlaceholder(s)] });
    });
  };
  pushNames(profile.OutfitNames, "Outfit");
  pushNames(profile.WeaponNames, "Weapon");
  return out;
}

function renderEquippedSkinsFast(data) {
  const box = document.getElementById("cekSkinsBox");
  const grid = document.getElementById("cekSkinsGrid");
  const countEl = document.getElementById("cekSkinsCount");
  if (!box || !grid) return;

  const ids = collectEquippedIds(data);
  const skills = collectEquippedSkills(data).map(resolveFfSkill).filter(Boolean);
  const named = collectNamedGear(data);

  // Skill dulu (ada icon), lalu item ID, lalu nama outfit/weapon dari FFxAPI
  let html = "";
  let total = 0;

  skills.forEach((it) => {
    total++;
    const name = String(it.name).slice(0, 32);
    const safe = name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const first = (it.urls && it.urls[0]) || skinPlaceholder(name);
    const ph = skinPlaceholder("?").replace(/'/g, "\\'");
    html += `<div class="cek-skin-item" title="${safe}">
      <img src="${first}" alt="${safe}" loading="eager" decoding="async"
        onerror="this.onerror=null;this.src='${ph}'" />
      <span>${safe}</span>
      <small>Skill</small>
    </div>`;
  });

  const seen = new Set();
  ids.forEach((id) => {
    if (seen.has(id)) return;
    seen.add(id);
    total++;
    const safeId = String(id).replace(/[^0-9]/g, "");
    const url = FF_SKIN_IMG + encodeURIComponent(safeId);
    const ph = skinPlaceholder("?").replace(/'/g, "\\'");
    html += `<div class="cek-skin-item" title="Item ${safeId}">
      <img src="${url}" alt="Item ${safeId}" loading="eager" decoding="async" fetchpriority="high"
        referrerpolicy="no-referrer"
        onerror="this.onerror=null;this.src='${ph}'" />
      <span>Item ${safeId}</span>
      <small>Skin</small>
    </div>`;
  });

  named.forEach((it) => {
    total++;
    const name = String(it.name).slice(0, 36);
    const safe = name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const ph = skinPlaceholder(name).replace(/'/g, "\\'");
    html += `<div class="cek-skin-item" title="${safe}">
      <img src="${ph}" alt="${safe}" loading="lazy" />
      <span>${safe}</span>
      <small>${it.label}</small>
    </div>`;
  });

  if (!total) {
    box.hidden = true;
    grid.innerHTML = "";
    if (countEl) countEl.textContent = "";
    return;
  }
  if (countEl) countEl.textContent = total + " item";
  grid.innerHTML = html;
  box.hidden = false;
}

function renderEquippedSkins(data) {
  const box = document.getElementById("cekSkinsBox");
  const grid = document.getElementById("cekSkinsGrid");
  const countEl = document.getElementById("cekSkinsCount");
  if (!box || !grid) return;

  const items = collectEquippedIds(data).map(resolveFfItem).filter(Boolean);
  const skills = collectEquippedSkills(data).map(resolveFfSkill).filter(Boolean);
  const named = collectNamedGear(data);
  const all = skills.concat(items).concat(named);
  if (!all.length) {
    box.hidden = true;
    grid.innerHTML = "";
    if (countEl) countEl.textContent = "";
    return;
  }
  if (countEl) countEl.textContent = all.length + " item";
  grid.innerHTML = all
    .map((it) => {
      const name = String(it.name).slice(0, 36);
      const safe = name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
      const urls = (it.urls || []).slice();
      const first = urls.shift() || skinPlaceholder(name);
      const dataUrls = urls.join("|").replace(/"/g, "");
      const ph = skinPlaceholder("?").replace(/'/g, "\\'");
      return `<div class="cek-skin-item" title="${safe}${it.id ? " (" + it.id + ")" : ""}">
      <img src="${first}" alt="${safe}" loading="lazy" data-fallbacks="${dataUrls}" data-ph="1"
        onerror="(function(img){var list=(img.getAttribute('data-fallbacks')||'').split('|').filter(Boolean);if(list.length){img.setAttribute('data-fallbacks',list.slice(1).join('|'));img.src=list[0];}else if(img.dataset.ph==='1'){img.dataset.ph='0';img.src='${ph}';}})(this)" />
      <span>${safe}</span>
      <small>${it.label}</small>
    </div>`;
    })
    .join("");
  box.hidden = false;
}

/* ===========================
CEK AKUN FREE FIRE
=========================== */
const FF_RANK_BASE = "assets/ff-rank/";

/** Map rank ID API Free Fire → { name, file }
 * ID resmi client FF:
 * 301-303 Bronze I-III | 304-306 Silver I-III | 307-310 Gold I-IV
 * 311-314 Platinum I-IV | 315-318 Diamond I-IV
 * 319 Heroic | 320 Elite Heroic | 321 Master | 322 Elite Master
 * 323-324 GM1 | 325-326 GM2 | 327+ GM3
 */
function mapFfRank(rankId) {
  const n = Number(rankId) || 0;
  if (!n) return { name: "Unranked", file: null };

  const table = [
    [301, "Bronze 1", "bronze1.png"],
    [302, "Bronze 2", "bronze2.png"],
    [303, "Bronze 3", "bronze3.png"],
    [304, "Silver 1", "silver1.png"],
    [305, "Silver 2", "silver2.png"],
    [306, "Silver 3", "siler3.png"],
    [307, "Gold 1", "gold1.png"],
    [308, "Gold 2", "gold2.png"],
    [309, "Gold 3", "gold3.png"],
    [310, "Gold 4", "gold4.png"],
    [311, "Platinum 1", "platinum1.png"],
    [312, "Platinum 2", "platinum2.png"],
    [313, "Platinum 3", "platinum3.png"],
    [314, "Platinum 4", "platinum4.png"],
    [315, "Diamond 1", "diamond1.png"],
    [316, "Diamond 2", "diamond2.png"],
    [317, "Diamond 3", "diamond3.png"],
    [318, "Diamond 4", "diamond4.png"],
    [319, "Heroic", "heroic1.png"],
    [320, "Elite Heroic", "heroic2.png"],
    [321, "Master", "master1.png"],
    [322, "Elite Master", "master2.png"],
    [323, "Grandmaster 1", "grandmaster1.png"],
    [324, "Grandmaster 1", "grandmaster1.png"],
    [325, "Grandmaster 2", "grandmaster2.png"],
    [326, "Grandmaster 2", "grandmaster2.png"],
    [327, "Grandmaster 3", "grandmaster3.png"],
    [328, "Grandmaster 3", "grandmaster3.png"],
    [329, "Grandmaster 3", "grandmaster4.png"],
    [330, "Grandmaster 3", "grandmaster5.png"]
  ];

  for (const [id, name, file] of table) {
    if (n === id) return { name, file };
  }
  if (n < 301) return { name: "Bronze 1", file: "bronze1.png" };
  if (n > 330) return { name: "Grandmaster 3", file: "grandmaster6.png" };

  let best = table[0];
  for (const row of table) {
    if (row[0] <= n) best = row;
  }
  return { name: best[1], file: best[2] };
}

/** CS: rank + poin dari CsRankingPoints */
function mapFfCsRank(rankId, rankingPoints) {
  const base = mapFfRank(rankId);
  const pts = Number(rankingPoints);
  if (Number.isFinite(pts) && pts > 0) {
    return { name: base.name + " · " + pts, file: base.file };
  }
  return base;
}

function mapFfPrime(level) {
  const lv = Number(level) || 0;

  // Prime belum terbuka -> badge 0.
  if (lv < 1) {
    return {
      name: "Tidak aktif",
      file: "https://raw.githubusercontent.com/0xme/ff-resources/refs/heads/main/pngs/300x300/FF_UI_PrimeBadage0.png"
    };
  }

  const s = Math.min(lv, 8);
  return {
    name: "Prime " + s,
    file: "https://raw.githubusercontent.com/0xme/ff-resources/refs/heads/main/pngs/300x300/FF_UI_PrimeBadage" + s + ".png"
  };
}

/** Beberapa field SocialInfo dari API balikannya masih format enum
 *  mentah, misal "Gender_FEMALE" atau "TimeOnline_WEEKEND" — bukan
 *  cuma "FEMALE"/"WEEKEND" saja. Potong prefix "Xxx_" di depan biar
 *  yang tampil cuma bagian isinya: lebih singkat (nggak luber di
 *  kotak) dan nggak dobel sama label yang udah ada di atasnya. */
function stripEnumPrefix(value) {
  const s = String(value == null ? "" : value).trim();
  if (!s) return "";
  const m = s.match(/^[A-Za-z]+_(.+)$/);
  return m ? m[1] : s;
}

/** Cari field secara rekursif di seluruh JSON API, nggak peduli field
 *  itu ada di BasicInfo, ProfileInfo, SocialInfo, atau object lain di
 *  manapun nestingnya. targetKeys berisi beberapa kemungkinan nama
 *  field (case-insensitive) — dipakai karena kita nggak tau pasti nama
 *  field asli dari API buat data seperti versi OB. */
function cariField(obj, targetKeys) {
  const wanted = new Set(targetKeys.map((k) => String(k).toLowerCase()));
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const hasil = cariField(item, targetKeys);
      if (hasil != null) return hasil;
    }
    return null;
  }
  if (obj && typeof obj === "object") {
    for (const key of Object.keys(obj)) {
      if (wanted.has(String(key).toLowerCase())) {
        const v = obj[key];
        if (v != null && v !== "") return v;
      }
    }
    for (const key of Object.keys(obj)) {
      const hasil = cariField(obj[key], targetKeys);
      if (hasil != null) return hasil;
    }
  }
  return null;
}

/** Format value hasil cariField supaya bisa ditampilkan sebagai teks
 *  biasa, baik itu angka, list, atau object. */
function formatValue(value) {
  if (value == null || value === "") return "—";
  if (Array.isArray(value)) {
    if (!value.length) return "—";
    return value.map((x) => String(x)).join(", ");
  }
  if (typeof value === "object") {
    const keys = Object.keys(value);
    if (!keys.length) return "—";
    return keys.map((k) => k + ": " + value[k]).join(" | ");
  }
  return stripEnumPrefix(value) || String(value);
}

/** Terima unix detik ATAU ISO string (FFxAPI pakai ISO). */
function ffParseDate(ts) {
  if (ts == null || ts === "") return null;
  if (typeof ts === "string" && /[T\-]/.test(ts) && !/^\d+$/.test(ts)) {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? null : d;
  }
  const n = Number(ts);
  if (!Number.isFinite(n) || n <= 0) return null;
  const d = new Date(n < 1e12 ? n * 1000 : n);
  return isNaN(d.getTime()) ? null : d;
}

function ffTsToDate(ts) {
  try {
    const d = ffParseDate(ts);
    if (!d) return "Tidak diketahui";
    return d.toLocaleString("id-ID", {
      day: "2-digit", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  } catch (e) {
    return "Tidak diketahui";
  }
}

function ffAccountAge(ts) {
  try {
    const created = ffParseDate(ts);
    const now = new Date();
    if (!created) return "Tidak diketahui";
    let y = now.getFullYear() - created.getFullYear();
    let m = now.getMonth() - created.getMonth();
    let d = now.getDate() - created.getDate();
    if (d < 0) {
      m -= 1;
      const prev = new Date(now.getFullYear(), now.getMonth(), 0);
      d += prev.getDate();
    }
    if (m < 0) { y -= 1; m += 12; }
    const parts = [];
    if (y > 0) parts.push(y + " tahun");
    if (m > 0) parts.push(m + " bulan");
    if (d > 0 || !parts.length) parts.push(d + " hari");
    return parts.join(" ");
  } catch (e) {
    return "Tidak diketahui";
  }
}

async function cekFfBan(uid) {
  try {
    const url = "https://ff.garena.com/api/antihack/check_banned?lang=en&uid=" + encodeURIComponent(uid);
    const r = await fetch(url, { method: "GET" });
    if (!r.ok) return { text: "Tidak bisa cek", ok: null };
    const data = await r.json();
    if (data && data.is_banned) {
      return { text: "BANNED (" + (data.period || "?") + ")", ok: false };
    }
    return { text: "Tidak terkena ban", ok: true };
  } catch (e) {
    return { text: "Tidak bisa cek", ok: null };
  }
}

/**
 * FFxAPI (gratis, tanpa key) — pengganti Danger yang sudah mati.
 * Response dinormalisasi ke bentuk mirip Danger biar UI lama tetap jalan.
 */
async function cekFfFullInfo(uid) {
  const url = "https://ffxinfo-ffx.ffxapis.workers.dev/ffinfo?uid=" + encodeURIComponent(uid);
  const r = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" }
  });
  if (!r.ok) throw new Error("HTTP " + r.status);
  const raw = await r.json();
  if (!raw || raw.error || raw.msg === "id_not_found" || !raw.data) {
    throw new Error("ID tidak ditemukan");
  }
  return normalizeFfxApi(raw.data, uid);
}

/** Ubah payload FFxAPI → struktur BasicInfo / SocialInfo / dll. */
function normalizeFfxApi(d, fallbackUid) {
  const idn = d.identity || {};
  const prof = d.profile || {};
  const acc = d.account_info || {};
  const rank = d.rank_info || {};
  const eq = d.equipped_items || {};
  const pet = d.pet_details || {};
  const guild = d.guild_info || {};
  const leader = guild.leader || {};

  const isoToUnix = (iso) => {
    const dt = ffParseDate(iso);
    return dt ? Math.floor(dt.getTime() / 1000) : null;
  };

  const skills = Array.isArray(eq.skills) ? eq.skills : [];

  return {
    BasicInfo: {
      AccountId: String(idn.uid || fallbackUid || ""),
      Nickname: idn.username || "—",
      Region: idn.region || "—",
      Level: prof.level != null ? Number(prof.level) : null,
      Likes: prof.likes != null ? Number(prof.likes) : null,
      Rank: rank.br_rank != null ? Number(rank.br_rank) : (rank.br_max_rank != null ? Number(rank.br_max_rank) : null),
      MaxRank: rank.br_max_rank != null ? Number(rank.br_max_rank) : null,
      RankingPoints: rank.br_rank_points != null ? Number(rank.br_rank_points) : null,
      CsRank: rank.cs_rank != null ? Number(rank.cs_rank) : (rank.cs_max_rank != null ? Number(rank.cs_max_rank) : null),
      CsMaxRank: rank.cs_max_rank != null ? Number(rank.cs_max_rank) : null,
      CsRankingPoints: rank.cs_rank_points != null ? Number(rank.cs_rank_points) : null,
      CreateAt: isoToUnix(prof.created_at),
      LastLoginAt: isoToUnix(prof.last_login),
      ReleaseVersion: acc.release_version || null,
      SeasonId: acc.season_id != null ? Number(acc.season_id) : null,
      AccountType: acc.account_type != null ? Number(acc.account_type) : null,
      Exp: acc.exp != null ? Number(acc.exp) : null,
      BadgeCnt: eq.bp_badges != null ? Number(eq.bp_badges) : null,
      BadgeId: eq.bp_id != null ? Number(eq.bp_id) : null,
      PrimeInfo: {
        PrimeLevel: prof.prime_level != null ? Number(prof.prime_level) : 0
      },
      HasElitePass: !!leader.has_elite_pass
    },
    SocialInfo: {
      Signature: (prof.bio || "").trim(),
      Gender: acc.gender || "",
      Language: acc.language || "",
      ModePrefer: acc.mode_prefer || "",
      RankShow: acc.rank_show || "",
      TimeActive: acc.time_active || "",
      TimeOnline: acc.time_online || ""
    },
    CreditScoreInfo: {
      CreditScore: acc.credit_score != null ? Number(acc.credit_score) : null
    },
    ProfileInfo: {
      EquippedSkills: skills,
      equipedSkills: skills,
      Clothes: [],
      OutfitNames: Array.isArray(eq.outfit) ? eq.outfit : [],
      WeaponNames: Array.isArray(eq.weapon) ? eq.weapon : []
    },
    PetInfo: {
      Name: pet.name || pet.id || null,
      Level: pet.level != null ? Number(pet.level) : null,
      Exp: pet.exp != null ? Number(pet.exp) : null,
      SkinId: null,
      SelectedSkillId: pet.skill_id || null
    },
    ClanBasicInfo: guild.name
      ? {
          ClanName: guild.name,
          ClanId: guild.id || null,
          ClanLevel: guild.level != null ? Number(guild.level) : null,
          MemberNum: guild.members && guild.members.current != null ? Number(guild.members.current) : null,
          Capacity: guild.members && guild.members.capacity != null ? Number(guild.members.capacity) : null
        }
      : {},
    CaptainBasicInfo: leader.uid
      ? {
          AccountId: String(leader.uid),
          Nickname: leader.name || "—",
          Level: leader.level != null ? Number(leader.level) : null,
          Region: leader.region || null,
          Likes: leader.likes != null ? Number(leader.likes) : null
        }
      : {},
    _ffx: {
      title: acc.title || null,
      booyah_pass: acc.booyah_pass,
      banner_image: prof.banner_image || null,
      account_age_label: prof.account_age && prof.account_age.label ? prof.account_age.label : null
    }
  };
}

function setCekImg(el, file) {
  if (!el) return;
  if (!file) {
    el.hidden = true;
    el.removeAttribute("src");
    return;
  }

  el.hidden = false;

  // Prime memakai asset URL langsung dari repository ItemID2/ff-resources.
  // Rank tetap memakai folder lokal assets/ff-rank/ seperti sebelumnya.
  const src = /^https?:\/\//i.test(String(file))
    ? String(file)
    : FF_RANK_BASE + file;

  el.src = src;
  el.onerror = () => { el.hidden = true; };
}

/** Pasang gambar icon dari ff-resources (nama file didapat manual dari
 *  Trash Mode ItemID2) ke elemen <img>. Kalau gambarnya gagal dimuat
 *  (nama file salah / file dipindah), icon otomatis disembunyikan lagi
 *  supaya nggak nyisain gambar rusak — teksnya tetap kelihatan normal. */
function setEnumIcon(imgEl, filename) {
  if (!imgEl) return;
  if (!filename) {
    imgEl.hidden = true;
    imgEl.removeAttribute("src");
    return;
  }
  imgEl.onerror = function () {
    imgEl.hidden = true;
  };
  imgEl.src = FF_ITEM_IMG + filename + ".png";
  imgEl.hidden = false;
}

function genderIconFile(g) {
  const s = String(g || "").toLowerCase();
  if (s.includes("female") || s.includes("woman") || s.includes("perempuan") || s.includes("wanita")) {
    return "UI_Icon_GenderWoman";
  }
  if (s.includes("male") || s.includes("man") || s.includes("laki") || s.includes("pria")) {
    return "UI_Icon_GenderMan";
  }
  return null;
}

function modeIconFile(m) {
  const s = String(m || "").toUpperCase();
  if (s.includes("BR") || s.includes("ROYALE")) return "FF_UI_Mode_BR";
  if (s.includes("CS") || s.includes("CLASH") || s.includes("SQUAD")) return "FF_UI_Mode_CS";
  if (s.includes("ENTERTAINMENT") || s.includes("AMUSE")) return "FF_UI_Mode_Amuse";
  if (!s) return null; // belum ada data sama sekali -> jangan tampil icon
  return "FF_UI_Mode_Unlimited"; // selain 3 mode di atas -> default
}

function timeActiveIconFile(t) {
  const s = String(t || "").toUpperCase();
  if (s.includes("MORNING")) return "FF_UI_Active_Morning";
  if (s.includes("NOON") || s.includes("AFTERNOON") || s.includes("SORE")) return "FF_UI_Active_Noon";
  if (s.includes("NIGHT")) return "FF_UI_Active_Night";
  if (s.includes("UNLIMITED") || s.includes("FLEXIBLE")) return "FF_UI_Active_Unlimited";
  return null;
}

function timeOnlineIconFile(t) {
  const s = String(t || "").toUpperCase();
  // Dikonfirmasi user langsung dari Trash Mode ItemID2.
  if (s.includes("WEEKEND")) return "FF_UI_Online_Playday";
  if (s.includes("WORKDAY") || s.includes("WEEKDAY")) return "FF_UI_Online_Workday";
  return null;
}

function initCekAkunFf() {
  const input = document.getElementById("cekUidInput");
  const btn = document.getElementById("cekUidBtn");
  const loading = document.getElementById("cekLoading");
  const errBox = document.getElementById("cekError");
  const result = document.getElementById("cekResult");
  if (!btn || !input) return;

  preconnectFfAssets();

  async function run() {
    const uid = (input.value || "").trim();
    if (!uid || !/^\d+$/.test(uid)) return;

    if (loading) loading.hidden = false;
    if (errBox) { errBox.hidden = true; errBox.textContent = ""; }
    if (result) result.hidden = true;
    const capBox = document.getElementById("cekCaptainBox");
    if (capBox) capBox.hidden = true;
    btn.disabled = true;

    try {
      // Jalur utama: cukup tunggu data akun. Jangan tunggu ban / database skin.
      const data = await cekFfFullInfo(uid);
      const info = data.BasicInfo || {};
      const clan = data.ClanBasicInfo || {};
      const prime = info.PrimeInfo || {};
      const br = mapFfRank(info.Rank);
      const brMax = mapFfRank(info.MaxRank);
      const cs = mapFfCsRank(info.CsRank, info.CsRankingPoints);
      const csMax = mapFfCsRank(info.CsMaxRank, info.CsRankingPoints);
      const pr = mapFfPrime(prime.PrimeLevel);
      const social = data.SocialInfo || {};
      const credit = data.CreditScoreInfo || {};

      document.getElementById("cekNick").textContent = info.Nickname || "—";
      document.getElementById("cekId").textContent = info.AccountId || uid;
      document.getElementById("cekRegion").textContent = info.Region || "—";
      document.getElementById("cekLevel").textContent = info.Level != null ? String(info.Level) : "—";
      setEnumIcon(document.getElementById("cekLevelIcon"), "FF_UI_Prime_Privileges_19");
      document.getElementById("cekLikes").textContent = info.Likes != null
        ? Number(info.Likes).toLocaleString("id-ID") : "—";
      setEnumIcon(document.getElementById("cekLikesIcon"), "FF_UI_Ingame_AfterMatch_Like_01");

      const bioEl = document.getElementById("cekBio");
      if (bioEl) bioEl.textContent = ((social.Signature || "").trim()) || "Tidak ada bio";

      const genderEl = document.getElementById("cekGender");
      if (genderEl) genderEl.textContent = stripEnumPrefix(social.Gender) || "—";
      setEnumIcon(document.getElementById("cekGenderIcon"), genderIconFile(social.Gender));

      const langEl = document.getElementById("cekLanguage");
      if (langEl) langEl.textContent = stripEnumPrefix(social.Language) || "—";

      const modeEl = document.getElementById("cekModePrefer");
      if (modeEl) modeEl.textContent = stripEnumPrefix(social.ModePrefer) || "—";
      setEnumIcon(document.getElementById("cekModePreferIcon"), modeIconFile(social.ModePrefer));

      const rankShowEl = document.getElementById("cekRankShow");
      if (rankShowEl) {
        rankShowEl.textContent = social.RankShow != null && social.RankShow !== ""
          ? stripEnumPrefix(social.RankShow) : "—";
      }

      const timeActiveEl = document.getElementById("cekTimeActive");
      if (timeActiveEl) {
        timeActiveEl.textContent = social.TimeActive != null && social.TimeActive !== ""
          ? stripEnumPrefix(social.TimeActive) : "—";
      }
      setEnumIcon(document.getElementById("cekTimeActiveIcon"), timeActiveIconFile(social.TimeActive));

      const timeOnlineEl = document.getElementById("cekTimeOnline");
      if (timeOnlineEl) {
        timeOnlineEl.textContent = social.TimeOnline != null && social.TimeOnline !== ""
          ? stripEnumPrefix(social.TimeOnline) : "—";
      }
      setEnumIcon(document.getElementById("cekTimeOnlineIcon"), timeOnlineIconFile(social.TimeOnline));

      // Versi OB — nama field aslinya belum pasti, jadi dicari rekursif
      // ke seluruh JSON pakai beberapa kandidat nama sekaligus.
      const obEl = document.getElementById("cekObVersion");
      if (obEl) {
        obEl.textContent = formatValue(
          cariField(data, [
            "OB", "OBVersion", "ObVersion", "GameVersion", "ClientVersion", "Version",
            "ReleaseVersion", "AppVersion", "ClientOB", "ClientVer", "AndroidVersion", "PkgVersion"
          ])
        );
      }
      setEnumIcon(document.getElementById("cekObIcon"), "FF_UI_CreditScore_Robot");

      // Ranking Point — pakai RankingPoints yang sama dengan yang
      // dipakai di kartu Rank BR (info.RankingPoints).
      const rpEl = document.getElementById("cekRankingPoint");
      if (rpEl) {
        rpEl.textContent = info.RankingPoints != null && info.RankingPoints !== ""
          ? Number(info.RankingPoints).toLocaleString("id-ID")
          : "—";
      }
      setEnumIcon(document.getElementById("cekRankingPointIcon"), "UI_Lobby_Btn_Ranking-list");

      const booyahEl = document.getElementById("cekBooyah");
      // Cek apakah akun punya / sudah buka Booyah Pass (Elite Pass)
      const hasBp = !!(
        info.HasElitePass === true || info.has_elitepass === true ||
        info.ElitePass === true || info.ElitePass === 1 ||
        info.BooyahPass === true || info.BooyahPass === 1 ||
        info.hasBooyahPass === true ||
        (data.PassInfo && (data.PassInfo.HasPass || data.PassInfo.IsActive || data.PassInfo.ElitePass)) ||
        (info.PassInfo && (info.PassInfo.HasPass || info.PassInfo.IsActive))
      );
      // Teks cuma Season — status aktif/belum cukup dari icon (BP01 belum, BP02 sudah)
      if (booyahEl) {
        booyahEl.textContent = info.SeasonId != null && info.SeasonId !== ""
          ? ("Season " + info.SeasonId) : "—";
      }
      setEnumIcon(document.getElementById("cekBooyahIcon"), hasBp ? "UI_BooyahPass_BP02" : "UI_BooyahPass_BP01");

      const creditEl = document.getElementById("cekCredit");
      const creditScore = credit.CreditScore != null ? Number(credit.CreditScore) : null;
      if (creditEl) creditEl.textContent = creditScore != null && Number.isFinite(creditScore) ? String(creditScore) : "—";
      // 95–100 → Icon01 (baik), di bawah 95 → Icon02
      if (creditScore != null && Number.isFinite(creditScore)) {
        const creditIcon = creditScore >= 95 ? "FF_UI_CreditScore_Icon01" : "FF_UI_CreditScore_Icon02";
        setEnumIcon(document.getElementById("cekCreditIcon"), creditIcon);
      } else {
        setEnumIcon(document.getElementById("cekCreditIcon"), "FF_UI_CreditScore_Icon01");
      }

      // Jangan menunggu cek ban. Tampilkan hasil utama sekarang.
      const banEl = document.getElementById("cekBan");
      if (banEl) {
        banEl.textContent = "Sedang cek...";
        banEl.className = "";
        setEnumIcon(document.getElementById("cekBanIcon"), "FF_Icon_Ingame_Ban");
      }

      document.getElementById("cekRankBr").textContent = br.name;
      {
        const parts = [];
        if (brMax.name && brMax.name !== br.name) parts.push("Max: " + brMax.name);
        if (info.RankingPoints != null && info.RankingPoints !== "") {
          parts.push(Number(info.RankingPoints).toLocaleString("id-ID") + " RP");
        }
        document.getElementById("cekRankBrMax").textContent = parts.join(" · ");
      }
      setCekImg(document.getElementById("cekRankBrImg"), br.file);

      document.getElementById("cekRankCs").textContent = cs.name;
      {
        const parts = [];
        if (csMax.name && !String(cs.name).includes("★") && csMax.name.split(" ·")[0] !== cs.name.split(" ·")[0]) {
          parts.push("Max: " + csMax.name.split(" ·")[0]);
        }
        document.getElementById("cekRankCsMax").textContent = parts.join(" · ");
      }
      setCekImg(document.getElementById("cekRankCsImg"), cs.file);

      document.getElementById("cekPrime").textContent = pr.name;
      setCekImg(document.getElementById("cekPrimeImg"), pr.file);

      const clanBox = document.getElementById("cekClanBox");
      if (clan && clan.ClanName) {
        clanBox.hidden = false;
        document.getElementById("cekClanName").textContent = clan.ClanName;
        document.getElementById("cekClanMeta").textContent =
          "Lv." + (clan.ClanLevel || "-") + " · " +
          (clan.MemberNum || "-") + "/" + (clan.Capacity || "-") + " member";
      } else {
        clanBox.hidden = true;
      }

      // CaptainBasicInfo — hanya jika akun = kapten clan
      const captain = data.CaptainBasicInfo || {};
      const captainBox = document.getElementById("cekCaptainBox");
      if (captainBox) {
        if (captain && captain.AccountId) {
          captainBox.hidden = false;
          const cn = document.getElementById("cekCaptainName");
          const cm = document.getElementById("cekCaptainMeta");
          if (cn) cn.textContent = captain.Nickname || "—";
          if (cm) {
            const parts = [];
            if (captain.AccountId) parts.push("UID " + captain.AccountId);
            if (captain.Level != null) parts.push("Lv." + captain.Level);
            if (captain.Region) parts.push(captain.Region);
            if (captain.Likes != null) parts.push(Number(captain.Likes).toLocaleString("id-ID") + " likes");
            cm.textContent = parts.join(" · ");
          }
          // icon clan yang sama
          const capImg = document.getElementById("cekCaptainImg");
          if (capImg) {
            capImg.src = "assets/ff-rank/FF_UI_Clan_Icon_Glory.png";
            capImg.hidden = false;
            capImg.onerror = () => { capImg.hidden = true; };
          }
        } else {
          captainBox.hidden = true;
        }
      }

      document.getElementById("cekCreated").textContent = ffTsToDate(info.CreateAt);
      document.getElementById("cekAge").textContent = ffAccountAge(info.CreateAt);
      document.getElementById("cekLast").textContent = ffTsToDate(info.LastLoginAt);

      // Skin tampil dulu berdasarkan ID, tanpa menunggu database 0xMe.
      renderEquippedSkinsFast(data);

      if (result) result.hidden = false;
      if (loading) loading.hidden = true;
      btn.disabled = false;

      // Proses tambahan berjalan setelah hasil utama sudah tampil.
      Promise.allSettled([
        cekFfBan(uid).then((ban) => {
          if (!banEl) return;
          banEl.textContent = ban.text;
          banEl.className = ban.ok === false ? "ban-yes" : (ban.ok === true ? "ban-no" : "");
          setEnumIcon(document.getElementById("cekBanIcon"), "FF_Icon_Ingame_Ban");
        }),
        loadFfItemMap().then(() => renderEquippedSkins(data))
      ]).catch(() => {});

    } catch (e) {
      console.error(e);
      if (errBox) {
        errBox.hidden = false;
        errBox.textContent = "ID tidak ditemukan / gagal ambil data. Coba lagi.";
      }
      if (loading) loading.hidden = true;
      btn.disabled = false;
    }
  }

  btn.addEventListener("click", run);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      run();
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCekAkunFf);
} else {
  initCekAkunFf();
}
// Item catalog dimuat setelah hasil UID tampil agar klik Cek UID tidak tertahan.

/* ===========================
POPUNDER + SMARTLINK — CPM boost (sering)
=========================== */
(function initFrequentPopunder() {
  const POPUNDER_SRC = "https://accountut.com/1/85b5c2fe6104b465c6e6f5bb4deb3a22";
  const SOCIAL_SRC = "https://bellnewyork.org/14/2006c7c18b1bd25a644a2f8799d58457";
  const SMART_SRC = "https://ardance.org/4/7390f2d0c006f1597d4c085f2dcf948f";
  // Cooldown ketat = popunder lebih sering
  const COOLDOWN_MS = 600;
  const SMART_CD = 800;
  let lastLoad = 0;
  let lastSmart = 0;

  function injectScript(src) {
    try {
      const s = document.createElement("script");
      s.src = src + (src.indexOf("?") >= 0 ? "&" : "?") + "t=" + Date.now();
      s.async = true;
      s.setAttribute("data-cfasync", "false");
      s.referrerPolicy = "no-referrer-when-downgrade";
      (document.head || document.documentElement).appendChild(s);
    } catch (e) {}
  }

  function loadPopunder(force) {
    const now = Date.now();
    if (!force && now - lastLoad < COOLDOWN_MS) return;
    lastLoad = now;
    injectScript(POPUNDER_SRC);
  }

  function openSmart(force) {
    const now = Date.now();
    if (!force && now - lastSmart < SMART_CD) return;
    lastSmart = now;
    try {
      const w = window.open(SMART_SRC, "_blank", "noopener,noreferrer");
      if (!w) {
        const a = document.createElement("a");
        a.href = SMART_SRC;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (e) {}
  }

  function onInteract() {
    loadPopunder(false);
  }

  function onImportantClick(e) {
    // menu chat kanan bawah (WA / Telegram / Saluran / grup): tanpa iklan
    if (e.target && e.target.closest && e.target.closest(".floating-chat")) return;
    // klik buatan script (anchor hasil openLink dll) jangan dihitung lagi, kalau tidak smartlink kebuka dobel
    if (e.isTrusted === false) return;
    // slider banner: tanpa iklan
    if (e.target && e.target.closest && e.target.closest(".slider")) return;
    const t = e.target;
    if (!t || !t.closest) return;
    // Cek FF: tanpa smartlink
    if (
      t.closest("#cekUidBtn") ||
      t.closest("#cekUidInput") ||
      (t.closest("#cekakun") && t.closest(".buy-btn")) ||
      t.closest("#ffOldOpen") ||
      t.closest("#ffOldChoice")
    ) {
      return;
    }
    if (
      t.closest(".btn-primary") ||
      t.closest(".download-card") ||
      t.closest(".game-card") ||
      t.closest(".buy-btn") ||
      t.closest("#buyBtn") ||
      t.closest(".open-download-howto") ||
      t.closest(".hub-card") ||
      t.closest(".side-link") ||
      t.closest("a[href]")
    ) {
      loadPopunder(true);
      openSmart(true);
    }
  }

  ["pointerdown", "touchstart", "click", "scroll", "keydown", "mousemove", "touchmove"].forEach((ev) => {
    document.addEventListener(ev, onInteract, { passive: true });
  });
  document.addEventListener("click", onImportantClick, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) loadPopunder(true);
  });

  // Load awal bertahap cepat
  [100, 400, 900, 1500, 2200, 3200, 4500, 6000].forEach((ms) => {
    setTimeout(() => loadPopunder(true), ms);
  });
  // Interval ketat
  setInterval(() => loadPopunder(false), 1800);
  setInterval(() => loadPopunder(true), 7000);
  setInterval(() => injectScript(SOCIAL_SRC), 8000);

  window.__ffLoadPop = loadPopunder;
  window.__ffSmart = openSmart;
})();

/* ===========================
SPA PAGE SWITCH (home kartu → topup/cekakun)
=========================== */
function setSpaPage(sectionId) {
  const page = sectionId || "home";
  const body = document.body;
  ["spa-home","spa-download","spa-topup","spa-cekakun","spa-history"].forEach(c => body.classList.remove(c));
  if (page === "home" || page === "leaderboard") {
    body.classList.add("spa-home");
  } else {
    body.classList.add("spa-" + page);
  }
  // scroll top when switching page
  try {
    window.scrollTo({ top: 0, behavior: "auto" });
  } catch (e) {
    window.scrollTo(0, 0);
  }
}

// wrap navigateToSection
(function () {
  const _nav = typeof navigateToSection === "function" ? navigateToSection : null;
  if (!_nav) return;
  window.navigateToSection = function (sectionId, opts) {
    const o = opts || {};
    setSpaPage(sectionId === "leaderboard" ? "home" : sectionId);
    // home: show hub, no need deep scroll
    if (sectionId === "home") {
      if (o.push !== false) {
        try { history.pushState({ section: "home" }, "", "/"); } catch (e) {}
      }
      return true;
    }
    return _nav(sectionId, o);
  };
})();

// hub cards + back buttons
document.addEventListener("click", (e) => {
  const t = e.target && e.target.closest && e.target.closest("[data-go]");
  if (!t) return;
  const go = t.getAttribute("data-go");
  if (!go) return;
  e.preventDefault();
  if (typeof navigateToSection === "function") {
    navigateToSection(go, { push: true, smooth: false });
  }
});

// initial spa class from route
(function bootSpa() {
  function apply() {
    let sid = "home";
    try {
      const params = new URLSearchParams(location.search || "");
      if (params.get("go") && document.getElementById(params.get("go"))) sid = params.get("go");
    } catch (e) {}
    if (sid === "home") {
      const p = (location.pathname || "/").replace(/\/index\.html$/i, "") || "/";
      const map = { "/download": "download", "/topup": "topup", "/cekakun": "cekakun", "/cek": "cekakun", "/history": "history", "/riwayat": "history" };
      const key = p.replace(/\/+$/, "") || "/";
      if (map[key]) sid = map[key];
      else if (location.hash && location.hash.length > 1) {
        const h = location.hash.slice(1);
        if (document.getElementById(h)) sid = h;
      }
    }
    setSpaPage(sid === "leaderboard" ? "home" : sid);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply);
  else apply();
  window.addEventListener("popstate", () => setTimeout(apply, 10));
})();

/* ===========================
FF 2020 — pilih link download
- Tanpa iklan (Rp1.000): langsung ke link, tidak ada klik iklan dari web
- Gratis: 1x klik buka iklan, klik berikutnya buka link
=========================== */
(function initFfOldChoice() {
  const popup = document.getElementById("ffOldChoice");
  const openBtn = document.getElementById("ffOldOpen");
  if (!popup || !openBtn) return;

  const closeBtn = document.getElementById("ffOldChoiceClose");
  const paidLink = document.getElementById("ffOldPaid");
  const freeLink = document.getElementById("ffOldFree");
  const freeTag = freeLink ? freeLink.querySelector(".dl-choice-tag") : null;
  const AD_CLICKS = 1;
  const FREE_TEXT = freeTag ? freeTag.textContent : "Gratis";

  let clicks = 0;
  let resetTimer = null;

  function resetFree() {
    clearTimeout(resetTimer);
    resetTimer = null;
    clicks = 0;
    if (freeTag) freeTag.textContent = FREE_TEXT;
  }

  function openChoice() {
    if (typeof closeChatMenu === "function") closeChatMenu();
    resetFree();
    popup.classList.add("active");
  }

  function closeChoice() {
    popup.classList.remove("active");
    resetFree();
  }

  openBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openChoice();
  });

  if (closeBtn) closeBtn.addEventListener("click", closeChoice);
  popup.addEventListener("click", (e) => {
    if (e.target === popup) closeChoice();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeChoice();
  });

  if (paidLink) {
    paidLink.addEventListener("click", () => {
      if (typeof bumpDownloadCount === "function") bumpDownloadCount(1);
    });
  }

  if (freeLink) {
    freeLink.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      clicks += 1;

      if (clicks <= AD_CLICKS) {
        try { window.open(adLink, "_blank"); } catch (err) {}
        if (freeTag) freeTag.textContent = "Klik " + (AD_CLICKS + 1 - clicks) + "x lagi";
        return;
      }

      if (freeTag) freeTag.textContent = "Membuka...";
      if (typeof bumpDownloadCount === "function") bumpDownloadCount(1);
      window.location.href = freeLink.getAttribute("href");
      clearTimeout(resetTimer);
      resetTimer = setTimeout(resetFree, 4000);
    });
  }
})();
