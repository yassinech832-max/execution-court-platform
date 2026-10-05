#!/usr/bin/env node
/* خادم اختياري: يقدم الملفات الثابتة ويضيف مساراً آمناً لموصل AI خارجي عند الحاجة. */

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { URL } = require("node:url");

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 4173);
const MAX_BODY = 1024 * 1024;

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
};

function send(res, status, body, contentType = "application/json; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": contentType,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(body);
}

function json(res, status, value) { send(res, status, JSON.stringify(value), "application/json; charset=utf-8"); }

function safeText(value) { return String(value || "").slice(0, 12000); }

function localCoach(payload) {
  const type = payload.type || "claim";
  const text = `${payload.prompt || ""} ${payload.draft || ""}`.toLowerCase();
  const points = [];
  const sources = [];
  let score = 66;
  if (text.includes("تبليغ") || type === "notice") {
    sources.push("المادة 49", "كتاب المرافعات ص 155–170");
    points.push({ tone: "ok", title: "محور التبليغ", text: "تحقق من الهوية والعنوان والوسيلة وأثر الاستلام أو الرفض قبل ترتيب بدء الميعاد." });
    points.push({ tone: "warn", title: "سؤال تحقق", text: "هل أرفقت دليلاً على وصول الورقة أو واقعة الرفض؟ اسم الوسيلة وحده لا يكفي." });
  } else if (text.includes("حجز تحفظ") || text.includes("8 أيام") || type === "objection") {
    sources.push("المادة 247", "كتاب التنفيذ ص 153–250");
    points.push({ tone: "ok", title: "محور الإجراء المؤقت", text: "أبرز الحق الظاهر والاستعجال والخطر، وحدد الأموال محل الحجز دون تعميم." });
    points.push({ tone: "fix", title: "ميعاد لا يُغفل", text: "أضف تنبيهاً لرفع دعوى الموضوع خلال ثمانية أيام، وبين أثر التخلف." });
  } else if (text.includes("إشكال") || text.includes("وقف التنفيذ")) {
    sources.push("المادة 239", "المادة 241");
    points.push({ tone: "ok", title: "تحديد نوع المنازعة", text: "سمِّ المنازعة وقتية أو موضوعية، واشرح الأثر المطلوب: استمرار التنفيذ أو وقفه أو الفصل في أصل الحق." });
    points.push({ tone: "warn", title: "لا تفترض الوقف", text: "أضف وجه الجدية والضرر وراجع شرط الكفالة عند طلب الوقف." });
  } else if (text.includes("توزيع") || type === "execution") {
    sources.push("المادتان 233 و310", "كتاب التنفيذ ص 251–262");
    points.push({ tone: "ok", title: "تسلسل التنفيذ", text: "رتب السند والإعلان ومهلة الوفاء ثم الحجز أو التحصيل، ولا تقفز إلى التوزيع قبل تكون الحصيلة." });
    points.push({ tone: "warn", title: "تخصيص أداة الحجز", text: "حدد هل المال لدى المدين أم لدى الغير؛ الحجز لدى الغير يحتاج أمراً وإعلاناً وتقريراً." });
  } else {
    sources.push("المادة 44", "المادة 47", "كتاب المرافعات ص 132–179");
    points.push({ tone: "ok", title: "هيكل المسودة", text: "ابدأ بالمحكمة وبيانات الخصوم والوقائع والطلبات والأسانيد، واربط كل طلب بواقعة وأثر." });
    points.push({ tone: "warn", title: "نقطة ناقصة محتملة", text: "أضف الميعاد أو واقعة الإعلان أو سند الاختصاص إن لم تكن ظاهرة في النص." });
  }
  if (safeText(payload.draft).length > 160) {
    score += 12;
    points.push({ tone: "ok", title: "تفصيل جيد", text: "المسودة تتضمن مادة كافية للتحليل الأولي؛ راجعها مع الأستاذ قبل استخدامها في التدريب." });
  } else {
    points.push({ tone: "fix", title: "مطلوب من الطالب", text: "أضف واقعة محددة وطلباً نهائياً واضحاً لاختبار الصلة بين الوقائع والإجراء." });
  }
  return { score: Math.min(98, score), headline: score > 78 ? "بنية واعدة تحتاج صقلاً" : "مسودة أولية تحتاج استكمالاً", points, sources, provider: "local-training-engine" };
}

async function coach(payload) {
  const remoteUrl = process.env.AI_API_URL;
  const remoteKey = process.env.AI_API_KEY;
  if (!remoteUrl || !remoteKey || typeof fetch !== "function") return localCoach(payload);

  try {
    const model = process.env.AI_MODEL || "educational-procedural-coach";
    const system = "أنت مدرب إجرائي لمنصة تعليمية جامعية في قانون الإجراءات المدنية والتنفيذ الجبري في دولة الإمارات. قدم ملاحظات تعليمية قابلة للتحقق، لا تصدر قراراً قضائياً ولا تقدم مشورة قانونية واقعية. أعد JSON فقط بالشكل: {score:number,headline:string,points:[{tone,title,text}],sources:string[]}. استخدم المواد التي يذكرها الطلب فقط، وصرح بالحاجة إلى مراجعة الأستاذ عند عدم اليقين.";
    const response = await fetch(remoteUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${remoteKey}` },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: system }, { role: "user", content: JSON.stringify({ type: payload.type, prompt: safeText(payload.prompt), draft: safeText(payload.draft) }) }],
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    });
    if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || data?.output_text || "";
    let result;
    try { result = typeof content === "string" ? JSON.parse(content) : content; } catch (error) { return localCoach(payload); }
    if (!result || !Array.isArray(result.points)) return localCoach(payload);
    return { ...result, provider: "configured-ai-provider" };
  } catch (error) {
    return localCoach(payload);
  }
}

function serveStatic(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  let pathname = decodeURIComponent(requestUrl.pathname);
  if (pathname === "/") pathname = "/index.html";
  const candidate = path.resolve(ROOT, `.${pathname}`);
  const relative = path.relative(ROOT, candidate);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return send(res, 403, "Forbidden", "text/plain; charset=utf-8");
  fs.stat(candidate, (statError, stat) => {
    if (statError || !stat.isFile()) return send(res, 404, "Not found", "text/plain; charset=utf-8");
    const type = mime[path.extname(candidate).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
    fs.createReadStream(candidate).pipe(res);
  });
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => { body += chunk; if (body.length > MAX_BODY) { reject(new Error("Request too large")); req.destroy(); } });
    req.on("end", () => { try { resolve(JSON.parse(body || "{}")); } catch (error) { reject(new Error("Invalid JSON")); } });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "POST" && new URL(req.url, `http://${req.headers.host || "localhost"}`).pathname === "/api/ai/coach") {
      const payload = await readJson(req);
      const result = await coach(payload);
      return json(res, 200, result);
    }
    if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, "Method not allowed", "text/plain; charset=utf-8");
    return serveStatic(req, res);
  } catch (error) {
    return json(res, 500, { error: "تعذر تشغيل موصل الذكاء الاصطناعي", fallback: "local-training-engine" });
  }
});

server.listen(PORT, () => {
  console.log(`منصة مختبر ياسين شامي تعمل على http://localhost:${PORT}`);
  console.log(process.env.AI_API_URL ? "موصل AI خارجي مفعّل عبر متغيرات البيئة." : "يعمل المساعد الذكي بمحرك التدريب المحلي؛ يمكن تفعيل موصل خارجي لاحقاً.");
});
