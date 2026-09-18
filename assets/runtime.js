/* MARIONETTE · runtime.js — tema + idioma compartilhados por todas as telas.
   Contrato por página: define PT_DICT (data-i18n key → texto PT) e renderAll()
   (recria os gráficos ECharts lendo os tokens atuais). O shell dirige tudo por
   localStorage; cada página também funciona aberta sozinha via ?theme= e ?lang=. */
(function () {
  "use strict";

  // ---------- boot de tema/idioma (antes do primeiro paint) ----------
  var q = {};
  try { new URLSearchParams(location.search).forEach(function (v, k) { q[k] = v; }); } catch (e) {}
  function stored(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  var theme = (q.theme === "light" || q.theme === "dark") ? q.theme : (stored("theme") === "light" ? "light" : "dark");
  var lang = (q.lang === "pt" || q.lang === "en") ? q.lang : (stored("lang") === "pt" ? "pt" : "en");
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.setAttribute("data-lang", lang);

  // ---------- helpers de tema para gráficos ----------
  function cvar(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
  window.cvar = cvar;

  window.registerDemoTheme = function () {
    if (!window.echarts) return;
    echarts.registerTheme("demo", {
      color: [cvar("--accent"), "#d95926", "#199e70", "#c98500", "#d55181", "#9085e9"],
      backgroundColor: "transparent",
      textStyle: { fontFamily: '"Space Grotesk",system-ui,sans-serif', color: cvar("--c-text") },
      legend: { textStyle: { color: cvar("--c-legend"), fontSize: 11 }, itemWidth: 12, itemHeight: 12, icon: "rect" },
      tooltip: { backgroundColor: cvar("--c-tip-bg"), borderColor: cvar("--c-border"), borderWidth: 1, textStyle: { color: cvar("--c-tip-text"), fontSize: 12 } },
      categoryAxis: { axisLine: { lineStyle: { color: cvar("--c-axis") } }, axisTick: { lineStyle: { color: cvar("--c-axis") } }, axisLabel: { color: cvar("--c-dim") }, splitLine: { show: false } },
      valueAxis: { axisLine: { show: false }, axisLabel: { color: cvar("--c-dim") }, splitLine: { lineStyle: { color: cvar("--c-split") } } }
    });
  };

  // ---------- i18n ----------
  window.applyLang = function (l) {
    lang = l === "pt" ? "pt" : "en";
    try { localStorage.setItem("lang", lang); } catch (e) {}
    document.documentElement.setAttribute("data-lang", lang);
    var dict = window.PT_DICT || {};
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (!el.dataset.en) el.dataset.en = el.innerHTML;
      if (lang === "pt" && dict[key]) el.innerHTML = dict[key];
      else if (lang === "en") el.innerHTML = el.dataset.en;
    });
    if (typeof window.renderAll === "function") window.renderAll();
  };
  window.lang = function () { return lang; };

  // ---------- tema ----------
  window.applyTheme = function (t) {
    theme = t === "light" ? "light" : "dark";
    try { localStorage.setItem("theme", theme); } catch (e) {}
    document.documentElement.setAttribute("data-theme", theme);
    window.registerDemoTheme();
    if (typeof window.renderAll === "function") window.renderAll();
  };

  // shell (outra janela/aba) dirige por storage
  window.addEventListener("storage", function (e) {
    if (!e || !e.key) return;
    if (e.key === "theme") window.applyTheme(e.newValue === "light" ? "light" : "dark");
    if (e.key === "lang") window.applyLang(e.newValue === "pt" ? "pt" : "en");
  });

  // resize único para instâncias registradas pela página
  window.RESIZE_CHARTS = new Set();
  window.addEventListener("resize", function () {
    window.RESIZE_CHARTS.forEach(function (c) { try { c.resize(); } catch (e) {} });
  });
  window.makeChart = function (el) {
    if (!window.echarts) return null;
    echarts.dispose(el);
    var c = echarts.init(el, "demo");
    window.RESIZE_CHARTS.add(c);
    return c;
  };

  // formatadores
  window.fmt = {
    int: function (v) { return Number(v).toLocaleString(lang === "pt" ? "pt-BR" : "en-US"); },
    usd: function (v) { return "US$ " + Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); },
    pct: function (v, d) { return (v * 100).toFixed(d == null ? 1 : d).replace(".", lang === "pt" ? "," : ".") + "%"; },
    ago: function (min) {
      if (lang === "pt") {
        if (min < 60) return min + " min atrás";
        if (min < 1440) return Math.round(min / 60) + " h atrás";
        return Math.round(min / 1440) + " d atrás";
      }
      if (min < 60) return min + " min ago";
      if (min < 1440) return Math.round(min / 60) + " h ago";
      return Math.round(min / 1440) + " d ago";
    }
  };
})();
