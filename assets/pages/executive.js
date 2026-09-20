/* MARIONETTE · pages/executive.js — Visão Executiva (overview).
   Camada Início (KPIs + pill, cobertura, fluxos, prioridades), rail do mês,
   leitura do mês (dual-axis), reuniões, funil por aging, fonte, quality strip,
   mapa do Brasil com overlay e drill. Registra-se em window.M. */
(function () {
  "use strict";
  var M = window.M, W = window.MARIONETTE, root = document.documentElement;
  var T = M.T, lang = M.lang, esc = M.esc, fmtNum = M.fmtNum, fmtBRL = M.fmtBRL, fmtCompactBRL = M.fmtCompactBRL;
  var cvar = M.cvar, initChart = M.initChart, ovMini = M.ovMini, ovRich = M.ovRich, ovDelta = M.ovDelta, railCell = M.railCell;

  M.registerI18n({
    ini_ttl: "Início", ini_sub: "saúde, resultado e prioridades: leitura de 60s", ini_pill: "operação saudável",
    cob_l: "Cobertura comercial atual", cob_cap: "WON no mês + pipeline Proposta+ atual vs meta do mês",
    flx_l: "Estado dos fluxos",
    pri_ttl: "Prioridades e exceções", pri_sub: "agregados com fonte comprovada: resume e encaminha",
    pri_th1: "Sinal", pri_th2: "Medida", pri_th3: "Destino", pri_th4: "Risco",
    ini_div: "Análise detalhada",
    mm_ttl: "Indicadores do mês", mm_sub: "operacional · mês comercial",
    m2_ttl: "Leitura do mês", m2_sub: "evolução dominante + indicadores comerciais",
    m2_chart: "Evolução mensal &mdash; receita, deals e ticket médio", m2_idx: "Indicadores comerciais",
    m3_ttl: "Reuniões & agendamentos", m3_sub: "3 KPIs vs mês comercial anterior · evolução 12 meses",
    m3_chart: "Evolução de reuniões <span style='font-weight:400;color:var(--text-muted);font-size:.72rem'>&middot; agendamentos &middot; realizadas &middot; no-show &middot; 12 meses</span>",
    m4_ttl: "Funil comercial", m4_sub: "pipeline aberto · proposta+ · fonte de aquisição",
    m4_c1: "Pipeline aberto por etapa <span style='font-weight:400;color:var(--text-muted);font-size:.72rem'>&middot; proposta+ &middot; empilhado por aging</span>",
    m4_c2: "Resumo proposta+ <span style='font-weight:400;color:var(--text-muted);font-size:.72rem'>&middot; conversão e risco</span>",
    m4_c3: "Deals por fonte de aquisição",
    m5_ttl: "Distribuição geográfica", m5_sub: "entidades por UF", m5_all: "Entidades", m5_back: "Voltar ao Brasil"
  });

  // ─── INÍCIO: rail executivo ───
  function renderIniRail() {
    var H = W.hero, R = W.rates, META = W.meta;
    var ating = Math.round(H.wonMes.valor / META.metaMes * 100);
    var cells = [
      { label: T("Operational health", "Saúde operacional"), value: W.saude.score.toFixed(1).replace(".", ",") + "%", sub: T("0 cron failures in 48h", "0 falhas de cron em 48h"), subCls: "up" },
      { hero: true, label: T("WON revenue", "Receita WON"), value: fmtCompactBRL(H.wonMes.valor), sub: fmtNum(H.wonMes.deals) + " deals · " + ovDelta(H.wonMes.valor, H.wonMes.prevValor, "cur").txt, subCls: ovDelta(H.wonMes.valor, H.wonMes.prevValor, "cur").cls, vColor: "var(--emerald)", big: true },
      { label: T("Proposal+ pipeline", "Pipeline Proposta+"), value: fmtCompactBRL(R.forecastValor), sub: fmtNum(W.stageTotals.reduce(function (a, b) { return a + b; }, 0)) + T(" open deals", " deals abertos") },
      { label: T("Target attainment", "Atingimento da meta"), value: ating + "%", sub: T("target ", "meta ") + fmtCompactBRL(META.metaMes), subCls: ating >= 100 ? "up" : "" },
      { label: T("Risk / critical aging", "Risco / aging crítico"), value: fmtNum(R.agingCriticoN) + " deals", sub: fmtCompactBRL(R.agingCriticoValor) + T(" stalled 20d+", " parados 20d+"), subCls: "down" }
    ];
    document.getElementById("iniRail").innerHTML = cells.map(railCell).join("");
  }

  function renderCobertura() {
    var H = W.hero, R = W.rates, META = W.meta;
    var won = H.wonMes.valor, prop = R.forecastValor, total = won + prop;
    document.getElementById("iniCobBig").textContent = fmtCompactBRL(total);
    document.getElementById("iniCobBar").innerHTML =
      '<i class="won" style="width:' + (won / total * 100) + '%"></i>' +
      '<i class="prop" style="width:' + (prop / total * 100) + '%"></i>';
    document.getElementById("iniCobLegend").innerHTML =
      '<span class="lg"><i style="background:var(--emerald)"></i>WON <b>' + fmtCompactBRL(won) + '</b></span>' +
      '<span class="lg"><i style="background:var(--blue)"></i>' + T("Proposal+ ", "Proposta+ ") + '<b>' + fmtCompactBRL(prop) + '</b></span>' +
      '<span class="lg"><i style="background:var(--amber)"></i>' + T("monthly target ", "meta do mês ") + '<b>' + fmtCompactBRL(META.metaMes) + '</b> · ' + Math.round(won / META.metaMes * 100) + "%</span>";
  }

  function renderFluxos() {
    var L = lang();
    var lbl = { ok: "OK", warn: L === "pt" ? "atenção" : "watch", bad: L === "pt" ? "risco" : "risk", info: "info" };
    document.getElementById("iniFluxos").innerHTML = W.fluxos.map(function (f) {
      return '<div class="ini-flow ' + f.status + '"><span class="fd"></span>' +
        '<span class="fn">' + esc(L === "pt" ? f.name_pt : f.name_en) + '</span>' +
        '<span class="fm">' + esc(L === "pt" ? f.msg_pt : f.msg_en) + '</span>' +
        '<span class="fs ' + f.status + '">' + lbl[f.status] + "</span></div>";
    }).join("");
  }

  function renderPrioridades() {
    var L = lang();
    var tbody = document.querySelector("#iniPrioridades tbody");
    tbody.innerHTML = W.prioridades.map(function (p) {
      var riskLbl = p.risk === "alto" ? T("HIGH", "ALTO") : p.risk === "medio" ? T("MED", "MÉDIO") : "—";
      return "<tr><td class='sig'>" + esc(L === "pt" ? p.sig_pt : p.sig_en) + "<small>" + esc(L === "pt" ? p.sm_pt : p.sm_en) + "</small></td>" +
        "<td>" + esc(p.med) + "</td>" +
        "<td><button class='ini-drill' data-page='" + p.page + "'>" + esc(L === "pt" ? p.dest_pt : p.dest_en) + " →</button></td>" +
        "<td class='tr'><span class='ini-risk " + p.risk + "'>" + riskLbl + "</span></td></tr>";
    }).join("");
    tbody.querySelectorAll(".ini-drill").forEach(function (b) {
      b.addEventListener("click", function () { location.hash = "#" + b.getAttribute("data-page"); });
    });
  }

  function renderMonthRail() {
    var H = W.hero;
    var cells = [
      { label: T("Active pipeline", "Pipeline ativo"), value: fmtCompactBRL(H.pipelineAtivo.valor), sub: fmtNum(H.pipelineAtivo.deals) + T(" open deals", " deals abertos") },
      { label: T("Win rate month", "Win rate mês"), value: H.winRate.toFixed(1).replace(".", ",") + "%", sub: ovDelta(H.winRate, H.winRatePrev, "pp").txt, subCls: ovDelta(H.winRate, H.winRatePrev, "pp").cls },
      { label: T("New deals month", "Novos deals mês"), value: fmtNum(H.novosDeals), sub: ovDelta(H.novosDeals, H.novosDealsPrev, "num").txt, subCls: ovDelta(H.novosDeals, H.novosDealsPrev, "num").cls },
      { label: T("Avg ticket month", "Ticket médio mês"), value: fmtCompactBRL(H.ticketMedio), sub: ovDelta(H.ticketMedio, H.ticketMedioPrev, "cur", false).txt, subCls: ovDelta(H.ticketMedio, H.ticketMedioPrev, "cur", false).cls }
    ];
    document.getElementById("monthRail").innerHTML = cells.map(railCell).join("");
  }

  function renderMonthly() {
    var chart = initChart("chart-monthly");
    var m = W.monthly;
    var months = m.map(function (d) { return d.month; });
    var revenue = m.map(function (d) { return d.revenue; });
    var deals = m.map(function (d) { return d.deals; });
    var tkm = m.map(function (d) { return d.tkm; });
    chart.setOption({
      tooltip: { trigger: "axis", axisPointer: { type: "cross", crossStyle: { color: cvar("--c-dim") } },
        formatter: function (ps) {
          var i = ps[0].dataIndex;
          var h = "<strong>" + ps[0].axisValue + "</strong>";
          h += "<br/>" + ps[0].marker + " " + T("Revenue", "Receita") + ": <strong>" + fmtBRL(revenue[i]) + "</strong>";
          h += '<br/><span style="color:' + cvar("--blue") + '">' + fmtNum(deals[i]) + " deals</span>";
          if (ps[1]) h += "<br/>" + ps[1].marker + " TKM: <strong>" + fmtBRL(tkm[i]) + "</strong>";
          return h;
        } },
      legend: { bottom: 0 },
      grid: { left: 58, right: 58, top: 30, bottom: 34 },
      xAxis: { type: "category", data: months },
      yAxis: [
        { type: "value", name: "R$", nameTextStyle: { fontSize: 9, color: cvar("--c-dim") }, axisLabel: { formatter: function (v) { return fmtCompactBRL(v); } } },
        { type: "value", name: "TKM", nameTextStyle: { fontSize: 9, color: cvar("--c-dim") }, axisLabel: { color: cvar("--amber"), formatter: function (v) { return fmtCompactBRL(v); } }, splitLine: { show: false } }
      ],
      series: [
        { name: T("WON revenue", "Receita WON"), type: "bar", yAxisIndex: 0, data: revenue,
          itemStyle: { color: "rgba(37,99,235,.68)", borderRadius: [3, 3, 0, 0] }, barWidth: "50%",
          label: { show: true, position: "top", fontSize: 9, color: cvar("--blue"), formatter: function (p) { return deals[p.dataIndex] > 0 ? deals[p.dataIndex] + " deals" : ""; } },
          markLine: { silent: true, symbol: "none", lineStyle: { color: cvar("--amber"), type: "dashed", width: 1 },
            label: { show: true, position: "insideEndTop", fontSize: 9, color: cvar("--amber"), formatter: function (p) { return T("Avg: ", "Média: ") + fmtCompactBRL(p.value); } },
            data: [{ type: "average", name: "avg" }] } },
        { name: "TKM", type: "line", yAxisIndex: 1, data: tkm, lineStyle: { color: cvar("--amber"), width: 2 }, itemStyle: { color: cvar("--amber") }, symbol: "circle", symbolSize: 5, smooth: 0.3 }
      ]
    });
  }

  function renderIndices() {
    var R = W.rates;
    var totals = W.stageTotals;
    var totalProp = totals.reduce(function (a, b) { return a + b; }, 0);
    var sum20p = W.propStages.reduce(function (a, s) { return a + s.b_20p; }, 0);
    var sum1020 = W.propStages.reduce(function (a, s) { return a + s.b_10_20; }, 0);
    var pct20p = Math.round(sum20p / totalProp * 100), pct1020 = Math.round(sum1020 / totalProp * 100);
    var worst = W.propStages.reduce(function (b, s) { return s.b_20p > b.b_20p ? s : b; }, W.propStages[0]);
    var critPct = Math.round(R.agingCriticoN / totalProp * 100);
    var fcCov = Math.round(R.forecastN / totalProp * 100);
    var fcCrit = Math.round(R.agingCriticoValor / R.forecastValor * 100);
    var cyD = ovDelta(R.cicloMedianoD, R.cicloMedianoPrevD, "days", true);
    var cyMag = Math.min(100, Math.round(Math.abs(R.cicloMedianoD - R.cicloMedianoPrevD) / R.cicloMedianoPrevD * 100));
    document.getElementById("commercialIndices").innerHTML = [
      ovRich(T("Overall conversion", "Conversão geral"), fmtNum(R.conversaoGeral) + "%",
        [{ t: "WON " + fmtNum(W.hero.wonMes.deals) + " / " + fmtNum(W.hero.novosDeals) }, { t: "Prop→Won " + fmtNum(R.propostaWon) + "%" }],
        [{ pct: R.conversaoGeral, color: "var(--emerald)", t: "conv" }, { pct: R.propostaWon, color: "var(--blue)", t: "P→W" }]),
      ovRich(T("Median cycle", "Ciclo mediano"), R.cicloMedianoD + " d",
        [{ t: cyD.txt, cls: cyD.cls }, { t: T("median · n=", "mediana · n=") + R.cicloN }],
        [{ pct: cyMag, color: cyD.cls === "up" ? "var(--emerald)" : "var(--rose)", t: "Δ" }]),
      ovRich("Forecast Prop+", fmtCompactBRL(R.forecastValor),
        [{ t: R.forecastN + " deals · " + T("avg ", "méd ") + fmtCompactBRL(R.forecastAvg) }, { t: fcCrit + "%" + T(" in 20d+ aging", " em aging 20d+"), cls: fcCrit >= 30 ? "down" : "" }],
        [{ pct: fcCov, color: "var(--emerald)", t: T("cover", "cobert") }, { pct: fcCrit, color: "var(--rose)", t: T("risk", "risco") }]),
      ovRich(T("Critical aging", "Aging crítico"), fmtNum(R.agingCriticoN) + " deals 20d+",
        [{ t: fmtCompactBRL(R.agingCriticoValor) + T(" stalled · ", " parado · ") + critPct + "%" + T(" of total", " do total") }, { t: T("worst: ", "pior: ") + T(worst.label_en, worst.label_pt) + " (" + worst.b_20p + ")" }],
        [{ pct: pct20p, color: "var(--rose)", t: "20d+" }, { pct: pct1020, color: "var(--amber)", t: "10-20d" }])
    ].join("");
  }

  function renderMeetings() {
    var evo = W.meetings;
    var cur = evo[11], prev = evo[10];
    var showRate = Math.round((cur.agendamentos - cur.noShow) / cur.agendamentos * 100);
    var nsRate = Math.round(cur.noShow / cur.agendamentos * 100);
    var maxAg = evo.reduce(function (m, d) { return Math.max(m, d.agendamentos); }, 0);
    var dAg = ovDelta(cur.agendamentos, prev.agendamentos, "num", false);
    var dRr = ovDelta(cur.realizadas, prev.realizadas, "num", false);
    var dNs = ovDelta(cur.noShow, prev.noShow, "num", true);
    document.getElementById("meetingIndices").innerHTML = [
      ovRich(T("Scheduled", "Agendamentos"), fmtNum(cur.agendamentos), [{ t: dAg.txt, cls: dAg.cls }], [{ pct: Math.round(cur.agendamentos / maxAg * 100), color: "var(--emerald)", t: T("vs peak", "vs pico") }]),
      ovRich(T("Meetings held", "Reuniões realizadas"), fmtNum(cur.realizadas), [{ t: dRr.txt, cls: dRr.cls }, { t: "show rate " + showRate + "%" }], [{ pct: showRate, color: "var(--emerald)", t: "show" }]),
      ovRich("No-show", fmtNum(cur.noShow), [{ t: dNs.txt, cls: dNs.cls }, { t: "no-show rate " + nsRate + "%" }], [{ pct: nsRate, color: "var(--rose)", t: "rate" }])
    ].join("");

    var chart = initChart("chart-meetings");
    chart.setOption({
      tooltip: { trigger: "axis", axisPointer: { type: "cross", crossStyle: { color: cvar("--c-dim") } } },
      legend: { bottom: 0 },
      grid: { left: 40, right: 18, top: 14, bottom: 34 },
      xAxis: { type: "category", data: evo.map(function (d) { return d.month; }) },
      yAxis: { type: "value" },
      series: [
        { name: T("Scheduled", "Agendamentos"), type: "bar", data: evo.map(function (d) { return d.agendamentos; }), itemStyle: { color: "rgba(37,99,235,.6)", borderRadius: [3, 3, 0, 0] }, barWidth: "46%" },
        { name: T("Held", "Realizadas"), type: "line", data: evo.map(function (d) { return d.realizadas; }), smooth: 0.3, symbol: "circle", symbolSize: 5, lineStyle: { color: cvar("--emerald"), width: 2 }, itemStyle: { color: cvar("--emerald") } },
        { name: "No-show", type: "line", data: evo.map(function (d) { return d.noShow; }), smooth: 0.3, symbol: "circle", symbolSize: 4, lineStyle: { color: cvar("--rose"), width: 1.5 }, itemStyle: { color: cvar("--rose") } }
      ]
    });
  }

  function renderFunnel() {
    var chart = initChart("chart-funnel");
    var rows = W.propStages;
    var labels = rows.map(function (s) { return T(s.label_en, s.label_pt); });
    var totals = W.stageTotals;
    var BUCKETS = [
      { name: "< 5d", key: "b_lt5", color: cvar("--emerald") },
      { name: "5-10d", key: "b_5_10", color: "#7db4a0" },
      { name: "10-20d", key: "b_10_20", color: cvar("--amber") },
      { name: "20d+", key: "b_20p", color: cvar("--rose") }
    ];
    var series = BUCKETS.map(function (bk) {
      return { name: bk.name, type: "bar", stack: "aging", barWidth: "56%",
        data: rows.map(function (s) { return s[bk.key]; }),
        itemStyle: { color: bk.color, borderColor: cvar("--ind-surf") || "#0e0e10", borderWidth: 1 } };
    });
    series.push({ name: "_total", type: "bar", barGap: "-100%", barWidth: "56%", silent: true, z: -1,
      data: totals, itemStyle: { color: "transparent" },
      label: { show: true, position: "right", color: cvar("--c-text"), fontSize: 11, fontWeight: 700, formatter: function (p) { return p.value > 0 ? fmtNum(p.value) : ""; } } });
    chart.setOption({
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" },
        formatter: function (ps) {
          if (!ps || !ps.length) return "";
          var i = ps[0].dataIndex, s = rows[i];
          var h = "<strong>" + esc(labels[i]) + "</strong> · " + fmtNum(totals[i]) + T(" open", " abertos") + "<br>" + fmtCompactBRL(s.valor) + T(" in valid value", " em valor válido");
          ps.forEach(function (p) { if (p.seriesName.charAt(0) !== "_" && p.value > 0) h += "<br>" + p.marker + p.seriesName + ": " + fmtNum(p.value); });
          return h;
        } },
      legend: { bottom: 0, data: BUCKETS.map(function (b) { return b.name; }) },
      grid: { left: 10, right: 46, top: 10, bottom: 28, containLabel: true },
      xAxis: { type: "value" },
      yAxis: { type: "category", inverse: true, data: labels, axisTick: { show: false } },
      series: series
    });

    var R = W.rates;
    var totalOpen = totals.reduce(function (a, b) { return a + b; }, 0);
    var critPct = Math.round(R.agingCriticoN / totalOpen * 100);
    document.getElementById("funnelSummary").innerHTML = [
      ovMini(T("Overall conversion", "Conversão geral"), fmtNum(R.conversaoGeral) + "%", T("WON / total · month", "WON / total · mês"), "", R.conversaoGeral, "var(--emerald)"),
      ovMini(T("Meeting → Proposal", "Reunião → Proposta"), fmtNum(R.reuniaoProposta) + "%", T("held / scheduled", "realizadas / agend."), "", R.reuniaoProposta, "var(--emerald)"),
      ovMini(T("Proposal → Won", "Proposta → Won"), fmtNum(R.propostaWon) + "%", T("won / held", "won / realizadas"), "", R.propostaWon, "var(--emerald)"),
      ovMini("No-show rate", fmtNum(R.noShowRate) + "%", T("no-show / scheduled", "no-show / agend."), R.noShowRate >= 15 ? "down" : "", R.noShowRate, "var(--rose)"),
      ovMini("Forecast Prop+", fmtCompactBRL(R.forecastValor), fmtNum(totalOpen) + T(" open · avg ", " abertos · méd ") + fmtCompactBRL(R.forecastAvg), "", null, null),
      ovMini(T("Critical aging", "Aging crítico"), fmtNum(R.agingCriticoN) + " deals", fmtCompactBRL(R.agingCriticoValor) + " · " + critPct + "%", critPct >= 30 ? "down" : "", critPct, "var(--rose)")
    ].join("");
  }

  function renderFonte() {
    var chart = initChart("chart-fonte");
    var factor = document.getElementById("fonteWindow").value === "180" ? 1.9 : 1;
    var items = W.fonteDist.map(function (f) {
      return { name: T(f.fonte_en, f.fonte_pt), total: Math.round(f.total * factor) };
    }).sort(function (a, b) { return a.total - b.total; });
    var ramp = ["#7db4f7", "#5b9bf4", "#3b82f6", "#2563eb", "#1d4ed8", "#173db6"];
    chart.setOption({
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, formatter: function (p) { return "<b>" + esc(p[0].name) + "</b><br>" + fmtNum(p[0].value) + " deals"; } },
      grid: { left: 10, right: 48, top: 8, bottom: 20, containLabel: true },
      xAxis: { type: "value" },
      yAxis: { type: "category", data: items.map(function (d) { return d.name; }) },
      series: [{ type: "bar", barWidth: "55%",
        data: items.map(function (d, i) { return { value: d.total, itemStyle: { color: ramp[Math.min(i + (6 - items.length), 5)], borderRadius: [0, 4, 4, 0] } }; }),
        label: { show: true, position: "right", color: cvar("--c-text"), fontSize: 10, formatter: function (p) { return fmtNum(p.value); } } }]
    });
  }

  function renderWfStrip() {
    var q = W.qualityFunnel;
    var items = [
      { label: "Total", value: q.total, color: cvar("--accent") },
      { label: "Email", value: q.email, color: "#5b9bf4" },
      { label: T("Phone", "Telefone"), value: q.telefone, color: "#3b82f6" },
      { label: T("Document", "Documento"), value: q.documento, color: "#2563eb" },
      { label: T("Organization", "Organização"), value: q.organizacao, color: "#1d4ed8" },
      { label: T("Complete", "Completos"), value: q.completos, color: cvar("--emerald") }
    ];
    var html = '<span class="wf-title">' + T("QUALITY FUNNEL", "FUNIL DE QUALIDADE") + "</span>";
    html += '<div class="wf-bar">';
    items.forEach(function (it) {
      var pct = it.value / q.total * 100;
      html += '<div style="width:' + pct + '%;height:100%;background:' + it.color + ';min-width:1px" title="' + esc(it.label) + ": " + fmtNum(it.value) + " (" + pct.toFixed(1) + '%)"></div>';
    });
    html += "</div>";
    html += '<div class="wf-legend">';
    items.forEach(function (it) {
      var pct = (it.value / q.total * 100).toFixed(0);
      html += '<span style="color:' + it.color + ';font-weight:600">' + esc(it.label) + ' <span style="color:var(--ind-ink)">' + fmtNum(it.value) + '</span> <span style="color:var(--ind-ink3)">(' + pct + "%)</span></span>";
    });
    html += "</div>";
    document.getElementById("wfStrip").innerHTML = html;
  }

  // ─── Mapa ───
  var _geoLoaded = false, _geoTipo = "", _drillUF = null;
  var REG_MAP = { "Rio Grande do Sul": "Sul", "Santa Catarina": "Sul", "Paraná": "Sul", "São Paulo": "Sudeste", "Rio de Janeiro": "Sudeste", "Minas Gerais": "Sudeste", "Espírito Santo": "Sudeste", "Goiás": "Centro-Oeste", "Mato Grosso": "Centro-Oeste", "Mato Grosso do Sul": "Centro-Oeste", "Distrito Federal": "Centro-Oeste", "Bahia": "Nordeste", "Sergipe": "Nordeste", "Alagoas": "Nordeste", "Pernambuco": "Nordeste", "Paraíba": "Nordeste", "Rio Grande do Norte": "Nordeste", "Ceará": "Nordeste", "Piauí": "Nordeste", "Maranhão": "Nordeste", "Pará": "Norte", "Amazonas": "Norte", "Amapá": "Norte", "Roraima": "Norte", "Tocantins": "Norte", "Rondônia": "Norte", "Acre": "Norte" };
  var REG_COLORS = { "Sudeste": "var(--emerald)", "Sul": "var(--blue)", "Nordeste": "var(--amber)", "Centro-Oeste": "var(--indigo)", "Norte": "var(--teal)" };
  function tipoFactor(uf) {
    if (_geoTipo === "PF") return 0.72 + (uf.charCodeAt(0) % 7) * 0.01;
    if (_geoTipo === "PJ") return 0.28 - (uf.charCodeAt(0) % 7) * 0.01;
    return 1;
  }
  function mapData() {
    return W.ufDist.map(function (d) { return { name: d.name, uf: d.uf, value: Math.round(d.total * tipoFactor(d.uf)) }; });
  }
  function buildOverlay(data) {
    var wrap = document.getElementById("chart-map").parentElement;
    var old = wrap.querySelector(".geo-overlay");
    if (old) old.remove();
    var ov = document.createElement("div");
    ov.className = "geo-overlay";
    var sorted = data.slice().sort(function (a, b) { return b.value - a.value; });
    var totalMapped = sorted.reduce(function (a, b) { return a + b.value; }, 0);
    function div(css, text) { var e = document.createElement("div"); e.style.cssText = css; if (text != null) e.textContent = text; return e; }

    if (_drillUF) {
      var d = sorted.filter(function (x) { return x.name === _drillUF; })[0];
      var rank = sorted.map(function (x) { return x.name; }).indexOf(_drillUF) + 1;
      var pct = (d.value / totalMapped * 100).toFixed(1);
      ov.appendChild(div("font-size:.7rem;text-transform:uppercase;color:var(--accent-soft);margin-bottom:8px;font-weight:700;letter-spacing:1px", _drillUF));
      ov.appendChild(div("font-size:1.7rem;font-weight:700;margin-bottom:2px;font-family:var(--mono)", fmtNum(d.value)));
      ov.appendChild(div("font-size:.7rem;color:var(--text-muted);margin-bottom:12px", T("entities in the golden record", "entidades no golden record")));
      var g = div("display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px");
      [[("#" + rank), T("national rank", "rank nacional")], [pct + "%", T("share of mapped", "share do mapeado")],
       [fmtNum(Math.round(d.value * 0.72)), "PF"], [fmtNum(Math.round(d.value * 0.28)), "PJ"]].forEach(function (it) {
        var c = div("background:var(--bg-card);border-radius:4px;padding:6px 8px");
        c.appendChild(div("font-size:1rem;font-weight:700;color:var(--accent-soft);font-family:var(--mono)", it[0]));
        c.appendChild(div("font-size:.6rem;color:var(--text-muted);margin-top:2px", it[1]));
        g.appendChild(c);
      });
      ov.appendChild(g);
      ov.appendChild(div("font-size:.62rem;color:var(--text-subtle)", T("Region: ", "Região: ") + (REG_MAP[_drillUF] || "-")));
      wrap.appendChild(ov);
      return;
    }

    var totalGeral = totalMapped + W.ufUnmapped.semUfComCidade + W.ufUnmapped.semLocalizacao;
    ov.appendChild(div("font-size:.7rem;text-transform:uppercase;color:var(--accent-soft);margin-bottom:8px;font-weight:700;letter-spacing:1px", T("National summary", "Resumo nacional")));
    ov.appendChild(div("font-size:1.6rem;font-weight:700;margin-bottom:2px;font-family:var(--mono)", fmtNum(totalGeral)));
    ov.appendChild(div("font-size:.7rem;color:var(--text-muted);margin-bottom:4px", T("entities with location scope", "entidades no escopo de localização")));
    var gapEl = div("font-size:.64rem;color:var(--amber);margin-bottom:12px");
    gapEl.textContent = fmtNum(W.ufUnmapped.semUfComCidade) + T(" city without state · ", " cidade sem UF · ") + fmtNum(W.ufUnmapped.semLocalizacao) + T(" no location", " sem localização");
    gapEl.title = T("Backfillable via city→state lookup; the rest has no address on record.", "Backfillável via lookup cidade→UF; o resto não tem endereço cadastrado.");
    ov.appendChild(gapEl);

    var states = sorted.filter(function (d) { return d.value > 0; }).length;
    var top3 = sorted.slice(0, 3).reduce(function (s, d) { return s + d.value; }, 0);
    var conc3 = (top3 / totalMapped * 100).toFixed(1);
    var hhi = 0;
    sorted.forEach(function (d) { var sh = d.value / totalMapped; hhi += sh * sh; });
    hhi = Math.round(hhi * 10000);
    var hhiLabel = hhi > 2500 ? T("Very concentrated", "Muito concentrado") : hhi > 1500 ? T("Concentrated", "Concentrado") : T("Dispersed", "Disperso");
    var hhiColor = hhi > 2500 ? "var(--rose)" : hhi > 1500 ? "var(--amber)" : "var(--emerald)";
    var grid = div("display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:13px");
    [[fmtNum(states), T("Active states", "Estados ativos"), "var(--accent-soft)"], [conc3 + "%", T("Top 3 states", "Top 3 estados"), "var(--blue)"],
     [fmtNum(hhi), T("HHI index", "Índice HHI"), hhiColor], [hhiLabel, T("Concentration", "Concentração"), hhiColor]].forEach(function (it) {
      var c = div("background:var(--bg-card);border-radius:4px;padding:6px 8px");
      c.appendChild(div("font-size:.95rem;font-weight:700;font-family:var(--mono);color:" + it[2], it[0]));
      c.appendChild(div("font-size:.6rem;color:var(--text-muted);margin-top:2px", it[1]));
      grid.appendChild(c);
    });
    ov.appendChild(grid);
    ov.appendChild(div("height:1px;background:var(--ind-line);margin-bottom:11px"));
    ov.appendChild(div("font-size:.68rem;text-transform:uppercase;color:var(--blue);margin-bottom:9px;font-weight:700", T("Top 5 concentrations", "Top 5 concentrações")));
    sorted.slice(0, 5).forEach(function (d, i) {
      var pct = (d.value / totalMapped * 100).toFixed(1);
      var row = div("margin-bottom:7px");
      var hdr = div("display:flex;justify-content:space-between;font-size:.72rem;margin-bottom:3px");
      var l = document.createElement("span"); l.style.color = "var(--text-muted)"; l.textContent = "#" + (i + 1) + " " + d.name;
      var v = document.createElement("span"); v.style.cssText = "color:var(--accent-soft);font-weight:600;font-family:var(--mono);font-size:.68rem"; v.textContent = fmtNum(d.value) + " (" + pct + "%)";
      hdr.appendChild(l); hdr.appendChild(v); row.appendChild(hdr);
      var bar = div("height:4px;background:var(--bg);border-radius:2px;overflow:hidden");
      bar.appendChild(div("height:100%;background:var(--accent);width:" + pct + "%"));
      row.appendChild(bar); ov.appendChild(row);
    });
    ov.appendChild(div("height:1px;background:var(--ind-line);margin:11px 0"));
    ov.appendChild(div("font-size:.68rem;text-transform:uppercase;color:var(--blue);margin-bottom:9px;font-weight:700", T("By region", "Por região")));
    var regioes = { "Sudeste": 0, "Sul": 0, "Nordeste": 0, "Centro-Oeste": 0, "Norte": 0 };
    sorted.forEach(function (d) { var r = REG_MAP[d.name]; if (r) regioes[r] += d.value; });
    Object.keys(regioes).sort(function (a, b) { return regioes[b] - regioes[a]; }).forEach(function (reg) {
      var pct = (regioes[reg] / totalMapped * 100).toFixed(1);
      var row = div("display:flex;justify-content:space-between;align-items:center;font-size:.7rem;margin-bottom:5px");
      var dot = document.createElement("span"); dot.style.cssText = "width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:6px;flex-shrink:0;background:" + REG_COLORS[reg];
      var left = document.createElement("span"); left.style.color = "var(--text-muted)"; left.appendChild(dot); left.appendChild(document.createTextNode(reg));
      var right = document.createElement("span"); right.style.cssText = "color:var(--text-2);font-weight:500;font-family:var(--mono);font-size:.66rem"; right.textContent = fmtNum(regioes[reg]) + " (" + pct + "%)";
      row.appendChild(left); row.appendChild(right); ov.appendChild(row);
    });
    wrap.appendChild(ov);
  }
  function renderMap() {
    var chart = initChart("chart-map");
    var data = mapData();
    var max = data.reduce(function (m, d) { return Math.max(m, d.value); }, 0);
    function fmtCompact(v) { return v >= 1000 ? Math.round(v / 1000) + "k" : String(v); }
    function paint() {
      chart.setOption({
        tooltip: { trigger: "item", formatter: function (p) { return isNaN(p.value) ? p.name : "<b>" + p.name + "</b><br>" + fmtNum(p.value) + T(" entities", " entidades"); } },
        visualMap: { min: 0, max: max, left: 14, bottom: 14, calculable: false, itemWidth: 10, itemHeight: 90,
          text: [fmtCompact(max), "0"], textStyle: { color: cvar("--c-dim"), fontSize: 9, fontFamily: '"Space Mono",monospace' },
          inRange: { color: root.getAttribute("data-theme") === "light" ? ["#e5edff", "#93b4f8", "#2563eb", "#173db6"] : ["#10182b", "#1d3a6b", "#2563eb", "#7db4f7"] } },
        series: [{ type: "map", map: "brazil", roam: false, selectedMode: false,
          itemStyle: { borderColor: cvar("--map-border"), borderWidth: 1, areaColor: cvar("--bg-card-solid") },
          emphasis: { itemStyle: { areaColor: cvar("--accent-soft") }, label: { color: cvar("--c-text"), fontSize: 10 } },
          label: { show: false },
          data: data }]
      });
    }
    if (!_geoLoaded) {
      fetch("assets/brazil-states.geojson").then(function (r) { return r.json(); }).then(function (geo) {
        echarts.registerMap("brazil", geo);
        _geoLoaded = true;
        paint(); buildOverlay(data);
      }).catch(function () {
        document.getElementById("chart-map").textContent = "map unavailable";
      });
    } else { paint(); buildOverlay(data); }
    chart.off("click");
    chart.on("click", function (p) {
      if (!p || !p.name) return;
      _drillUF = (_drillUF === p.name) ? null : p.name;
      document.getElementById("btnBackBrazil").style.display = _drillUF ? "inline-block" : "none";
      buildOverlay(mapData());
    });
  }

  // listeners estáticos da página (elementos vivem no HTML da casca)
  document.getElementById("btnBackBrazil").addEventListener("click", function () {
    _drillUF = null;
    this.style.display = "none";
    buildOverlay(mapData());
  });
  document.getElementById("geoTipo").addEventListener("click", function (ev) {
    var b = ev.target.closest("button");
    if (!b) return;
    this.querySelectorAll("button").forEach(function (x) { x.classList.remove("active"); });
    b.classList.add("active");
    _geoTipo = b.getAttribute("data-tipo");
    renderMap();
  });
  document.getElementById("fonteWindow").addEventListener("change", renderFonte);

  M.registerPage("overview", {
    render: function () {
      var meta = document.getElementById("m1Meta");
      if (meta) meta.textContent = (lang() === "pt" ? "MÊS COMERCIAL " : "COMMERCIAL MONTH ") + W.commercialMonth;
      renderIniRail(); renderCobertura(); renderFluxos(); renderPrioridades(); renderMonthRail();
      renderMonthly(); renderIndices(); renderMeetings();
      renderFunnel(); renderFonte(); renderWfStrip(); renderMap();
    }
  });
})();
