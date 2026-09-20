/* ============================================================
   MARIONETTE · app.js — núcleo/casca compartilhado por todas as páginas.
   Expõe window.M: helpers de formato, tema/ECharts, células densas,
   i18n acumulável e um registry de páginas com render lazy.
   Cada página (assets/pages/<page>.js) chama M.registerPage(id, {render})
   e M.registerI18n({...}); o núcleo cuida de rotear, tema e idioma.
   ============================================================ */
(function () {
  "use strict";
  var W = window.MARIONETTE;
  var root = document.documentElement;
  var M = {};

  // ─── idioma ───
  function lang() { return root.getAttribute("data-lang") === "pt" ? "pt" : "en"; }
  function T(en, pt) { return lang() === "pt" ? pt : en; }
  M.lang = lang; M.T = T;

  // i18n acumulável: cada módulo registra seu dicionário PT (chave data-i18n → texto).
  M.I18N = {};
  M.registerI18n = function (obj) { Object.assign(M.I18N, obj); };
  function applyStaticLang() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      if (!el.dataset.en) el.dataset.en = el.innerHTML;
      el.innerHTML = (lang() === "pt" && M.I18N[k]) ? M.I18N[k] : el.dataset.en;
    });
    document.getElementById("langToggle").textContent = lang() === "pt" ? "PT" : "EN";
    setBreadcrumb(currentPage());
  }

  // dicionário da CASCA (sidebar, topbar, stubs, rodapé)
  M.registerI18n({
    nav_exec: "Visão Executiva", nav_cockpit: "Cockpit Comercial", nav_meu: "Meu Cockpit", nav_contas: "Contas",
    nav_intel: "RevOps & Inteligência", nav_platform: "Dados & Plataforma", nav_search: "Buscar",
    g_com: "Comercial", g_rev: "RevOps & Inteligência", g_dados: "Dados & Plataforma",
    tb_search: "Buscar pessoas e empresas", sb_synth: "sintético",
    stub_sub: "esqueleto espelhado em seguida · mapa de módulos abaixo",
    st_c1: "Subtab visão geral", st_c1b: "KPIs de pipeline, cascata por etapa, win/loss por time, faixa macro fixa no topo.",
    st_c2: "Subtab pré-vendas", st_c2b: "Atividade de SDR, funil de agendamento, controle de no-show, distribuição de SLA de resposta.",
    st_c3: "Subtab fechamento", st_c3b: "Aging de propostas, forecast por closer, ciclo de contrato, alertas de derrapagem.",
    st_c4: "Produção por área", st_c4b: "Receita ganha por área de produto, mudanças de mix, sinais de cross-sell.",
    st_v1: "Meu dia", st_v1b: "Reuniões de hoje, follow-ups vencidos, fila priorizada pelo lead score.",
    st_v2: "Meu funil", st_v2b: "Pipeline pessoal por etapa com aging e próximos passos.",
    st_e1b: "Busca unificada de entidades, proveniência e soberania por campo, grafo de vínculos PF&harr;PJ.",
    st_e2: "Resolução de identidade", st_e2b: "3 camadas: determinística (CPF/CNPJ), score probabilístico, quarentena 70-89 com fila de revisão.",
    st_e3: "Quarentena & merge", st_e3b: "Passo a passo do merge com antes/depois e trilha de auditoria.",
    st_m1: "Campanhas", st_m1b: "Investimento, CPL e conversão por canal; picos de campanha anotados na série de ingestão.",
    st_m2: "Atribuição", st_m2b: "Visão multi-touch do primeiro toque à receita ganha.",
    st_i1: "Avaliações de reunião", st_i1b: "Rubrica com LLM e computeScore determinístico: o modelo extrai evidência, o código faz a aritmética.",
    st_i2b: "Motor config-driven, breakdown por dimensão, bandas A-D com conversão por banda.",
    st_i3: "Custo de avaliação", st_i3b: "Ledger de tokens/custo por etapa do pipeline com latência P95.",
    st_p1: "Integrações & saúde de sync", st_p1b: "Mapa de fontes com lag/volume/erro, falsos alarmes documentados por integração, fila de dead-letter.",
    st_p2b: "Decisões de write-back (fill/merge/keep/suggest) com diff antes/depois e proteção anti-overwrite.",
    st_p3: "Qualidade de dados", st_p3b: "Funil de completude, watchlist de anomalias, protocolo de aposentadoria de campos.",
    st_s1: "Busca unificada", st_s1b: "Uma caixa para nome, CPF, CNPJ ou e-mail em todo o golden record, com drawer da entidade ao clicar.",
    foot: "MARIONETTE é um demo de portfólio de um operational data store para times de receita. Alvor Capital é fictícia; todo registro em tela é gerado por seed fixa. Fontes regulatórias (CVM, ANCORD, BCB) mantêm o nome real; SaaS comercial fica genérico de propósito."
  });

  var PAGE_TITLES = {
    overview: ["Executive View", "Visão Executiva"], cockpit: ["Sales Cockpit", "Cockpit Comercial"],
    "cockpit-vendedor": ["My Cockpit", "Meu Cockpit"], empresas: ["Accounts", "Contas"],
    marketing: ["Marketing", "Marketing"], intelligence: ["RevOps & Intelligence", "RevOps & Inteligência"],
    quality: ["Data & Platform", "Dados & Plataforma"], search: ["Search", "Buscar"]
  };

  // ─── fmt ───
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function fmtNum(n) { return (n != null ? n : 0).toLocaleString(lang() === "pt" ? "pt-BR" : "en-US"); }
  function fmtBRL(n) { return (n != null ? n : 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }); }
  function fmtCompactBRL(v) {
    v = Number(v) || 0;
    if (Math.abs(v) >= 1e6) return "R$ " + (v / 1e6).toFixed(1).replace(".", ",") + "M";
    if (Math.abs(v) >= 1e3) return "R$ " + Math.round(v / 1e3) + "k";
    return "R$ " + Math.round(v);
  }
  M.esc = esc; M.fmtNum = fmtNum; M.fmtBRL = fmtBRL; M.fmtCompactBRL = fmtCompactBRL;

  // ─── tema/ECharts ───
  function cvar(n) { return getComputedStyle(root).getPropertyValue(n).trim(); }
  function registerDemoTheme() {
    echarts.registerTheme("demo", {
      color: [cvar("--accent"), "#d95926", cvar("--emerald"), cvar("--amber"), "#d55181", cvar("--indigo")],
      backgroundColor: "transparent",
      textStyle: { fontFamily: '"Space Grotesk",system-ui,sans-serif', color: cvar("--c-text") },
      legend: { textStyle: { color: cvar("--c-dim"), fontSize: 9 }, itemWidth: 12, itemHeight: 8, icon: "rect" },
      tooltip: { backgroundColor: cvar("--c-tip-bg"), borderColor: cvar("--c-border"), borderWidth: 1, textStyle: { color: cvar("--c-tip-text"), fontSize: 12 } },
      categoryAxis: { axisLine: { lineStyle: { color: cvar("--c-axis") } }, axisTick: { lineStyle: { color: cvar("--c-axis") } }, axisLabel: { color: cvar("--c-dim"), fontSize: 10 }, splitLine: { show: false } },
      valueAxis: { axisLine: { show: false }, axisLabel: { color: cvar("--c-dim"), fontSize: 9 }, splitLine: { lineStyle: { color: cvar("--c-split") } } }
    });
  }
  var CHARTS = {};
  function initChart(id) {
    var el = document.getElementById(id);
    if (!el) return null;
    echarts.dispose(el);
    var c = echarts.init(el, "demo");
    CHARTS[id] = c;
    return c;
  }
  function resizeAll() { Object.keys(CHARTS).forEach(function (k) { try { CHARTS[k].resize(); } catch (e) {} }); }
  window.addEventListener("resize", resizeAll);
  // descarta as instâncias destes ids (páginas que regeneram o próprio markup chamam antes de reconstruir)
  function disposeCharts(ids) { ids.forEach(function (id) { if (CHARTS[id]) { try { CHARTS[id].dispose(); } catch (e) {} delete CHARTS[id]; } }); }
  M.cvar = cvar; M.initChart = initChart; M.resizeAll = resizeAll; M.disposeCharts = disposeCharts;

  // ─── células densas (espelho _ovMini/_ovRich/_ovDelta) ───
  function ovMini(k, v, sub, subCls, barPct, barColor) {
    var bar = (barPct != null)
      ? '<div class="mbar"><i style="width:' + Math.max(0, Math.min(100, Number(barPct) || 0)) + '%' + (barColor ? ';background:' + barColor : '') + '"></i></div>' : '';
    return '<div class="ovx-mini"><div class="mk">' + esc(k) + '</div><div class="mv">' + esc(v) + '</div>' +
      (sub ? '<div class="md ' + (subCls || '') + '">' + esc(sub) + '</div>' : '') + bar + '</div>';
  }
  function ovRich(k, v, lines, bars) {
    var aux = (lines || []).filter(Boolean).map(function (l) { return '<div class="md ' + (l.cls || '') + '">' + esc(l.t) + '</div>'; }).join('');
    var bs = (bars || []).filter(Boolean).map(function (b) {
      var w = Math.max(0, Math.min(100, Number(b.pct) || 0));
      return '<div class="mrow">' + (b.t ? '<span class="ml">' + esc(b.t) + '</span>' : '') +
        '<span class="mbar"><i style="width:' + w + '%' + (b.color ? ';background:' + b.color : '') + '"></i></span></div>';
    }).join('');
    return '<div class="ovx-mini rich"><div class="mk">' + esc(k) + '</div>' +
      '<div class="mvrow"><div class="mv">' + esc(v) + '</div>' + (aux ? '<div class="maux">' + aux + '</div>' : '') + '</div>' +
      (bs ? '<div class="mbars">' + bs + '</div>' : '') + '</div>';
  }
  function ovDelta(cur, prev, fmt, lowerIsBetter) {
    if (cur == null || prev == null) return { txt: "", cls: "fl" };
    var d = Number(cur) - Number(prev);
    if (!isFinite(d) || d === 0) return { txt: T("= prev. commercial", "= comercial ant."), cls: "fl" };
    var a = Math.abs(d);
    var val = fmt === "cur" ? fmtCompactBRL(a) : fmt === "pp" ? (fmtNum(a) + " pp") : fmt === "days" ? (fmtNum(a) + "d") : fmtNum(a);
    return { txt: (d > 0 ? "▲ " : "▼ ") + val + T(" vs prev. commercial", " vs comercial ant."), cls: (lowerIsBetter ? (d < 0) : (d > 0)) ? "up" : "down" };
  }
  function railCell(c) {
    return '<div class="card' + (c.hero ? " hero" : "") + '">' +
      '<div class="card-label">' + esc(c.label) + '</div>' +
      '<div class="card-value" style="font-size:' + (c.big ? "1.8rem" : "1.3rem") + (c.vColor ? ";color:" + c.vColor : "") + '">' + esc(c.value) + '</div>' +
      '<div class="card-sub ' + (c.subCls || "") + '">' + esc(c.sub || "") + '</div></div>';
  }
  M.ovMini = ovMini; M.ovRich = ovRich; M.ovDelta = ovDelta; M.railCell = railCell;

  // ─── módulo de mercado (topbar, sempre visível) ───
  function renderMarket() {
    var el = document.getElementById("tbMarket");
    if (!el || !W.bcb) return;
    el.innerHTML = W.bcb.map(function (b) {
      var pc = b.trend === "up" ? "var(--emerald)" : b.trend === "down" ? "var(--rose)" : "var(--text-muted)";
      var arrow = b.trend === "up" ? "▲" : b.trend === "down" ? "▼" : "●";
      return '<span class="tb-mkt-chip" title="BCB-SGS · synthetic"><span class="tb-mkt-lbl">' + b.label + '</span><span class="tb-mkt-val">' + b.value + '</span><span class="tb-mkt-pct" style="color:' + pc + '">' + arrow + "</span></span>";
    }).join("");
  }

  // ─── registry de páginas (render lazy) ───
  M.PAGES = {}; M.RENDERED = {};
  M.registerPage = function (id, def) { M.PAGES[id] = def; };
  function ensureRendered(page) {
    if (M.PAGES[page] && !M.RENDERED[page]) { try { M.PAGES[page].render(); } catch (e) { console.error(e); } M.RENDERED[page] = true; }
  }

  // ─── navegação ───
  var VALID = ["overview", "cockpit", "cockpit-vendedor", "empresas", "marketing", "intelligence", "quality", "search"];
  function currentPage() {
    var h = (location.hash || "#overview").slice(1);
    return VALID.indexOf(h) >= 0 ? h : "overview";
  }
  function setBreadcrumb(page) {
    var t = PAGE_TITLES[page] || PAGE_TITLES.overview;
    var el = document.getElementById("tbBreadcrumbCurrent");
    if (el) el.textContent = lang() === "pt" ? t[1] : t[0];
  }
  M.currentPage = currentPage;
  function route() {
    var page = currentPage();
    document.querySelectorAll(".page").forEach(function (p) { p.classList.toggle("active", p.id === "page-" + page); });
    document.querySelectorAll(".sb-nav-item").forEach(function (t) { t.classList.toggle("active", t.getAttribute("data-page") === page); });
    var sb = document.getElementById("tbSearchBtn"); if (sb) sb.classList.toggle("active", page === "search");
    setBreadcrumb(page);
    document.body.classList.remove("sb-mobile-open");
    ensureRendered(page);
    resizeAll();
  }
  document.querySelectorAll(".sb-nav-item,[data-page='search']").forEach(function (b) {
    b.addEventListener("click", function () { location.hash = "#" + b.getAttribute("data-page"); });
  });
  window.addEventListener("hashchange", route);

  // ─── sidebar collapse + mobile ───
  var cbtn = document.getElementById("sbCollapseBtn");
  if (cbtn) cbtn.addEventListener("click", function () {
    document.body.classList.toggle("sb-collapsed");
    try { localStorage.setItem("sbc", document.body.classList.contains("sb-collapsed") ? "1" : "0"); } catch (e) {}
    setTimeout(resizeAll, 200);
  });
  var mbtn = document.getElementById("tbMobileMenu");
  if (mbtn) mbtn.addEventListener("click", function () { document.body.classList.toggle("sb-mobile-open"); });
  var bd = document.getElementById("sidebarBackdrop");
  if (bd) bd.addEventListener("click", function () { document.body.classList.remove("sb-mobile-open"); });
  try { if (localStorage.getItem("sbc") === "1") document.body.classList.add("sb-collapsed"); } catch (e) {}
  requestAnimationFrame(function () { requestAnimationFrame(function () { document.body.classList.add("sb-ready"); }); });

  // ─── chrome (globais re-render em toda troca de tema/idioma) ───
  function applyChrome() { registerDemoTheme(); applyStaticLang(); renderMarket(); }
  function rerenderAll() {
    applyChrome();
    M.RENDERED = {};              // esquece o cache; a página ativa re-renderiza já, as outras ao reativar
    ensureRendered(currentPage());
    resizeAll();
  }
  window.applyTheme = function (t) {
    root.setAttribute("data-theme", t === "light" ? "light" : "dark");
    try { localStorage.setItem("theme", root.getAttribute("data-theme")); } catch (e) {}
    var mc = document.querySelector("meta[name=theme-color]");
    if (mc) mc.setAttribute("content", root.getAttribute("data-theme") === "light" ? "#f4f3ee" : "#0a0a0b");
    rerenderAll();
  };
  window.applyLang = function (l) {
    root.setAttribute("data-lang", l === "pt" ? "pt" : "en");
    try { localStorage.setItem("lang", root.getAttribute("data-lang")); } catch (e) {}
    rerenderAll();
  };
  document.getElementById("themeToggle").addEventListener("click", function () {
    window.applyTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light");
  });
  document.getElementById("langToggle").addEventListener("click", function () {
    window.applyLang(lang() === "pt" ? "en" : "pt");
  });
  window.addEventListener("storage", function (e) {
    if (!e || !e.key) return;
    if (e.key === "theme") window.applyTheme(e.newValue === "light" ? "light" : "dark");
    if (e.key === "lang") window.applyLang(e.newValue === "pt" ? "pt" : "en");
  });

  // ─── boot (chamado pelo index após todas as páginas se registrarem) ───
  M.boot = function () { applyChrome(); route(); };

  window.M = M;
})();
