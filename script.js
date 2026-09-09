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
        ["vipPopup", "active"],
        ["vipListPopup", "active"],
        ["vipHowToPopup", "active"],
        ["downloadHowToPopup", "active"],
        ["vipChatPanel", "show"],
        ["vipChatOverlay", "show"]
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
    history: "/history",
    faq: "/faq"
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
    "/riwayat": "history",
    "/faq": "faq"
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
FAQ
=========================== */
document.querySelectorAll(".faq-item").forEach(item => {
    const btn = item.querySelector("button");
    const answer = item.querySelector("div");
    btn.onclick = () => {
        if (answer.style.maxHeight) {
            answer.style.maxHeight = null;
            answer.style.paddingBottom = "0";
        } else {
            answer.style.maxHeight = answer.scrollHeight + 20 + "px";
            answer.style.paddingBottom = "16px";
        }
    };
});

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

document.querySelectorAll(".download-card, .game-card, .stat, .faq-item").forEach(el => {
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
const adLink = "https://www.effectivecpmnetwork.com/b8r0ht674?key=7390f2d0c006f1597d4c085f2dcf948f";

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
    const popupBanner = document.getElementById("popupBanner");
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

        if (popupBanner) popupBanner.src = data.banner;
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

    const topupAdLink = "https://www.effectivecpmnetwork.com/b8r0ht674?key=7390f2d0c006f1597d4c085f2dcf948f";

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
            if (popupBanner && card.dataset.banner) popupBanner.src = card.dataset.banner;
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
            const progressBar = document.getElementById("progressBar");
            const progressText = document.getElementById("progressText");
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
                <span>Top up atau order VIP akan muncul di sini.</span>
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
            } else if (typeof showToast === "function") {
                showToast("Gagal", "Tidak bisa salin", "error");
            }
        });
    });
}

renderTrxHistory();

