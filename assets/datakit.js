/* ============================================================
   MARIONETTE · datakit.js
   Um mundo sintético único e coerente, gerado por seed fixa.
   Todas as telas leem este mesmo mundo: os agregados batem
   entre módulos por construção. Nenhum dado aqui é real.
   ============================================================ */
(function (global) {
  "use strict";

  // ---------- PRNG seedado (mulberry32): mesma seed, mesmo mundo ----------
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var SEED = 20260918;
  var rnd = mulberry32(SEED);
  function ri(min, max) { return Math.floor(rnd() * (max - min + 1)) + min; }
  function rf(min, max) { return rnd() * (max - min) + min; }
  function pick(arr) { return arr[Math.floor(rnd() * arr.length)]; }

  // ---------- Identidade do demo ----------
  var ORG = {
    name: "Alvor Capital",
    kind: "Investment advisory (fictitious)",
    kind_pt: "Assessoria de investimentos (fictícia)"
  };

  // ---------- Fontes integradas ----------
  // Reguladores públicos com nome real; SaaS sempre genérico.
  var SOURCES = [
    { id: "crm",        name: "CRM",                    name_pt: "CRM",                       group: "commercial", bidirectional: true,  cadence: "15 min" },
    { id: "mkt",        name: "Marketing Automation",   name_pt: "Automação de Marketing",   group: "commercial", bidirectional: true,  cadence: "30 min" },
    { id: "cvm",        name: "CVM registry",           name_pt: "Cadastro CVM",              group: "regulatory", bidirectional: false, cadence: "daily" },
    { id: "ancord",     name: "ANCORD certification",   name_pt: "Certificação ANCORD",      group: "regulatory", bidirectional: false, cadence: "daily" },
    { id: "bcb",        name: "BCB-SGS series",         name_pt: "Séries BCB-SGS",            group: "regulatory", bidirectional: false, cadence: "daily" },
    { id: "sanctions",  name: "Public sanction lists",  name_pt: "Listas públicas de sanções", group: "regulatory", bidirectional: false, cadence: "weekly" },
    { id: "calendar",   name: "Calendar",               name_pt: "Agenda",                    group: "activity",   bidirectional: false, cadence: "10 min" },
    { id: "email",      name: "Transactional email",    name_pt: "E-mail transacional",       group: "activity",   bidirectional: false, cadence: "hourly" },
    { id: "sheets",     name: "Spreadsheets",           name_pt: "Planilhas",                 group: "activity",   bidirectional: false, cadence: "hourly" },
    { id: "transcripts",name: "Meeting transcripts",    name_pt: "Transcrições de reuniões",  group: "activity",   bidirectional: false, cadence: "on event" }
  ];

  // ---------- North stars (agregados do mundo) ----------
  var K = {
    entitiesTotal: 68437,          // golden record
    entitiesActive: 51280,
    pfPjLinks: 15941,
    quarantineOpen: 143,
    sources: SOURCES.length,
    syncs24h: 1284,
    syncSuccessRate: 0.994,
    writebackQueue30d: 21378,
    writebackSuccess: 0.993,
    leadsScored: 21704,
    meetingsEvaluated: 2118,
    aiCostMtdUsd: 27.84,
    aiCostPerMeetingUsd: 0.081,
    llmTokens30dM: 9.6,            // milhões
    cronJobs: 87,
    cronFailures48h: 0,
    tables: 173,
    migrations: 791
  };

  // ---------- Funil comercial (30d) ----------
  // Coerência: soma dos estágios downstream <= leads novos; bandas somam leadsScored.
  var FUNNEL = [
    { key: "leads",      en: "New leads",        pt: "Leads novos",        value: 6480 },
    { key: "qualified",  en: "Qualified",        pt: "Qualificados",       value: 2350 },
    { key: "meeting",    en: "Meeting held",     pt: "Reunião feita",       value: 1118 },
    { key: "proposal",   en: "Proposal",         pt: "Proposta",           value: 512 },
    { key: "won",        en: "Won",              pt: "Ganho",              value: 231 }
  ];

  var SCORE_BANDS = [
    { band: "A", share: 0.09, convMult: 6.8 },
    { band: "B", share: 0.17, convMult: 3.1 },
    { band: "C", share: 0.38, convMult: 1.2 },
    { band: "D", share: 0.36, convMult: 0.4 }
  ];

  // ---------- Saúde de sync por fonte ----------
  var FALSE_ALARMS = {
    crm: {
      en: "Weekend volume drops ~70%. A quiet Sunday is not a broken pipeline: check the weekday baseline before paging anyone.",
      pt: "Volume cai ~70% no fim de semana. Domingo quieto não é pipeline quebrado: confira a baseline de dia útil antes de acionar alguém."
    },
    mkt: {
      en: "Campaign bursts create 10x spikes followed by silence. The gap after a burst looks like an outage but is expected decay.",
      pt: "Disparos de campanha criam picos de 10x seguidos de silêncio. O vazio pós-pico parece queda, mas é decaimento esperado."
    },
    cvm: {
      en: "Registry publishes in one daily batch. Zero rows during the day is normal; only a missing overnight batch is an incident.",
      pt: "O cadastro publica em lote diário único. Zero linhas durante o dia é normal; incidente é só a ausência do lote noturno."
    },
    ancord: {
      en: "Certification updates cluster around exam windows. Weeks of no change are healthy.",
      pt: "Atualizações de certificação se concentram nas janelas de prova. Semanas sem mudança são saudáveis."
    },
    bcb: {
      en: "Series revise past values retroactively. A changed historical point is a revision, not corruption.",
      pt: "As séries revisam valores passados retroativamente. Ponto histórico alterado é revisão, não corrupção."
    },
    sanctions: {
      en: "Weekly cadence. Mid-week checks always show \"stale\" age; alert only past 9 days.",
      pt: "Cadência semanal. Checagem no meio da semana sempre parece \"velha\"; alertar só acima de 9 dias."
    },
    calendar: {
      en: "Cancelled events arrive as updates, briefly inflating the changed count after holidays.",
      pt: "Eventos cancelados chegam como updates e inflam o contador de mudanças depois de feriados."
    },
    email: {
      en: "Bounce storms from one bad list can triple hourly volume without any pipeline fault.",
      pt: "Tempestades de bounce de uma lista ruim triplicam o volume horário sem falha nenhuma de pipeline."
    },
    sheets: {
      en: "Manual edits at month-close create bursts of cell-level changes that are business as usual.",
      pt: "Edições manuais no fechamento do mês geram rajadas de mudanças de célula que são rotina."
    },
    transcripts: {
      en: "Volume follows the meeting calendar; empty early mornings are not failures.",
      pt: "Volume segue a agenda de reuniões; madrugadas vazias não são falha."
    }
  };

  function buildSyncHealth() {
    var now = Date.now();
    return SOURCES.map(function (s, idx) {
      var lagMin, status;
      // um warning proposital (mkt) e o resto saudável, com lags plausíveis por cadência
      if (s.id === "mkt") { lagMin = 96; status = "warn"; }
      else if (s.cadence === "daily") { lagMin = ri(60, 20 * 60); status = "ok"; }
      else if (s.cadence === "weekly") { lagMin = ri(1, 5) * 24 * 60; status = "ok"; }
      else { lagMin = ri(2, 40); status = "ok"; }
      var vol7 = [];
      var base = { crm: 420, mkt: 260, cvm: 90, ancord: 35, bcb: 60, sanctions: 12, calendar: 210, email: 180, sheets: 75, transcripts: 48 }[s.id] || 50;
      for (var d = 6; d >= 0; d--) {
        var weekend = ((new Date(now - d * 86400000)).getDay() % 6 === 0);
        var v = Math.round(base * (weekend ? rf(0.2, 0.45) : rf(0.8, 1.25)));
        if (s.id === "mkt" && d === 2) v = Math.round(base * 9.4); // pico de campanha
        vol7.push(v);
      }
      return {
        id: s.id, name: s.name, name_pt: s.name_pt, group: s.group,
        bidirectional: s.bidirectional, cadence: s.cadence,
        status: status, lagMin: lagMin,
        errorRate: s.id === "mkt" ? 0.021 : rf(0, 0.006),
        rows24h: vol7[6] * ri(3, 6),
        vol7: vol7,
        falseAlarm: FALSE_ALARMS[s.id]
      };
    });
  }

  // ---------- Dead-letter queue ----------
  var DL_REASONS = [
    { en: "Upstream 429 after retry budget",        pt: "429 do upstream após esgotar retries" },
    { en: "Payload failed schema validation",       pt: "Payload reprovado na validação de schema" },
    { en: "Foreign key target not yet synced",      pt: "Alvo da foreign key ainda não sincronizado" },
    { en: "Timestamp older than current record",    pt: "Timestamp mais antigo que o registro atual" },
    { en: "Encoding error in free-text field",      pt: "Erro de encoding em campo de texto livre" }
  ];
  function buildDeadLetters() {
    var out = [];
    var srcs = ["crm", "mkt", "email", "sheets", "crm", "mkt", "transcripts"];
    for (var i = 0; i < 7; i++) {
      var r = pick(DL_REASONS);
      out.push({
        id: "dl-" + (4100 + i * ri(2, 9)),
        source: srcs[i],
        reason_en: r.en, reason_pt: r.pt,
        attempts: ri(3, 5),
        ageMin: ri(14, 2100),
        entityHint: pick(FIRST) + " " + pick(LAST)
      });
    }
    return out;
  }

  // ---------- Pessoas sintéticas (para feeds e, nas fases 2+, o golden record) ----------
  var FIRST = ["Marina", "Rafael", "Beatriz", "Caio", "Helena", "Otavio", "Larissa", "Bruno", "Camila", "Diego", "Isadora", "Vicente", "Paula", "Renato", "Sofia", "Tiago", "Yara", "Gustavo", "Elisa", "Mateus"];
  var LAST = ["Duarte", "Sales", "Moreira", "Pinheiro", "Vasconcelos", "Rocha", "Siqueira", "Tavares", "Antunes", "Barroso", "Camargo", "Peixoto", "Sarmento", "Valente", "Queiroz", "Linhares"];

  var WB_ACTIONS = [
    { type: "fill",    en: "filled empty CRM field",        pt: "preencheu campo vazio no CRM" },
    { type: "merge",   en: "merged duplicate into golden",  pt: "fundiu duplicata no golden record" },
    { type: "suggest", en: "suggested value for review",    pt: "sugeriu valor para revisão" },
    { type: "keep",    en: "kept local value (sovereignty)", pt: "manteve valor local (soberania)" },
    { type: "score",   en: "pushed updated lead score",     pt: "enviou lead score atualizado" }
  ];
  var WB_FIELDS = ["email", "celular", "faixa de PL", "registro CVM", "certificação ANCORD", "origem", "lead score", "empresa"];

  function buildWritebackFeed(n) {
    var out = [];
    for (var i = 0; i < n; i++) {
      var a = pick(WB_ACTIONS);
      out.push({
        who: pick(FIRST) + " " + pick(LAST),
        action: a, field: pick(WB_FIELDS),
        target: pick(["CRM", "Marketing Automation"]),
        minAgo: Math.round(Math.pow(rnd(), 1.6) * 400) + ri(1, 9)
      });
    }
    out.sort(function (x, y) { return x.minAgo - y.minAgo; });
    return out;
  }

  // ---------- Série de sync 7d (total, para o Overview) ----------
  function buildSyncSeries(health) {
    var days = [];
    var now = Date.now();
    for (var d = 6; d >= 0; d--) {
      var t = new Date(now - d * 86400000);
      var total = 0;
      health.forEach(function (h) { total += h.vol7[6 - d]; });
      days.push({ label: (t.getMonth() + 1) + "/" + t.getDate(), value: total });
    }
    return days;
  }

  // ---------- Monta o mundo (uma vez por página) ----------
  var health = buildSyncHealth();
  var world = {
    org: ORG,
    sources: SOURCES,
    k: K,
    funnel: FUNNEL,
    scoreBands: SCORE_BANDS,
    syncHealth: health,
    syncSeries7d: buildSyncSeries(health),
    deadLetters: buildDeadLetters(),
    writebackFeed: buildWritebackFeed(14)
  };

  global.MARIONETTE = world;
})(window);
