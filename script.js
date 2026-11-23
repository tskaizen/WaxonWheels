(function () {
  document.documentElement.classList.remove("no-js");

  // Mobile menu
  var btn = document.querySelector(".menu-btn"), nav = document.getElementById("mobile-nav");
  if (btn && nav) btn.addEventListener("click", function () {
    var o = nav.classList.toggle("open"); btn.setAttribute("aria-expanded", String(o));
  });

  // Desktop dropdown keyboard / tap support
  document.querySelectorAll(".has-dd > button").forEach(function (b) {
    b.addEventListener("click", function () {
      var li = b.parentElement, o = li.classList.toggle("open");
      b.setAttribute("aria-expanded", String(o));
    });
  });
  document.addEventListener("click", function (e) {
    document.querySelectorAll(".has-dd.open").forEach(function (li) {
      if (!li.contains(e.target)) { li.classList.remove("open"); li.querySelector("button").setAttribute("aria-expanded", "false"); }
    });
  });

  // Gallery filters + lightbox
  var filters = document.querySelectorAll(".filters button");
  filters.forEach(function (f) {
    f.addEventListener("click", function () {
      filters.forEach(function (x) { x.setAttribute("aria-pressed", String(x === f)); });
      var cat = f.dataset.filter;
      document.querySelectorAll(".gallery figure").forEach(function (fig) {
        fig.style.display = (cat === "all" || fig.dataset.cat === cat) ? "" : "none";
      });
    });
  });
  var lb = document.querySelector(".lightbox");
  if (lb) {
    var lbImg = lb.querySelector("img");
    document.querySelectorAll(".gallery img").forEach(function (img) {
      img.addEventListener("click", function () { lbImg.src = img.src; lbImg.alt = img.alt; lb.classList.add("open"); lb.querySelector("button").focus(); });
    });
    var close = function () { lb.classList.remove("open"); };
    lb.addEventListener("click", function (e) { if (e.target === lb || e.target.tagName === "BUTTON") close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  // Prefill service from ?service= on contact page
  var sel = document.getElementById("service");
  if (sel) {
    var want = new URLSearchParams(location.search).get("service");
    if (want) for (var i = 0; i < sel.options.length; i++) if (sel.options[i].value === want) sel.selectedIndex = i;
  }

  // Form submit: post to the booking function (creates a pending calendar event); fall back to email if it fails
  var form = document.querySelector("form[data-quote]");
  if (form) {
    var pd = document.getElementById("pd"); if (pd) pd.min = new Date().toISOString().slice(0, 10);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.querySelector("[name=bot-field]").value) return;
      var data = {}; new FormData(form).forEach(function (v, k) { data[k] = v; });
      var opt = form.querySelector("#service").selectedOptions[0];
      data.service_label = opt ? opt.text : data.service;
      var btn = form.querySelector("button[type=submit]"); btn.disabled = true;
      var done = function () { form.closest(".form-card").classList.add("sent"); };
      var fallback = function () {
        var lines = []; Object.keys(data).forEach(function (k) { if (k !== "bot-field" && data[k]) lines.push(k.replace(/_/g, " ") + ": " + data[k]); });
        location.href = "mailto:" + form.dataset.to + "?subject=" + encodeURIComponent("Quote request: " + data.service_label) + "&body=" + encodeURIComponent(lines.join("\n"));
        done();
      };
      fetch("/.netlify/functions/book", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
        .then(function (r) { if (r.ok) done(); else fallback(); }).catch(fallback);
    });
  }

  // Before/after and luxury photos open in the same lightbox
  var lb2 = document.querySelector(".lightbox");
  if (lb2) document.querySelectorAll(".ba img, .lad img").forEach(function (img) {
    img.addEventListener("click", function () { var i = lb2.querySelector("img"); i.src = img.src; i.alt = img.alt; lb2.classList.add("open"); lb2.querySelector("button").focus(); });
  });

  // Reveal
  var els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  } else els.forEach(function (el) { el.classList.add("in"); });

  var y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();
})();
