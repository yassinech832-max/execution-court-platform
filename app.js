(function () {
  "use strict";

  const DATA = window.COURSE_DATA;
  const Logic = window.EnforcementLogic;
  const STORAGE_KEY = "enforcement_academy_progress_v1";
  const SETTINGS_KEY = "enforcement_academy_settings_v1";
  const main = document.getElementById("main-content");
  const toast = document.getElementById("toast");

  const defaultState = () => ({
    version: 1,
    completedLessons: [],
    lessonScores: {},
    court: { stage: 0, decisions: [] },
    toolRuns: { title: 0, route: 0, distribution: 0, dispute: 0, order: 0, document: 0 },
    history: [],
    lastView: "home",
    lastLesson: "foundations",
  });

  const defaultSettings = () => ({ font: "normal", contrast: false, motion: false });
  let state = loadState();
  let settings = loadSettings();
  let selectedLessonId = state.lastLesson || "foundations";
  let lessonSelection = null;
  let orderWorking = createOrderExercise();
  let currentView = "home";

  function safeParse(raw) {
    try { return JSON.parse(raw); } catch (_) { return null; }
  }

  function validImportedState(value) {
    if (!value || value.version !== 1) return false;
    if (!Array.isArray(value.completedLessons) || !value.lessonScores || !value.court || !value.toolRuns) return false;
    if (!Array.isArray(value.court.decisions) || !Number.isInteger(value.court.stage)) return false;
    const allowedKeys = new Set(["version", "completedLessons", "lessonScores", "court", "toolRuns", "history", "lastView", "lastLesson"]);
    if (Object.keys(value).some((key) => !allowedKeys.has(key))) return false;
    return true;
  }

  function normalizeState(value) {
    const lessonIds = new Set(DATA.lessons.map((lesson) => lesson.id));
    const stageMap = new Map(DATA.courtCase.stages.map((stage) => [stage.id, new Set(stage.options.map((option) => option.id))]));
    const completedLessons = [...new Set(value.completedLessons.filter((id) => lessonIds.has(id)))];
    const lessonScores = Object.fromEntries(Object.entries(value.lessonScores || {}).filter(([id, score]) => lessonIds.has(id) && Number.isFinite(Number(score))).map(([id, score]) => [id, Math.max(0, Math.min(1, Number(score)))]));
    const decisions = value.court.decisions.filter((item) => item && stageMap.has(item.stageId) && stageMap.get(item.stageId).has(item.optionId)).map((item) => ({ stageId: item.stageId, optionId: item.optionId, correct: Boolean(item.correct) })).slice(0, DATA.courtCase.stages.length);
    const toolKeys = Object.keys(defaultState().toolRuns);
    const toolRuns = Object.fromEntries(toolKeys.map((key) => [key, Math.max(0, Math.floor(Number(value.toolRuns[key]) || 0))]));
    const history = Array.isArray(value.history) ? value.history.filter((item) => item && typeof item.label === "string" && typeof item.detail === "string" && typeof item.at === "string").slice(0, 12).map((item) => ({ label: item.label.slice(0, 80), detail: item.detail.slice(0, 160), at: item.at })) : [];
    return {
      version: 1,
      completedLessons,
      lessonScores,
      court: { stage: Math.max(0, Math.min(DATA.courtCase.stages.length, Number(value.court.stage) || 0)), decisions },
      toolRuns,
      history,
      lastView: ["home", "map", "lessons", "court", "tools", "glossary", "progress"].includes(value.lastView) ? value.lastView : "home",
      lastLesson: lessonIds.has(value.lastLesson) ? value.lastLesson : "foundations",
    };
  }

  function loadState() {
    try {
      const parsed = safeParse(localStorage.getItem(STORAGE_KEY));
      if (!validImportedState(parsed)) return defaultState();
      return normalizeState(parsed);
    } catch (_) {
      return defaultState();
    }
  }

  function loadSettings() {
    try {
      const parsed = safeParse(localStorage.getItem(SETTINGS_KEY));
      return parsed ? { ...defaultSettings(), ...parsed } : defaultSettings();
    } catch (_) {
      return defaultSettings();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {
      showToast("تعمل المنصة، لكن المتصفح لم يسمح بحفظ التقدم بعد إغلاقه.");
    }
    updateHeaderProgress();
  }

  function saveSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (_) {}
    applySettings();
  }

  function addHistory(label, detail) {
    state.history.unshift({ label, detail, at: new Date().toISOString() });
    state.history = state.history.slice(0, 12);
  }

  function markTool(key, label) {
    state.toolRuns[key] = (state.toolRuns[key] || 0) + 1;
    addHistory("تدريب عملي", label);
    saveState();
  }

  function overallProgress() {
    const lessonUnits = state.completedLessons.length;
    const courtUnits = state.court.decisions.length;
    const toolUnits = Object.values(state.toolRuns).filter((n) => n > 0).length;
    return Math.min(100, Math.round(((lessonUnits + courtUnits + toolUnits) / (DATA.lessons.length + DATA.courtCase.stages.length + 6)) * 100));
  }

  function updateHeaderProgress() {
    const value = overallProgress();
    document.getElementById("header-progress-label").textContent = `${toArabicDigits(value)}٪`;
    document.getElementById("header-progress-bar").style.width = `${value}%`;
  }

  function applySettings() {
    const scales = { normal: "1", large: "1.1", xlarge: "1.22" };
    document.documentElement.style.setProperty("--font-scale", scales[settings.font] || "1");
    document.body.classList.toggle("high-contrast", Boolean(settings.contrast));
    document.body.classList.toggle("reduce-motion", Boolean(settings.motion));
    document.querySelectorAll("[data-font]").forEach((button) => button.classList.toggle("active", button.dataset.font === settings.font));
    document.getElementById("contrast-toggle").checked = Boolean(settings.contrast);
    document.getElementById("motion-toggle").checked = Boolean(settings.motion);
  }

  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => { toast.hidden = true; }, 3600);
  }

  function toArabicDigits(value) {
    return String(value).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
  }

  function formatDate(iso) {
    try { return new Intl.DateTimeFormat("ar-AE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso)); }
    catch (_) { return ""; }
  }

  function setActiveNav(view) {
    document.querySelectorAll(".nav-item").forEach((button) => {
      const active = button.dataset.view === view;
      button.classList.toggle("active", active);
      if (active) button.setAttribute("aria-current", "page"); else button.removeAttribute("aria-current");
    });
  }

  function navigate(view, options = {}) {
    currentView = view;
    state.lastView = view;
    if (options.lesson) selectedLessonId = options.lesson;
    saveState();
    setActiveNav(view);
    closeMobileMenu();
    renderView(view);
    if (!options.keepFocus) main.focus({ preventScroll: true });
    if (location.hash !== `#${view}`) history.replaceState(null, "", `#${view}`);
  }

  function renderView(view) {
    lessonSelection = null;
    if (view === "map") renderMap();
    else if (view === "lessons") renderLessons();
    else if (view === "court") renderCourt();
    else if (view === "tools") renderTools();
    else if (view === "glossary") renderGlossary();
    else if (view === "progress") renderProgress();
    else renderHome();
    bindCommonActions();
  }

  function renderHome() {
    const progress = overallProgress();
    const nextLesson = DATA.lessons.find((lesson) => !state.completedLessons.includes(lesson.id)) || DATA.lessons[DATA.lessons.length - 1];
    const courtStage = Math.min(state.court.stage, DATA.courtCase.stages.length - 1);
    main.innerHTML = `
      <div class="view home-view">
        <section class="hero">
          <div class="hero-copy">
            <span class="eyebrow">تعلم القانون بالممارسة</span>
            <h1>لا تحفظ الإجراء.<br>اتخذ القرار وشاهد أثره.</h1>
            <p>منصة تطبيقية تجمع الدروس، ملف تنفيذ حي، محكمة افتراضية، وأدوات تساعدك على فحص السند واختيار الحجز وتوزيع الحصيلة وتكييف المنازعة.</p>
            <div class="hero-actions">
              <button class="btn btn-gold" type="button" data-go="court">ابدأ القضية الكبرى</button>
              <button class="btn btn-ghost" type="button" data-open-lesson="${escapeHtml(nextLesson.id)}">تابع: ${escapeHtml(nextLesson.title)}</button>
            </div>
          </div>
          <aside class="case-dossier" aria-label="ملخص القضية التفاعلية">
            <span class="dossier-tab">ملف رقم ١</span>
            <h3>${escapeHtml(DATA.courtCase.title)}</h3>
            <p>${escapeHtml(DATA.courtCase.subtitle)}</p>
            <dl>${DATA.courtCase.parties.map(([key, value]) => `<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd>`).join("")}</dl>
          </aside>
        </section>

        <section class="metric-grid" aria-label="ملخص التقدم">
          <article class="metric-card"><span>التقدم الكلي</span><strong>${toArabicDigits(progress)}٪</strong><small>${progress ? "واصل بناء كفاياتك" : "ابدأ أول قرار الآن"}</small></article>
          <article class="metric-card"><span>الدروس المتقنة</span><strong>${toArabicDigits(state.completedLessons.length)} / ${toArabicDigits(DATA.lessons.length)}</strong><small>شرح، مثال، ثم قرار تطبيقي</small></article>
          <article class="metric-card"><span>مرحلة القضية</span><strong>${state.court.stage >= DATA.courtCase.stages.length ? "مكتمل" : toArabicDigits(state.court.stage + 1)}</strong><small>${state.court.stage >= DATA.courtCase.stages.length ? "صدر التقرير الختامي" : escapeHtml(DATA.courtCase.stages[courtStage].label)}</small></article>
        </section>

        <div class="section-heading"><div><span class="eyebrow">رحلة التنفيذ</span><h2>مسار واحد يربط موضوعات المقرر</h2><p>كل مرحلة تبني على سلامة المرحلة السابقة، كما يحدث في الملف الواقعي.</p></div><button class="btn btn-small" type="button" data-go="map">افتح الخريطة الكاملة</button></div>
        ${renderJourney()}

        <div class="section-heading"><div><span class="eyebrow">ثلاث طرق للتعلّم</span><h2>اختر نقطة الدخول المناسبة</h2></div></div>
        <section class="card-grid">
          <article class="content-card"><span class="card-icon">§</span><h3>افهم القاعدة في سياقها</h3><p>ثلاث عشرة وحدة تشرح المفهوم، وتميزه عما يشتبه به، ثم تختبره بواقعة قصيرة مع تفسير كامل.</p><button class="btn btn-small" type="button" data-go="lessons">افتح الدروس</button></article>
          <article class="content-card"><span class="card-icon">⚖</span><h3>اجلس على منصة القضاء</h3><p>اقرأ ملف القضية، افحص المستند، أصدر القرار، ثم شاهد أثره على المراحل التالية وسجل قراراتك.</p><button class="btn btn-small" type="button" data-go="court">ادخل المحكمة</button></article>
          <article class="content-card"><span class="card-icon">⌘</span><h3>تدرّب بأدوات مستقلة</h3><p>فاحص للسند، موجه لطريق التنفيذ، حاسبة توزيع، مصنف للمنازعات، وتمارين في ترتيب الإجراءات.</p><button class="btn btn-small" type="button" data-go="tools">افتح المختبر</button></article>
        </section>
      </div>`;
  }

  function renderJourney() {
    const labels = ["السند", "الأطراف", "المقدمات", "اختيار المال", "الحجز", "البيع", "الحصيلة", "المنازعة", "الإقفال"];
    const completed = Math.min(labels.length, Math.ceil((state.completedLessons.length / DATA.lessons.length) * labels.length));
    return `<div class="journey" aria-label="تسلسل رحلة التنفيذ">${labels.map((label, index) => `<div class="journey-step ${index < completed ? "is-complete" : ""}"><span class="journey-number">${index < completed ? "✓" : toArabicDigits(index + 1)}</span><strong>${label}</strong></div>`).join("")}</div>`;
  }

  function renderMap() {
    const bands = [
      ["الأساس القانوني", DATA.lessons.slice(0, 4)],
      ["بنية ملف التنفيذ", DATA.lessons.slice(4, 6)],
      ["طرق الحجز والبيع", DATA.lessons.slice(6, 9)],
      ["الوفاء والضغط", DATA.lessons.slice(9, 11)],
      ["الرقابة والمنازعة", DATA.lessons.slice(11, 13)],
    ];
    main.innerHTML = `<div class="view">
      <header class="page-intro"><span class="eyebrow">الخريطة الكبرى</span><h1>من ثبوت الحق إلى إقفال ملف التنفيذ</h1><p>تظهر الخريطة كيف ينتقل الطالب من تحديد السند إلى إدارة الأموال والحصيلة، ثم مراجعة الأعمال وحل المنازعات.</p></header>
      <section class="panel-card map-section">${bands.map(([label, items]) => `<div class="map-band"><div class="map-label">${label}</div><div class="map-modules">${items.map((lesson) => `<button class="map-module" type="button" data-open-lesson="${lesson.id}">${toArabicDigits(lesson.number)}. ${lesson.title}</button>`).join("")}</div></div>`).join("")}</section>
      <div class="section-heading"><div><span class="eyebrow">التطبيق الجامع</span><h2>ملف التنفيذ الحي</h2><p>تستدعي القضية مفاهيم من كل طبقة بدل اختبار كل فصل بمعزل عن الآخر.</p></div><button class="btn btn-primary" type="button" data-go="court">ابدأ المحاكاة</button></div>
      ${renderJourney()}
    </div>`;
  }

  function renderLessons() {
    const lesson = DATA.lessons.find((item) => item.id === selectedLessonId) || DATA.lessons[0];
    selectedLessonId = lesson.id;
    state.lastLesson = lesson.id;
    saveState();
    main.innerHTML = `<div class="view">
      <header class="page-intro"><span class="eyebrow">المكتبة التطبيقية</span><h1>الدروس</h1><p>كل درس يبدأ بشرح مركز وينتهي بقرار قانوني. إتقان السؤال يحدّث بطاقة كفاياتك.</p></header>
      <div class="lessons-layout">
        <div class="lesson-list" aria-label="قائمة الدروس">${DATA.lessons.map((item) => renderLessonCard(item, item.id === lesson.id)).join("")}</div>
        ${renderLessonDetail(lesson)}
      </div>
    </div>`;
    bindLessonActions(lesson);
  }

  function renderLessonCard(lesson, active) {
    const complete = state.completedLessons.includes(lesson.id);
    return `<button class="lesson-card ${active ? "active" : ""} ${complete ? "complete" : ""}" type="button" data-select-lesson="${lesson.id}" aria-pressed="${active}">
      <span class="lesson-index">${toArabicDigits(lesson.number)}</span><span><strong>${lesson.title}</strong><small>${lesson.skill}</small></span><span class="lesson-duration">${toArabicDigits(lesson.duration)} دقيقة</span>
    </button>`;
  }

  function renderLessonDetail(lesson) {
    const complete = state.completedLessons.includes(lesson.id);
    return `<article class="lesson-detail panel-card" aria-labelledby="lesson-title">
      <div class="lesson-meta"><span>الوحدة ${toArabicDigits(lesson.number)} من ${toArabicDigits(DATA.lessons.length)}</span><span>${complete ? "✓ متقنة" : "قيد التعلّم"}</span></div>
      <span class="eyebrow">${lesson.skill}</span><h2 id="lesson-title">${lesson.title}</h2><p>${lesson.summary}</p>
      <div class="concept-grid">${lesson.concepts.map(([title, text]) => `<section class="concept"><h3>${title}</h3><p>${text}</p></section>`).join("")}</div>
      <h3>تسلسل التفكير</h3><div class="sequence">${lesson.steps.map((step) => `<div class="sequence-item">${step}</div>`).join("")}</div>
      <div class="example-box"><span class="eyebrow">مثال تطبيقي</span><p>${lesson.example}</p></div>
      <section class="knowledge-check" aria-labelledby="check-title-${lesson.id}">
        <span class="eyebrow">قرّر وفسّر</span><h3 id="check-title-${lesson.id}">${lesson.check.prompt}</h3>
        <div class="option-list" role="group" aria-label="خيارات سؤال الدرس">${lesson.check.options.map((option, index) => `<button class="option-button" type="button" data-lesson-option="${index}" aria-pressed="false"><span class="option-marker">${toArabicDigits(index + 1)}</span><span>${option}</span></button>`).join("")}</div>
        <button class="btn btn-primary" type="button" data-check-lesson="${lesson.id}" disabled>تحقق من القرار</button>
        <div id="lesson-feedback" aria-live="polite"></div>
      </section>
      <div class="view-actions"><button class="btn" type="button" data-next-lesson="${lesson.id}">الدرس التالي</button><button class="btn" type="button" data-go="court">طبّق في القضية الكبرى</button></div>
    </article>`;
  }

  function bindLessonActions(lesson) {
    main.querySelectorAll("[data-select-lesson]").forEach((button) => button.addEventListener("click", () => {
      selectedLessonId = button.dataset.selectLesson;
      renderView("lessons");
      main.querySelector(".lesson-detail")?.scrollIntoView({ behavior: settings.motion ? "auto" : "smooth", block: "start" });
    }));
    main.querySelectorAll("[data-lesson-option]").forEach((button) => button.addEventListener("click", () => {
      lessonSelection = Number(button.dataset.lessonOption);
      main.querySelectorAll("[data-lesson-option]").forEach((item) => { item.classList.toggle("selected", item === button); item.setAttribute("aria-pressed", String(item === button)); });
      main.querySelector("[data-check-lesson]").disabled = false;
    }));
    main.querySelector("[data-check-lesson]")?.addEventListener("click", () => {
      if (lessonSelection === null) return;
      const correct = lessonSelection === lesson.check.correct;
      state.lessonScores[lesson.id] = Math.max(state.lessonScores[lesson.id] || 0, correct ? 1 : .35);
      if (correct && !state.completedLessons.includes(lesson.id)) {
        state.completedLessons.push(lesson.id);
        addHistory("إتقان درس", lesson.title);
      }
      saveState();
      const feedback = document.getElementById("lesson-feedback");
      feedback.innerHTML = `<div class="feedback ${correct ? "correct" : "incorrect"}"><div class="feedback-title"><span aria-hidden="true">${correct ? "✓" : "↺"}</span><span>${correct ? "تحليل صحيح" : "أعد النظر في التكييف"}</span></div><p>${lesson.check.feedback[lessonSelection]}</p></div>`;
      if (correct) showToast("أضيفت هذه الوحدة إلى الدروس المتقنة.");
    });
    main.querySelector("[data-next-lesson]")?.addEventListener("click", () => {
      const index = DATA.lessons.findIndex((item) => item.id === lesson.id);
      selectedLessonId = DATA.lessons[(index + 1) % DATA.lessons.length].id;
      renderView("lessons");
      window.scrollTo({ top: 0, behavior: settings.motion ? "auto" : "smooth" });
    });
  }

  function renderCourt() {
    const stages = DATA.courtCase.stages;
    if (state.court.stage >= stages.length) return renderCourtReport();
    const stage = stages[state.court.stage];
    const decision = state.court.decisions.find((item) => item.stageId === stage.id);
    main.innerHTML = `<div class="view">
      <header class="page-intro"><span class="eyebrow">المحكمة التفاعلية</span><h1>${DATA.courtCase.title}</h1><p>${DATA.courtCase.subtitle}. اقرأ الوقائع والمستند قبل اعتماد القرار؛ فالقرار المعتمد يدخل سجل القضية.</p></header>
      <div class="court-shell">
        <aside class="court-panel panel-card"><div class="case-status"><strong>مراحل الملف</strong><span>${toArabicDigits(state.court.stage + 1)} / ${toArabicDigits(stages.length)}</span></div><div class="case-stage-list">${stages.map((item, index) => `<div class="stage-pill ${index < state.court.stage ? "complete" : index === state.court.stage ? "current" : "locked"}"><span class="dot">${index < state.court.stage ? "✓" : toArabicDigits(index + 1)}</span><span>${item.label}</span></div>`).join("")}</div></aside>
        <section class="scene-card panel-card" aria-labelledby="court-stage-title">
          <header class="scene-header"><span class="eyebrow">${stage.skill}</span><h2 id="court-stage-title">${stage.label}</h2><p>${stage.scene}</p></header>
          <div class="scene-body"><div class="document-sheet"><p>${stage.document}</p></div><h3>${stage.question}</h3>
            <div class="option-list">${stage.options.map((option, index) => `<div class="court-option"><button class="option-button ${decision?.optionId === option.id ? "selected" : ""}" type="button" data-court-option="${option.id}" ${decision ? "disabled" : ""}><span class="option-marker">${toArabicDigits(index + 1)}</span><span>${option.text}</span></button></div>`).join("")}</div>
            ${decision ? renderCourtDecision(stage, decision) : `<p class="muted text-small">لا يُعتمد القرار قبل اختيار أحد البدائل. يمكنك مراجعته داخل المشهد ثم تثبيته.</p>`}
          </div>
        </section>
        <aside class="court-panel panel-card"><span class="eyebrow">دفتر القرارات</span><h2>سجل القضية</h2><div class="decision-log">${renderDecisionLog()}</div></aside>
      </div>
    </div>`;
    bindCourtActions(stage, decision);
  }

  function renderCourtDecision(stage, decision) {
    const option = stage.options.find((item) => item.id === decision.optionId);
    return `<div class="decision-result" aria-live="polite"><div class="feedback ${option.correct ? "correct" : "incorrect"}"><div class="feedback-title"><span>${option.correct ? "✓ قرار سليم" : "⚠ قرار يحتاج إلى مراجعة"}</span></div><p>${option.feedback}</p><div class="effect-line ${option.correct ? "good" : ""}"><strong>أثر القرار:</strong> ${option.effect}</div></div><div class="view-actions"><button class="btn btn-primary" type="button" data-next-stage>الانتقال إلى المرحلة التالية</button><button class="btn" type="button" data-open-lesson="${lessonForSkill(stage.skill)}">راجع الدرس المرتبط</button></div></div>`;
  }

  function lessonForSkill(skill) {
    const map = { "السند التنفيذي": "title-conditions", "أشخاص التنفيذ": "persons", "ترتيب الإجراءات": "assets-preliminaries", "محل التنفيذ": "assets-preliminaries", "التقرير بما في الذمة": "protective-garnishment", "الحجز العقاري": "real-estate", "التوزيع": "distribution", "منازعات التنفيذ": "disputes" };
    return map[skill] || "foundations";
  }

  function renderDecisionLog() {
    if (!state.court.decisions.length) return `<div class="empty-state"><p>سيظهر هنا أثر كل قرار بعد اعتماده.</p></div>`;
    return state.court.decisions.map((decision) => {
      const stage = DATA.courtCase.stages.find((item) => item.id === decision.stageId);
      const option = stage?.options.find((item) => item.id === decision.optionId);
      return `<div class="log-item ${decision.correct ? "correct" : "incorrect"}"><strong>${stage?.label || "مرحلة"}</strong><br><span>${option?.text || "قرار"}</span></div>`;
    }).join("");
  }

  function bindCourtActions(stage, decision) {
    if (!decision) main.querySelectorAll("[data-court-option]").forEach((button) => button.addEventListener("click", () => {
      const option = stage.options.find((item) => item.id === button.dataset.courtOption);
      state.court.decisions.push({ stageId: stage.id, optionId: option.id, correct: option.correct });
      addHistory("قرار في المحكمة", `${stage.label}: ${option.correct ? "سليم" : "يحتاج مراجعة"}`);
      saveState();
      renderView("court");
    }));
    main.querySelector("[data-next-stage]")?.addEventListener("click", () => {
      state.court.stage += 1;
      saveState();
      renderView("court");
      window.scrollTo({ top: 0, behavior: settings.motion ? "auto" : "smooth" });
    });
  }

  function renderCourtReport() {
    const total = DATA.courtCase.stages.length;
    const correct = state.court.decisions.filter((item) => item.correct).length;
    const percentage = Math.round((correct / total) * 100);
    main.innerHTML = `<div class="view"><header class="page-intro"><span class="eyebrow">التقرير الختامي</span><h1>اكتمل ملف القضية</h1><p>يعرض التقرير نمط قراراتك ويقودك إلى الموضوعات التي تستحق محاولة جديدة.</p></header>
      <section class="hero"><div class="hero-copy"><span class="eyebrow">نتيجة المحاكاة</span><h1>${toArabicDigits(correct)} من ${toArabicDigits(total)} قرارات سليمة</h1><p>${percentage >= 75 ? "أظهرت قدرة جيدة على وصل المراحل وإدراك أثر القرار." : "المحاولة كشفت مواضع محددة للمراجعة؛ أعد القضية بعد مراجعة الدروس المرتبطة."}</p><div class="hero-actions"><button class="btn btn-gold" type="button" data-restart-case>إعادة القضية من البداية</button><button class="btn btn-ghost" type="button" data-go="progress">افتح بطاقة الكفايات</button></div></div><aside class="case-dossier"><span class="dossier-tab">خلاصة</span><h3>دقة القرارات</h3><strong class="big-score">${toArabicDigits(percentage)}٪</strong><p>التقييم تدريبي ولا يمثل درجة نهائية.</p></aside></section>
      <div class="section-heading"><div><h2>خريطة قراراتك</h2></div></div><div class="decision-log">${renderDecisionLog()}</div></div>`;
    main.querySelector("[data-restart-case]")?.addEventListener("click", () => {
      if (!confirm("هل تريد بدء القضية من جديد؟ ستبقى نتائج الدروس والأدوات محفوظة.")) return;
      state.court = { stage: 0, decisions: [] };
      addHistory("إعادة محاكاة", DATA.courtCase.title);
      saveState();
      renderView("court");
    });
  }

  function renderTools() {
    main.innerHTML = `<div class="view"><header class="page-intro"><span class="eyebrow">مختبر الأدوات</span><h1>تدرّب على مهارة واحدة في كل مرة</h1><p>هذه الأدوات التعليمية لا تصدر فتوى أو قرارًا حقيقيًا؛ هدفها تدريب طريقة التفكير وبيان البيانات التي يجب فحصها.</p></header>
      <section class="tool-grid">
        ${titleCheckerMarkup()}
        ${routeAdvisorMarkup()}
        ${distributionMarkup()}
        ${disputeMarkup()}
        ${orderExerciseMarkup()}
        ${documentLabMarkup()}
      </section></div>`;
    bindToolActions();
  }

  function toolHeader(tag, title, description) {
    return `<header class="tool-card-header"><span>${tag}</span><h2>${title}</h2><p>${description}</p></header>`;
  }

  function titleCheckerMarkup() {
    return `<article class="tool-card">${toolHeader("الأداة ١", "فاحص السند التنفيذي", "أدخل عناصر الفرض ثم اقرأ تقرير الجاهزية والنواقص.")}<div class="tool-card-body"><form id="title-checker" class="form-grid">
      <div class="field"><label for="title-type">نوع السند</label><select id="title-type" name="titleType" required><option value="">اختر</option><option value="judgment">حكم قضائي</option><option value="payment-order">أمر أداء</option><option value="notarized">محرر موثق</option><option value="other">سند آخر معترف به</option></select></div>
      <div class="field"><label for="obligation">وجود الحق</label><select id="obligation" name="obligation"><option value="certain">محقق الوجود</option><option value="uncertain">احتمالي أو محل شرط</option></select></div>
      <div class="field"><label for="due">حلول الأداء</label><select id="due" name="due"><option value="yes">حال الأداء</option><option value="no">لم يحل بعد</option></select></div>
      <div class="field"><label for="exec-copy">الصورة التنفيذية</label><select id="exec-copy" name="execCopy"><option value="yes">موجودة</option><option value="exception">استثناء قانوني</option><option value="no">غير موجودة</option></select></div>
      <div class="field"><label for="title-amount">مقدار الحق</label><input id="title-amount" name="amount" inputmode="decimal" value="420000" aria-describedby="number-help"></div>
      <div class="field"><label for="title-paid">وفاء سابق</label><input id="title-paid" name="paid" inputmode="decimal" value="0"></div>
      <small id="number-help" class="field full muted">تقبل الأداة الأرقام العربية والإنجليزية.</small>
      <div class="tool-actions field full"><button class="btn btn-primary" type="submit">حلّل السند</button></div></form><div id="title-result" aria-live="polite"></div></div></article>`;
  }

  function routeAdvisorMarkup() {
    return `<article class="tool-card">${toolHeader("الأداة ٢", "موجّه طريق التنفيذ", "اختر طبيعة الأداء والمال لتتعرف إلى الطريق الأقرب ونقاط الفحص.")}<div class="tool-card-body"><form id="route-advisor" class="form-grid">
      <div class="field"><label for="performance">طبيعة الأداء</label><select id="performance" name="performance"><option value="money">مبلغ من النقود</option><option value="specific">أداء عيني محدد</option></select></div>
      <div class="field"><label for="has-title">هل يوجد سند تنفيذي؟</label><select id="has-title" name="hasTitle"><option value="yes">نعم</option><option value="no">لا</option></select></div>
      <div class="field"><label for="asset-type">نوع المال</label><select id="asset-type" name="assetType"><option value="cash">نقود أو رصيد</option><option value="movable">منقول</option><option value="realestate">عقار</option></select></div>
      <div class="field"><label for="location">مكان المال</label><select id="location" name="location"><option value="debtor">لدى المدين</option><option value="third">لدى الغير</option></select></div>
      <div class="field"><label for="ownership">الملكية</label><select id="ownership" name="ownership"><option value="debtor">ثابتة للمدين</option><option value="uncertain">غير مؤكدة</option><option value="third">ثابتة للغير</option></select></div>
      <div class="field"><label for="urgency">خشية على الضمان</label><select id="urgency" name="urgency"><option value="no">غير ظاهرة</option><option value="yes">توجد أمارات جدية</option></select></div>
      <div class="tool-actions field full"><button class="btn btn-primary" type="submit">اقترح مسار الفحص</button></div></form><div id="route-result" aria-live="polite"></div></div></article>`;
  }

  function distributionMarkup() {
    return `<article class="tool-card">${toolHeader("الأداة ٣", "محاكي توزيع الحصيلة", "نموذج تدريبي يخصم المصروفات والحق المقدم ثم يقسم الباقي نسبيًا بين دائنين في المرتبة نفسها.")}<div class="tool-card-body"><form id="distribution-calculator" class="form-grid">
      <div class="field"><label for="proceeds">الحصيلة الصافية</label><input id="proceeds" name="proceeds" inputmode="decimal" value="500000"></div>
      <div class="field"><label for="costs">مصروفات مقدمة</label><input id="costs" name="costs" inputmode="decimal" value="0"></div>
      <div class="field"><label for="secured">حق مقدم أو مقيد</label><input id="secured" name="secured" inputmode="decimal" value="110000"></div>
      <div class="field"><label for="creditor-a">دين الدائن الأول</label><input id="creditor-a" name="creditorA" inputmode="decimal" value="250000"></div>
      <div class="field"><label for="creditor-b">دين الدائن الثاني</label><input id="creditor-b" name="creditorB" inputmode="decimal" value="210000"></div>
      <div class="tool-actions field full"><button class="btn btn-primary" type="submit">أنشئ التوزيع</button></div></form><div id="distribution-result" aria-live="polite"></div></div></article>`;
  }

  function disputeMarkup() {
    return `<article class="tool-card">${toolHeader("الأداة ٤", "مصنّف المنازعة", "ابدأ من الطلب الحقيقي، لا من الاسم الذي أعطاه صاحبه للمذكرة.")}<div class="tool-card-body"><form id="dispute-classifier" class="form-grid">
      <div class="field full"><label for="dispute-type">ماذا يطلب صاحب الشأن؟</label><select id="dispute-type" name="type"><option value="temporary">وقف مؤقت دون حسم أصل الحق</option><option value="invalidity">حكم نهائي ببطلان التنفيذ</option><option value="movable-third">الغير يدعي ملكية منقول محجوز</option><option value="realestate-third">الغير يدعي ملكية عقار محجوز</option><option value="review">مراجعة ما صدر عن قاضي التنفيذ</option></select></div>
      <div class="field"><label for="first-dispute">هل هي الأولى للمال ذاته؟</label><select id="first-dispute" name="first"><option value="yes">نعم</option><option value="no">لا</option></select></div>
      <div class="tool-actions field full"><button class="btn btn-primary" type="submit">كيّف الطلب</button></div></form><div id="dispute-result" aria-live="polite"></div></div></article>`;
  }

  function createOrderExercise() {
    const source = [...DATA.proceduralOrder];
    return [source[0], source[2], source[1], source[4], source[3], source[5], source[7], source[6], source[8]];
  }

  function orderExerciseMarkup() {
    return `<article class="tool-card">${toolHeader("الأداة ٥", "رتّب ملف التنفيذ", "حرّك الإجراءات إلى أعلى أو أسفل حتى يصبح التسلسل صحيحًا.")}<div class="tool-card-body"><div class="order-list" id="order-list">${orderWorking.map((item, index) => `<div class="order-item"><span class="order-item-number">${toArabicDigits(index + 1)}</span><span>${item}</span><span class="order-controls"><button type="button" data-move="up" data-index="${index}" aria-label="تحريك ${item} إلى أعلى">↑</button><button type="button" data-move="down" data-index="${index}" aria-label="تحريك ${item} إلى أسفل">↓</button></span></div>`).join("")}</div><div class="tool-actions"><button class="btn btn-primary" type="button" id="check-order">تحقق من الترتيب</button><button class="btn" type="button" id="reset-order">إعادة الخلط</button></div><div id="order-result" aria-live="polite"></div></div></article>`;
  }

  function documentLabMarkup() {
    return `<article class="tool-card">${toolHeader("الأداة ٦", "مختبر محضر الحجز", "اقرأ المقتطف وحدد العيوب التي تهدد سلامة الإجراء.")}<div class="tool-card-body"><div class="document-sheet"><p>«انتقل القائم بالتنفيذ إلى مستودع المدين، وقرر حجز الموجودات المناسبة. لم يثبت أوصافها أو أرقامها، وتركها دون تعيين حارس، وحدد البيع في اليوم التالي دون إعلان، رغم أن قيمتها الظاهرة تتجاوز الدين مرات عدة.»</p></div><form id="document-lab"><div class="checklist">
      <label class="check-row"><input type="checkbox" name="defect" value="description"><span>عدم وصف الأموال وتمييزها في المحضر</span></label>
      <label class="check-row"><input type="checkbox" name="defect" value="guard"><span>غياب تنظيم الحراسة على المال المحجوز</span></label>
      <label class="check-row"><input type="checkbox" name="defect" value="notice"><span>الانتقال إلى البيع دون التمهيد والإعلان</span></label>
      <label class="check-row"><input type="checkbox" name="defect" value="scope"><span>عدم مراعاة تناسب نطاق الحجز مع مقدار الحق</span></label>
      <label class="check-row"><input type="checkbox" name="defect" value="warehouse"><span>مجرد وجود الأموال داخل مستودع</span></label>
      </div><div class="tool-actions"><button class="btn btn-primary" type="submit">افحص المحضر</button></div></form><div id="document-result" aria-live="polite"></div></div></article>`;
  }

  function formObject(form) { return Object.fromEntries(new FormData(form).entries()); }

  function bindToolActions() {
    document.getElementById("title-checker")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const result = Logic.analyzeTitle(formObject(event.currentTarget));
      document.getElementById("title-result").innerHTML = `<div class="tool-result"><h3>${result.headline}</h3>${result.balance !== null ? `<p><strong>الرصيد المفترض:</strong> ${Logic.formatMoney(result.balance)} درهم</p>` : ""}${result.strengths.length ? `<p><strong>عناصر مكتملة:</strong></p><ul>${result.strengths.map((item) => `<li>${item}</li>`).join("")}</ul>` : ""}${result.issues.length ? `<p><strong>نقاط تحتاج إلى مراجعة:</strong></p><ul>${result.issues.map((item) => `<li>${item}</li>`).join("")}</ul>` : ""}</div>`;
      markTool("title", "تشغيل فاحص السند التنفيذي");
    });
    document.getElementById("route-advisor")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const result = Logic.adviseRoute(formObject(event.currentTarget));
      document.getElementById("route-result").innerHTML = `<div class="tool-result"><h3>المسار الأقرب</h3><p>${result.route}</p>${result.notes.length ? `<ul>${result.notes.map((item) => `<li>${item}</li>`).join("")}</ul>` : ""}</div>`;
      markTool("route", "تشغيل موجه طريق التنفيذ");
    });
    document.getElementById("distribution-calculator")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const result = Logic.calculateDistribution(formObject(event.currentTarget));
      const target = document.getElementById("distribution-result");
      if (!result.valid) target.innerHTML = `<div class="tool-result" role="alert"><h3>تعذر الحساب</h3><p>${result.error}</p></div>`;
      else target.innerHTML = `<div class="tool-result"><h3>${result.insufficient ? "توزيع مع عدم كفاية الحصيلة" : "الحصيلة كافية"}</h3><div class="table-responsive"><table class="calculator-table"><thead><tr><th>البند</th><th>المبلغ المصروف</th><th>المتبقي</th></tr></thead><tbody><tr><td>المصروفات المقدمة</td><td>${result.formatted.costsPaid}</td><td>—</td></tr><tr><td>الحق المقدم أو المقيد</td><td>${result.formatted.securedPaid}</td><td>—</td></tr><tr><td>الدائن الأول</td><td>${result.formatted.shareA}</td><td>${result.formatted.unpaidA}</td></tr><tr><td>الدائن الثاني</td><td>${result.formatted.shareB}</td><td>${result.formatted.unpaidB}</td></tr><tr><td>فائض الحصيلة</td><td>${result.formatted.surplus}</td><td>—</td></tr></tbody></table></div><p class="text-small muted">هذا نموذج تدريبي لدائنين عامين في مرتبة واحدة بعد المصروفات والحق المقدم؛ لا يستبدل فحص مراتب الحقوق في الواقعة الحقيقية.</p></div>`;
      if (result.valid) markTool("distribution", "بناء توزيع لحصيلة التنفيذ");
    });
    document.getElementById("dispute-classifier")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const result = Logic.classifyDispute(formObject(event.currentTarget));
      document.getElementById("dispute-result").innerHTML = `<div class="tool-result"><h3>${result.title}</h3><p><strong>الطريق:</strong> ${result.route}</p><p><strong>الأثر:</strong> ${result.effect}</p></div>`;
      markTool("dispute", "تصنيف منازعة تنفيذ");
    });
    bindOrderActions();
    document.getElementById("document-lab")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const chosen = [...new FormData(event.currentTarget).getAll("defect")].sort();
      const expected = ["description", "guard", "notice", "scope"].sort();
      const correct = chosen.length === expected.length && chosen.every((item, index) => item === expected[index]);
      document.getElementById("document-result").innerHTML = `<div class="tool-result ${correct ? "" : "incorrect"}"><h3>${correct ? "اكتشفت العيوب الجوهرية" : "راجع الاختيارات"}</h3><p>${correct ? "يجب أن يميز المحضر الأموال، وينظم الحراسة، ويحترم التمهيد للبيع، ويقصر الحجز على القدر اللازم. أما وجود المال في مستودع فليس عيبًا بذاته." : "ابحث عن كل ما يمنع معرفة المال أو حفظه أو إعلان بيعه أو ضبط نطاق الحجز. ولا تعد ظرف المكان عيبًا مستقلًا."}</p></div>`;
      markTool("document", "فحص محضر حجز منقول");
    });
  }

  function bindOrderMoveActions() {
    main.querySelectorAll("[data-move]").forEach((button) => button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      const target = button.dataset.move === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= orderWorking.length) return;
      [orderWorking[index], orderWorking[target]] = [orderWorking[target], orderWorking[index]];
      const card = button.closest(".tool-card");
      card.querySelector("#order-list").outerHTML = `<div class="order-list" id="order-list">${orderWorking.map((item, i) => `<div class="order-item"><span class="order-item-number">${toArabicDigits(i + 1)}</span><span>${item}</span><span class="order-controls"><button type="button" data-move="up" data-index="${i}" aria-label="تحريك ${item} إلى أعلى">↑</button><button type="button" data-move="down" data-index="${i}" aria-label="تحريك ${item} إلى أسفل">↓</button></span></div>`).join("")}</div>`;
      bindOrderMoveActions();
    }));
  }

  function bindOrderActions() {
    bindOrderMoveActions();
    document.getElementById("check-order")?.addEventListener("click", () => {
      const result = Logic.validateOrder(orderWorking, DATA.proceduralOrder);
      document.getElementById("order-result").innerHTML = `<div class="tool-result"><h3>${result.correct ? "تسلسل صحيح" : "ما زال هناك خلل"}</h3><p>${result.message}</p></div>`;
      if (result.correct) markTool("order", "ترتيب مراحل التنفيذ");
    });
    document.getElementById("reset-order")?.addEventListener("click", () => { orderWorking = createOrderExercise(); renderView("tools"); });
  }

  function renderGlossary() {
    main.innerHTML = `<div class="view"><header class="page-intro"><span class="eyebrow">قاموس تطبيقي</span><h1>المصطلحات التي تحكم لغة التنفيذ</h1><p>ابحث عن المصطلح، ثم ارجع إلى الدرس المرتبط لرؤيته داخل سياق إجرائي كامل.</p></header><div class="glossary-search"><label class="sr-only" for="glossary-query">ابحث في المصطلحات</label><input id="glossary-query" type="search" placeholder="اكتب: السند، الحجز، الإشكال…" autocomplete="off"></div><dl class="glossary-grid" id="glossary-list">${renderTerms(DATA.glossary)}</dl></div>`;
    document.getElementById("glossary-query")?.addEventListener("input", (event) => {
      const query = event.target.value.trim().toLowerCase();
      const matches = DATA.glossary.filter(([term, definition]) => `${term} ${definition}`.toLowerCase().includes(query));
      document.getElementById("glossary-list").innerHTML = matches.length ? renderTerms(matches) : `<div class="empty-state"><p>لم يظهر مصطلح مطابق. جرّب كلمة أقصر.</p></div>`;
    });
  }

  function renderTerms(terms) {
    return terms.map(([term, definition]) => `<div class="term-card panel-card"><dt>${term}</dt><dd>${definition}</dd></div>`).join("");
  }

  function masteryData() {
    const competencies = [
      { title: "السند والقوة التنفيذية", lessons: ["foundations", "judgments", "orders-titles", "title-conditions"], stages: ["title"], tools: ["title"] },
      { title: "الأشخاص والاختصاص", lessons: ["persons"], stages: ["parties"], tools: [] },
      { title: "الأموال والحجز", lessons: ["assets-preliminaries", "movables", "real-estate", "protective-garnishment"], stages: ["notice", "asset", "bank", "realestate"], tools: ["route", "order", "document"] },
      { title: "الحصيلة والتوزيع", lessons: ["distribution"], stages: ["distribution"], tools: ["distribution"] },
      { title: "التناسب ووسائل الضغط", lessons: ["pressure"], stages: [], tools: [] },
      { title: "المراجعة والمنازعات", lessons: ["review", "disputes"], stages: ["dispute"], tools: ["dispute"] },
    ];
    return competencies.map((competency) => {
      const parts = [];
      competency.lessons.forEach((id) => parts.push(state.completedLessons.includes(id) ? 1 : state.lessonScores[id] || 0));
      competency.stages.forEach((id) => { const decision = state.court.decisions.find((item) => item.stageId === id); parts.push(decision ? (decision.correct ? 1 : .45) : 0); });
      competency.tools.forEach((key) => parts.push(state.toolRuns[key] > 0 ? .8 : 0));
      const score = parts.length ? Math.round((parts.reduce((sum, value) => sum + value, 0) / parts.length) * 100) : 0;
      return { title: competency.title, score, level: score >= 80 ? "متقن" : score >= 45 ? "نامٍ" : "مبتدئ" };
    });
  }

  function renderProgress() {
    const mastery = masteryData();
    main.innerHTML = `<div class="view"><header class="page-intro"><span class="eyebrow">بطاقة الكفايات</span><h1>تقدّمك محفوظ على هذا الجهاز</h1><p>لا تسجل المنصة اسمًا أو بريدًا أو نصوصًا حرة. يمكنك تصدير هذا السجل واستعادته على جهاز آخر.</p></header>
      <section class="competency-grid">${mastery.map((item) => `<article class="competency-card"><div class="progress-label"><strong>${item.title}</strong><span>${item.level} · ${toArabicDigits(item.score)}٪</span></div><div class="progress-track" role="progressbar" aria-label="${item.title}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${item.score}"><span style="width:${item.score}%"></span></div></article>`).join("")}</section>
      <section class="summary-grid"><article class="panel-card"><span class="eyebrow">آخر النشاطات</span><h2>سجل التعلّم</h2>${state.history.length ? `<ul class="history-list">${state.history.map((item) => `<li><span><strong>${escapeHtml(item.label)}</strong><br>${escapeHtml(item.detail)}</span><time datetime="${item.at}">${formatDate(item.at)}</time></li>`).join("")}</ul>` : `<div class="empty-state"><p>ابدأ درسًا أو أداة لتظهر نشاطاتك هنا.</p></div>`}</article>
      <article class="panel-card"><span class="eyebrow">إدارة التقدم</span><h2>نسخة محلية قابلة للنقل</h2><div class="privacy-box"><p>ملف التصدير يحتوي على معرفات الدروس والقرارات والنتائج فقط. لا يحتوي على بيانات شخصية أو إجابات نصية.</p></div><div class="view-actions"><button class="btn btn-primary" type="button" id="export-progress">تصدير تقدمي</button><label class="btn" for="import-progress">استيراد تقدم</label><input class="sr-only" id="import-progress" type="file" accept="application/json"><button class="btn btn-danger" type="button" id="clear-progress">مسح التقدم</button></div><div id="progress-message" aria-live="polite"></div></article></section></div>`;
    bindProgressActions();
  }

  function bindProgressActions() {
    document.getElementById("export-progress")?.addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "تقدم-محكمة-التنفيذ.json";
      link.click();
      URL.revokeObjectURL(link.href);
      showToast("تم إنشاء نسخة من تقدمك.");
    });
    document.getElementById("import-progress")?.addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        const parsed = JSON.parse(await file.text());
        if (!validImportedState(parsed)) throw new Error("invalid");
        state = normalizeState(parsed);
        saveState();
        renderView("progress");
        showToast("تم استيراد التقدم بنجاح.");
      } catch (_) {
        document.getElementById("progress-message").innerHTML = `<div class="feedback incorrect" role="alert"><p>لم يُقبل الملف. تأكد أنه ملف تقدم صادر من هذه النسخة من المنصة.</p></div>`;
      }
    });
    document.getElementById("clear-progress")?.addEventListener("click", () => {
      if (!confirm("هل تريد مسح تقدم هذه المنصة من الجهاز؟ لا يمكن التراجع عن ذلك دون ملف تصدير.")) return;
      if (!confirm("تأكيد أخير: سيُحذف سجل الدروس والقضية والأدوات فقط.")) return;
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
      state = defaultState();
      selectedLessonId = "foundations";
      renderView("progress");
      updateHeaderProgress();
      showToast("مُسح تقدم المنصة من هذا الجهاز.");
    });
  }

  function bindCommonActions() {
    main.querySelectorAll("[data-go]").forEach((button) => button.addEventListener("click", () => navigate(button.dataset.go)));
    main.querySelectorAll("[data-open-lesson]").forEach((button) => button.addEventListener("click", () => {
      selectedLessonId = button.dataset.openLesson;
      navigate("lessons", { lesson: selectedLessonId });
    }));
  }

  function openMobileMenu() {
    document.getElementById("sidebar").classList.add("open");
    document.getElementById("sidebar-backdrop").hidden = false;
    document.getElementById("menu-toggle").setAttribute("aria-expanded", "true");
  }
  function closeMobileMenu() {
    document.getElementById("sidebar").classList.remove("open");
    document.getElementById("sidebar-backdrop").hidden = true;
    document.getElementById("menu-toggle").setAttribute("aria-expanded", "false");
  }

  document.querySelectorAll(".nav-item").forEach((button) => button.addEventListener("click", () => navigate(button.dataset.view)));
  document.getElementById("menu-toggle").addEventListener("click", () => document.getElementById("sidebar").classList.contains("open") ? closeMobileMenu() : openMobileMenu());
  document.getElementById("sidebar-backdrop").addEventListener("click", closeMobileMenu);

  const accessPanel = document.getElementById("accessibility-panel");
  function toggleAccessPanel(force) {
    const show = typeof force === "boolean" ? force : accessPanel.hidden;
    accessPanel.hidden = !show;
    document.getElementById("accessibility-toggle").setAttribute("aria-expanded", String(show));
    if (show) document.getElementById("accessibility-close").focus();
  }
  document.getElementById("accessibility-toggle").addEventListener("click", () => toggleAccessPanel());
  document.getElementById("accessibility-close").addEventListener("click", () => { toggleAccessPanel(false); document.getElementById("accessibility-toggle").focus(); });
  document.querySelectorAll("[data-font]").forEach((button) => button.addEventListener("click", () => { settings.font = button.dataset.font; saveSettings(); }));
  document.getElementById("contrast-toggle").addEventListener("change", (event) => { settings.contrast = event.target.checked; saveSettings(); });
  document.getElementById("motion-toggle").addEventListener("change", (event) => { settings.motion = event.target.checked; saveSettings(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") { toggleAccessPanel(false); closeMobileMenu(); } });

  window.addEventListener("hashchange", () => {
    const view = location.hash.slice(1);
    if (["home", "map", "lessons", "court", "tools", "glossary", "progress"].includes(view) && view !== currentView) navigate(view, { keepFocus: true });
  });

  applySettings();
  updateHeaderProgress();
  const initialView = ["home", "map", "lessons", "court", "tools", "glossary", "progress"].includes(location.hash.slice(1)) ? location.hash.slice(1) : state.lastView;
  navigate(initialView || "home", { keepFocus: true });

  if ("serviceWorker" in navigator && location.protocol.startsWith("http") && document.querySelector('link[rel="manifest"]')) navigator.serviceWorker.register("sw.js").catch(() => {});
})();