/* ===========================
SLIDER (SINGLE VIDEO)
=========================== */
const heroVideo = document.getElementById("heroVideo");
if (heroVideo) {
    heroVideo.muted = true;
    const tryPlay = () => {
        const p = heroVideo.play();
        if (p && p.catch) p.catch(() => {});
    };
    tryPlay();
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) tryPlay();
    });
    // unlock autoplay after first tap anywhere (mobile)
    const unlock = () => {
        tryPlay();
        document.removeEventListener("touchstart", unlock);
        document.removeEventListener("click", unlock);
    };
    document.addEventListener("touchstart", unlock, { once: true });
    document.addEventListener("click", unlock, { once: true });
}

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
                target.style.boxShadow = "0 0 0 2px rgba(255,152,0,0.6)";
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
            } else {
                showToast("Gagal", "Tidak bisa pakai nama ini, coba lagi", "error");
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
        if (isAdminName(n)) {
            startVipAdminListener();
            const sub = document.getElementById("vipMenuSub");
            if (sub) sub.textContent = "Inbox order VIP";
            const lab = document.getElementById("vipMenuLabel");
            if (lab) lab.textContent = "Inbox VIP (Admin)";
        }
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
            showToast("Gagal", "Pesan tidak terkirim", "error");
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
            showToast("Gagal", "Upload gambar gagal", "error");
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
            showToast("Gagal", "Upload foto profil gagal", "error");
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
   FFKIPAS VIP — AUTO ORDER + PRIVATE CHAT
   Setiap pembeli = 1 room chat terpisah (Firebase)
=========================== */
const VIP_PRODUCT = "FFKIPAS VIP";
const VIP_LS_KEY = "ff_vip_orders";
/** Paket harga VIP */
const VIP_PACKAGES = [
    { id: "1d", days: 1, price: 20000, label: "1 Hari" },
    { id: "2d", days: 2, price: 40000, label: "2 Hari" },
    { id: "3d", days: 3, price: 60000, label: "3 Hari" },
    { id: "4d", days: 4, price: 80000, label: "4 Hari" },
    { id: "5d", days: 5, price: 100000, label: "5 Hari" },
    { id: "6d", days: 6, price: 120000, label: "6 Hari" },
    { id: "7d", days: 7, price: 140000, label: "7 Hari" },
    { id: "8d", days: 8, price: 160000, label: "8 Hari" },
];
const VIP_PRICE = VIP_PACKAGES[0].price;
const VIP_HOURS_TEXT = "09.00 – 23.00 WIB";
const VIP_REPLY_ETA = "5–15 menit";
/**
 * SETTING KUPON VIP
 * - code   : kode yang diketik user (otomatis di-UPPERCASE)
 * - percent: diskon %
 * - maxUses: kuota total pemakaian (null = tanpa batas)
 * - active : false = nonaktif sementara
 * Ubah / tambah di sini, lalu upload script.js
 */
const VIP_COUPONS = {
    "DISKONKIPAS": { percent: 5, maxUses: 5, active: true },
    "MUHLISDISKON":  { percent: 10, maxUses: 5, active: true },
    "VIP20":    { percent: 11, maxUses: 3, active: true }
};
let vipSelectedPack = VIP_PACKAGES[0];
let vipAppliedCoupon = null; // { code, percent, maxUses }
let vipAdminFilter = "all"; // all | wait | process | done | archived

let vipPending = null; // { orderId, name, contact, note, price, packId, packLabel, days, ... }
let vipActiveOrderId = null;
let vipActiveName = "";
let vipMsgUnsub = null;
let vipStatusUnsub = null;
let vipForceScroll = true;
let vipLastSend = 0;
let vipProofFile = null; // File bukti TF — wajib sebelum order masuk admin

function formatRp(n) {
    return "Rp" + Number(n || 0).toLocaleString("id-ID");
}

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

function getVipCouponDef(code) {
    const c = String(code || "").trim().toUpperCase();
    if (!c || !VIP_COUPONS[c]) return null;
    const def = VIP_COUPONS[c];
    // backward compat: angka polos = percent saja
    if (typeof def === "number") {
        return { code: c, percent: def, maxUses: null, active: true };
    }
    return {
        code: c,
        percent: Number(def.percent) || 0,
        maxUses: def.maxUses == null ? null : Number(def.maxUses),
        active: def.active !== false
    };
}

async function getVipCouponUsedCount(code) {
    if (!gcDb || !gcReady) return 0;
    try {
        const snap = await gcDb.ref("ffkipas_coupons/" + code + "/used").once("value");
        const n = Number(snap.val());
        return Number.isFinite(n) && n > 0 ? n : 0;
    } catch (e) {
        return 0;
    }
}

async function consumeVipCoupon(code) {
    if (!code || !gcDb || !gcReady) return;
    const def = getVipCouponDef(code);
    if (!def || def.maxUses == null) {
        // tetap catat pemakaian meski unlimited
        try {
            await gcDb.ref("ffkipas_coupons/" + code + "/used").transaction(cur => (Number(cur) || 0) + 1);
        } catch (e) {}
        return;
    }
    try {
        await gcDb.ref("ffkipas_coupons/" + code + "/used").transaction(cur => {
            const used = Number(cur) || 0;
            if (used >= def.maxUses) return; // abort
            return used + 1;
        });
    } catch (e) {
        console.warn("coupon consume", e);
    }
}

async function applyVipCoupon() {
    const input = document.getElementById("vipCouponInput");
    const msg = document.getElementById("vipCouponMsg");
    const code = (input?.value || "").trim().toUpperCase();
    if (!code) {
        vipAppliedCoupon = null;
        if (msg) { msg.style.display = "none"; msg.textContent = ""; }
        updateVipPackUI();
        return;
    }
    const def = getVipCouponDef(code);
    if (!def || !def.percent || !def.active) {
        vipAppliedCoupon = null;
        if (msg) {
            msg.style.display = "block";
            msg.className = "vip-coupon-msg err";
            msg.textContent = def && !def.active ? "Kupon nonaktif" : "Kode kupon tidak valid";
        }
        updateVipPackUI();
        showToast("Kupon", def && !def.active ? "Kupon nonaktif" : "Kode tidak valid", "warning");
        return;
    }

    // cek kuota
    if (def.maxUses != null) {
        const used = await getVipCouponUsedCount(code);
        const sisa = def.maxUses - used;
        if (sisa <= 0) {
            vipAppliedCoupon = null;
            if (msg) {
                msg.style.display = "block";
                msg.className = "vip-coupon-msg err";
                msg.textContent = "Kuota kupon " + code + " sudah habis";
            }
            updateVipPackUI();
            showToast("Kupon", "Kuota habis", "warning");
            return;
        }
        vipAppliedCoupon = { code, percent: def.percent, maxUses: def.maxUses, sisa: sisa };
        if (msg) {
            msg.style.display = "block";
            msg.className = "vip-coupon-msg ok";
            msg.textContent = "Kupon " + code + " aktif · −" + def.percent + "% · sisa " + sisa + "/" + def.maxUses;
        }
        updateVipPackUI();
        showToast("Kupon", "Diskon " + def.percent + "% · sisa " + sisa);
        return;
    }

    vipAppliedCoupon = { code, percent: def.percent, maxUses: null };
    if (msg) {
        msg.style.display = "block";
        msg.className = "vip-coupon-msg ok";
        msg.textContent = "Kupon " + code + " aktif · diskon " + def.percent + "%";
    }
    updateVipPackUI();
    showToast("Kupon", "Diskon " + def.percent + "% diterapkan");
}

function getVipDiscountedPrice(base) {
    const p = Number(base) || 0;
    if (!vipAppliedCoupon || !vipAppliedCoupon.percent) return p;
    return Math.max(0, Math.round(p * (100 - vipAppliedCoupon.percent) / 100));
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

/** type: "vip" | "group" — nada berbeda */
function playNotifSound(type) {
    try {
        const ctx = getNotifAudioCtx();
        if (!ctx) return;
        const run = () => {
            const t0 = ctx.currentTime;
            // VIP = 2 nada tinggi cepat; GRUP = 3 nada lebih rendah
            const notes = type === "group"
                ? [
                    { at: 0, freq: 523, dur: 0.12 },
                    { at: 0.14, freq: 659, dur: 0.12 },
                    { at: 0.28, freq: 784, dur: 0.16 }
                  ]
                : [
                    { at: 0, freq: 880, dur: 0.14 },
                    { at: 0.16, freq: 1175, dur: 0.2 }
                  ];
            notes.forEach(({ at, freq, dur }) => {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.type = type === "group" ? "triangle" : "square";
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

function playVipNotifSound() { playNotifSound("vip"); }
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
    const kind = opts.kind || "vip";
    if (opts.sound !== false) {
        if (kind === "group") playGroupNotifSound();
        else playVipNotifSound();
    }
    const panel = opts.panelId ? document.getElementById(opts.panelId) : null;
    const panelOpen = !!(panel && panel.classList.contains("show"));
    if (document.hidden || !panelOpen || opts.forceDesktop) {
        showDesktopNotif(title, body, opts);
    }
}

let gcKnownMsgIds = new Set();
let gcNotifReady = false;

function statusToTrackStep(st) {
    const x = String(st || "").toLowerCase();
    if (x === "processing" || x === "process" || x === "diproses") return "process";
    if (x === "paid" || x === "done" || x === "completed" || x === "selesai") return "done";
    return "wait";
}

function updateVipStatusTrack(status) {
    const track = document.getElementById("vipStatusTrack");
    if (!track) return;
    const step = statusToTrackStep(status);
    const order = ["wait", "process", "done"];
    const idx = order.indexOf(step);
    track.querySelectorAll(".vst-step").forEach(el => {
        const s = el.getAttribute("data-step");
        const si = order.indexOf(s);
        el.classList.toggle("active", si === idx);
        el.classList.toggle("done", si < idx);
    });
    track.querySelectorAll(".vst-line").forEach((line, i) => {
        line.classList.toggle("filled", i < idx);
    });
}

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

function getVipPackById(id) {
    return VIP_PACKAGES.find(p => p.id === id) || VIP_PACKAGES[0];
}

function updateVipPackUI() {
    const pack = vipSelectedPack || VIP_PACKAGES[0];
    const finalPrice = getVipDiscountedPrice(pack.price);
    if (vipPriceLabel) {
        vipPriceLabel.textContent = Number(finalPrice).toLocaleString("id-ID");
    }
    const sel = document.getElementById("vipPackSelectedLabel");
    if (sel) {
        let t = "Paket: " + pack.label + " · akses VIP penuh";
        if (vipAppliedCoupon) t += " · −" + vipAppliedCoupon.percent + "%";
        sel.textContent = t;
    }
    document.querySelectorAll(".vip-pack-card").forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-id") === pack.id);
    });
}

function renderVipPackGrid() {
    const grid = document.getElementById("vipPackGrid");
    if (!grid) return;
    grid.innerHTML = VIP_PACKAGES.map(p => {
        const cls = "vip-pack-card" + (p.allAccess ? " all-access" : "") + (vipSelectedPack?.id === p.id ? " active" : "");
        return `<button type="button" class="${cls}" data-id="${p.id}">
            <strong>${p.label}</strong>
            <span>${formatRp(p.price)}${p.allAccess ? " · full VIP" : ""}</span>
        </button>`;
    }).join("");
    grid.querySelectorAll(".vip-pack-card").forEach(btn => {
        btn.addEventListener("click", () => {
            vipSelectedPack = getVipPackById(btn.getAttribute("data-id"));
            updateVipPackUI();
        });
    });
    updateVipPackUI();
}

function genVipOrderId() {
    const t = Date.now().toString(36).toUpperCase();
    const r = Math.random().toString(36).slice(2, 6).toUpperCase();
    return "VIP-" + t.slice(-5) + r;
}

/** Nama yang mengandung "muhlis" (dan variasi) dilarang untuk order VIP */
function containsReservedVipName(name) {
    const n = String(name || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, ""); // buang spasi/simbol biar "muh lis" / "muhl1s" ikut ketahuan sebagian
    // pola inti
    if (n.includes("muhlis")) return true;
    if (n.includes("muhliss")) return true;
    if (n.includes("muhliz")) return true;
    // leetspeak sederhana: 1=i/l, 0=o
    const leet = n.replace(/1/g, "i").replace(/0/g, "o").replace(/3/g, "e");
    if (leet.includes("muhlis")) return true;
    return false;
}

function suggestRandomVipName() {
    const prefixes = ["Player", "Gamer", "User", "Guest", "Nova", "Pixel", "Shadow", "Blaze", "Frost", "Viper"];
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(100 + Math.random() * 900);
    return p + num;
}

function loadVipOrders() {
    try {
        return JSON.parse(localStorage.getItem(VIP_LS_KEY) || "[]");
    } catch (e) {
        return [];
    }
}

function saveVipOrderLocal(order) {
    const list = loadVipOrders().filter(o => o.orderId !== order.orderId);
    list.unshift(order);
    localStorage.setItem(VIP_LS_KEY, JSON.stringify(list.slice(0, 30)));
}

function getVipOrderLocal(orderId) {
    return loadVipOrders().find(o => o.orderId === orderId) || null;
}

const vipPopup = document.getElementById("vipPopup");
const vipStepForm = document.getElementById("vipStepForm");
const vipStepPay = document.getElementById("vipStepPay");
const openVipOrderBtn = document.getElementById("openVipOrder");
const closeVipPopup = document.getElementById("closeVipPopup");
const vipContinueBtn = document.getElementById("vipContinueBtn");
const vipPaidBtn = document.getElementById("vipPaidBtn");
const vipBackBtn = document.getElementById("vipBackBtn");
const vipPriceLabel = document.getElementById("vipPriceLabel");
const vipPayAmount = document.getElementById("vipPayAmount");
const vipOrderIdLabel = document.getElementById("vipOrderIdLabel");

const vipChatPanel = document.getElementById("vipChatPanel");
const vipChatOverlay = document.getElementById("vipChatOverlay");
const vipChatClose = document.getElementById("vipChatClose");
const vipMessages = document.getElementById("vipMessages");
const vipForm = document.getElementById("vipForm");
const vipInput = document.getElementById("vipInput");
const vipImageBtn = document.getElementById("vipImageBtn");
const vipImageInput = document.getElementById("vipImageInput");
const vipChatTitle = document.getElementById("vipChatTitle");
const vipChatSub = document.getElementById("vipChatSub");
const vipBannerText = document.getElementById("vipBannerText");

const vipListPopup = document.getElementById("vipListPopup");
const closeVipList = document.getElementById("closeVipList");
const vipOrdersList = document.getElementById("vipOrdersList");
const openVipChatsBtn = document.getElementById("openVipChatsBtn");
const vipNewOrderFromList = document.getElementById("vipNewOrderFromList");

renderVipPackGrid();
if (vipPayAmount) vipPayAmount.textContent = formatRp(vipSelectedPack?.price || VIP_PRICE);

const vipProofInput = document.getElementById("vipProofInput");
const vipProofBtn = document.getElementById("vipProofBtn");
const vipProofLabel = document.getElementById("vipProofLabel");
const vipProofPreview = document.getElementById("vipProofPreview");
const vipProofImg = document.getElementById("vipProofImg");
const vipProofRemove = document.getElementById("vipProofRemove");

function clearVipProof() {
    if (vipProofFile && vipPending && vipPending.proofPreviewUrl) {
        try { URL.revokeObjectURL(vipPending.proofPreviewUrl); } catch (e) {}
    }
    vipProofFile = null;
    if (vipProofInput) vipProofInput.value = "";
    if (vipProofPreview) vipProofPreview.style.display = "none";
    if (vipProofImg) vipProofImg.src = "";
    if (vipProofLabel) vipProofLabel.textContent = "Upload Bukti Transfer";
    if (vipProofBtn) vipProofBtn.style.display = "";
    if (vipPaidBtn) vipPaidBtn.disabled = true;
}

function setVipProofFile(file) {
    if (!file) {
        clearVipProof();
        return;
    }
    if (!file.type.startsWith("image/")) {
        showToast("File", "Bukti TF harus gambar", "warning");
        return;
    }
    if (file.size > 3 * 1024 * 1024) {
        showToast("Terlalu besar", "Maksimal 3MB", "warning");
        return;
    }
    clearVipProof();
    vipProofFile = file;
    const url = URL.createObjectURL(file);
    if (vipPending) vipPending.proofPreviewUrl = url;
    if (vipProofImg) vipProofImg.src = url;
    if (vipProofPreview) vipProofPreview.style.display = "inline-block";
    if (vipProofBtn) vipProofBtn.style.display = "none";
    if (vipProofLabel) vipProofLabel.textContent = file.name || "Bukti terpilih";
    if (vipPaidBtn) vipPaidBtn.disabled = false;
}

if (vipProofBtn && vipProofInput) {
    vipProofBtn.onclick = () => vipProofInput.click();
    vipProofInput.addEventListener("change", () => {
        const f = vipProofInput.files && vipProofInput.files[0];
        if (f) setVipProofFile(f);
    });
}
if (vipProofRemove) {
    vipProofRemove.onclick = () => {
        clearVipProof();
        if (vipProofBtn) vipProofBtn.style.display = "";
    };
}

async function uploadVipProofImage(file) {
    if (!IMGBB_API_KEY || IMGBB_API_KEY.indexOf("PASTE_") === 0) {
        throw new Error("IMGBB_API_KEY belum diisi");
    }
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch("https://api.imgbb.com/1/upload?key=" + encodeURIComponent(IMGBB_API_KEY), {
        method: "POST",
        body: formData
    });
    const json = await res.json();
    if (!json.success || !json.data || !json.data.url) {
        throw new Error(json.error?.message || "Upload bukti gagal");
    }
    return json.data.url;
}

function showVipStep(step) {
    if (vipStepForm) vipStepForm.style.display = step === "form" ? "block" : "none";
    if (vipStepPay) vipStepPay.style.display = step === "pay" ? "block" : "none";
    if (step === "form") clearVipProof();
}

function openVipOrderPopup() {
    if (typeof closeChatMenu === "function") closeChatMenu();
    if (typeof closeGroupChat === "function") closeGroupChat();
    closeVipChat();
    vipPending = null;
    clearVipProof();
    vipSelectedPack = VIP_PACKAGES[0];
    vipAppliedCoupon = null;
    const cIn = document.getElementById("vipCouponInput");
    const cMsg = document.getElementById("vipCouponMsg");
    if (cIn) cIn.value = "";
    if (cMsg) { cMsg.style.display = "none"; cMsg.textContent = ""; }
    updateVipPackUI();
    showVipStep("form");
    const nameEl = document.getElementById("vipNameInput");
    const contactEl = document.getElementById("vipContactInput");
    const noteEl = document.getElementById("vipNoteInput");
    if (nameEl) nameEl.value = "";
    if (contactEl) contactEl.value = "";
    if (noteEl) noteEl.value = "";
    if (vipPopup) vipPopup.classList.add("active");
    setTimeout(() => nameEl && nameEl.focus(), 80);
}

function closeVipOrderPopup() {
    if (vipPopup) vipPopup.classList.remove("active");
}

if (openVipOrderBtn) {
    openVipOrderBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openVipOrderPopup();
    });
}
if (closeVipPopup) closeVipPopup.onclick = closeVipOrderPopup;
if (vipPopup) {
    vipPopup.onclick = (e) => {
        if (e.target === vipPopup) closeVipOrderPopup();
    };
}

if (vipContinueBtn) {
    vipContinueBtn.onclick = () => {
        const name = (document.getElementById("vipNameInput")?.value || "").trim().slice(0, 24);
        const contact = (document.getElementById("vipContactInput")?.value || "").trim().slice(0, 40);
        const note = (document.getElementById("vipNoteInput")?.value || "").trim().slice(0, 80);
        if (name.length < 2) {
            showToast("Nama", "Isi nama minimal 2 huruf", "warning");
            return;
        }
        if (containsReservedVipName(name)) {
            const saran = suggestRandomVipName();
            const nameEl = document.getElementById("vipNameInput");
            if (nameEl) {
                nameEl.value = saran;
                nameEl.focus();
                nameEl.select();
            }
            showToast(
                "Nama tidak boleh",
                'Nama mengandung "Muhlis" dilarang. Saran: ' + saran + " (boleh diganti)",
                "warning"
            );
            return;
        }
        if (contact.length < 5) {
            showToast("Kontak", "Isi No. WA / Telegram", "warning");
            return;
        }
        const pack = vipSelectedPack || VIP_PACKAGES[0];
        const finalPrice = getVipDiscountedPrice(pack.price);
        const orderId = genVipOrderId();
        vipPending = {
            orderId,
            name,
            contact,
            note,
            price: finalPrice,
            originalPrice: pack.price,
            coupon: vipAppliedCoupon ? vipAppliedCoupon.code : "",
            couponPercent: vipAppliedCoupon ? vipAppliedCoupon.percent : 0,
            packId: pack.id,
            packLabel: pack.label,
            days: pack.days,
            product: VIP_PRODUCT + " · " + pack.label,
            createdAt: Date.now()
        };
        if (vipOrderIdLabel) vipOrderIdLabel.textContent = orderId;
        if (vipPayAmount) {
            let payTxt = formatRp(finalPrice);
            if (vipAppliedCoupon) payTxt += " (setelah kupon " + vipAppliedCoupon.code + ")";
            vipPayAmount.textContent = payTxt;
        }
        const payPack = document.getElementById("vipPayPackLabel");
        if (payPack) payPack.textContent = pack.label;
        clearVipProof();
        showVipStep("pay");
        if (vipPaidBtn) {
            vipPaidBtn.disabled = true;
            vipPaidBtn.innerHTML = "Kirim Bukti & Buka Chat";
        }
    };
}

if (vipBackBtn) {
    vipBackBtn.onclick = () => showVipStep("form");
}

async function createVipOrderInFirebase(order) {
    if (!gcDb || !gcReady) {
        return { ok: false, error: new Error("Firebase offline") };
    }
    if (!order.proofImage) {
        return { ok: false, error: new Error("Bukti TF wajib") };
    }
    try {
        const packLabel = order.packLabel || (order.allAccess ? "All Akses" : ((order.days || "?") + " Hari"));
        const meta = {
            orderId: order.orderId,
            name: order.name,
            contact: order.contact,
            note: order.note || "",
            price: order.price,
            product: order.product || (VIP_PRODUCT + " · " + packLabel),
            packId: order.packId || "",
            packLabel: packLabel,
            days: order.days == null ? null : order.days,
            coupon: order.coupon || "",
            couponPercent: order.couponPercent || 0,
            originalPrice: order.originalPrice || order.price,
            status: "waiting_verification",
            proofImage: order.proofImage,
            hasProof: true,
            visibleToAdmin: true,
            createdAt: order.createdAt || Date.now(),
            paidAt: Date.now(),
            proofAt: Date.now()
        };
        await gcDb.ref("ffkipas_vip_orders/" + order.orderId).set(meta);

        const now = Date.now();
        // system message + bukti TF (order baru masuk admin)
        const sys = {
            name: "SYSTEM",
            text: "Order " + order.orderId + " masuk.\nProduk: " + meta.product +
                "\nPaket: " + packLabel +
                "\nHarga: " + formatRp(order.price) +
                "\nNama: " + order.name +
                "\nKontak: " + order.contact +
                (order.note ? "\nCatatan: " + order.note : "") +
                "\n\nBukti transfer sudah diupload. Menunggu verifikasi admin.",
            ts: now,
            system: true
        };
        await gcDb.ref("ffkipas_vip_chat/" + order.orderId + "/messages").push(sys);
        await gcDb.ref("ffkipas_vip_chat/" + order.orderId + "/messages").push({
            name: order.name || "User",
            text: "Bukti transfer",
            image: order.proofImage,
            ts: now + 1,
            isProof: true
        });
        // Auto-reply jam operasional
        await gcDb.ref("ffkipas_vip_chat/" + order.orderId + "/messages").push({
            name: "SYSTEM",
            text: "🤖 Auto-reply Admin\n" +
                "Terima kasih sudah order VIP.\n" +
                "Admin biasanya online " + VIP_REPLY_ETA + " saat jam operasional.\n" +
                "Jam operasional: " + VIP_HOURS_TEXT + ".\n" +
                "Di luar jam, order tetap masuk & dibalas saat admin online.\n" +
                "Mohon tunggu — jangan spam ya.",
            ts: now + 2,
            system: true
        });
        return { ok: true };
    } catch (err) {
        console.error("createVipOrder", err);
        return { ok: false, error: err };
    }
}

if (vipPaidBtn) {
    vipPaidBtn.onclick = async () => {
        if (!vipPending) {
            showToast("Order", "Data order hilang, ulangi dari awal", "error");
            showVipStep("form");
            return;
        }
        if (!vipProofFile) {
            showToast("Bukti TF", "Upload bukti transfer dulu sebelum lanjut", "warning");
            return;
        }
        if (!gcReady || !gcDb) {
            showToast("Belum siap", "Koneksi Firebase belum siap, coba lagi", "warning");
            return;
        }

        vipPaidBtn.disabled = true;
        const oldLabel = vipPaidBtn.innerHTML;
        vipPaidBtn.innerHTML = "⏳ Upload bukti...";

        let proofUrl = "";
        try {
            proofUrl = await uploadVipProofImage(vipProofFile);
        } catch (err) {
            console.error(err);
            vipPaidBtn.disabled = false;
            vipPaidBtn.innerHTML = oldLabel || "Kirim Bukti & Buka Chat";
            showToast("Gagal", "Upload bukti TF gagal. Coba lagi.", "error");
            return;
        }

        vipPaidBtn.innerHTML = "⏳ Membuat order...";
        const order = {
            ...vipPending,
            status: "waiting_verification",
            proofImage: proofUrl,
            paidClaimAt: Date.now()
        };
        const res = await createVipOrderInFirebase(order);

        if (!res.ok) {
            vipPaidBtn.disabled = false;
            vipPaidBtn.innerHTML = oldLabel || "Kirim Bukti & Buka Chat";
            showToast("Gagal", "Tidak bisa membuat order. Cek koneksi / Firebase.", "error");
            return;
        }

        saveVipOrderLocal({
            orderId: order.orderId,
            name: order.name,
            contact: order.contact,
            note: order.note || "",
            price: order.price,
            product: order.product,
            packId: order.packId,
            packLabel: order.packLabel,
            days: order.days,
            allAccess: !!order.allAccess,
            status: "waiting_verification",
            proofImage: proofUrl,
            createdAt: order.createdAt,
            date: new Date().toLocaleString("id-ID")
        });

        try {
            const history = JSON.parse(localStorage.getItem("trxHistory") || "[]");
            history.unshift({
                invoice: order.orderId,
                game: order.product || VIP_PRODUCT,
                uid: order.contact,
                item: order.packLabel || VIP_PRODUCT,
                pay: "QRIS + Bukti TF",
                price: formatRp(order.price),
                date: new Date().toLocaleString("id-ID")
            });
            if (history.length > 2) history.length = 2;
            localStorage.setItem("trxHistory", JSON.stringify(history));
            if (typeof renderTrxHistory === "function") renderTrxHistory();
        } catch (e) {}

        vipPaidBtn.disabled = false;
        vipPaidBtn.innerHTML = "Kirim Bukti & Buka Chat";
        clearVipProof();
        closeVipOrderPopup();
        // kurangi kuota kupon (setelah order sukses)
        if (order.coupon) {
            try { await consumeVipCoupon(order.coupon); } catch (e) {}
        }
        playVipNotifSound();
        showToast("Bukti terkirim", order.orderId + " · order masuk ke admin");
        openVipChat(order.orderId, order.name);
        vipPending = null;
        vipAppliedCoupon = null;
    };
}

function scrollVipToBottom(smooth) {
    if (!vipMessages) return;
    requestAnimationFrame(() => {
        vipMessages.scrollTop = vipMessages.scrollHeight;
        setTimeout(() => {
            if (vipMessages) vipMessages.scrollTop = vipMessages.scrollHeight;
        }, smooth ? 80 : 30);
    });
}

function renderVipMessages(list) {
    if (!vipMessages) return;
    if (!list || !list.length) {
        vipMessages.innerHTML = '<div class="gc-empty">Belum ada pesan. Kirim bukti transfer di sini.</div>';
        return;
    }
    const wasNear = vipForceScroll ||
        (vipMessages.scrollHeight - vipMessages.scrollTop - vipMessages.clientHeight < 120);

    vipMessages.innerHTML = list.map(m => {
        if (m.system) {
            return `<div class="vip-sys-msg">${escapeHtml(m.text || "").replace(/\n/g, "<br>")}</div>`;
        }
        const me = m.name === vipActiveName ? " me" : "";
        const displayName = m.name || "Anon";
        const badge = (typeof adminBadgeHtml === "function") ? adminBadgeHtml(displayName) : "";
        let body = "";
        if (m.image) {
            body += `<img class="gc-msg-img" src="${escapeHtml(m.image)}" alt="gambar" loading="lazy" onclick="window.open(this.src,'_blank')">`;
        }
        if (m.text) {
            body += `<div class="gc-msg-text">${escapeHtml(m.text)}</div>`;
        }
        if (!body) body = `<div class="gc-msg-text"></div>`;
        return `<div class="gc-msg-row${me}">
            ${typeof avatarHtml === "function" ? avatarHtml(m) : `<div class="gc-msg-avatar placeholder">${escapeHtml((displayName[0] || "?").toUpperCase())}</div>`}
            <div class="gc-msg">
                <div class="gc-msg-name">${escapeHtml(displayName)}${badge}</div>
                ${body}
                <div class="gc-msg-time">${typeof formatTime === "function" ? formatTime(m.ts) : ""}</div>
            </div>
        </div>`;
    }).join("");

    if (wasNear) {
        scrollVipToBottom(false);
        vipForceScroll = false;
    }
}

function unsubVipMessages() {
    if (vipMsgUnsub && typeof vipMsgUnsub === "function") {
        try { vipMsgUnsub(); } catch (e) {}
    }
    vipMsgUnsub = null;
}

function listenVipMessages(orderId) {
    unsubVipMessages();
    if (!gcDb || !gcReady) {
        renderVipMessages([]);
        return;
    }
    const ref = gcDb.ref("ffkipas_vip_chat/" + orderId + "/messages").orderByChild("ts").limitToLast(100);
    const handler = (snap) => {
        const val = snap.val() || {};
        const list = Object.keys(val).map(k => ({ id: k, ...val[k] }))
            .sort((a, b) => (a.ts || 0) - (b.ts || 0));
        renderVipMessages(list);
    };
    ref.on("value", handler);
    vipMsgUnsub = () => ref.off("value", handler);
}


function openVipChat(orderId, name) {
    if (typeof closeChatMenu === "function") closeChatMenu();
    if (typeof closeGroupChat === "function") closeGroupChat();
    closeVipOrderPopup();
    if (vipListPopup) vipListPopup.classList.remove("active");

    vipActiveOrderId = orderId;
    const local = getVipOrderLocal(orderId);
    const adminMode = isCurrentUserAdmin();
    // Admin kirim pesan pakai nama admin; buyer pakai nama order
    if (adminMode) {
        vipActiveName = (typeof gcName !== "undefined" && gcName) || localStorage.getItem("ff_chat_name") || name || "Admin";
    } else {
        vipActiveName = name || local?.name || localStorage.getItem("ff_chat_name") || "User";
    }

    if (vipChatTitle) vipChatTitle.textContent = "VIP · " + orderId;
    if (vipChatSub) vipChatSub.textContent = adminMode ? ("Admin: " + vipActiveName) : vipActiveName;
    if (vipBannerText) {
        vipBannerText.textContent = "Order " + orderId + " · " + formatRp(local?.price || VIP_PRICE) + (adminMode ? " · balas pembeli di sini" : " · status real-time");
    }
    updateVipStatusTrack(local?.status || "waiting_verification");

    // Real-time status order
    if (typeof vipStatusUnsub === "function") {
        try { vipStatusUnsub(); } catch (e) {}
        vipStatusUnsub = null;
    }
    if (gcDb && gcReady) {
        const statusRef = gcDb.ref("ffkipas_vip_orders/" + orderId);
        let lastStatus = local?.status || null;
        let statusReady = false;
        const onStatus = (snap) => {
            const meta = snap.val();
            if (!meta) return;
            const st = statusLabel(meta.status).text;
            if (vipBannerText) {
                if (adminMode) {
                    vipBannerText.textContent = orderId + " · " + (meta.name || "-") + " · " + (meta.contact || "-") + " · " + formatRp(meta.price || VIP_PRICE) + " · " + st;
                } else {
                    vipBannerText.textContent = orderId + " · " + (meta.packLabel || meta.product || "VIP") + " · " + formatRp(meta.price || VIP_PRICE) + " · " + st;
                }
            }
            updateVipStatusTrack(meta.status);
            syncVipAdminActionButtons(meta.status);
            if (statusReady && lastStatus && meta.status && meta.status !== lastStatus) {
                playVipNotifSound();
                if (!adminMode) showToast("Status order", st);
            }
            lastStatus = meta.status || lastStatus;
            statusReady = true;
            try {
                const list = loadVipOrders();
                const i = list.findIndex(o => o.orderId === orderId);
                if (i >= 0 && list[i].status !== meta.status) {
                    list[i].status = meta.status;
                    localStorage.setItem(VIP_LS_KEY, JSON.stringify(list));
                }
            } catch (e) {}
        };
        statusRef.on("value", onStatus);
        vipStatusUnsub = () => statusRef.off("value", onStatus);
    }

    vipForceScroll = true;
    if (vipChatPanel) vipChatPanel.classList.add("show");
    if (vipChatOverlay) vipChatOverlay.classList.add("show");
    if (typeof setChatLabelVisible === "function") setChatLabelVisible(false);

    syncVipAdminActionButtons(local?.status || "waiting_verification");
    listenVipMessages(orderId);
    setTimeout(() => vipInput && vipInput.focus(), 120);
}

function closeVipChat() {
    if (vipChatPanel) vipChatPanel.classList.remove("show");
    if (vipChatOverlay) vipChatOverlay.classList.remove("show");
    const bar = document.getElementById("vipAdminActions");
    if (bar) bar.style.display = "none";
    unsubVipMessages();
    if (typeof vipStatusUnsub === "function") {
        try { vipStatusUnsub(); } catch (e) {}
        vipStatusUnsub = null;
    }
    vipActiveOrderId = null;
    if (typeof setChatLabelVisible === "function") {
        const gcOpen = document.getElementById("groupChatPanel")?.classList.contains("show");
        setChatLabelVisible(!gcOpen);
    }
}

if (vipChatClose) vipChatClose.onclick = closeVipChat;
if (vipChatOverlay) vipChatOverlay.onclick = closeVipChat;

if (vipForm) {
    vipForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!vipActiveOrderId) return;
        if (!gcReady || !gcDb) {
            showToast("Belum siap", "Firebase belum terhubung", "warning");
            return;
        }
        const text = (vipInput?.value || "").trim().slice(0, 300);
        if (!text) return;
        const now = Date.now();
        if (now - vipLastSend < 1000) {
            showToast("Pelan-pelan", "Jangan spam ya", "warning");
            return;
        }
        vipLastSend = now;
        const payload = {
            name: vipActiveName || "User",
            text,
            ts: now
        };
        const av = localStorage.getItem("ff_chat_avatar");
        if (av) payload.avatar = av;

        vipForceScroll = true;
        gcDb.ref("ffkipas_vip_chat/" + vipActiveOrderId + "/messages").push(payload).then(() => {
            if (vipInput) vipInput.value = "";
            // update order activity
            gcDb.ref("ffkipas_vip_orders/" + vipActiveOrderId).update({ lastMsgAt: now }).catch(() => {});
            scrollVipToBottom(false);
        }).catch((err) => {
            console.error(err);
            showToast("Gagal", "Pesan tidak terkirim", "error");
        });
    });
}

