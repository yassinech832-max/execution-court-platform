(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.EnforcementLogic = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const eastern = "٠١٢٣٤٥٦٧٨٩";
  const persian = "۰۱۲۳۴۵۶۷۸۹";

  function normalizeArabicNumber(value) {
    if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
    const normalized = String(value ?? "")
      .trim()
      .replace(/[٠-٩]/g, (d) => String(eastern.indexOf(d)))
      .replace(/[۰-۹]/g, (d) => String(persian.indexOf(d)))
      .replace(/[٬,\s]/g, "")
      .replace(/٫/g, ".");
    if (!normalized) return NaN;
    const result = Number(normalized);
    return Number.isFinite(result) ? result : NaN;
  }

  function formatMoney(value) {
    return new Intl.NumberFormat("ar-AE", {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(Math.round(value));
  }

  function analyzeTitle(input) {
    const amount = normalizeArabicNumber(input.amount);
    const paid = normalizeArabicNumber(input.paid || 0);
    const issues = [];
    const strengths = [];

    if (!input.titleType) issues.push("حدد نوع السند قبل التحليل.");
    else strengths.push("جرى تحديد نوع السند المطلوب استعماله.");

    if (input.obligation !== "certain") issues.push("يجب أن يكون وجود الحق ثابتًا لا احتماليًا.");
    else strengths.push("الحق محقق الوجود بحسب البيانات المدخلة.");

    if (input.due !== "yes") issues.push("لا يبدأ الاقتضاء الجبري قبل حلول الأداء.");
    else strengths.push("الأداء حال وفق الفرض التدريبي.");

    if (!Number.isFinite(amount) || amount <= 0) issues.push("أدخل مقدارًا موجبًا ومحددًا للحق.");
    if (!Number.isFinite(paid) || paid < 0) issues.push("قيمة الوفاء السابق يجب أن تكون صفرًا أو رقمًا موجبًا.");
    if (Number.isFinite(amount) && Number.isFinite(paid) && paid > amount) issues.push("لا يمكن أن يزيد الوفاء السابق على مقدار الحق في هذا النموذج.");

    if (input.execCopy !== "yes" && input.execCopy !== "exception") {
      issues.push("افحص الصورة التنفيذية أو وجود حالة تجيز التنفيذ بغيرها.");
    } else {
      strengths.push(input.execCopy === "yes" ? "الصورة التنفيذية متوافرة." : "أشير إلى استثناء يحتاج إلى توثيق أساسه.");
    }

    const balance = Number.isFinite(amount) && Number.isFinite(paid) ? Math.max(0, amount - paid) : null;
    if (balance === 0 && Number.isFinite(amount)) issues.push("يبدو أن الحق قد استوفي كاملًا وفق الأرقام المدخلة.");

    return {
      ready: issues.length === 0,
      issues,
      strengths,
      balance,
      headline: issues.length === 0 ? "السند جاهز مبدئيًا للانتقال إلى مقدمات التنفيذ" : "السند يحتاج إلى استكمال أو مراجعة",
    };
  }

  function adviseRoute(input) {
    const notes = [];
    let route = "ابدأ بفحص السند والأطراف قبل اختيار الإجراء.";

    if (input.performance === "specific") {
      route = "ادرس التنفيذ المباشر على محل الالتزام ذاته قبل اللجوء إلى الحجز.";
      notes.push("يحدد قاضي التنفيذ كيفية الوصول إلى الأداء العيني بحسب طبيعته.");
    } else if (input.urgency === "yes" && input.hasTitle === "no") {
      route = "افحص الحجز التحفظي لحماية الضمان، ثم استكمل دعوى ثبوت الحق ومتطلبات التحول.";
      notes.push("الحجز التحفظي لا يحقق الوفاء وحده ولا يغني عن السند التنفيذي.");
    } else if (input.location === "third") {
      route = "اسلك حجز ما للمدين لدى الغير وأعلن المحجوز لديه وفق الطريق الخاص.";
      notes.push("لا تعامل المال الموجود لدى البنك أو مدين المدين كمنقول موجود في حيازة المدين.");
    } else if (input.assetType === "realestate") {
      route = "اتبع الحجز التنفيذي العقاري: التسجيل، الإعلان، التقييم، شروط البيع ثم المزايدة.";
      notes.push("تحقق من الحائز والكفيل العيني وأصحاب الحقوق المقيدة.");
    } else if (input.assetType === "movable") {
      route = "اتبع حجز المنقول: الجرد، الحراسة، التمهيد للبيع ثم المزايدة عند الحاجة.";
      notes.push("تحقق من ملكية المدين وقابلية المال للحجز والتناسب مع مقدار الحق.");
    } else if (input.assetType === "cash") {
      route = "ابدأ بالمال النقدي المعلوم لأنه يقلل إجراءات البيع، مع مراعاة طريق وجوده لدى المدين أو الغير.";
      notes.push("استمر على أموال أخرى فقط في حدود الرصيد غير المستوفى.");
    }

    if (input.hasTitle === "no" && input.urgency !== "yes") notes.push("لا يبدأ الحجز التنفيذي قبل وجود سند صالح واستكمال مقدماته.");
    if (input.ownership === "third") notes.push("توقف عن افتراض ملكية المدين؛ التنفيذ على مال الغير يفتح طريق الاسترداد أو الاستحقاق.");
    if (input.ownership === "uncertain") notes.push("يلزم التحقق من الملكية قبل توسيع الحجز، وتوثيق أي ادعاء من الغير.");

    return { route, notes };
  }

  function calculateDistribution(input) {
    const proceeds = normalizeArabicNumber(input.proceeds);
    const costs = normalizeArabicNumber(input.costs || 0);
    const secured = normalizeArabicNumber(input.secured || 0);
    const creditorA = normalizeArabicNumber(input.creditorA || 0);
    const creditorB = normalizeArabicNumber(input.creditorB || 0);
    const values = { proceeds, costs, secured, creditorA, creditorB };

    for (const [key, value] of Object.entries(values)) {
      if (!Number.isFinite(value) || value < 0) return { valid: false, error: `تحقق من قيمة ${key}; يجب أن تكون صفرًا أو رقمًا موجبًا.` };
    }
    if (proceeds <= 0) return { valid: false, error: "يجب أن تكون الحصيلة أكبر من صفر." };

    let remaining = proceeds;
    const costsPaid = Math.min(costs, remaining);
    remaining -= costsPaid;
    const securedPaid = Math.min(secured, remaining);
    remaining -= securedPaid;

    const totalGeneral = creditorA + creditorB;
    let shareA = 0;
    let shareB = 0;
    if (totalGeneral > 0 && remaining > 0) {
      const distributable = Math.min(remaining, totalGeneral);
      shareA = distributable * (creditorA / totalGeneral);
      shareB = distributable * (creditorB / totalGeneral);
      remaining -= distributable;
    }

    return {
      valid: true,
      proceeds,
      costsPaid,
      securedPaid,
      shareA,
      shareB,
      unpaidA: Math.max(0, creditorA - shareA),
      unpaidB: Math.max(0, creditorB - shareB),
      surplus: Math.max(0, remaining),
      insufficient: costsPaid < costs || securedPaid < secured || shareA < creditorA || shareB < creditorB,
      formatted: {
        costsPaid: formatMoney(costsPaid),
        securedPaid: formatMoney(securedPaid),
        shareA: formatMoney(shareA),
        shareB: formatMoney(shareB),
        unpaidA: formatMoney(Math.max(0, creditorA - shareA)),
        unpaidB: formatMoney(Math.max(0, creditorB - shareB)),
        surplus: formatMoney(Math.max(0, remaining)),
      },
    };
  }

  function classifyDispute(input) {
    const type = input.type;
    const first = input.first === "yes";
    const result = { title: "يلزم مزيد من البيانات", route: "حدد حقيقة الطلب والمال والطرف الذي يثيره.", effect: "لا يمكن تحديد أثر على التنفيذ قبل التكييف." };

    if (type === "temporary") {
      result.title = "إشكال وقتي";
      result.route = "يطلب حماية مؤقتة من قاضي التنفيذ دون حسم أصل الحق نهائيًا.";
      result.effect = first ? "الإشكال الأول المقدم أثناء التنفيذ يمنع الإتمام مؤقتًا إلى أن يقرر القاضي الوقف أو المضي، مع بقاء أعمال الحفظ." : "الإشكال اللاحق لا يوقف التنفيذ تلقائيًا، ويظل للقاضي أن يأمر بالوقف عند الجدية والخطر.";
    } else if (type === "invalidity") {
      result.title = "منازعة تنفيذ موضوعية";
      result.route = "ترفع بطلب الحكم ببطلان التنفيذ أو عدم جوازه أمام الجهة المختصة.";
      result.effect = "لا يتحقق الوقف النهائي لمجرد الادعاء؛ يطلب الوقف المؤقت عند الحاجة أمام الجهة المختصة.";
    } else if (type === "movable-third") {
      result.title = "دعوى استرداد منقول محجوز";
      result.route = "يرفعها الغير بطلب ملكيته للمنقول وبطلان الحجز مع اختصام الأطراف اللازمين.";
      result.effect = first ? "الدعوى الأولى توقف بيع المنقول محلها وفق شروطها، ولا توقف التنفيذ على الأموال الأخرى." : "الدعوى الثانية لا توقف البيع تلقائيًا، مع بقاء سلطة المحكمة في الأمر بالوقف.";
    } else if (type === "realestate-third") {
      result.title = "دعوى استحقاق عقار محجوز";
      result.route = "ترفع أمام المحكمة المختصة بموقع العقار بطلب الملكية وبطلان التنفيذ واستيفاء شروطها الخاصة.";
      result.effect = "لا يقف البيع بمجرد القيد؛ يطلب الوقف وتفحص المحكمة شروطه في أول جلسة، مع الطريق العاجل إذا سبق المزاد الجلسة.";
    } else if (type === "review") {
      result.title = "مراجعة عمل صادر في التنفيذ";
      result.route = "ابدأ بتكييف العمل: حكم أم قرار أم أمر، ثم اختر الاستئناف أو التظلم أو عدم القابلية للمراجعة المستقلة.";
      result.effect = "المراجعة لا توقف التنفيذ تلقائيًا في كل الحالات؛ افحص الحاجة إلى طلب وقف مستقل.";
    }
    return result;
  }

  function validateOrder(order, expected) {
    const same = order.length === expected.length && order.every((value, index) => value === expected[index]);
    if (same) return { correct: true, firstError: -1, message: "التسلسل صحيح من طلب التنفيذ حتى توزيع الحصيلة." };
    const firstError = order.findIndex((value, index) => value !== expected[index]);
    return { correct: false, firstError, message: `راجع الخطوة رقم ${firstError + 1}؛ هناك إجراء سابق يجب أن يسبقها.` };
  }

  return { normalizeArabicNumber, formatMoney, analyzeTitle, adviseRoute, calculateDistribution, classifyDispute, validateOrder };
});
