/* MARIONETTE · pages/cockpit.js — Cockpit Comercial.
   Duas views (Visão Geral × Detalhado), cross-filter (período × time) que
   re-renderiza os gráficos do Detalhado, e ~12 visualizadores densos.
   Markup gerado no idioma atual; registra-se em window.M. */
(function () {
  "use strict";
  var M = window.M, W = window.MARIONETTE, root = document.documentElement;
  var T = M.T, lang = M.lang, esc = M.esc, fmtNum = M.fmtNum, fmtCompactBRL = M.fmtCompactBRL;
  var cvar = M.cvar, initChart = M.initChart, ovMini = M.ovMini;
  var C = W.cockpit;

  var CHART_IDS = ["ck-hero", "ck-pipe-stage", "ck-pipe-temp", "ck-pipe-aging", "ck-pipe-sla",
    "ck-fonte", "ck-wonlost", "ck-lostreasons", "ck-area-mix", "ck-area-ticket", "ck-pareto", "ck-winrate", "ck-forecast"];

  var _view = "overview", _squad = "all", _period = "90", _detailDone = false;

  function squadF() { var s = C.squads.filter(function (x) { return x.id === _squad; })[0]; return s ? s.factor : 1; }
  function periodF() { var p = C.periods.filter(function (x) { return x.id === _period; })[0]; return p ? p.factor : 1; }
  function scaled(v) { return Math.round(v * squadF() * periodF()); }
  function colorOf(k) { return { rose: cvar("--rose"), amber: cvar("--amber"), blue: cvar("--blue"), emerald: cvar("--emerald") }[k] || cvar("--accent"); }

  // ─── markup ───
  function fbtns(arr, cur, kind) {
    return arr.map(function (o) {
      return '<button class="ck-fbtn' + (o.id === cur ? " active" : "") + '" data-f="' + kind + '" data-v="' + o.id + '">' + esc(T(o.en, o.pt)) + "</button>";
    }).join("");
  }
  function buildMarkup() {
    var h = "";
    h += '<div class="ck-viewbar" role="tablist">';
    h += '<button class="ck-viewtab' + (_view === "overview" ? " active" : "") + '" data-view="overview">' + T("Overview", "Visão Geral") + "</button>";
    h += '<button class="ck-viewtab' + (_view === "detail" ? " active" : "") + '" data-view="detail">' + T("Detailed", "Detalhado") + "</button>";
    h += '<div class="ck-filterbar">';
    h += '<span class="ck-flabel">' + T("Period", "Período") + "</span>" + fbtns(C.periods, _period, "period");
    h += '<span class="ck-flabel" style="margin-left:6px">' + T("Team", "Time") + "</span>" + fbtns(C.squads, _squad, "squad");
    h += "</div></div>";

    // ── OVERVIEW ──
    h += '<div data-panel="overview"' + (_view === "overview" ? "" : " hidden") + ">";
    h += '<div class="ind-h"><span class="ttl">' + T("Management control", "Controle gerencial") + '</span><span class="sub">' + T("won evolution + read of the current cut", "evolução de WON + leitura do recorte atual") + "</span></div>";
    h += '<div class="ind-module" style="margin-top:8px"><div style="padding:11px 15px 0"><h3 class="ck-hero-t">' + T("WON revenue — commercial evolution", "Receita WON — evolução comercial") + '</h3></div><div class="chart-box" id="ck-hero" style="height:280px;margin:2px 12px 10px"></div></div>';
    h += '<div class="ck-gauges" id="ckGauges" style="margin-top:8px"></div>';
    h += '<div class="ind-module ind-row" style="grid-template-columns:1fr 1fr;margin-top:8px">';
    h += '<div class="card"><div class="card-label">' + T("Current cut performance", "Desempenho do recorte") + '</div><div id="ckCut" class="ovx-mini-grid fill" style="margin-top:8px"></div></div>';
    h += '<div class="card"><div class="card-label">' + T("Actionable queues", "Filas acionáveis") + '</div><ul class="ck-list" id="ckQueues"></ul></div>';
    h += "</div></div>";

    // ── DETAIL ──
    h += '<div data-panel="detail"' + (_view === "detail" ? "" : " hidden") + ">";
    h += section(T("Pipeline", "Pipeline"), T("open deals by stage · temperature · aging · response SLA", "deals abertos por etapa · temperatura · aging · SLA de resposta"));
    h += '<div class="ind-module ind-row" style="grid-template-columns:1.3fr 1fr;margin-top:8px">' + col("ck-pipe-stage", T("Open pipeline by stage", "Pipeline aberto por etapa"), 260) + col("ck-pipe-temp", T("Deal temperature", "Temperatura dos deals"), 260) + "</div>";
    h += '<div class="ind-module ind-row" style="grid-template-columns:1fr 1fr;margin-top:8px">' + col("ck-pipe-aging", T("Proposal+ stage aging", "Aging por etapa (proposta+)"), 240) + col("ck-pipe-sla", T("Response SLA distribution", "Distribuição de SLA de resposta"), 240) + "</div>";
    h += section(T("Proposal and origin", "Proposta e origem"), T("acquisition source · won vs lost · loss reasons", "fonte de aquisição · won vs lost · motivos de perda"));
    h += '<div class="ind-module ind-row" style="grid-template-columns:1fr 1fr 1fr;margin-top:8px">' + col("ck-fonte", T("Deals by source", "Deals por fonte"), 240) + col("ck-wonlost", T("Won vs Lost · monthly", "Won vs Lost · mensal"), 240) + col("ck-lostreasons", T("Loss reasons", "Motivos de perda"), 240) + "</div>";
    h += section(T("Production by area", "Produção por área"), T("won and ticket by product area", "receita e ticket por área de produto"));
    h += '<div class="ind-module ind-row" style="grid-template-columns:1fr 1fr;margin-top:8px">' + col("ck-area-mix", T("WON by product area", "WON por área"), 250) + col("ck-area-ticket", T("Average ticket by area", "Ticket médio por área"), 250) + "</div>";
    h += section(T("Strategic", "Estratégico"), T("source pareto · stage win rate · forecast vs target", "pareto de origem · win rate por etapa · forecast vs meta"));
    h += '<div class="ind-module ind-row" style="grid-template-columns:1.2fr 1fr;margin-top:8px">' + col("ck-pareto", T("Source pareto", "Pareto de origem"), 250) + col("ck-winrate", T("Stage win rate", "Win rate por etapa"), 250) + "</div>";
    h += '<div class="ind-module" style="margin-top:8px"><div style="padding:9px 15px 0"><div class="card-label">' + T("Forecast vs target", "Forecast vs meta") + '</div></div><div class="chart-box" id="ck-forecast" style="height:150px;margin:2px 12px 12px"></div></div>';
    h += "</div>";
    return h;
  }
  function section(ttl, sub) { return '<div class="ind-h" style="margin-top:14px"><span class="ttl">' + esc(ttl) + '</span><span class="sub">' + esc(sub) + "</span></div>"; }
  function col(id, label, hgt) { return '<div class="card"><div class="card-label">' + esc(label) + '</div><div class="chart-box" id="' + id + '" style="height:' + hgt + 'px;margin-top:6px"></div></div>'; }

  // ─── overview ───
  function renderOverviewChrome() {
    var ps = C.pipelineStages;
    var openTot = ps.reduce(function (a, s) { return a + s.open; }, 0);
    var propOpen = W.stageTotals.reduce(function (a, b) { return a + b; }, 0);
    var gauges = [
      { k: T("Open pipeline", "Pipeline aberto"), v: fmtNum(openTot), s: fmtNum(ps.length) + T(" stages", " etapas") },
      { k: T("Without owner", "Sem responsável"), v: "14", s: T("coverage gap", "lacuna de cobertura") },
      { k: "Proposal+", v: fmtNum(propOpen), s: fmtCompactBRL(W.rates.forecastValor) + T(" forecast", " forecast") },
      { k: T("Aging 20d+", "Aging 20d+"), v: fmtNum(W.rates.agingCriticoN), s: fmtCompactBRL(W.rates.agingCriticoValor) + T(" stalled", " parado") }
    ];
    document.getElementById("ckGauges").innerHTML = gauges.map(function (g) {
      return '<button class="ck-gauge" data-view="detail"><div class="g-k">' + esc(g.k) + '<span class="arrow">→</span></div><div class="g-v">' + esc(g.v) + '</div><div class="g-s">' + esc(g.s) + "</div></button>";
    }).join("");

    var R = W.rates;
    document.getElementById("ckCut").innerHTML = [
      ovMini(T("Win rate", "Win rate"), W.hero.winRate.toFixed(1).replace(".", ",") + "%", T("won / total", "won / total"), "", W.hero.winRate * 5, "var(--emerald)"),
      ovMini(T("Overall conversion", "Conversão geral"), fmtNum(R.conversaoGeral) + "%", "WON / total", "", R.conversaoGeral, "var(--emerald)"),
      ovMini(T("Median cycle", "Ciclo mediano"), R.cicloMedianoD + " d", T("n=", "n=") + R.cicloN, "", 100 - R.cicloMedianoD, "var(--blue)"),
      ovMini("No-show rate", fmtNum(R.noShowRate) + "%", T("no-show / scheduled", "no-show / agend."), R.noShowRate >= 15 ? "down" : "", R.noShowRate, "var(--rose)")
    ].join("");

    var L = lang();
    document.getElementById("ckQueues").innerHTML = C.queues.map(function (q) {
      var col = q.risk === "alto" ? "var(--rose)" : "var(--amber)";
      return "<li><span class='qn' style='color:" + col + "'>" + q.n + "</span><span class='ql'>" + esc(L === "pt" ? q.pt : q.en) + "</span><button class='qgo' data-page='" + q.page + "'>" + T("open", "abrir") + " →</button></li>";
    }).join("");
    document.getElementById("ckQueues").querySelectorAll(".qgo").forEach(function (b) {
      b.addEventListener("click", function () { location.hash = "#" + b.getAttribute("data-page"); });
    });
  }
  function renderHero() {
    var chart = initChart("ck-hero");
    var m = W.monthly;
    chart.setOption({
      tooltip: { trigger: "axis", formatter: function (ps) { var i = ps[0].dataIndex; return "<strong>" + ps[0].axisValue + "</strong><br>" + ps[0].marker + " " + M.fmtBRL(m[i].revenue) + "<br><span style='color:" + cvar("--blue") + "'>" + m[i].deals + " deals</span>"; } },
      grid: { left: 58, right: 20, top: 16, bottom: 28 },
      xAxis: { type: "category", data: m.map(function (d) { return d.month; }) },
      yAxis: { type: "value", axisLabel: { formatter: function (v) { return fmtCompactBRL(v); } } },
      series: [{ type: "bar", data: m.map(function (d) { return d.revenue; }), barWidth: "52%",
        itemStyle: { color: "rgba(37,99,235,.68)", borderRadius: [3, 3, 0, 0] },
        label: { show: true, position: "top", fontSize: 9, color: cvar("--blue"), formatter: function (p) { return m[p.dataIndex].deals + "d"; } },
        markLine: { silent: true, symbol: "none", lineStyle: { color: cvar("--amber"), type: "dashed", width: 1 }, label: { show: true, position: "insideEndTop", fontSize: 9, color: cvar("--amber"), formatter: function (p) { return T("Avg ", "Média ") + fmtCompactBRL(p.value); } }, data: [{ type: "average" }] } }]
    });
  }

  // ─── detail (aplica cross-filter via scaled()) ───
  function barH(id, cats, vals, opt) {
    opt = opt || {};
    var chart = initChart(id);
    chart.setOption({
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, formatter: opt.tip || function (p) { return "<b>" + esc(p[0].name) + "</b><br>" + fmtNum(p[0].value); } },
      grid: { left: 10, right: 46, top: 8, bottom: 18, containLabel: true },
      xAxis: { type: "value" },
      yAxis: { type: "category", data: cats, inverse: !!opt.inverse, axisTick: { show: false } },
      series: [{ type: "bar", barWidth: "58%", data: vals.map(function (v, i) { return { value: v, itemStyle: { color: opt.colors ? opt.colors[i] : cvar("--accent"), borderRadius: [0, 4, 4, 0] } }; }),
        label: { show: true, position: "right", color: cvar("--c-text"), fontSize: 10, formatter: opt.fmt || function (p) { return fmtNum(p.value); } } }]
    });
  }
  function renderDetail() {
    // Pipeline por etapa (aberto)
    var ps = C.pipelineStages;
    var ramp = ["#7db4f7", "#5b9bf4", "#3b82f6", "#2563eb", "#1d4ed8", "#173db6"];
    barH("ck-pipe-stage", ps.map(function (s) { return T(s.label_en, s.label_pt); }), ps.map(function (s) { return scaled(s.open); }), { inverse: true, colors: ramp });

    // Temperatura (donut)
    var tp = initChart("ck-pipe-temp");
    tp.setOption({
      tooltip: { trigger: "item", formatter: function (p) { return "<b>" + p.name + "</b><br>" + fmtNum(p.value) + " (" + p.percent + "%)"; } },
      legend: { bottom: 0 },
      series: [{ type: "pie", radius: ["45%", "70%"], center: ["50%", "44%"], avoidLabelOverlap: true,
        itemStyle: { borderColor: cvar("--ind-surf"), borderWidth: 2 }, label: { show: false },
        data: C.temperatura.map(function (t) { return { name: T(t.en, t.pt), value: scaled(t.value), itemStyle: { color: colorOf(t.color) } }; }) }]
    });

    // Aging proposta+ (stacked)
    var rows = W.propStages, labels = rows.map(function (s) { return T(s.label_en, s.label_pt); });
    var BK = [{ n: "< 5d", k: "b_lt5", c: cvar("--emerald") }, { n: "5-10d", k: "b_5_10", c: "#7db4a0" }, { n: "10-20d", k: "b_10_20", c: cvar("--amber") }, { n: "20d+", k: "b_20p", c: cvar("--rose") }];
    var ag = initChart("ck-pipe-aging");
    ag.setOption({
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      legend: { bottom: 0, data: BK.map(function (b) { return b.n; }) },
      grid: { left: 10, right: 20, top: 8, bottom: 28, containLabel: true },
      xAxis: { type: "value" }, yAxis: { type: "category", data: labels, inverse: true, axisTick: { show: false } },
      series: BK.map(function (b) { return { name: b.n, type: "bar", stack: "ag", barWidth: "56%", data: rows.map(function (s) { return scaled(s[b.k]); }), itemStyle: { color: b.c, borderColor: cvar("--ind-surf"), borderWidth: 1 } }; })
    });

    // SLA de resposta
    barH("ck-pipe-sla", C.slaResponse.map(function (s) { return T(s.en, s.pt); }), C.slaResponse.map(function (s) { return scaled(s.value); }), { inverse: false, colors: C.slaResponse.map(function (_, i) { return ramp[Math.min(i, 5)]; }) });

    // Fonte
    var fd = W.fonteDist.map(function (f) { return { n: T(f.fonte_en, f.fonte_pt), v: scaled(f.total) }; }).sort(function (a, b) { return a.v - b.v; });
    barH("ck-fonte", fd.map(function (d) { return d.n; }), fd.map(function (d) { return d.v; }), { colors: fd.map(function (_, i) { return ramp[Math.min(i + (6 - fd.length), 5)]; }) });

    // Won vs Lost mensal
    var wl = initChart("ck-wonlost");
    wl.setOption({
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } }, legend: { bottom: 0 },
      grid: { left: 30, right: 12, top: 8, bottom: 28, containLabel: true },
      xAxis: { type: "category", data: C.wonLost.map(function (d) { return d.month; }) }, yAxis: { type: "value" },
      series: [
        { name: "Won", type: "bar", data: C.wonLost.map(function (d) { return scaled(d.won); }), itemStyle: { color: cvar("--emerald"), borderRadius: [3, 3, 0, 0] }, barWidth: "38%" },
        { name: "Lost", type: "bar", data: C.wonLost.map(function (d) { return scaled(d.lost); }), itemStyle: { color: cvar("--rose"), borderRadius: [3, 3, 0, 0] }, barWidth: "38%" }
      ]
    });

    // Motivos de perda
    var lr = C.lostReasons.map(function (r) { return { n: T(r.en, r.pt), v: scaled(r.value) }; }).sort(function (a, b) { return a.v - b.v; });
    barH("ck-lostreasons", lr.map(function (d) { return d.n; }), lr.map(function (d) { return d.v; }), { colors: lr.map(function () { return cvar("--rose"); }) });

    // Área: WON
    var am = C.areas.map(function (a) { return { n: T(a.en, a.pt), v: scaled(a.won) }; }).sort(function (a, b) { return a.v - b.v; });
    barH("ck-area-mix", am.map(function (d) { return d.n; }), am.map(function (d) { return d.v; }), { colors: am.map(function (_, i) { return ramp[Math.min(i + 1, 5)]; }), fmt: function (p) { return fmtCompactBRL(p.value); }, tip: function (p) { return "<b>" + esc(p[0].name) + "</b><br>" + fmtCompactBRL(p[0].value); } });

    // Área: ticket
    var at = C.areas.map(function (a) { return { n: T(a.en, a.pt), v: a.ticket }; }).sort(function (a, b) { return a.v - b.v; });
    barH("ck-area-ticket", at.map(function (d) { return d.n; }), at.map(function (d) { return d.v; }), { colors: at.map(function () { return cvar("--indigo"); }), fmt: function (p) { return fmtCompactBRL(p.value); }, tip: function (p) { return "<b>" + esc(p[0].name) + "</b><br>" + fmtCompactBRL(p[0].value); } });

    // Pareto de origem (bar + linha acumulada)
    var pf = W.fonteDist.map(function (f) { return { n: T(f.fonte_en, f.fonte_pt), v: scaled(f.total) }; }).sort(function (a, b) { return b.v - a.v; });
    var tot = pf.reduce(function (a, d) { return a + d.v; }, 0), acc = 0;
    var cum = pf.map(function (d) { acc += d.v; return Math.round(acc / tot * 100); });
    var pr = initChart("ck-pareto");
    pr.setOption({
      tooltip: { trigger: "axis", axisPointer: { type: "cross" } }, legend: { bottom: 0 },
      grid: { left: 36, right: 40, top: 10, bottom: 28, containLabel: true },
      xAxis: { type: "category", data: pf.map(function (d) { return d.n; }), axisLabel: { interval: 0, rotate: 20, fontSize: 8 } },
      yAxis: [{ type: "value" }, { type: "value", max: 100, axisLabel: { formatter: "{value}%" }, splitLine: { show: false } }],
      series: [
        { name: "deals", type: "bar", data: pf.map(function (d) { return d.v; }), itemStyle: { color: cvar("--accent"), borderRadius: [3, 3, 0, 0] }, barWidth: "50%" },
        { name: T("cumulative", "acumulado"), type: "line", yAxisIndex: 1, data: cum, lineStyle: { color: cvar("--amber"), width: 2 }, itemStyle: { color: cvar("--amber") }, symbol: "circle", symbolSize: 5 }
      ]
    });

    // Win rate por etapa
    barH("ck-winrate", C.winrateStages.map(function (s) { return T(s.label_en, s.label_pt); }), C.winrateStages.map(function (s) { return s.value; }), { inverse: true, colors: C.winrateStages.map(function (s) { return s.value >= 55 ? cvar("--emerald") : s.value >= 42 ? cvar("--amber") : cvar("--rose"); }), fmt: function (p) { return p.value + "%"; }, tip: function (p) { return "<b>" + esc(p[0].name) + "</b><br>" + p[0].value + "%"; } });

    // Forecast vs meta (barra comparativa horizontal)
    var won = W.hero.wonMes.valor, fc = W.rates.forecastValor, meta = W.meta.metaMes;
    var fg = initChart("ck-forecast");
    fg.setOption({
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, formatter: function (p) { return "<b>" + esc(p[0].name) + "</b><br>" + fmtCompactBRL(p[0].value); } },
      grid: { left: 10, right: 70, top: 6, bottom: 6, containLabel: true },
      xAxis: { type: "value", max: Math.max(won + fc, meta) * 1.05 },
      yAxis: { type: "category", inverse: true, data: [T("Target", "Meta"), T("WON + forecast", "WON + forecast"), "WON"], axisTick: { show: false } },
      series: [{ type: "bar", barWidth: "52%",
        data: [
          { value: meta, itemStyle: { color: cvar("--ind-ink3"), borderRadius: [0, 4, 4, 0] } },
          { value: won + fc, itemStyle: { color: cvar("--blue"), borderRadius: [0, 4, 4, 0] } },
          { value: won, itemStyle: { color: cvar("--emerald"), borderRadius: [0, 4, 4, 0] } }
        ],
        label: { show: true, position: "right", color: cvar("--c-text"), fontSize: 10, formatter: function (p) { return fmtCompactBRL(p.value); } } }]
    });
  }

  // ─── view switching + filtros ───
  function showView(v) {
    _view = v;
    var ct = document.getElementById("page-cockpit");
    ct.querySelectorAll(".ck-viewtab").forEach(function (t) { t.classList.toggle("active", t.getAttribute("data-view") === v); });
    ct.querySelector('[data-panel="overview"]').hidden = (v !== "overview");
    ct.querySelector('[data-panel="detail"]').hidden = (v !== "detail");
    if (v === "detail" && !_detailDone) { renderDetail(); _detailDone = true; }
    M.resizeAll();
  }
  function bind() {
    var ct = document.getElementById("page-cockpit");
    ct.querySelectorAll(".ck-viewtab").forEach(function (t) {
      t.addEventListener("click", function () { showView(t.getAttribute("data-view")); });
    });
    ct.addEventListener("click", function (ev) {
      var g = ev.target.closest(".ck-gauge"); if (g) { showView("detail"); return; }
    });
    ct.querySelectorAll(".ck-fbtn").forEach(function (b) {
      b.addEventListener("click", function () {
        var kind = b.getAttribute("data-f"), v = b.getAttribute("data-v");
        if (kind === "period") _period = v; else _squad = v;
        ct.querySelectorAll('.ck-fbtn[data-f="' + kind + '"]').forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active");
        if (_view === "detail") renderDetail();  // cross-filter reflete no Detalhado
      });
    });
  }

  M.registerPage("cockpit", {
    render: function () {
      M.disposeCharts(CHART_IDS);
      _detailDone = false;
      var ct = document.getElementById("page-cockpit");
      ct.innerHTML = buildMarkup();
      bind();
      renderOverviewChrome();
      renderHero();
      if (_view === "detail") { renderDetail(); _detailDone = true; }
    }
  });
})();