if (vipImageBtn && vipImageInput) {
    vipImageBtn.addEventListener("click", () => {
        if (!vipActiveOrderId) return;
        if (!IMGBB_API_KEY || IMGBB_API_KEY.indexOf("PASTE_") === 0) {
            showToast("Belum siap", "IMGBB_API_KEY belum diisi", "warning");
            return;
        }
        vipImageInput.click();
    });
    vipImageInput.addEventListener("change", async () => {
        const file = vipImageInput.files && vipImageInput.files[0];
        vipImageInput.value = "";
        if (!file || !vipActiveOrderId) return;
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
        if (now - vipLastSend < 1500) {
            showToast("Pelan-pelan", "Jangan spam ya", "warning");
            return;
        }
        vipLastSend = now;
        vipImageBtn.disabled = true;
        const oldIcon = vipImageBtn.innerHTML;
        vipImageBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
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
            const payload = {
                name: vipActiveName || "User",
                text: "",
                image: json.data.url,
                ts: Date.now()
            };
            const av = localStorage.getItem("ff_chat_avatar");
            if (av) payload.avatar = av;
            vipForceScroll = true;
            await gcDb.ref("ffkipas_vip_chat/" + vipActiveOrderId + "/messages").push(payload);
            gcDb.ref("ffkipas_vip_orders/" + vipActiveOrderId).update({ lastMsgAt: Date.now() }).catch(() => {});
            scrollVipToBottom(false);
        } catch (err) {
            console.error(err);
            showToast("Gagal", "Upload gambar gagal", "error");
        }
        vipImageBtn.disabled = false;
        vipImageBtn.innerHTML = oldIcon;
    });
}

