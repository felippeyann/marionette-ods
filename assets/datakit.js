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

  // ---------- North stars ----------
  var K = {
    entitiesTotal: 68437,
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
    llmTokens30dM: 9.6,
    cronJobs: 87,
    cronFailures48h: 0,
    tables: 173,
    migrations: 791
  };

  // ---------- Mês comercial corrente (fixo pelo seed do mundo) ----------
  var COMMERCIAL_MONTH = "09/26";

  // ---------- Resultado do mês (régua de heróis) ----------
  var HERO = {
    wonMes: { valor: 412500, deals: 9, prevValor: 356000, prevDeals: 7 },
    pipelineAtivo: { valor: 2870000, deals: 214 },
    winRate: 11.8, winRatePrev: 10.2,
    novosDeals: 486, novosDealsPrev: 445,
    ticketMedio: 45833, ticketMedioPrev: 50857
  };

  // ---------- Evolução mensal 12 meses comerciais (receita, deals, TKM) ----------
  function buildMonthly() {
    var out = [];
    var labels = ["10/25","11/25","12/25","01/26","02/26","03/26","04/26","05/26","06/26","07/26","08/26","09/26"];
    var base = 240000;
    for (var i = 0; i < 12; i++) {
      var seasonal = (i === 2) ? 0.55 : (1 + i * 0.055);            // dezembro cai, tendência sobe
      var revenue = Math.round(base * seasonal * rf(0.86, 1.16) / 500) * 500;
      var deals = Math.max(3, Math.round(revenue / rf(38000, 56000)));
      out.push({ month: labels[i], revenue: revenue, deals: deals, tkm: Math.round(revenue / deals) });
    }
    out[11].revenue = HERO.wonMes.valor; out[11].deals = HERO.wonMes.deals;
    out[11].tkm = Math.round(HERO.wonMes.valor / HERO.wonMes.deals);
    return out;
  }

  // ---------- Reuniões & agendamentos: 12 meses + indices ----------
  function buildMeetings() {
    var out = [];
    var labels = ["10/25","11/25","12/25","01/26","02/26","03/26","04/26","05/26","06/26","07/26","08/26","09/26"];
    for (var i = 0; i < 12; i++) {
      var ag = Math.round((120 + i * 9) * ((i === 2) ? 0.5 : rf(0.85, 1.2)));
      var ns = Math.round(ag * rf(0.1, 0.2));
      var rr = Math.round((ag - ns) * rf(0.86, 0.97));
      out.push({ month: labels[i], agendamentos: ag, realizadas: rr, noShow: ns });
    }
    return out;
  }

  // ---------- Funil Proposta+ com aging buckets ----------
  var PROP_STAGES = [
    { label_en: "Proposal",    label_pt: "Proposta",    b_lt5: 14, b_5_10: 9, b_10_20: 7, b_20p: 5,  valor: 780000 },
    { label_en: "Negotiation", label_pt: "Negociação", b_lt5: 8,  b_5_10: 6, b_10_20: 4, b_20p: 4,  valor: 545000 },
    { label_en: "Closing",     label_pt: "Fechamento",  b_lt5: 5,  b_5_10: 3, b_10_20: 2, b_20p: 2,  valor: 310000 },
    { label_en: "Contract",    label_pt: "Contrato",    b_lt5: 3,  b_5_10: 2, b_10_20: 1, b_20p: 1,  valor: 168000 }
  ];
  function stageTotals() {
    return PROP_STAGES.map(function (s) { return s.b_lt5 + s.b_5_10 + s.b_10_20 + s.b_20p; });
  }

  // ---------- Rates / índices comerciais ----------
  var RATES = {
    conversaoGeral: 11.8,
    reuniaoProposta: 46,
    propostaWon: 24,
    noShowRate: 14,
    cicloMedianoD: 38, cicloMedianoPrevD: 44, cicloN: 116,
    forecastValor: 1803000, forecastN: 61, forecastAvg: 29557,
    agingCriticoN: 12, agingCriticoValor: 402000
  };

  // ---------- Distribuição por fonte de aquisição (deals 90d) ----------
  var FONTE_DIST = [
    { fonte_en: "Referral",          fonte_pt: "Indicação",       total: 168 },
    { fonte_en: "Regulatory scan",   fonte_pt: "Varredura regulatória", total: 129 },
    { fonte_en: "Inbound marketing", fonte_pt: "Inbound marketing",  total: 114 },
    { fonte_en: "Outbound",          fonte_pt: "Outbound",           total: 87 },
    { fonte_en: "Events",            fonte_pt: "Eventos",            total: 43 },
    { fonte_en: "Partnerships",      fonte_pt: "Parcerias",          total: 31 }
  ];

  // ---------- Funil de qualidade da base (waterfall strip) ----------
  var QUALITY_FUNNEL = {
    total: K.entitiesTotal,
    email: 51740, telefone: 44182, documento: 38966, organizacao: 30125,
    completos: 26580
  };

  // ---------- Distribuição geográfica (27 UFs; nomes = geojson) ----------
  var UF_DIST = [
    ["São Paulo", "SP", 19870], ["Rio de Janeiro", "RJ", 7930], ["Minas Gerais", "MG", 6120],
    ["Rio Grande do Sul", "RS", 4480], ["Paraná", "PR", 4210], ["Santa Catarina", "SC", 3980],
    ["Bahia", "BA", 2610], ["Distrito Federal", "DF", 2340], ["Goiás", "GO", 1720],
    ["Pernambuco", "PE", 1560], ["Ceará", "CE", 1385], ["Espírito Santo", "ES", 1120],
    ["Mato Grosso", "MT", 780], ["Mato Grosso do Sul", "MS", 645], ["Paraíba", "PB", 470],
    ["Rio Grande do Norte", "RN", 452], ["Amazonas", "AM", 401], ["Pará", "PA", 388],
    ["Sergipe", "SE", 246], ["Alagoas", "AL", 228], ["Piauí", "PI", 204], ["Maranhão", "MA", 196],
    ["Tocantins", "TO", 132], ["Rondônia", "RO", 118], ["Amapá", "AP", 52], ["Roraima", "RR", 41], ["Acre", "AC", 38]
  ].map(function (r) { return { name: r[0], uf: r[1], total: r[2] }; });
  var UF_UNMAPPED = { semUfComCidade: 214, semLocalizacao: 6507 }; // fecha com K.entitiesTotal por construcao

  // ---------- Camada executiva (Inicio): meta, saude, fluxos, prioridades ----------
  var META = { metaMes: 550000 };
  var SAUDE = { score: 98.7, cronFalhas48h: 0 };
  var FLUXOS = [
    { name_en: "CRM sync", name_pt: "Sync CRM", msg_en: "15 min cadence, last run 11 min ago, 0 dead letters today", msg_pt: "cadência 15 min, última há 11 min, 0 dead letters hoje", status: "ok" },
    { name_en: "Marketing Automation", name_pt: "Automação de Marketing", msg_en: "lag 1h36 after campaign burst, inside documented false alarm", msg_pt: "lag 1h36 pós-disparo de campanha, dentro do falso alarme documentado", status: "warn" },
    { name_en: "Write-back (Puppeteer)", name_pt: "Write-back (Puppeteer)", msg_en: "99.3% push success in 30d, overwrite protection active", msg_pt: "99,3% de sucesso em 30d, proteção anti-overwrite ativa", status: "ok" },
    { name_en: "AI evaluations", name_pt: "Avaliações IA", msg_en: "2,118 meetings scored, US$ 0.08 per meeting, P95 under 60s", msg_pt: "2.118 reuniões avaliadas, US$ 0,08 por reunião, P95 abaixo de 60s", status: "ok" },
    { name_en: "Regulatory ingestion", name_pt: "Ingestão regulatória", msg_en: "CVM/ANCORD/BCB nightly batches on schedule", msg_pt: "lotes noturnos CVM/ANCORD/BCB em dia", status: "info" },
    { name_en: "Quarantine", name_pt: "Quarentena", msg_en: "143 identity matches waiting review (score 70-89)", msg_pt: "143 matches de identidade aguardando revisão (score 70-89)", status: "warn" }
  ];
  var PRIORIDADES = [
    { sig_en: "12 deals in 20d+ aging", sig_pt: "12 deals em aging 20d+", sm_en: "worst stage: Proposal (5)", sm_pt: "pior etapa: Proposta (5)", med: "R$ 402k", dest_en: "Review in Sales Cockpit", dest_pt: "Revisar no Cockpit Comercial", page: "cockpit", risk: "alto" },
    { sig_en: "Quarantine backlog at 143", sig_pt: "Quarentena com 143 pendências", sm_en: "oldest waiting 9 days", sm_pt: "mais antiga há 9 dias", med: "143 matches", dest_en: "Merge queue in Accounts", dest_pt: "Fila de merge em Contas", page: "empresas", risk: "medio" },
    { sig_en: "No-show rate at 14%", sig_pt: "No-show em 14%", sm_en: "alert threshold is 15%", sm_pt: "limite de alerta é 15%", med: "36 no-shows", dest_en: "Pre-sales in Sales Cockpit", dest_pt: "Pré-vendas no Cockpit", page: "cockpit", risk: "medio" },
    { sig_en: "Marketing sync lag 1h36", sig_pt: "Lag de 1h36 no marketing", sm_en: "campaign burst decay, documented", sm_pt: "decaimento pós-campanha, documentado", med: "1 source", dest_en: "Data & Platform health", dest_pt: "Saúde em Dados & Plataforma", page: "quality", risk: "na" },
    { sig_en: "6,507 entities without location", sig_pt: "6.507 entidades sem localização", sm_en: "214 backfillable via city lookup", sm_pt: "214 backfilláveis via lookup de cidade", med: "9.5% of base", dest_en: "Data quality protocol", dest_pt: "Protocolo de qualidade de dados", page: "quality", risk: "na" }
  ];

  // ---------- Indicadores BCB (strip do cockpit; valores sintéticos plausíveis) ----------
  var BCB = [
    { id: "selic", label: "SELIC", value: "15,00%", trend: "fl" },
    { id: "cdi",   label: "CDI",   value: "14,90%", trend: "fl" },
    { id: "ipca",  label: "IPCA 12m", value: "4,21%", trend: "down" },
    { id: "usd",   label: "USD/BRL", value: "5,27", trend: "down" },
    { id: "ibov",  label: "IBOV", value: "148.230", trend: "up" }
  ];

  // ---------- Saúde de sync por fonte ----------
  var FALSE_ALARMS = {
    crm: { en: "Weekend volume drops ~70%. A quiet Sunday is not a broken pipeline: check the weekday baseline before paging anyone.",
           pt: "Volume cai ~70% no fim de semana. Domingo quieto não é pipeline quebrado: confira a baseline de dia útil antes de acionar alguém." },
    mkt: { en: "Campaign bursts create 10x spikes followed by silence. The gap after a burst looks like an outage but is expected decay.",
           pt: "Disparos de campanha criam picos de 10x seguidos de silêncio. O vazio pós-pico parece queda, mas é decaimento esperado." },
    cvm: { en: "Registry publishes in one daily batch. Zero rows during the day is normal; only a missing overnight batch is an incident.",
           pt: "O cadastro publica em lote diário único. Zero linhas durante o dia é normal; incidente é só a ausência do lote noturno." },
    ancord: { en: "Certification updates cluster around exam windows. Weeks of no change are healthy.",
              pt: "Atualizações de certificação se concentram nas janelas de prova. Semanas sem mudança são saudáveis." },
    bcb: { en: "Series revise past values retroactively. A changed historical point is a revision, not corruption.",
           pt: "As séries revisam valores passados retroativamente. Ponto histórico alterado é revisão, não corrupção." },
    sanctions: { en: "Weekly cadence. Mid-week checks always show \"stale\" age; alert only past 9 days.",
                 pt: "Cadência semanal. Checagem no meio da semana sempre parece \"velha\"; alertar só acima de 9 dias." },
    calendar: { en: "Cancelled events arrive as updates, briefly inflating the changed count after holidays.",
                pt: "Eventos cancelados chegam como updates e inflam o contador de mudanças depois de feriados." },
    email: { en: "Bounce storms from one bad list can triple hourly volume without any pipeline fault.",
             pt: "Tempestades de bounce de uma lista ruim triplicam o volume horário sem falha nenhuma de pipeline." },
    sheets: { en: "Manual edits at month-close create bursts of cell-level changes that are business as usual.",
              pt: "Edições manuais no fechamento do mês geram rajadas de mudanças de célula que são rotina." },
    transcripts: { en: "Volume follows the meeting calendar; empty early mornings are not failures.",
                   pt: "Volume segue a agenda de reuniões; madrugadas vazias não são falha." }
  };

  function buildSyncHealth() {
    var now = Date.now();
    return SOURCES.map(function (s) {
      var lagMin, status;
      if (s.id === "mkt") { lagMin = 96; status = "warn"; }
      else if (s.cadence === "daily") { lagMin = ri(60, 20 * 60); status = "ok"; }
      else if (s.cadence === "weekly") { lagMin = ri(1, 5) * 24 * 60; status = "ok"; }
      else { lagMin = ri(2, 40); status = "ok"; }
      var vol7 = [];
      var base = { crm: 420, mkt: 260, cvm: 90, ancord: 35, bcb: 60, sanctions: 12, calendar: 210, email: 180, sheets: 75, transcripts: 48 }[s.id] || 50;
      for (var d = 6; d >= 0; d--) {
        var weekend = ((new Date(now - d * 86400000)).getDay() % 6 === 0);
        var v = Math.round(base * (weekend ? rf(0.2, 0.45) : rf(0.8, 1.25)));
        if (s.id === "mkt" && d === 2) v = Math.round(base * 9.4);
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
    { en: "Upstream 429 after retry budget",     pt: "429 do upstream após esgotar retries" },
    { en: "Payload failed schema validation",    pt: "Payload reprovado na validação de schema" },
    { en: "Foreign key target not yet synced",   pt: "Alvo da foreign key ainda não sincronizado" },
    { en: "Timestamp older than current record", pt: "Timestamp mais antigo que o registro atual" },
    { en: "Encoding error in free-text field",   pt: "Erro de encoding em campo de texto livre" }
  ];
  var FIRST = ["Marina", "Rafael", "Beatriz", "Caio", "Helena", "Otavio", "Larissa", "Bruno", "Camila", "Diego", "Isadora", "Vicente", "Paula", "Renato", "Sofia", "Tiago", "Yara", "Gustavo", "Elisa", "Mateus"];
  var LAST = ["Duarte", "Sales", "Moreira", "Pinheiro", "Vasconcelos", "Rocha", "Siqueira", "Tavares", "Antunes", "Barroso", "Camargo", "Peixoto", "Sarmento", "Valente", "Queiroz", "Linhares"];

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

  // ---------- Cockpit comercial ----------
  // Pipeline completo por etapa (deals abertos + valor). Proposta+ é o subconjunto de PROP_STAGES.
  var PIPELINE_STAGES = [
    { label_en: "Lead",        label_pt: "Lead",        open: 640, valor: 0 },
    { label_en: "Qualified",   label_pt: "Qualificado", open: 288, valor: 0 },
    { label_en: "Meeting",     label_pt: "Reunião",     open: 176, valor: 0 },
    { label_en: "Proposal",    label_pt: "Proposta",    open: 35,  valor: 780000 },
    { label_en: "Negotiation", label_pt: "Negociação", open: 22,  valor: 545000 },
    { label_en: "Closing",     label_pt: "Fechamento",  open: 12,  valor: 310000 }
  ];
  var TEMPERATURA = [
    { key: "hot",  en: "Hot",  pt: "Quente", value: 58, color: "rose" },
    { key: "warm", en: "Warm", pt: "Morno",  value: 143, color: "amber" },
    { key: "cold", en: "Cold", pt: "Frio",   value: 372, color: "blue" }
  ];
  var SLA_RESPONSE = [
    { en: "< 5 min",  pt: "< 5 min",  value: 214 },
    { en: "5-30 min", pt: "5-30 min", value: 168 },
    { en: "30-60 min",pt: "30-60 min",value: 92 },
    { en: "1-4 h",    pt: "1-4 h",    value: 61 },
    { en: "4 h+",     pt: "4 h+",     value: 34 }
  ];
  var WON_LOST = ["04/26","05/26","06/26","07/26","08/26","09/26"].map(function (mo, i) {
    var won = [5, 6, 7, 6, 8, 9][i], lost = [11, 9, 12, 10, 8, 10][i];
    return { month: mo, won: won, lost: lost };
  });
  var LOST_REASONS = [
    { en: "Price / fee",        pt: "Preço / fee",        value: 22 },
    { en: "Timing / no budget", pt: "Timing / sem verba",  value: 17 },
    { en: "Competitor",         pt: "Concorrente",         value: 13 },
    { en: "No decision",        pt: "Sem decisão",        value: 9 },
    { en: "Poor fit",           pt: "Sem fit",             value: 7 }
  ];
  var AREAS = [
    { en: "Fixed income",  pt: "Renda fixa",      won: 168000, ticket: 42000, pipe: 720000, conv: 14 },
    { en: "Equities",      pt: "Renda variável",  won: 96000,  ticket: 38000, pipe: 540000, conv: 11 },
    { en: "Funds",         pt: "Fundos",          won: 78000,  ticket: 52000, pipe: 410000, conv: 12 },
    { en: "Pension",       pt: "Previdência",     won: 44000,  ticket: 61000, pipe: 230000, conv: 9 },
    { en: "FX",            pt: "Câmbio",          won: 26500,  ticket: 33000, pipe: 180000, conv: 8 }
  ];
  // win rate por etapa (conversão de uma etapa para a próxima, %)
  var WINRATE_STAGES = [
    { label_en: "Lead→Qual", label_pt: "Lead→Qual", value: 45 },
    { label_en: "Qual→Meet", label_pt: "Qual→Reun", value: 61 },
    { label_en: "Meet→Prop", label_pt: "Reun→Prop", value: 46 },
    { label_en: "Prop→Neg",  label_pt: "Prop→Neg",  value: 63 },
    { label_en: "Neg→Won",   label_pt: "Neg→Won",   value: 38 }
  ];
  // squads para o cross-filter (fator determinístico aplicado no módulo)
  var SQUADS = [
    { id: "all",        en: "All squads",  pt: "Todos os times", factor: 1 },
    { id: "north",      en: "North squad", pt: "Time Norte",     factor: 0.42 },
    { id: "south",      en: "South squad", pt: "Time Sul",       factor: 0.36 },
    { id: "enterprise", en: "Enterprise",  pt: "Enterprise",     factor: 0.22 }
  ];
  var PERIODS = [
    { id: "90",  en: "90 days",  pt: "90 dias",  factor: 1 },
    { id: "30",  en: "30 days",  pt: "30 dias",  factor: 0.38 },
    { id: "180", en: "180 days", pt: "180 dias", factor: 1.85 }
  ];
  var CKM_QUEUES = [
    { en: "Proposal+ without value",  pt: "Proposta+ sem valor",       n: 8,  page: "empresas", risk: "medio" },
    { en: "Deals without owner",      pt: "Deals sem responsável",     n: 14, page: "empresas", risk: "medio" },
    { en: "Stalled 20d+ in proposal", pt: "Parados 20d+ em proposta",  n: 12, page: "quality",  risk: "alto" },
    { en: "No-show follow-up due",    pt: "Follow-up de no-show",      n: 21, page: "cockpit-vendedor", risk: "medio" }
  ];
  var COCKPIT = {
    pipelineStages: PIPELINE_STAGES, temperatura: TEMPERATURA, slaResponse: SLA_RESPONSE,
    wonLost: WON_LOST, lostReasons: LOST_REASONS, areas: AREAS, winrateStages: WINRATE_STAGES,
    squads: SQUADS, periods: PERIODS, queues: CKM_QUEUES
  };

  // ---------- Monta o mundo ----------
  var health = buildSyncHealth();
  var world = {
    org: ORG,
    sources: SOURCES,
    k: K,
    commercialMonth: COMMERCIAL_MONTH,
    hero: HERO,
    monthly: buildMonthly(),
    meetings: buildMeetings(),
    propStages: PROP_STAGES,
    stageTotals: stageTotals(),
    rates: RATES,
    fonteDist: FONTE_DIST,
    qualityFunnel: QUALITY_FUNNEL,
    ufDist: UF_DIST,
    ufUnmapped: UF_UNMAPPED,
    meta: META,
    saude: SAUDE,
    fluxos: FLUXOS,
    prioridades: PRIORIDADES,
    cockpit: COCKPIT,
    bcb: BCB,
    syncHealth: health,
    syncSeries7d: buildSyncSeries(health),
    deadLetters: buildDeadLetters(),
    writebackFeed: buildWritebackFeed(14)
  };

  global.MARIONETTE = world;
})(window);
