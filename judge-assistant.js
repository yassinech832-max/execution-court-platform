/* مساعد القاضي التعليمي: استرجاع محدد من النصوص المرفقة وصياغة مشروطة بمراجعة الإنسان. */
(function () {
  "use strict";

  const KEY = "yassin-shami-judge-assistant-v1";
  const LAW = window.CIVIL_PROCEDURE_LAW || { articles: [], meta: {} };
  const OFFICIAL_JUDGMENTS = "https://www.adjd.gov.ae/sites/eservices/ar/pages/judgments.aspx";
  const ids = ["judgeTrack", "judgeTitle", "judgeFacts", "judgeClaim", "judgeDefense", "judgeClaimEvidence", "judgeDefenseEvidence", "judgeApplication", "judgePrecedentRef", "judgePrecedentUrl", "judgePrecedentNote", "judgeOutcome", "judgeReason", "judgeReview"];
  const presets = [
    { id: "notice", label: "إعلان شركة", track: "procedure", title: "الإعلان على بريد إلكتروني قديم", facts: "رفع طالب دعوى على شركة، وأرسل مكتب الإعلان صحيفتها إلى بريد موظف غادر الشركة. لا يظهر في الملف سجل يثبت وصول الصحيفة إلى ممثل الشركة. عُيّنت جلسة وتنازع الطرفان في أثر الإعلان.", claim: "يطلب المدعي اعتماد الإعلان ومتابعة الدعوى، ويشير إلى أن النظام أرسل الرسالة.", defense: "تطلب الشركة التثبت من صفة متلقي الإعلان ومن تحقق العلم والتمكين من الدفاع.", claimEvidence: "سجل الإرسال الإلكتروني (دون إثبات وصول بعد)", defenseEvidence: "بيانات انتهاء عمل الموظف قبل الإرسال", laws: [10, 13, 49] },
    { id: "provisional", label: "حجز تحفظي", track: "enforcement", title: "حجز الآلات قبل الفصل في الحق", facts: "طلب دائن حجز آلات مؤقتاً بعد أن عرض مراسلات تشير إلى نقلها خارج الدولة. صدر أمر بالحجز التحفظي، ثم تأخر الدائن اثني عشر يوماً في رفع دعوى ثبوت الحق. توجد منازعة حول أساس الدين.", claim: "يطلب الدائن إبقاء الآلات محجوزة خوفاً من تهريبها.", defense: "يطلب المدين رفع الحجز لفوات ميعاد إقامة دعوى ثبوت الحق في الحالة التي تتطلبها.", claimEvidence: "مراسلات نقل الآلات وتاريخ أمر الحجز", defenseEvidence: "قيد دعوى ثبوت الحق بعد اثني عشر يوماً", laws: [247, 250] },
    { id: "bank", label: "حجز لدى بنك", track: "enforcement", title: "أمر حجز لدى بنك بلا مقدار", facts: "أعلن بنك بأمر حجز على حساب مدين دون بيان أصل المبلغ والمصروفات. يطلب الحاجز من البنك الدفع قبل أن يقدم تقريراً بما في ذمته.", claim: "يطلب الحاجز تثبيت الحجز والحصول على المبلغ من البنك.", defense: "يدفع البنك بعيب البيانات ويريد تحديد واجب التقرير قبل أي وفاء.", claimEvidence: "صورة الأمر المعلن للبنك", defenseEvidence: "نسخة الأمر الخالية من أصل المبلغ والمصروفات", laws: [253, 254, 256, 260] },
    { id: "objection", label: "إشكال وقتي", track: "enforcement", title: "إشكال عُرض أثناء بيع المنقول", facts: "أثناء بيع منقول محجوز، أبدى المدين إشكالاً وقتياً وطلب وقف البيع. أراد القائم بالتنفيذ استكمال المزايدة قبل عرض الإشكال على قاضي التنفيذ.", claim: "يطلب الدائن المضي في البيع لعدم كفاية أسباب الإشكال.", defense: "يطلب المدين عرض الإشكال على قاضي التنفيذ ليقرر وقف التنفيذ أو المضي فيه.", claimEvidence: "محضر إجراءات المزاد", defenseEvidence: "طلب الإشكال ومرفقاته وتاريخ تقديمه", laws: [239, 241] },
  ];
  const topics = [
    { track: "procedure", words: ["اعلان", "تبليغ", "رساله", "بريد"], laws: [10, 13, 49] },
    { track: "procedure", words: ["اختصاص", "موطن", "عقار"], laws: [27, 33, 34, 86] },
    { track: "procedure", words: ["قيد الدعوي", "صحيفه", "رسم"], laws: [44, 47, 49] },
    { track: "procedure", words: ["امر الاداء", "فاتوره"], laws: [143, 144] },
    { track: "procedure", words: ["استئناف", "الطعن"], laws: [159, 167] },
    { track: "enforcement", words: ["البنك", "مصرف", "لدي الغير", "المحجوز لديه"], laws: [252, 253, 254, 256, 260] },
    { track: "enforcement", words: ["تحفظي", "تهريب", "فرار"], laws: [247, 249, 250] },
    { track: "enforcement", words: ["اشكال", "وقف التنفيذ", "منازعه تنفيذ"], laws: [207, 239, 241] },
    { track: "enforcement", words: ["منقول", "مزاد"], laws: [264, 275, 279] },
    { track: "enforcement", words: ["العقار", "السجل العقاري"], laws: [285, 286, 289] },
    { track: "enforcement", words: ["توزيع", "حصيله"], laws: [310, 312, 313] },
    { track: "enforcement", words: ["سند تنفيذي", "وفاء", "دين"], laws: [212, 233, 235] },
  ];
  const articleByNumber = (number) => (LAW.articles || []).find((article) => article.number === Number(number));
  const el = (id) => document.getElementById(id);
  const esc = (text) => String(text ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const norm = (text) => String(text || "").toLowerCase().normalize("NFKD").replace(/[\u064B-\u065F\u0670\u06D6-\u06EDـ]/g, "").replace(/[إأآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه");
  const blank = () => ({ track: "procedure", title: "", facts: "", claim: "", defense: "", claimEvidence: "", defenseEvidence: "", application: "", precedentRef: "", precedentUrl: "", precedentNote: "", outcome: "review", reason: "", review: "", preset: "", hintArticles: [], candidates: [], selected: [], ready: false });

  function fromPreset(preset) {
    return { ...blank(), ...preset, preset: preset.id, hintArticles: preset.laws.slice(), candidates: [], selected: [], ready: false };
  }
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      if (!saved || !["procedure", "enforcement"].includes(saved.track)) return fromPreset(presets[0]);
      const next = blank();
      for (const key of Object.keys(next)) {
        if (typeof next[key] === "string" && typeof saved[key] === "string") next[key] = saved[key].slice(0, 3500);
      }
      for (const key of ["hintArticles", "candidates", "selected"]) next[key] = Array.isArray(saved[key]) ? [...new Set(saved[key].map(Number))].filter((n) => articleByNumber(n)).slice(0, 8) : [];
      next.ready = saved.ready === true;
      if (!["accept", "reject", "review"].includes(next.outcome)) next.outcome = "review";
      return next;
    } catch (_) { return fromPreset(presets[0]); }
  }
  let state = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) { /* التخزين الخاص غير متاح */ } }
  function message(text) { const node = el("judgeMessage"); if (node) node.textContent = text; }
  function fields() {
    const values = { judgeTrack: "track", judgeTitle: "title", judgeFacts: "facts", judgeClaim: "claim", judgeDefense: "defense", judgeClaimEvidence: "claimEvidence", judgeDefenseEvidence: "defenseEvidence", judgeApplication: "application", judgePrecedentRef: "precedentRef", judgePrecedentUrl: "precedentUrl", judgePrecedentNote: "precedentNote", judgeOutcome: "outcome", judgeReason: "reason", judgeReview: "review" };
    for (const [id, key] of Object.entries(values)) if (el(id)) el(id).value = state[key];
  }

  function findCandidates(data = state) {
    const query = norm(`${data.title} ${data.facts} ${data.claim} ${data.defense}`);
    const ranked = topics.filter((item) => item.track === data.track).map((item) => ({ item, score: item.words.reduce((sum, word) => sum + (query.includes(word) ? 1 : 0), 0) })).filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score);
    const seeded = data.hintArticles.length ? data.hintArticles : ranked.length ? ranked.slice(0, 2).flatMap((entry) => entry.item.laws) : [];
    return [...new Set(seeded.map(Number))].filter((number) => articleByNumber(number)).slice(0, 6);
  }

  function validOfficialUrl(value) {
    if (!value.trim()) return "";
    try {
      const url = new URL(value.trim());
      return url.protocol === "https:" && (url.hostname.toLowerCase() === "adjd.gov.ae" || url.hostname.toLowerCase().endsWith(".adjd.gov.ae")) ? url.href : "";
    } catch (_) { return ""; }
  }

  function renderLaws() {
    const container = el("judgeLawResults");
    if (!container) return;
    const candidates = [...new Set([...state.candidates, ...state.selected])].filter(articleByNumber);
    container.innerHTML = candidates.length ? candidates.map((number) => {
      const article = articleByNumber(number);
      const selected = state.selected.includes(number);
      return `<article class="judge-law-card ${selected ? "selected" : ""}"><button type="button" data-judge-law="${number}" aria-pressed="${selected}"><span>المادة (${number}) · ${selected ? "مختارة" : "مرشحة للقراءة"}</span><strong>${esc(article.topic || article.title || "قانون الإجراءات المدنية")}</strong><small>${esc(article.text.slice(0, 255))}${article.text.length > 255 ? "…" : ""}</small></button><button type="button" class="judge-source-button" data-judge-source="${number}">اقرأ المادة كاملة في المصادر ↗</button></article>`;
    }).join("") : '<p class="judge-law-empty">اكتب الوقائع واضغط «حلّل الملف»، أو أضف رقم مادة من السجل. لا يظهر ترشيح قانوني من دون موضوع واضح.</p>';
  }

  function renderPresets() {
    if (el("judgePresets")) el("judgePresets").innerHTML = presets.map((preset) => `<button type="button" data-judge-preset="${preset.id}" class="${preset.id === state.preset ? "active" : ""}" aria-pressed="${preset.id === state.preset}">${esc(preset.label)}</button>`).join("");
  }

  function problems() {
    const issues = [];
    if (state.facts.trim().length < 35) issues.push("اكتب وقائع القضية في فقرتين على الأقل");
    if (state.claim.trim().length < 15) issues.push("بيّن طلب الطرف الأول");
    if (state.defense.trim().length < 15) issues.push("بيّن رد الطرف الثاني");
    if (!state.selected.length) issues.push("اختر مادة قانونية واقرأها");
    if (state.application.trim().length < 30) issues.push("اربط المادة المختارة بواقعة محددة");
    if (state.reason.trim().length < 25) issues.push("اكتب سبباً للترجيح والرد على الدفع");
    if (state.precedentUrl.trim() && !validOfficialUrl(state.precedentUrl)) issues.push("اكتب رابطاً رسمياً صحيحاً من نطاق دائرة القضاء أو امسحه");
    return issues;
  }

  function draftMarkup() {
    const selected = state.selected.map(articleByNumber).filter(Boolean);
    const sourceLink = LAW.meta?.sourceUrl || "https://uaelegislation.gov.ae/ar/legislations/1602";
    const caveats = [
      !state.claimEvidence.trim() ? "لم تُحدد مستندات تؤيد الطلب." : "مستندات الطالب مدخلة منه ولم يتحقق النظام من أصالتها.",
      !state.defenseEvidence.trim() ? "لم تُحدد مستندات تؤيد الدفاع." : "مستندات الدفاع مدخلة منه ولم يتحقق النظام من أصالتها.",
      state.precedentRef.trim() ? "رقم الحكم ومناسبته أدخلهما الطالب؛ يُراجع الأصل في البوابة القضائية." : "لم يحدد الطالب حكماً منشوراً للتحقق من الصلة به.",
    ];
    const result = { review: "يتطلب الملف استكمال الوقائع أو فحص الأدلة قبل تبنّي نتيجة موضوعية.", accept: "يرجّح الطالب إمكان قبول الطلب إذا ثبتت الوقائع وتوافرت شروط النصوص التي اختارها.", reject: "يرجّح الطالب إمكان رفض الطلب إذا لم تثبت شروطه بعد فحص أدلة الخصمين." }[state.outcome];
    const precedent = state.precedentRef.trim() ? `أدخل الطالب المرجع «${esc(state.precedentRef)}»${state.precedentNote.trim() ? `، وملاحظته البحثية: ${esc(state.precedentNote)}` : " دون ملاحظة تقارن الوقائع"}. لا تتحقق المنصة من هذا المرجع آلياً. ${validOfficialUrl(state.precedentUrl) ? `<a href="${esc(validOfficialUrl(state.precedentUrl))}" target="_blank" rel="noopener noreferrer">افتح رابط الحكم الرسمي ↗</a>` : `<a href="${OFFICIAL_JUDGMENTS}" target="_blank" rel="noopener noreferrer">تحقق من بوابة النشر الرسمية ↗</a>`}` : `<a href="${OFFICIAL_JUDGMENTS}" target="_blank" rel="noopener noreferrer">لا توجد سابقة مسجلة؛ افتح البحث الرسمي ↗</a>`;
    return `<article class="judge-report"><div class="judge-report-banner"><span>مسودة تعليمية غير معتمدة</span><small>إعداد طالب · للمراجعة البشرية</small></div><h4>${esc(state.title.trim() || "ملف تدريبي غير معنون")}</h4><p class="judge-report-sub">${state.track === "enforcement" ? "التنفيذ الجبري" : "الإجراءات المدنية"} · مواد اختارها الطالب (${selected.length})</p><section><h5>الوقائع المعروضة</h5><p>${esc(state.facts)}</p></section><section><h5>الطلب والدفاع</h5><p><strong>الطلب: </strong>${esc(state.claim)}</p><p><strong>الدفاع: </strong>${esc(state.defense)}</p><p><strong>دليل الطالب المدخل: </strong>${esc(state.claimEvidence || "لم يحدد")}</p><p><strong>دليل الدفاع المدخل: </strong>${esc(state.defenseEvidence || "لم يحدد")}</p></section><section><h5>النصوص التي اختارها الطالب: تحقق من انطباقها</h5><ul>${selected.map((article) => `<li>المادة (${article.number}) · ${esc(article.topic || article.title || "قانون الإجراءات المدنية")} <button type="button" data-judge-source="${article.number}">اقرأ النص ↗</button></li>`).join("")}</ul><a href="${esc(sourceLink)}" target="_blank" rel="noopener noreferrer">راجع النسخة الرسمية للقانون ↗</a></section><section><h5>وجه التطبيق الذي حرره الطالب</h5><p>${esc(state.application)}</p></section><section><h5>الاستئناس بالأحكام المنشورة</h5><p>${precedent}</p></section><section><h5>الاحتمال المعلل، لا حكم قضائي</h5><p>${esc(result)} ${esc(state.reason)}</p></section><section class="judge-caveats"><h5>تحقق قبل المناقشة</h5><ul>${caveats.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></section>${state.review.trim() ? `<section><h5>ملاحظة بشرية مسجلة على هذا الجهاز</h5><p>${esc(state.review)}</p></section>` : ""}</article>`;
  }

  function renderDraft() {
    const node = el("judgeDraft");
    if (!node) return;
    const issues = problems();
    if (state.ready && !issues.length) node.innerHTML = draftMarkup();
    else node.innerHTML = `<div class="judge-empty">${issues.length ? `لإعداد المشروع: ${esc(issues.slice(0, 3).join("؛ "))}.` : "الملف تغيّر؛ أنشئ مشروع التسبيب بعد مراجعة المدخلات."}</div>`;
    if (el("judgeDownload")) el("judgeDownload").hidden = !(state.ready && !issues.length);
  }

  function render() { fields(); renderPresets(); renderLaws(); renderDraft(); }
  function markDirty() { state.ready = false; save(); renderDraft(); }

  function loadThinkingCase(caseData, entry) {
    if (!caseData || !Array.isArray(caseData.story)) return;
    state = { ...blank(), track: caseData.track === "enforcement" ? "enforcement" : "procedure", title: caseData.title, facts: caseData.story.join("\n"), claim: entry?.first || caseData.sample.first, defense: entry?.second || caseData.sample.second, hintArticles: caseData.tools.filter((tool) => tool.kind === "law" && tool.essential).map((tool) => Number(tool.id)) };
    state.candidates = findCandidates();
    save(); render(); message("نُقلت الواقعة وحجج الطالب. أضف الأدلة، ثم اختر النصوص واكتب وجه انطباقها.");
  }

  function download() {
    if (!state.ready || problems().length) return;
    const sourceLink = LAW.meta?.sourceUrl || "https://uaelegislation.gov.ae/ar/legislations/1602";
    const text = ["مساعد القاضي التعليمي ـ مشروع تسبيب غير معتمد", "مختبر د. ياسين شامي · كلية القانون · جامعة الإمارات العربية المتحدة", "", `الملف: ${state.title}`, `المقرر: ${state.track === "enforcement" ? "التنفيذ الجبري" : "الإجراءات المدنية"}`, `الوقائع: ${state.facts}`, `طلب الطالب: ${state.claim}`, `رد الخصم: ${state.defense}`, `مستندات الطلب المدخلة: ${state.claimEvidence || "غير محددة"}`, `مستندات الرد المدخلة: ${state.defenseEvidence || "غير محددة"}`, `المواد المقترحة التي اختارها الطالب: ${state.selected.map((n) => `(${n})`).join("، ")}`, `المصدر القانوني الرسمي: ${sourceLink}`, `وجه التطبيق: ${state.application}`, `مرجع الحكم المدخل دون تحقق آلي: ${state.precedentRef || "لم يحدد"}`, `البحث الرسمي للأحكام: ${OFFICIAL_JUDGMENTS}`, `ملاحظة الطالب البحثية: ${state.precedentNote || "لم تحدد"}`, `احتمال الطالب: ${state.outcome === "accept" ? "قبول مشروط" : state.outcome === "reject" ? "رفض مشروط" : "استكمال الدليل"}`, `تعليل الطالب: ${state.reason}`, `ملاحظة بشرية: ${state.review || "لم تسجل"}`, "", "هذا مشروع تدريبي قابل للنقاش وليس حكماً أو مصدراً للأحكام القضائية."].join("\n\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "مشروع_تسبيب_تعليمي.txt"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function init() {
    const root = el("view-judge-assistant");
    if (!root) return;
    render();
    const syncInput = (event) => {
      const node = event.target;
      const map = { judgeTrack: "track", judgeTitle: "title", judgeFacts: "facts", judgeClaim: "claim", judgeDefense: "defense", judgeClaimEvidence: "claimEvidence", judgeDefenseEvidence: "defenseEvidence", judgeApplication: "application", judgePrecedentRef: "precedentRef", judgePrecedentUrl: "precedentUrl", judgePrecedentNote: "precedentNote", judgeOutcome: "outcome", judgeReason: "reason", judgeReview: "review" };
      if (!(node.id in map)) return;
      state[map[node.id]] = node.value.slice(0, 3500);
      if (node.id === "judgeTrack") { state.preset = ""; state.hintArticles = []; state.candidates = []; state.selected = []; renderPresets(); renderLaws(); }
      if (node.id === "judgeReview" && state.ready) { save(); renderDraft(); return; }
      markDirty();
    };
    root.addEventListener("input", syncInput);
    root.addEventListener("change", (event) => { if (event.target.id === "judgeTrack" || event.target.id === "judgeOutcome") syncInput(event); });
    root.addEventListener("click", (event) => {
      const presetButton = event.target.closest("[data-judge-preset]");
      if (presetButton) {
        const preset = presets.find((item) => item.id === presetButton.dataset.judgePreset);
        if (!preset) return;
        state = fromPreset(preset); state.candidates = findCandidates(); save(); render(); message("حمّلت ملفاً تدريبياً. اقرأ الوقائع واختر النص المناسب قبل إعداد المسودة."); return;
      }
      const source = event.target.closest("[data-judge-source]");
      if (source) { if (typeof window.openLawSource === "function") window.openLawSource(Number(source.dataset.judgeSource)); return; }
      const lawButton = event.target.closest("[data-judge-law]");
      if (lawButton) { const number = Number(lawButton.dataset.judgeLaw); state.selected = state.selected.includes(number) ? state.selected.filter((n) => n !== number) : [...state.selected, number]; markDirty(); renderLaws(); return; }
      const action = event.target.closest("button");
      if (!action) return;
      if (action.id === "judgeAnalyze") {
        if (state.facts.trim().length < 35 || state.claim.trim().length < 15 || state.defense.trim().length < 15) { message("أكمل الوقائع وطلب الطرف الأول ورد الطرف الثاني قبل البحث."); return; }
        state.candidates = findCandidates(); markDirty(); renderLaws(); message(state.candidates.length ? "هذه مواد مرشحة من سجل القانون. اختر المناسب بعد قراءة نصه الكامل." : "لم تظهر مادة مطابقة بوضوح؛ استخدم رقم مادة من سجل المصادر وراجعها."); return;
      }
      if (action.id === "judgeAddArticle") {
        const number = Number(el("judgeArticleNumber").value);
        if (!Number.isInteger(number) || !articleByNumber(number)) { message("هذا الرقم غير موجود في المواد المرفقة؛ راجع سجل المصادر."); return; }
        if (!state.candidates.includes(number)) state.candidates.push(number);
        if (!state.selected.includes(number)) state.selected.push(number);
        el("judgeArticleNumber").value = ""; markDirty(); renderLaws(); message(`أُضيفت المادة (${number}). اقرأها كاملة وتحقق من صلتها بوقائع النزاع.`); return;
      }
      if (action.id === "judgeGenerate") {
        const errors = problems();
        if (errors.length) { message(`استكمل أولاً: ${errors.join("؛ ")}.`); renderDraft(); return; }
        state.ready = true; save(); renderDraft(); message("ظهر مشروع التسبيب مع أوجه التحقق. راجعه مع الأستاذ قبل استعماله في التدريب."); return;
      }
      if (action.id === "judgeDownload") { download(); return; }
      if (action.id === "judgeClear") { state = blank(); save(); render(); el("judgeArticleNumber").value = ""; message("بدأ ملف جديد؛ أُزيلت مدخلات المساعد المحفوظة على هذا الجهاز."); }
    });
  }

  window.JudgeAssistant = { init, render, loadThinkingCase, findCandidates, validOfficialUrl, articleByNumber, _test: { presets, blank, problems: () => problems(), draftMarkup: () => draftMarkup(), getState: () => state } };
})();