function isCurrentUserAdmin() {
    const n = (typeof gcName !== "undefined" && gcName) || localStorage.getItem("ff_chat_name") || "";
    return typeof isAdminName === "function" && isAdminName(n);
}

let vipAdminOrdersCache = [];
let vipAdminListenReady = false;
let vipAdminKnownIds = new Set();
let vipAdminUnsub = null;

function formatVipDate(ts) {
    try {
        return new Date(ts).toLocaleString("id-ID");
    } catch (e) {
        return "";
    }
}

function statusLabel(st) {
    const x = String(st || "").toLowerCase();
    if (x === "processing" || x === "process" || x === "diproses") {
        return { text: "Diproses", cls: "process" };
    }
    if (x === "paid" || x === "done" || x === "completed" || x === "selesai") {
        return { text: "Selesai", cls: "done" };
    }
    if (x === "waiting_verification" || x === "proof_submitted") {
        return { text: "Menunggu verifikasi", cls: "wait" };
    }
    if (x === "waiting_payment") {
        return { text: "Menunggu bukti TF", cls: "wait" };
    }
    return { text: "Menunggu verifikasi", cls: "wait" };
}

async function setVipOrderStatus(status, labelText) {
    if (!vipActiveOrderId || !gcDb || !gcReady) {
        showToast("Gagal", "Chat/order belum siap", "error");
        return false;
    }
    if (!isCurrentUserAdmin()) {
        showToast("Admin only", "Hanya admin yang bisa ubah status", "warning");
        return false;
    }
    const now = Date.now();
    const adminName = (typeof gcName !== "undefined" && gcName) || localStorage.getItem("ff_chat_name") || "Admin";
    try {
        await gcDb.ref("ffkipas_vip_orders/" + vipActiveOrderId).update({
            status: status,
            statusAt: now,
            statusBy: adminName
        });
        // system message di chat privat
        await gcDb.ref("ffkipas_vip_chat/" + vipActiveOrderId + "/messages").push({
            name: "SYSTEM",
            text: "📌 Status order: " + labelText + "\nOleh: " + adminName,
            ts: now,
            system: true
        });
        // update local history if any
        try {
            const list = loadVipOrders();
            const i = list.findIndex(o => o.orderId === vipActiveOrderId);
            if (i >= 0) {
                list[i].status = status;
                localStorage.setItem(VIP_LS_KEY, JSON.stringify(list));
            }
        } catch (e) {}
        if (vipBannerText) {
            const base = vipBannerText.textContent.split(" · ").slice(0, 3).join(" · ");
            vipBannerText.textContent = (base || vipActiveOrderId) + " · " + labelText;
        }
        updateVipStatusTrack(status);
        // highlight buttons
        const bp = document.getElementById("vipBtnProcess");
        const bd = document.getElementById("vipBtnDone");
        if (bp) bp.classList.toggle("active", status === "processing");
        if (bd) bd.classList.toggle("active", status === "completed");
        playVipNotifSound();
        showToast("Status", labelText);
        return true;
    } catch (err) {
        console.error(err);
        showToast("Gagal", "Tidak bisa update status", "error");
        return false;
    }
}

