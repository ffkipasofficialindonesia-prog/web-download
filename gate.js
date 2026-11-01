/* Pop-up pengumuman "Join Saluran" yang muncul tiap kali web dibuka / di-refresh.
   File ini sengaja terpisah & dimuat tepat setelah markup pop-up, supaya
   tombolnya langsung jalan walau script.js belum selesai dimuat. */
(function () {
  var gate = document.getElementById("joinGate");
  if (!gate) return;

  function close() {
    gate.classList.add("closing");
    setTimeout(function () { gate.hidden = true; }, 180);
    document.documentElement.classList.remove("gate-open");
  }

  document.documentElement.classList.add("gate-open");

  var btns = gate.querySelectorAll("[data-gate-close]");
  for (var i = 0; i < btns.length; i++) btns[i].addEventListener("click", close);

  var join = document.getElementById("joinGateBtn");
  if (join) join.addEventListener("click", function () { setTimeout(close, 50); });

  gate.addEventListener("click", function (e) { if (e.target === gate) close(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !gate.hidden) close();
  });
})();
