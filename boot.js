/* Pasang class halaman (spa-home / spa-topup / ...) sedetik sebelum konten
   digambar, supaya web langsung tampil saat refresh tanpa nunggu script.js
   dan script iklan/Firebase selesai dimuat. */
(function () {
  var MAP = {
    "/download": "download", "/topup": "topup",
    "/cekakun": "cekakun", "/cek": "cekakun",
    "/history": "history", "/riwayat": "history"
  };
  var VALID = { download: 1, topup: 1, cekakun: 1, history: 1 };
  var page = null;

  function fromPath(p) {
    p = String(p || "/").split("?")[0].split("#")[0]
      .replace(/\/index\.html$/i, "").replace(/\/+$/, "").toLowerCase();
    return MAP[p] || null;
  }

  try {
    var go = new URLSearchParams(location.search).get("go");
    if (go && VALID[go]) page = go;
  } catch (e) {}

  if (!page) {
    try {
      var saved = sessionStorage.getItem("spa_redirect");
      if (saved) page = fromPath(saved);
    } catch (e) {}
  }

  if (!page && location.hash.length > 1) {
    var h = location.hash.slice(1);
    if (VALID[h]) page = h;
  }

  if (!page) page = fromPath(location.pathname);

  document.body.classList.add("spa-" + (page || "home"));
})();