function syncVipAdminActionButtons(status) {
    const bar = document.getElementById("vipAdminActions");
    const bp = document.getElementById("vipBtnProcess");
    const bd = document.getElementById("vipBtnDone");
    const admin = isCurrentUserAdmin();
    if (bar) bar.style.display = admin ? "flex" : "none";
    if (!admin) return;
    const x = String(status || "").toLowerCase();
    if (bp) bp.classList.toggle("active", x === "processing" || x === "process" || x === "diproses");
    if (bd) bd.classList.toggle("active", x === "completed" || x === "done" || x === "selesai" || x === "paid");
}

async function fetchAllVipOrdersFromFirebase() {
    if (!gcDb || !gcReady) return [];
    try {
        const snap = await gcDb.ref("ffkipas_vip_orders").once("value");
        const val = snap.val() || {};
        // Hanya order yang sudah upload bukti TF yang tampil di admin
        const list = Object.keys(val)
            .map(k => ({ orderId: k, ...val[k] }))
            .filter(o => !!(o.proofImage || o.hasProof));
        list.sort((a, b) => (b.proofAt || b.createdAt || b.paidAt || 0) - (a.proofAt || a.createdAt || a.paidAt || 0));
        return list.slice(0, 80);
    } catch (e) {
        console.error("fetchAllVipOrders", e);
        return [];
    }
}

function startVipAdminListener() {
    if (!gcDb || !gcReady || vipAdminListenReady) return;
    if (!isCurrentUserAdmin()) return;
    vipAdminListenReady = true;
    try {
        const ref = gcDb.ref("ffkipas_vip_orders");
        const handler = (snap) => {
            const order = snap.val();
            if (!order) return;
            // Belum ada bukti TF → jangan masuk inbox admin
            if (!(order.proofImage || order.hasProof)) return;
            const id = snap.key || order.orderId;
            if (!id) return;
            if (vipAdminKnownIds.has(id)) return;
            if (startVipAdminListener._seeding) {
                vipAdminKnownIds.add(id);
                return;
            }
            vipAdminKnownIds.add(id);
            notifyUser(
                "Order VIP baru",
                id + " · " + (order.name || "User") + " · " + formatRp(order.price || VIP_PRICE),
                {
                    kind: "vip",
                    tag: "ffkipas-vip-order",
                    forceDesktop: true,
                    panelId: "vipListPopup",
                    onClick: () => {
                        if (typeof openVipList === "function") openVipList();
                    }
                }
            );
            showToast("Order VIP + bukti TF", id + " · " + (order.name || "User"), "warning");
            const sub = document.getElementById("vipMenuSub");
            if (sub) {
                sub.textContent = "Ada order baru!";
                sub.classList.add("has-new");
            }
            if (vipListPopup && vipListPopup.classList.contains("active")) {
                renderVipOrdersList();
            }
        };
        startVipAdminListener._seeding = true;
        ref.once("value").then((snap) => {
            const val = snap.val() || {};
            Object.keys(val).forEach(k => vipAdminKnownIds.add(k));
            startVipAdminListener._seeding = false;
            ref.on("child_added", handler);
            vipAdminUnsub = () => ref.off("child_added", handler);
        }).catch(() => {
            startVipAdminListener._seeding = false;
            ref.on("child_added", handler);
            vipAdminUnsub = () => ref.off("child_added", handler);
        });
    } catch (e) {
        console.error(e);
        vipAdminListenReady = false;
    }
}

