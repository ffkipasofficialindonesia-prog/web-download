/* Redirect untuk GitHub Pages.
   GitHub Pages tidak punya rewrite, jadi buka /spin atau /topup langsung = 404.
   File 404.html memanggil script ini: path diubah jadi /?go=<menu>,
   lalu script.js membuka menu yang sesuai dan merapikan URL jadi /spin lagi. */
(function () {
  var MAP = {
    "/": "home",
    "/home": "home",
    "/download": "download",
    "/topup": "topup",
    "/cekakun": "cekakun",
    "/cek": "cekakun",
    "/spin": "spin",
    "/event": "spin",
    "/history": "history",
    "/riwayat": "history",
    "/faq": "faq"
  };

  var path = (location.pathname || "/")
    .replace(/\/index\.html$/i, "")
    .replace(/\/+$/, "") || "/";
  path = path.toLowerCase();

  var section = MAP[path];
  var target = "/";
  if (section && section !== "home") {
    target = "/?go=" + section;
  }

  location.replace(target);
})();