function orderMatchesAdminFilter(o, filter) {
    const archived = !!(o.archived);
    const step = statusToTrackStep(o.status);
    if (filter === "archived") return archived;
    // filter status hanya untuk order aktif (belum arsip)
    if (archived) return false;
    if (filter === "all") return true;
    if (filter === "wait") return step === "wait";
    if (filter === "process") return step === "process";
    if (filter === "done") return step === "done";
    return true;
}

async function setVipOrderArchived(orderId, archived) {
    if (!orderId || !gcDb || !gcReady) return false;
    if (!isCurrentUserAdmin()) {
        showToast("Admin only", "Hanya admin", "warning");
        return false;
    }
    try {
        await gcDb.ref("ffkipas_vip_orders/" + orderId).update({
            archived: !!archived,
            archivedAt: archived ? Date.now() : null
        });
        showToast(archived ? "Diarsipkan" : "Dikembalikan", orderId);
        return true;
    } catch (e) {
        console.error(e);
        showToast("Gagal", "Tidak bisa ubah arsip", "error");
        return false;
    }
}

async function deleteVipOrderHard(orderId) {
    if (!orderId || !gcDb || !gcReady) return false;
    if (!isCurrentUserAdmin()) {
        showToast("Admin only", "Hanya admin", "warning");
        return false;
    }
    if (!confirm("Hapus permanen order " + orderId + "?\nChat privat ikut dihapus. Tidak bisa dibatalkan.")) {
        return false;
    }
    try {
        await gcDb.ref("ffkipas_vip_orders/" + orderId).remove();
        await gcDb.ref("ffkipas_vip_chat/" + orderId).remove();
        showToast("Dihapus", orderId);
        return true;
    } catch (e) {
        console.error(e);
        showToast("Gagal", "Tidak bisa hapus", "error");
        return false;
    }
}

async function renderVipOrdersList() {
    if (!vipOrdersList) return;
    const title = document.getElementById("vipListTitle");
    const desc = document.getElementById("vipListDesc");
    const joinBox = document.getElementById("vipJoinById");
    const newBtn = document.getElementById("vipNewOrderFromList");
    const filterBar = document.getElementById("vipFilterBar");
    const admin = isCurrentUserAdmin();

    if (admin) {
        if (title) title.innerHTML = '<i class="fa-solid fa-crown"></i> Inbox Order VIP (Admin)';
        if (desc) desc.textContent = "Filter · arsip order selesai · salin ID/bukti.";
        if (joinBox) joinBox.style.display = "flex";
        if (newBtn) newBtn.style.display = "none";
        if (filterBar) filterBar.style.display = "flex";
        vipOrdersList.innerHTML = '<div class="vip-orders-empty">Memuat order dari server...</div>';
        const list = await fetchAllVipOrdersFromFirebase();
        vipAdminOrdersCache = list;
        const filtered = list.filter(o => orderMatchesAdminFilter(o, vipAdminFilter || "all"));
        if (!list.length) {
            vipOrdersList.innerHTML = '<div class="vip-orders-empty">Belum ada order VIP masuk.</div>';
            return;
        }
        if (!filtered.length) {
            vipOrdersList.innerHTML = '<div class="vip-orders-empty">Tidak ada order di filter ini.</div>';
            return;
        }
        vipOrdersList.innerHTML = filtered.map(o => {
            const id = o.orderId || "";
            const st = statusLabel(o.status);
            const when = o.date || formatVipDate(o.createdAt || o.paidAt);
            const proof = o.proofImage || "";
            const isArchived = !!o.archived;
            const step = statusToTrackStep(o.status);
            const archiveBtn = isArchived
                ? `<button type="button" class="voi-copy voi-restore" data-archive="0" data-id="${escapeHtml(id)}" title="Kembalikan ke inbox"><i class="fa-solid fa-box-open"></i> Pulih</button>
                   <button type="button" class="voi-copy voi-delete" data-delete="${escapeHtml(id)}" title="Hapus permanen"><i class="fa-solid fa-trash"></i></button>`
                : `<button type="button" class="voi-copy voi-archive" data-archive="1" data-id="${escapeHtml(id)}" title="Arsipkan"><i class="fa-solid fa-box-archive"></i> Arsip</button>`;
            return `<div class="vip-order-item${isArchived ? " is-archived" : ""}" data-id="${escapeHtml(id)}" data-name="${escapeHtml(o.name || "")}">
                <div class="voi-icon"><i class="fa-solid fa-crown"></i></div>
                <div class="voi-body">
                    <strong>${escapeHtml(id)}</strong>
                    <span class="voi-meta">${escapeHtml(o.name || "-")} · ${escapeHtml(o.contact || "-")} · ${escapeHtml(o.packLabel || o.product || "-")} · ${formatRp(o.price || VIP_PRICE)}</span>
                    <span class="voi-meta">${escapeHtml(when)}</span>
                    <span class="voi-status ${st.cls}">${st.text}${isArchived ? " · Arsip" : ""}</span>
                    <div class="voi-actions">
                        <button type="button" class="voi-copy" data-copy="${escapeHtml(id)}" title="Salin Order ID"><i class="fa-regular fa-copy"></i> ID</button>
                        ${proof ? `<button type="button" class="voi-copy" data-copy="${escapeHtml(proof)}" title="Salin link bukti TF"><i class="fa-regular fa-image"></i> Bukti</button>
                        <a class="voi-copy" href="${escapeHtml(proof)}" target="_blank" rel="noopener" title="Buka bukti"><i class="fa-solid fa-up-right-from-square"></i></a>` : ""}
                        ${archiveBtn}
                    </div>
                </div>
            </div>`;
        }).join("");
        // copy buttons must not open chat
        vipOrdersList.querySelectorAll(".voi-copy[data-copy]").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const val = btn.getAttribute("data-copy") || "";
                const ok = await copyTextToClipboard(val);
                if (ok) showToast("Tersalin", val.length > 40 ? val.slice(0, 36) + "…" : val);
                else showToast("Gagal", "Tidak bisa salin", "error");
            });
        });
        vipOrdersList.querySelectorAll("a.voi-copy").forEach(a => {
            a.addEventListener("click", (e) => e.stopPropagation());
        });
        vipOrdersList.querySelectorAll("[data-archive]").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = btn.getAttribute("data-id") || "";
                const arch = btn.getAttribute("data-archive") === "1";
                btn.disabled = true;
                const ok = await setVipOrderArchived(id, arch);
                btn.disabled = false;
                if (ok) renderVipOrdersList();
            });
        });
        vipOrdersList.querySelectorAll("[data-delete]").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = btn.getAttribute("data-delete") || "";
                btn.disabled = true;
                const ok = await deleteVipOrderHard(id);
                btn.disabled = false;
                if (ok) renderVipOrdersList();
            });
        });
    } else {
        if (filterBar) filterBar.style.display = "none";
        if (title) title.innerHTML = '<i class="fa-solid fa-crown"></i> Chat VIP Saya';
        if (desc) desc.textContent = "Setiap order punya ruang chat sendiri.";
        if (joinBox) joinBox.style.display = "flex";
        if (newBtn) newBtn.style.display = "block";
        const list = loadVipOrders();
        if (!list.length) {
            vipOrdersList.innerHTML = '<div class="vip-orders-empty">Belum ada order VIP.<br>Order dulu biar chat privat muncul di sini.</div>';
            return;
        }
        vipOrdersList.innerHTML = list.map(o => {
            const st = statusLabel(o.status);
            const step = statusToTrackStep(o.status);
            const cWait = step === "wait" ? "active" : "done";
            const cProc = step === "process" ? "active" : (step === "done" ? "done" : "");
            const cDone = step === "done" ? "active" : "";
            return `<div class="vip-order-item" data-id="${escapeHtml(o.orderId)}" data-name="${escapeHtml(o.name || "")}">
                <div class="voi-icon"><i class="fa-solid fa-crown"></i></div>
                <div>
                    <strong>${escapeHtml(o.orderId)}</strong>
                    <span class="voi-meta">${escapeHtml(o.packLabel || o.product || "-")} · ${formatRp(o.price || VIP_PRICE)} · ${escapeHtml(o.date || "")}</span>
                    <span class="voi-status ${st.cls}">${st.text}</span>
                    <div class="vip-status-mini">
                        <span class="vsm ${cWait}">Verifikasi</span>
                        <span class="vsm-line"></span>
                        <span class="vsm ${cProc}">Diproses</span>
                        <span class="vsm-line"></span>
                        <span class="vsm ${cDone}">Selesai</span>
                    </div>
                </div>
            </div>`;
        }).join("");
    }

    vipOrdersList.querySelectorAll(".vip-order-item").forEach(el => {
        el.addEventListener("click", () => {
            const id = el.getAttribute("data-id");
            // Admin balas pakai nama admin; buyer pakai nama order
            const adminNow = isCurrentUserAdmin();
            const nm = adminNow
                ? ((typeof gcName !== "undefined" && gcName) || localStorage.getItem("ff_chat_name") || "Admin")
                : (el.getAttribute("data-name") || "");
            if (vipListPopup) vipListPopup.classList.remove("active");
            const sub = document.getElementById("vipMenuSub");
            if (sub) {
                sub.textContent = adminNow ? "Inbox order VIP" : "Order & support privat";
                sub.classList.remove("has-new");
            }
            openVipChat(id, nm);
        });
    });
}

async function openVipList() {
    if (typeof closeChatMenu === "function") closeChatMenu();
    if (typeof closeGroupChat === "function") closeGroupChat();
    closeVipChat();
    if (isCurrentUserAdmin()) startVipAdminListener();
    if (vipListPopup) vipListPopup.classList.add("active");
    await renderVipOrdersList();
}

if (openVipChatsBtn) {
    openVipChatsBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openVipList();
    });
}
if (closeVipList) closeVipList.onclick = () => vipListPopup && vipListPopup.classList.remove("active");
if (vipListPopup) {
    vipListPopup.onclick = (e) => {
        if (e.target === vipListPopup) vipListPopup.classList.remove("active");
    };
}
if (vipNewOrderFromList) {
    vipNewOrderFromList.onclick = () => {
        if (vipListPopup) vipListPopup.classList.remove("active");
        openVipOrderPopup();
    };
}

/* Cara Order VIP */
const vipHowToPopup = document.getElementById("vipHowToPopup");
const openVipHowToBtn = document.getElementById("openVipHowTo");
const closeVipHowToBtn = document.getElementById("closeVipHowTo");
const vipHowToBuyBtn = document.getElementById("vipHowToBuy");
function openVipHowTo() {
    if (typeof closeChatMenu === "function") closeChatMenu();
    if (vipHowToPopup) vipHowToPopup.classList.add("active");
}
function closeVipHowTo() {
    if (vipHowToPopup) vipHowToPopup.classList.remove("active");
}
if (openVipHowToBtn) {
    openVipHowToBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openVipHowTo();
    });
}
if (closeVipHowToBtn) closeVipHowToBtn.onclick = closeVipHowTo;
if (vipHowToPopup) {
    vipHowToPopup.onclick = (e) => {
        if (e.target === vipHowToPopup) closeVipHowTo();
    };
}
if (vipHowToBuyBtn) {
    vipHowToBuyBtn.onclick = () => {
        closeVipHowTo();
        openVipOrderPopup();
    };
}

/* Salin Order ID */
const vipCopyOrderIdBtn = document.getElementById("vipCopyOrderId");
if (vipCopyOrderIdBtn) {
    vipCopyOrderIdBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = vipActiveOrderId || "";
        if (!id) {
            showToast("Order ID", "Belum ada order aktif", "warning");
            return;
        }
        const ok = await copyTextToClipboard(id);
        if (ok) {
            const old = vipCopyOrderIdBtn.innerHTML;
            vipCopyOrderIdBtn.innerHTML = '<i class="fa-solid fa-check"></i> Tersalin';
            showToast("Tersalin", id);
            setTimeout(() => { vipCopyOrderIdBtn.innerHTML = old; }, 1500);
        } else {
            showToast("Gagal", "Tidak bisa salin", "error");
        }
    });
}

/* Cara Download */
const downloadHowToPopup = document.getElementById("downloadHowToPopup");
const closeDownloadHowToBtn = document.getElementById("closeDownloadHowTo");
const downloadHowToCloseBtn = document.getElementById("downloadHowToCloseBtn");
function openDownloadHowTo() {
    if (typeof closeChatMenu === "function") closeChatMenu();
    if (downloadHowToPopup) downloadHowToPopup.classList.add("active");
}
function closeDownloadHowTo() {
    if (downloadHowToPopup) downloadHowToPopup.classList.remove("active");
}
document.querySelectorAll(".open-download-howto").forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openDownloadHowTo();
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
        closeVipHowTo();
        closeDownloadHowTo();
    }
});

// ESC juga nutup VIP UI
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closeVipOrderPopup();
        closeVipChat();
        if (vipListPopup) vipListPopup.classList.remove("active");
    }
});

// unlockPage juga bersihkan VIP overlays
const _unlockPageOrig = typeof unlockPage === "function" ? unlockPage : null;
if (_unlockPageOrig) {
    // patch via ids already covered partially — add VIP classes cleanup
}

const vipJoinIdInput = document.getElementById("vipJoinIdInput");
const vipJoinIdBtn = document.getElementById("vipJoinIdBtn");
if (vipJoinIdBtn) {
    vipJoinIdBtn.onclick = async () => {
        const id = (vipJoinIdInput?.value || "").trim().toUpperCase();
        if (!id || id.length < 6) {
            showToast("Order ID", "Masukkan kode order yang valid", "warning");
            return;
        }
        let name = localStorage.getItem("ff_chat_name") || "Admin";
        // coba ambil meta dari Firebase
        if (gcDb && gcReady) {
            try {
                const snap = await gcDb.ref("ffkipas_vip_orders/" + id).once("value");
                const meta = snap.val();
                if (meta && meta.name) {
                    // admin reply pakai nama chat sendiri; buyer name only for display
                    if (vipChatSub) vipChatSub.textContent = meta.name + " · " + (meta.contact || "");
                } else if (!meta) {
                    showToast("Tidak ditemukan", "Order " + id + " tidak ada di server", "warning");
                    return;
                }
            } catch (e) {
                console.error(e);
            }
        }
        if (vipListPopup) vipListPopup.classList.remove("active");
        openVipChat(id, name);
    };
}


// Admin VIP inbox auto-listen saat nama admin sudah tersimpan



const vipBtnProcess = document.getElementById("vipBtnProcess");
const vipBtnDone = document.getElementById("vipBtnDone");
if (vipBtnProcess) {
    vipBtnProcess.onclick = async () => {
        vipBtnProcess.disabled = true;
        await setVipOrderStatus("processing", "Pesanan diproses");
        vipBtnProcess.disabled = false;
    };
}
if (vipBtnDone) {
    vipBtnDone.onclick = async () => {
        vipBtnDone.disabled = true;
        await setVipOrderStatus("completed", "Pesanan selesai");
        vipBtnDone.disabled = false;
    };
}

(function bootVipAdmin() {
    const tryStart = () => {
        if (typeof isCurrentUserAdmin === "function" && isCurrentUserAdmin()) {
            startVipAdminListener();
            const sub = document.getElementById("vipMenuSub");
            if (sub) sub.textContent = "Inbox order VIP";
            const lab = document.getElementById("vipMenuLabel");
            if (lab) lab.textContent = "Inbox VIP (Admin)";
        }
    };
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => setTimeout(tryStart, 800));
    } else {
        setTimeout(tryStart, 800);
    }
    window.addEventListener("load", () => setTimeout(tryStart, 1500));
})();


/* Filter inbox VIP admin */
document.querySelectorAll(".vip-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".vip-filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        vipAdminFilter = btn.getAttribute("data-filter") || "all";
        renderVipOrdersList();
    });
});

/* Kupon VIP */
const vipCouponBtn = document.getElementById("vipCouponBtn");
const vipCouponInput = document.getElementById("vipCouponInput");
if (vipCouponBtn) vipCouponBtn.onclick = applyVipCoupon;
if (vipCouponInput) {
    vipCouponInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            applyVipCoupon();
        }
    });
}

/* Admin online status */
updateAdminOnlineUI();
setInterval(updateAdminOnlineUI, 60 * 1000);



/* Video tutorial — pause saat popup ditutup + optional YouTube */
(function initTutorialVideo() {
  const box = document.getElementById("tutorialVideoBox");
  const video = document.getElementById("tutorialVideo");
  const popup = document.getElementById("downloadHowToPopup");
  if (!box) return;

  const yt = (box.getAttribute("data-youtube") || "").trim();
  if (yt) {
    // Ganti <video> jadi iframe YouTube
    box.innerHTML = `<iframe src="https://www.youtube.com/embed/${encodeURIComponent(yt)}?rel=0&modestbranding=1"
      title="Tutorial Download FFKIPAS"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen loading="lazy"></iframe>`;
  }

  function pauseTutorial() {
    const v = document.getElementById("tutorialVideo");
    if (v && !v.paused) {
      try { v.pause(); } catch (e) {}
    }
    // stop youtube: reset src if iframe
    const iframe = box.querySelector("iframe");
    if (iframe && iframe.src) {
      const src = iframe.src;
      iframe.src = "";
      iframe.src = src.replace(/[?&]autoplay=1/, "").replace(/&&/g, "&");
    }
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
    reply: "Harga VIP cek di kartu FFKIPAS VIP (1–8 hari). Top up game nominalnya muncul pas pilih diamond/UC. Ada kupon? isi di form VIP."
  },
  {
    keys: ["cara", "tutorial", "pasang", "install", "download"],
    reply: "Cara pasang: klik tombol Cara Download di section Download → tonton video + ikuti langkah. Download file: klik 3x (iklan) sampai link terbuka."
  },
  {
    keys: ["vip", "order vip", "beli vip"],
    reply: "Order VIP: buka kartu FFKIPAS VIP → pilih paket → bayar QRIS → upload bukti TF. Setelah bukti masuk, chat privat ke admin otomatis terbuka."
  },
  {
    keys: ["admin", "whatsapp", "telegram", "hubungi"],
    reply: "Chat admin: tombol chat kanan bawah → WhatsApp / Telegram / Saluran WA. Atau order VIP biar dapat room chat privat."
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


/* Notif Saluran WA — simpel, 1x session, bawah */
(function () {
  var KEY = "ffkipas_wa_bar";
  try { if (sessionStorage.getItem(KEY)) return; } catch (e) {}
  function run() {
    var box = document.getElementById("waJoinNotif");
    if (!box) return;
    box.hidden = false;
    void box.offsetWidth;
    box.classList.add("show");
    function hide() {
      box.classList.remove("show");
      setTimeout(function () { box.hidden = true; }, 250);
      try { sessionStorage.setItem(KEY, "1"); } catch (e) {}
    }
    var c = document.getElementById("waJoinClose");
    var a = document.getElementById("waJoinBtn");
    if (c) c.onclick = hide;
    if (a) a.addEventListener("click", function () {
      try { sessionStorage.setItem(KEY, "1"); } catch (e) {}
    });
    setTimeout(function () {
      if (box.classList.contains("show")) hide();
    }, 10000);
  }
  setTimeout(run, 2000);
})();


/* ===========================
CEK AKUN FREE FIRE
=========================== */
const FF_RANK_BASE = "assets/ff-rank/";

/** Map rank ID API → { name, file } */
function mapFfRank(rankId) {
  const n = Number(rankId) || 0;
  if (!n) return { name: "Unranked", file: null };

  // Format 301 = tier 3, step 1 (umum di API FF)
  let tier, step;
  if (n >= 100) {
    tier = Math.floor(n / 100);
    step = n % 100;
    if (step === 0) { tier -= 1; step = 99; }
  } else {
    // sequential 1–36
    const seq = [
      ["Bronze", 3, "bronze"],
      ["Silver", 3, "silver"],
      ["Gold", 4, "gold"],
      ["Platinum", 5, "platinum"],
      ["Diamond", 5, "diamond"],
      ["Heroic", 5, "heroic"],
      ["Master", 5, "master"],
      ["Grandmaster", 6, "grandmaster"]
    ];
    let left = n;
    for (const [label, max, key] of seq) {
      if (left <= max) {
        const file = key === "silver" && left === 3 ? "siler3.png" : key + left + ".png";
        return { name: label + " " + left, file: file };
      }
      left -= max;
    }
    return { name: "Grandmaster", file: "grandmaster6.png" };
  }

  const tiers = [
    null,
    ["Bronze", 3, "bronze"],
    ["Silver", 3, "silver"],
    ["Gold", 4, "gold"],
    ["Platinum", 5, "platinum"],
    ["Diamond", 5, "diamond"],
    ["Heroic", 5, "heroic"],
    ["Master", 5, "master"],
    ["Grandmaster", 6, "grandmaster"]
  ];
  if (tier < 1) tier = 1;
  if (tier > 8) tier = 8;
  const [label, max, key] = tiers[tier];
  const s = Math.min(Math.max(step, 1), max);
  const file = key === "silver" && s === 3 ? "siler3.png" : key + s + ".png";
  return { name: label + " " + s, file: file };
}

function mapFfPrime(level) {
  const lv = Number(level) || 0;
  if (lv < 1) return { name: "Tidak aktif", file: null };
  const s = Math.min(lv, 8);
  return { name: "Prime " + s, file: "prime-" + s + ".png" };
}

function ffTsToDate(ts) {
  try {
    const d = new Date(Number(ts) * 1000);
    if (isNaN(d.getTime())) return "Tidak diketahui";
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
    const created = new Date(Number(ts) * 1000);
    const now = new Date();
    if (isNaN(created.getTime())) return "Tidak diketahui";
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

async function cekFfFullInfo(uid) {
  const url = "https://danger-player-info.vercel.app/accinfo?uid=" + encodeURIComponent(uid) + "&key=DANGERxINFO";
  const r = await fetch(url);
  if (!r.ok) throw new Error("HTTP " + r.status);
  const data = await r.json();
  if (!data || !data.BasicInfo) throw new Error("ID tidak ditemukan");
  return data;
}

function setCekImg(el, file) {
  if (!el) return;
  if (!file) {
    el.hidden = true;
    el.removeAttribute("src");
    return;
  }
  el.hidden = false;
  el.src = FF_RANK_BASE + file;
  el.onerror = () => { el.hidden = true; };
}

function initCekAkunFf() {
  const input = document.getElementById("cekUidInput");
  const btn = document.getElementById("cekUidBtn");
  const loading = document.getElementById("cekLoading");
  const errBox = document.getElementById("cekError");
  const result = document.getElementById("cekResult");
  if (!btn || !input) return;

  async function run() {
    const uid = (input.value || "").trim();
    if (!uid || !/^\d+$/.test(uid)) {
      if (typeof showToast === "function") showToast("UID", "Masukkan UID angka yang valid", "error");
      return;
    }
    if (loading) loading.hidden = false;
    if (errBox) { errBox.hidden = true; errBox.textContent = ""; }
    if (result) result.hidden = true;
    btn.disabled = true;

    try {
      const data = await cekFfFullInfo(uid);
      const info = data.BasicInfo || {};
      const clan = data.ClanBasicInfo || {};
      const prime = info.PrimeInfo || {};
      const ban = await cekFfBan(uid);

      const br = mapFfRank(info.Rank);
      const brMax = mapFfRank(info.MaxRank);
      const cs = mapFfRank(info.CsRank);
      const csMax = mapFfRank(info.CsMaxRank);
      const pr = mapFfPrime(prime.PrimeLevel);

      const social = data.SocialInfo || {};
      const credit = data.CreditScoreInfo || {};

      document.getElementById("cekNick").textContent = info.Nickname || "—";
      document.getElementById("cekId").textContent = info.AccountId || uid;
      document.getElementById("cekRegion").textContent = info.Region || "—";
      document.getElementById("cekLevel").textContent = info.Level != null ? String(info.Level) : "—";
      document.getElementById("cekLikes").textContent = info.Likes != null
        ? Number(info.Likes).toLocaleString("id-ID") : "—";

      const bioEl = document.getElementById("cekBio");
      const bioText = (social.Signature || "").trim();
      if (bioEl) bioEl.textContent = bioText || "Tidak ada bio";

      const seasonId = info.SeasonId;
      const booyahEl = document.getElementById("cekBooyah");
      if (booyahEl) {
        booyahEl.textContent = seasonId != null && seasonId !== ""
          ? ("Season " + seasonId)
          : "—";
      }

      const creditEl = document.getElementById("cekCredit");
      if (creditEl) {
        const sc = credit.CreditScore;
        creditEl.textContent = sc != null ? String(sc) : "—";
      }

      const banEl = document.getElementById("cekBan");
      banEl.textContent = ban.text;
      banEl.className = ban.ok === false ? "ban-yes" : (ban.ok === true ? "ban-no" : "");

      document.getElementById("cekRankBr").textContent = br.name;
      document.getElementById("cekRankBrMax").textContent = brMax.name !== br.name ? ("Max: " + brMax.name) : "";
      setCekImg(document.getElementById("cekRankBrImg"), br.file);

      document.getElementById("cekRankCs").textContent = cs.name;
      document.getElementById("cekRankCsMax").textContent = csMax.name !== cs.name ? ("Max: " + csMax.name) : "";
      setCekImg(document.getElementById("cekRankCsImg"), cs.file);

      document.getElementById("cekPrime").textContent = pr.name;
      setCekImg(document.getElementById("cekPrimeImg"), pr.file);

      const clanBox = document.getElementById("cekClanBox");
      if (clan && clan.ClanName) {
        clanBox.hidden = false;
        document.getElementById("cekClanName").textContent = clan.ClanName;
        document.getElementById("cekClanMeta").textContent =
          "Lv." + (clan.ClanLevel || "-") + " · " + (clan.MemberNum || "-") + "/" + (clan.Capacity || "-") + " member";
      } else {
        clanBox.hidden = true;
      }

      document.getElementById("cekCreated").textContent = ffTsToDate(info.CreateAt);
      document.getElementById("cekAge").textContent = ffAccountAge(info.CreateAt);
      document.getElementById("cekLast").textContent = ffTsToDate(info.LastLoginAt);

      if (result) result.hidden = false;
    } catch (e) {
      console.error(e);
      if (errBox) {
        errBox.hidden = false;
        errBox.textContent = "ID tidak ditemukan / gagal ambil data. Coba lagi.";
      }
      if (typeof showToast === "function") showToast("Gagal", "Tidak bisa cek akun", "error");
    }

    if (loading) loading.hidden = true;
    btn.disabled = false;
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
