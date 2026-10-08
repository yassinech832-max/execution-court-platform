/*
 * مختبر ياسين شامي للمرافعات والتنفيذ الجبري
 * محرك الواجهة يعمل محلياً؛ لا يرسل بيانات الطالب إلى أي خدمة ما لم يُشغّل
 * الخادم الاختياري المرفق ويُضبط موصل الذكاء الاصطناعي فيه صراحة.
 */

(() => {
  "use strict";

  const STORAGE_KEY = "yassin-shami-procedural-lab-v1";
  const today = new Date().toISOString().slice(0, 10);

  const scenarios = {
    claim: {
      label: "مسار الدعوى إلى التوزيع",
      caseLabel: "ملف رقم UAEU–001",
      title: "من عقد التوريد إلى توزيع الحصيلة",
      stages: [
        {
          short: "صحيفة الدعوى",
          facts: ["عقد توريد", "185,000 د.إ", "مدني / تجاري"],
          prompt: "قبل إيداع الصحيفة، ما العنصر الذي يجب أن تضمنه في بنائها الإجرائي؟",
          options: [
            { text: "تحديد المحكمة وبيانات الأطراف والطلبات والوقائع والأسانيد", correct: true },
            { text: "إرفاق محضر بيع أموال المدين قبل رفع الدعوى", correct: false },
            { text: "طلب توزيع حصيلة لم تُحصّل بعد", correct: false },
          ],
          sourceTitle: "المادة 44 من قانون الإجراءات المدنية",
          sourceText: "بيانات صحيفة الدعوى واختصاص المحكمة.",
          hint: "ابدأ من بنية الصحيفة: المحكمة، الخصوم، الطلبات، الوقائع، والأسانيد.",
          success: "صح. هذه هي البنية الأولية التي تسمح بقيد الدعوى وتحديد نطاق الخصومة.",
          error: "هذا الإجراء ينتمي إلى مرحلة لاحقة. اسأل أولاً: ما الذي يجعل الصحيفة قابلة للقيد؟",
        },
        {
          short: "قيد الدعوى",
          facts: ["الرسم القضائي", "3 أيام عمل", "رقم قيد"],
          prompt: "بعد تسجيل بيانات الدعوى في النظام، ما الخطوة الزمنية التي يجب متابعتها؟",
          options: [
            { text: "سداد الرسم خلال ثلاثة أيام عمل من تاريخ تقديم طلب القيد", correct: true },
            { text: "انتظار البيع الجبري ثم سداد الرسم من الحصيلة", correct: false },
            { text: "إعلان الحكم قبل إنشاء رقم الدعوى", correct: false },
          ],
          sourceTitle: "المادة 47 من قانون الإجراءات المدنية",
          sourceText: "ميعاد سداد الرسم وآثار عدم استكمال القيد.",
          hint: "المواعيد الصغيرة تصنع مسار الملف؛ ضعها في سجل زمني لا في الذاكرة.",
          success: "أحسنت. أضفت ميعاد الرسم إلى سجل الملف قبل الانتقال للإعلان.",
          error: "لا تخلط بين مرحلة القيد ومرحلة التنفيذ؛ الرسم يسبق الخصومة والحكم.",
        },
        {
          short: "الإعلان",
          facts: ["تبليغ موثق", "إثبات هوية", "بدء الميعاد"],
          prompt: "ما التصرف الأكثر أماناً عند تجهيز إعلان المدعى عليه؟",
          options: [
            { text: "اختيار وسيلة منتجة للأثر مع توثيق الهوية والعنوان وواقعة الاستلام أو الرفض", correct: true },
            { text: "اعتبار إرسال رسالة غير موثقة إعلاناً صحيحاً في كل الأحوال", correct: false },
            { text: "تأجيل الإعلان إلى ما بعد طلب الحجز التنفيذي", correct: false },
          ],
          sourceTitle: "المادة 49 من قانون الإجراءات المدنية",
          sourceText: "ميعاد الإعلان وإثبات وصول الورقة إلى المعلن إليه.",
          hint: "لا تنظر إلى الوسيلة وحدها؛ راقب الهوية، العنوان، والأثر القابل للإثبات.",
          success: "قرار سليم. أنشأت رابطاً بين التبليغ وحق الدفاع وبدء المواعيد.",
          error: "الإعلان غير الموثق قد يهدد الأثر الإجرائي ولو بدا سريعاً.",
        },
        {
          short: "الحكم",
          facts: ["حكم نهائي", "قوة تنفيذية", "منطوق محدد"],
          prompt: "متى ينتقل الحكم في هذا السيناريو إلى خانة السند التنفيذي؟",
          options: [
            { text: "عندما تتوافر له القوة التنفيذية وفق القانون ويكون منطوقه قابلاً للتنفيذ", correct: true },
            { text: "فور كتابة مسودة الحكم وقبل صدوره", correct: false },
            { text: "بمجرد إرسال صورة الحكم غير الموقعة إلى المدين", correct: false },
          ],
          sourceTitle: "كتاب التنفيذ الجبري، ص 8–100",
          sourceText: "السند التنفيذي وشروط مباشرة التنفيذ الجبري.",
          hint: "افصل بين وجود الحكم وبين قابليته للتنفيذ؛ القوة التنفيذية هي بوابة الغرفة التالية.",
          success: "صحيح. أصبح لدينا سند قابل للفحص قبل طلب التنفيذ.",
          error: "المسودة أو الصورة غير الموقعة لا تكفي وحدها لإنشاء مسار تنفيذ جبري.",
        },
        {
          short: "طلب التنفيذ",
          facts: ["قاضي التنفيذ", "ملف EX", "إعلان السند"],
          prompt: "ما المسار المؤسسي الصحيح بعد توافر السند التنفيذي؟",
          options: [
            { text: "إيداع طلب التنفيذ لدى الجهة المختصة تحت إشراف قاضي التنفيذ", correct: true },
            { text: "قيام طالب التنفيذ ببيع مال المدين بنفسه دون ملف تنفيذ", correct: false },
            { text: "بدء التوزيع قبل إعلان السند التنفيذي", correct: false },
          ],
          sourceTitle: "المادتان 206 و207 من قانون الإجراءات المدنية",
          sourceText: "إجراءات التنفيذ واختصاص قاضي التنفيذ.",
          hint: "قاضي التنفيذ هو بوابة الانتقال من الحق المثبت إلى الإجراء الجبري.",
          success: "أحسنت. أنشأت ملف التنفيذ قبل اختيار وسيلة الحجز.",
          error: "التنفيذ الذاتي أو التوزيع المبكر يتجاوز إشراف قاضي التنفيذ وشروط الملف.",
        },
        {
          short: "مهلة الوفاء",
          facts: ["إعلان السند", "7 أيام", "وفاء طوعي"],
          prompt: "ما الذي يجب أن يسجله المنفذ الافتراضي قبل الانتقال للحجز؟",
          options: [
            { text: "إعلان السند التنفيذي ومضي مهلة الوفاء العامة البالغة سبعة أيام، ما لم يوجد استثناء", correct: true },
            { text: "اعتبار طلب التنفيذ وحده بديلاً عن إعلان السند", correct: false },
            { text: "إجراء البيع خلال يوم الإعلان مباشرة في كل الحالات", correct: false },
          ],
          sourceTitle: "المادة 233 من قانون الإجراءات المدنية",
          sourceText: "مهلة الوفاء بعد إعلان السند التنفيذي.",
          hint: "ضع الإعلان والمهلة كبوابتين منفصلتين في الخط الزمني.",
          success: "سجلت الإعلان وانقضاء مهلة الوفاء قبل الحجز.",
          error: "طلب التنفيذ لا يمحو شرط الإعلان والمهلة إلا في حالات استثنائية محددة.",
        },
        {
          short: "الحجز لدى الغير",
          facts: ["بنك الغير", "أمر حجز", "تقرير خلال 7 أيام"],
          prompt: "للوصول إلى أموال المدين لدى البنك، ما تسلسل الإجراء الأدق؟",
          options: [
            { text: "طلب أمر الحجز ثم إعلان الغير وتتبّع تقريره خلال الميعاد", correct: true },
            { text: "مخاطبة البنك شفهياً واعتبار المبلغ محصلاً فوراً", correct: false },
            { text: "إجراء حجز تحفظي جديد بعد صدور السند التنفيذي دون بيان الغير", correct: false },
          ],
          sourceTitle: "المادتان 252 و256 من قانون الإجراءات المدنية",
          sourceText: "الحجز لدى الغير، أمر الحجز، وتقرير الغير.",
          hint: "في الحجز لدى الغير، يصبح الغير حلقة إجرائية لا مجرد عنوان مالي.",
          success: "ممتاز. اكتمل المسار من الأمر إلى الإعلان ثم التقرير.",
          error: "الحجز لدى الغير يحتاج أمراً وإعلاناً وتقريراً، لا مجرد مطالبة خارج الملف.",
        },
        {
          short: "التوزيع",
          facts: ["حصيلة محصلة", "دائنون", "محضر توزيع"],
          prompt: "متى يصبح ملف التوزيع جاهزاً في هذا السيناريو؟",
          options: [
            { text: "بعد تحقق واقعة الحجز أو البيع أو تقرير الغير وانقضاء الأجل الإجرائي اللازم", correct: true },
            { text: "قبل أن يورد الغير تقريره أو تُحصّل أي حصيلة", correct: false },
            { text: "فور قيد الدعوى الأصلية ولو لم يصدر سند تنفيذي", correct: false },
          ],
          sourceTitle: "المادة 310 من قانون الإجراءات المدنية",
          sourceText: "توزيع حصيلة التنفيذ بعد الحجز أو البيع أو تقرير الغير.",
          hint: "التوزيع خاتمة السلسلة، ولذلك يحتاج حصيلة حقيقية وملفاً قابلاً للمفاضلة بين الدائنين.",
          success: "اكتملت الرحلة: دعوى، حكم، سند، حجز، تحصيل، ثم توزيع.",
          error: "لا توزيع بلا حصيلة تنفيذية وبلا تحقق من الأجل الذي يسبق التوزيع.",
        },
      ],
    },
    provisional: {
      label: "الحجز التحفظي والإشكال",
      caseLabel: "ملف رقم UAEU–002",
      title: "الحجز التحفظي والإشكال في التنفيذ",
      stages: [
        {
          short: "خطر الاستعجال",
          facts: ["دين ظاهر", "خشية تهريب", "إجراء تحفظي"],
          prompt: "ما الذي يبرر التفكير في الحجز التحفظي قبل اكتمال دعوى الموضوع؟",
          options: [
            { text: "خشية جدية من فقدان الضمان مع ظهور أصل الحق وتوافر موجب الاستعجال", correct: true },
            { text: "رغبة الدائن في معاقبة المدين قبل سماع دفاعه", correct: false },
            { text: "مجرد وجود خلاف تجاري دون حق ظاهر أو خطر", correct: false },
          ],
          sourceTitle: "المادة 247 من قانون الإجراءات المدنية",
          sourceText: "شروط الحجز التحفظي وارتباطه بدعوى الحق.",
          hint: "الحجز التحفظي ضمان مؤقت، لا بديل عن إثبات الحق في دعوى الموضوع.",
          success: "صحيح. ربطت الإجراء بالخطر والحق الظاهر لا بالعقوبة.",
          error: "الحجز التحفظي ليس جزاءً؛ يحتاج حقاً ظاهراً وخطراً يبرر التدخل المؤقت.",
        },
        {
          short: "أمر الحجز",
          facts: ["قاضي مختص", "قائمة الأموال", "ضمان"],
          prompt: "ما أفضل طريقة لصياغة الطلب التحفظي أمام القاضي؟",
          options: [
            { text: "بيان الحق والخطر والأموال المراد حجزها وطلب الإجراء المؤقت مع احترام متطلبات الضمان", correct: true },
            { text: "طلب حجز جميع أموال المدين بلا تحديد أو تسبيب", correct: false },
            { text: "طلب بيع الأموال فوراً لأن الحجز التحفظي يعادل التنفيذ", correct: false },
          ],
          sourceTitle: "كتاب التنفيذ الجبري، ص 153–250",
          sourceText: "إجراءات الحجز التحفظي وحدوده وآثاره.",
          hint: "دقة الطلب تقلل مساحة التقدير غير المنضبط وتُظهر تناسب الإجراء.",
          success: "أحسنت. جعلت الطلب محدداً ومؤقتاً ومسنوداً بعناصره.",
          error: "التحديد والتسبيب والضمان هي التي تفصل الإجراء التحفظي عن الطلب العام.",
        },
        {
          short: "دعوى الموضوع",
          facts: ["ميعاد 8 أيام", "دعوى الحق", "استمرار التحفظ"],
          prompt: "بعد توقيع الحجز التحفظي، ما الالتزام الإجرائي الحاسم؟",
          options: [
            { text: "رفع دعوى تثبيت الحق خلال ثمانية أيام من توقيع الحجز ما لم يرد حكم أو استثناء", correct: true },
            { text: "انتظار انتهاء الحجز ثم تقرير ما إذا كانت دعوى الموضوع لازمة", correct: false },
            { text: "تحويل الحجز تلقائياً إلى بيع نهائي بمجرد توقيعه", correct: false },
          ],
          sourceTitle: "المادة 247 من قانون الإجراءات المدنية",
          sourceText: "أجل الثمانية أيام لرفع دعوى صحة الحق.",
          hint: "أنشئ تنبيهاً فورياً في سجل الملف؛ فهذه محطة لا تحتمل النسيان.",
          success: "قرار دقيق. أضفت مهلة الثمانية أيام كشرط لاستمرار الحماية.",
          error: "الحجز التحفظي مرتبط بدعوى الموضوع ولا يتحول تلقائياً إلى تنفيذ نهائي.",
        },
        {
          short: "أثر التخلف",
          facts: ["انقضاء الميعاد", "زوال الأثر", "طلب رفع"],
          prompt: "ما النتيجة التعليمية الأقرب إذا لم ترفع دعوى الموضوع في الأجل؟",
          options: [
            { text: "يصبح استمرار الحجز معرضاً للزوال أو الرفع وفق القاعدة والإجراء الذي يطلبه ذوو الشأن", correct: true },
            { text: "يتحول الحجز تلقائياً إلى حكم نهائي لصالح طالب الحجز", correct: false },
            { text: "لا يترتب أي أثر لأن الميعاد إرشادي دائماً", correct: false },
          ],
          sourceTitle: "كتاب التنفيذ الجبري، ص 153–250",
          sourceText: "أثر عدم رفع دعوى الموضوع في الميعاد.",
          hint: "اسأل: ما وظيفة الحجز؟ إذا انتهى غرضه المؤقت بلا دعوى، يضعف أساس استمراره.",
          success: "أحسنت. فهمت أن الإجراء المؤقت لا يعيش مستقلاً عن غايته.",
          error: "لا تنتج الحماية المؤقتة حكماً بالحق لمجرد أن صاحبها لم يرفع دعواه.",
        },
        {
          short: "الإشكال الوقتي",
          facts: ["منازعة تنفيذ", "وقف مؤقت", "قاضي التنفيذ"],
          prompt: "ما الأثر الابتدائي للإشكال الوقتي في التنفيذ؟",
          options: [
            { text: "يُعرض على قاضي التنفيذ، ولا يوقف التنفيذ تلقائياً إلا وفق القرار والضوابط المقررة", correct: true },
            { text: "يوقف كل تنفيذ بقوة القانون بمجرد تقديم ورقة الإشكال", correct: false },
            { text: "يحال دائماً إلى محكمة الموضوع دون نظر قاضي التنفيذ", correct: false },
          ],
          sourceTitle: "المادة 239 من قانون الإجراءات المدنية",
          sourceText: "الإشكال الوقتي والاختصاص والقرار في الاستمرار أو الوقف.",
          hint: "ميّز بين تقديم الإشكال وبين صدور قرار قضائي بشأن أثره.",
          success: "ممتاز. فرّقت بين الإيداع والأثر، وهي لبّ منازعة التنفيذ الوقتية.",
          error: "مجرد تسمية الطلب إشكالاً لا تنشئ وقفاً تلقائياً في كل حالة.",
        },
        {
          short: "الكفالة",
          facts: ["5000 د.إ", "استثناءات", "وقف التنفيذ"],
          prompt: "ما الذي يجب أن تراجعه عند طلب وقف التنفيذ بسبب إشكال موضوعي؟",
          options: [
            { text: "شرط الكفالة المقررة عند الاقتضاء، وقدرها الافتراضي هنا خمسة آلاف درهم، مع مراجعة الاستثناء", correct: true },
            { text: "اعتبار الكفالة غير لازمة لأن الإشكال يوقف التنفيذ بذاته", correct: false },
            { text: "إيداع كامل قيمة الدين دائماً دون صلة بقرار المحكمة", correct: false },
          ],
          sourceTitle: "المادة 241 من قانون الإجراءات المدنية",
          sourceText: "الكفالة في منازعة التنفيذ الموضوعية وأثرها.",
          hint: "لا تحفظ الرقم وحده؛ اربطه بقرار الوقف والاستثناءات الواردة في النص.",
          success: "أضفت الكفالة إلى قائمة التحقق، ولم تفترض وقفاً آلياً.",
          error: "الكفالة مرتبطة بحالة الطلب وقرار المحكمة، وليست بديلاً عن تحليل الإشكال.",
        },
      ],
    },
  };

  const quizQuestions = [
    {
      topic: "الاختصاص والقيد", difficulty: "تمهيدي", prompt: "ما الذي ينبغي فحصه أولاً عند بناء صحيفة الدعوى؟", source: "المادة 44 · كتاب المرافعات ص 132–147", remediation: 5,
      options: ["المحكمة المختصة وبيانات الأطراف والطلبات", "حصيلة البيع وتوزيعها", "تقرير الغير عن الدين المحجوز"], answer: 0,
    },
    {
      topic: "الإعلان والميعاد", difficulty: "تمهيدي", prompt: "ما قيمة توثيق الهوية وواقعة الاستلام أو الرفض في التبليغ؟", source: "المادة 49 · كتاب المرافعات ص 155–170", remediation: 6,
      options: ["عنصر شكلي لا أثر له متى أرسلت الورقة", "يساعد في إثبات وصول الورقة وترتيب أثر الميعاد", "يغني عن تحديد عنوان المعلن إليه"], answer: 1,
    },
    {
      topic: "الحجز التحفظي", difficulty: "متوسط", prompt: "ما الميعاد الذي تختبره المحاكاة لرفع دعوى الموضوع بعد الحجز التحفظي؟", source: "المادة 247 · كتاب التنفيذ ص 153–250", remediation: 7,
      options: ["8 أيام", "3 أيام عمل", "30 يوماً"], answer: 0,
    },
    {
      topic: "الحجز لدى الغير", difficulty: "متوسط", prompt: "أي تسلسل يعبّر عن الحجز لدى الغير؟", source: "المادتان 252 و256 · كتاب التنفيذ ص 153–250", remediation: 8,
      options: ["بيع مباشر ثم إخطار البنك", "طلب توزيع قبل الإعلان", "أمر حجز ثم إعلان الغير ثم تقريره"], answer: 2,
    },
    {
      topic: "التوزيع", difficulty: "متقدم", prompt: "ما الشرط الإجرائي الذي يسبق فتح التوزيع في السيناريو؟", source: "المادة 310 · كتاب التنفيذ ص 251–262", remediation: 9,
      options: ["مجرد قيد الدعوى الأصلية", "تكوّن حصيلة من الحجز أو البيع أو تقرير الغير وانقضاء الأجل اللازم", "تقديم اعتراض شفهي من المدين"], answer: 1,
    },
    {
      topic: "مراجعة الصحيفة", difficulty: "معالجة", prompt: "أي صياغة تصلح لتقوية صحيفة الدعوى؟", source: "المادة 44 · كتاب المرافعات ص 132–147", remediation: null,
      options: ["أطلب كل ما يلزم دون تحديد", "أحدد المحكمة والخصوم والطلبات والوقائع والأسانيد في بنية واحدة", "أبدأ بمحضر البيع قبل عرض الحق"], answer: 1,
    },
    {
      topic: "معالجة الإعلان", difficulty: "معالجة", prompt: "إذا كان العنوان معلوماً، فما الخيار التدريبي الأكثر اتساقاً مع سجل التبليغ؟", source: "المادة 49 · كتاب المرافعات ص 155–170", remediation: null,
      options: ["النشر دائماً دون فحص البدائل", "وسيلة موثقة مع عنوان وهوية وأثر استلام أو رفض", "إغفال إثبات المستلم لأن الورقة وصلت إلى المبنى"], answer: 1,
    },
    {
      topic: "معالجة الحجز التحفظي", difficulty: "معالجة", prompt: "ما الذي يجب أن يتبع الحجز التحفظي في سجل الطالب؟", source: "المادة 247 · كتاب التنفيذ ص 153–250", remediation: null,
      options: ["رفع دعوى الموضوع خلال 8 أيام", "فتح التوزيع فوراً", "اعتبار الحجز حكماً نهائياً"], answer: 0,
    },
    {
      topic: "معالجة الحجز لدى الغير", difficulty: "معالجة", prompt: "ما دور الغير في الحجز لدى الغير؟", source: "المادتان 252 و256 · كتاب التنفيذ ص 153–250", remediation: null,
      options: ["لا دور له بعد صدور الحكم", "يُعلن ويقدم تقريراً عن المال أو الدين المحجوز", "يتولى توزيع الحصيلة بنفسه"], answer: 1,
    },
    {
      topic: "معالجة التوزيع", difficulty: "معالجة", prompt: "أي عبارة تمنع القفز إلى التوزيع؟", source: "المادة 310 · كتاب التنفيذ ص 251–262", remediation: null,
      options: ["لا توزيع قبل تحقق الحصيلة والأجل الإجرائي", "التوزيع يسبق الحجز", "يكفي طلب الدائن وحده لفتح التوزيع"], answer: 0,
    },
  ];

  const defaultState = {
    view: "dashboard",
    scenario: "claim",
    stage: 0,
    simScore: 0,
    simSelections: {},
    decisionHistory: [],
    activity: [],
    files: 0,
    aiType: "claim",
    draft: "",
    role: "student",
    courtTranscript: [],
    noticeResult: null,
    executionChoice: null,
    judgmentTitle: "",
    judgmentText: "",
    judgmentFileName: "",
    judgmentAnalysis: null,
    quizQueue: [0, 1, 2, 3, 4],
    quizIndex: 0,
    quizSelection: null,
    quizHistory: [],
  };

  let state = loadState();

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      const merged = saved ? { ...defaultState, ...saved } : { ...defaultState };
      if (!merged.simSelections || typeof merged.simSelections !== "object") merged.simSelections = {};
      if (!Array.isArray(merged.decisionHistory)) merged.decisionHistory = [];
      if (!Array.isArray(merged.activity)) merged.activity = [];
      if (!Array.isArray(merged.courtTranscript)) merged.courtTranscript = [];
      if (!Array.isArray(merged.quizQueue) || !merged.quizQueue.length) merged.quizQueue = [0, 1, 2, 3, 4];
      if (!Array.isArray(merged.quizHistory)) merged.quizHistory = [];
      if (!Number.isInteger(merged.quizIndex)) merged.quizIndex = 0;
      if (typeof merged.judgmentTitle !== "string") merged.judgmentTitle = "";
      if (typeof merged.judgmentText !== "string") merged.judgmentText = "";
      if (typeof merged.judgmentFileName !== "string") merged.judgmentFileName = "";
      return merged;
    } catch (error) {
      return { ...defaultState };
    }
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (error) { /* private browsing */ }
  }

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function showToast(message) {
    const toast = $("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 3200);
  }

  function currentScenario() { return scenarios[state.scenario]; }
  function selectionKey(scenario = state.scenario, stage = state.stage) { return `${scenario}-${stage}`; }

  function addActivity(title, detail, score = "") {
    state.activity.unshift({ title, detail, score, at: new Date().toLocaleTimeString("ar-AE", { hour: "2-digit", minute: "2-digit" }) });
    state.activity = state.activity.slice(0, 8);
  }

  function setView(view) {
    if (!$("#view-" + view)) view = "dashboard";
    state.view = view;
    $$(".view").forEach((node) => node.classList.toggle("active", node.id === `view-${view}`));
    $$(".nav-item").forEach((node) => node.classList.toggle("active", node.dataset.view === view));
    const title = $("#view-" + view)?.dataset.title || "لوحة المختبر";
    $("#viewTitle").textContent = title;
    $("#sidebar").classList.remove("open");
    renderView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderView(view) {
    if (view === "dashboard") renderDashboard();
    if (view === "simulator") renderSimulator();
    if (view === "court") renderCourt();
    if (view === "ai") renderAI();
    if (view === "judgment") renderJudgment();
    if (view === "quiz") renderQuiz();
    if (view === "map") renderMap();
    if (view === "notice") renderNotice();
    if (view === "execution") renderExecution();
    if (view === "sources") renderSources();
  }

  function renderDashboard() {
    const totalStages = scenarios.claim.stages.length + scenarios.provisional.stages.length;
    const completed = new Set(state.decisionHistory.filter((item) => item.correct).map((item) => `${item.scenario}-${item.stage}`)).size;
    const progress = Math.min(100, Math.round((completed / totalStages) * 100));
    const attempts = state.decisionHistory.length;
    const correct = state.decisionHistory.filter((item) => item.correct).length;
    const accuracy = attempts ? Math.round((correct / attempts) * 100) : null;
    $("#metricProgress").textContent = `${progress}%`;
    $("#metricProgressBar").style.width = `${progress}%`;
    $("#metricAccuracy").textContent = accuracy === null ? "—" : `${accuracy}%`;
    $("#metricAccuracySuffix").textContent = accuracy === null ? "" : " دقة";
    $("#metricFiles").textContent = String(state.files || 0);
    const level = progress >= 80 ? ["متمكن", "اكتمال المسار"] : progress >= 45 ? ["محلل", "أكمل المسار المتبقي"] : progress >= 15 ? ["ممارس", "خطوتان للترقية"] : ["مستكشف", "أكمل أول قرارين للترقية"];
    $("#metricLevel").textContent = level[0];
    $("#metricLevelNote").textContent = level[1];
    const bars = $$(".level-steps span");
    const filled = progress >= 80 ? 5 : progress >= 45 ? 4 : progress >= 15 ? 3 : 2;
    bars.forEach((bar, index) => bar.classList.toggle("filled", index < filled));

    const list = $("#activityList");
    if (!state.activity.length) {
      list.innerHTML = '<div class="empty-state">لا توجد قرارات بعد. ابدأ بأحد المسارات أعلاه.</div>';
    } else {
      list.innerHTML = state.activity.slice(0, 5).map((item) => `<div class="activity-row"><span class="activity-mark">✓</span><div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.detail)} · ${escapeHtml(item.at)}</small></div><span class="activity-score">${escapeHtml(item.score || "محفوظ")}</span></div>`).join("");
    }
  }

  function switchScenario(scenario) {
    if (!scenarios[scenario]) return;
    state.scenario = scenario;
    state.stage = 0;
    saveState();
    renderSimulator();
    $$(".scenario-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.scenario === scenario));
  }

  function renderSimulator() {
    const scenario = currentScenario();
    const stage = scenario.stages[state.stage];
    const chosen = state.simSelections[selectionKey()];
    $("#simScore").textContent = String(state.simScore || 0);
    $("#simCaseLabel").textContent = scenario.caseLabel;
    $("#simCaseTitle").textContent = scenario.title;
    $("#simStatus").textContent = `المحطة ${state.stage + 1} من ${scenario.stages.length}`;
    $("#stageTrack").innerHTML = scenario.stages.map((item, index) => `<div class="stage-item ${index < state.stage ? "done" : ""} ${index === state.stage ? "active" : ""}"><div class="stage-line"></div><span>${escapeHtml(item.short)}</span></div>`).join("");
    $("#caseFacts").innerHTML = stage.facts.map((fact) => `<span class="fact-chip">${escapeHtml(fact)}</span>`).join("");
    $("#decisionPrompt").textContent = stage.prompt;
    $("#decisionCounter").textContent = chosen ? (chosen.correct ? "قرار سليم · يمكنك المتابعة" : "راجع الاختيار وأعد المحاولة") : "اختر إجابة واحدة";
    $("#decisionOptions").innerHTML = stage.options.map((option, index) => {
      let stateClass = "";
      if (chosen && chosen.index === index && chosen.correct) stateClass = "correct";
      if (chosen && chosen.index === index && !chosen.correct) stateClass = "incorrect";
      return `<button class="decision-button ${stateClass}" data-decision-index="${index}"><span class="option-letter">${String.fromCharCode(65 + index)}</span><span>${escapeHtml(option.text)}</span></button>`;
    }).join("");
    const feedback = $("#simFeedback");
    if (chosen) {
      feedback.className = `sim-feedback ${chosen.correct ? "success" : "error"}`;
      feedback.innerHTML = `<strong>${chosen.correct ? "✓ قرار سليم" : "! يحتاج إلى مراجعة"}</strong><span>${escapeHtml(chosen.correct ? stage.success : `${stage.error} الإجابة التي تحقق الغرض هي: ${stage.options.find((item) => item.correct).text}`)}</span>`;
    } else {
      feedback.className = "sim-feedback hidden";
      feedback.innerHTML = "";
    }
    $("#simPrev").disabled = state.stage === 0;
    $("#simPrev").style.opacity = state.stage === 0 ? ".45" : "1";
    $("#simNext").disabled = !chosen?.correct;
    $("#simNext").textContent = state.stage === scenario.stages.length - 1 ? "إنهاء السيناريو ✓" : "المحطة التالية →";
    $("#simSourceTitle").textContent = stage.sourceTitle;
    $("#simSourceText").textContent = stage.sourceText;
    $("#simHint").textContent = stage.hint;
    renderLedger();
    $$(".scenario-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.scenario === state.scenario));
  }

  function renderLedger() {
    const items = state.decisionHistory.filter((item) => item.scenario === state.scenario).slice(-6).reverse();
    const list = $("#ledgerList");
    if (!items.length) {
      list.innerHTML = '<div class="empty-state compact">ستظهر هنا آثار قراراتك.</div>';
      return;
    }
    list.innerHTML = items.map((item) => `<div class="ledger-row"><i>${item.correct ? "✓" : "!"}</i><div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.detail)}</small></div><span class="ledger-score">${item.correct ? "+10" : "مراجعة"}</span></div>`).join("");
  }

  function chooseDecision(index) {
    const scenario = currentScenario();
    const stage = scenario.stages[state.stage];
    const option = stage.options[index];
    if (!option) return;
    const key = selectionKey();
    const previous = state.simSelections[key];
    const result = { index, correct: Boolean(option.correct) };
    state.simSelections[key] = result;
    state.decisionHistory.push({ scenario: state.scenario, stage: state.stage, title: stage.short, detail: option.text, correct: Boolean(option.correct) });
    if (option.correct && !previous?.correct) {
      state.simScore = (state.simScore || 0) + 10;
      addActivity(`قرار سليم: ${stage.short}`, scenario.title, "+10 نقطة");
      showToast("تم تسجيل القرار في السجل الإجرائي.");
    } else if (!option.correct) {
      addActivity(`مراجعة مطلوبة: ${stage.short}`, "المحاكاة الإجرائية", "إعادة المحاولة");
      showToast("راجع أثر القرار ثم أعد المحاولة.");
    }
    saveState();
    renderSimulator();
    renderDashboard();
  }

  function advanceStage() {
    const scenario = currentScenario();
    if (!state.simSelections[selectionKey()]?.correct) return;
    if (state.stage < scenario.stages.length - 1) {
      state.stage += 1;
      saveState();
      renderSimulator();
    } else {
      addActivity("اكتمل السيناريو", scenario.title, "إنجاز");
      saveState();
      renderDashboard();
      showToast("أحسنت، اكتمل المسار الإجرائي. يمكنك الآن دخول المحكمة الافتراضية.");
    }
  }

  const courtActions = {
    claim: { lawyer: "أتمسك بطلب الحجز لدى الغير وألتمس إعلان البنك وتكليفه بالتقرير ضمن الميعاد.", judge: "يثبت الطلب في محضر الجلسة. على طالب التنفيذ بيان السند، والغير، ومقدار الدين محل الحجز. أشر إلى المادة 252 في مذكرة مختصرة." },
    defense: { lawyer: "أدفع ببطلان التبليغ لعدم ثبوت هوية المستلم وعدم تمكيني من العلم بمضمون السند.", judge: "الدفع منتج إذا مسّ العلم وحق الدفاع. أطلب من موظف التبليغ إبراز أثر التسليم أو الرفض والعنوان المعتمد قبل تقرير الأثر." },
    objection: { lawyer: "أطلب وقف التنفيذ مؤقتاً إلى حين الفصل في منازعتي، مع بيان وجه الجدية وطلب الإجراء المناسب.", judge: "يُقيد الطلب كمنازعة تنفيذ وقتية. تقديم الإشكال لا يغني عن قرار القاضي في الوقف؛ افصل بين الأثر الابتدائي والقرار القضائي وفق المادة 239." },
    officer: { lawyer: "أبرز محضر الحجز وإعلان السند وتاريخ انقضاء مهلة الوفاء.", judge: "يُضم المحضر إلى ملف الجلسة. على مأمور التنفيذ أن يبين التسلسل الزمني بدقة، ولا سيما تاريخ الإعلان ومضي مهلة الوفاء." },
    judge: { lawyer: "ألتمس تحديد أجل لتقديم التقرير والمذكرة الختامية.", judge: "يحدد أجل تدريبي قدره ثلاثة أيام للمذكرة، مع إثبات الإجراء في السجل. الجلسة التالية لا تعالج نقصاً كان يمكن تداركه الآن." },
  };

  function renderCourt() {
    const transcript = $("#courtTranscript");
    if (!state.courtTranscript.length) {
      state.courtTranscript = [
        { role: "judge", speaker: "القاضي الافتراضي", text: "تفتتح الجلسة. هذه محاكاة تعليمية لمنازعة تنفيذ، وعلى كل طرف أن يربط طلبه بواقعة ومادة وأثر.", at: "09:00" },
        { role: "lawyer", speaker: "المحامي الافتراضي", text: "حاضر. أتمسك بأن الملف يتضمن سنداً تنفيذياً معلناً، وأطلب توجيه الجلسة إلى الإجراء محل المنازعة.", at: "09:01" },
      ];
      saveState();
    }
    transcript.innerHTML = state.courtTranscript.map((line) => `<div class="transcript-row ${escapeHtml(line.role)}"><span class="transcript-avatar">${escapeHtml(line.role === "judge" ? "ق" : line.role === "lawyer" ? "مح" : line.role === "opponent" ? "خص" : line.role === "officer" ? "من" : "ت")}</span><div><strong>${escapeHtml(line.speaker)} <small style="color:#a0adba;font-weight:400">· ${escapeHtml(line.at || "الآن")}</small></strong><p>${escapeHtml(line.text)}</p></div></div>`).join("");
    transcript.scrollTop = transcript.scrollHeight;
    $("#courtTurnLabel").textContent = `الدور: ${roleLabel(state.role)}`;
    $$(".role-choice").forEach((choice) => choice.classList.toggle("active", choice.dataset.role === state.role));
  }

  function roleLabel(role) {
    return { student: "الطالب / المحامي", judge: "القاضي الافتراضي", opponent: "الخصم الافتراضي", officer: "المنفذ الافتراضي", notice: "موظف التبليغ" }[role] || "الطالب";
  }

  function courtSpeak() {
    const action = $("#courtAction").value;
    const data = courtActions[action];
    if (!data) return;
    const speakerByRole = { student: "المحامي الافتراضي", judge: "القاضي الافتراضي", opponent: "الخصم الافتراضي", officer: "المنفذ الافتراضي", notice: "موظف التبليغ" };
    const roleByState = { student: "lawyer", judge: "judge", opponent: "opponent", officer: "officer", notice: "notice" };
    let statement = data.lawyer;
    if (state.role === "opponent") statement = action === "defense" ? "أتمسك بأن الإعلان لم يثبت علماً صحيحاً، وأطلب عدم ترتيب أثر التنفيذ على الورقة محل المنازعة." : "أعارض الطلب لعدم بيان وجه الجدية ولأن التنفيذ يجب أن يستمر ما لم يصدر قرار بالوقف.";
    if (state.role === "officer") statement = action === "officer" ? "أبرز محضر التنفيذ، وأثبت تواريخ الإعلان والحجز والتقرير في السجل الإلكتروني." : "أوضح أن دوري يقتصر على تنفيذ قرار قاضي التنفيذ وإثبات الواقعة، لا الفصل في المنازعة.";
    if (state.role === "notice") statement = "أثبت واقعة التبليغ ووسيلته وهوية المستلم أو الرفض، وأضع أثر الاستلام في متناول المحكمة.";
    if (state.role === "judge") statement = data.judge;
    const now = new Date().toLocaleTimeString("ar-AE", { hour: "2-digit", minute: "2-digit" });
    state.courtTranscript.push({ role: roleByState[state.role], speaker: speakerByRole[state.role], text: statement, at: now });
    state.courtTranscript.push({ role: "judge", speaker: "القاضي الافتراضي", text: data.judge, at: now });
    state.files += 1;
    addActivity("مداخلة في المحكمة الافتراضية", roleLabel(state.role), "محضر جلسة");
    saveState();
    renderCourt();
    renderDashboard();
    showToast("أضيفت المداخلة وتعليل القاضي إلى محضر الجلسة.");
  }

  function wordCount(text) { return text.trim() ? text.trim().split(/\s+/).length : 0; }

  function renderAI() {
    const textarea = $("#aiDraft");
    if (textarea && textarea.value !== state.draft) textarea.value = state.draft || "";
    $("#draftCount").textContent = `${wordCount(textarea?.value || state.draft)} كلمة`;
    $$(".workbench-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.docType === state.aiType));
  }

  function currentQuizQuestion() {
    const queue = Array.isArray(state.quizQueue) && state.quizQueue.length ? state.quizQueue : [0, 1, 2, 3, 4];
    return quizQuestions[queue[state.quizIndex]] || null;
  }

  function renderQuiz() {
    if (!Array.isArray(state.quizQueue) || !state.quizQueue.length) state.quizQueue = [0, 1, 2, 3, 4];
    const queueLength = state.quizQueue.length;
    const attempts = state.quizHistory.length;
    const correct = state.quizHistory.filter((item) => item.correct).length;
    const mastery = attempts ? Math.round((correct / attempts) * 100) : 0;
    $("#quizMastery").textContent = `${mastery}%`;
    $("#quizProgressLabel").textContent = state.quizIndex >= queueLength ? "اكتملت الجلسة" : `السؤال ${state.quizIndex + 1} من ${queueLength}`;
    $("#quizProgressBar").style.width = `${Math.min(100, Math.round((Math.min(state.quizIndex, queueLength) / queueLength) * 100))}%`;
    renderWeaknesses();
    const question = currentQuizQuestion();
    const nextButton = $("#quizNext");
    if (!question) {
      $("#quizTopic").textContent = "جلسة مكتملة";
      $("#quizDifficulty").textContent = mastery >= 80 ? "إتقان جيد" : "خطة مراجعة";
      $("#quizQuestionType").textContent = "نتيجة البنك التكيّفي";
      $("#quizPrompt").textContent = mastery >= 80 ? "أحسنت. انتقلت من الإجابة إلى تحليل أثرها الإجرائي." : "اكتملت الجلسة. استخدم نقاط المراجعة الجانبية لإعادة المحطات التي أخطأت فيها.";
      $("#quizOptions").innerHTML = `<div class="quiz-complete"><span>✓</span><strong>${correct} من ${attempts} إجابات سليمة</strong><small>يمكنك إعادة جلسة جديدة بالضغط على الزر أدناه.</small></div>`;
      $("#quizFeedback").className = "quiz-feedback success";
      $("#quizFeedback").innerHTML = "تم تحديث مؤشر الإتقان محلياً.";
      $("#quizSource").textContent = "السجل محفوظ على هذا الجهاز";
      nextButton.disabled = false;
      nextButton.textContent = "جلسة جديدة ↻";
      return;
    }
    $("#quizTopic").textContent = question.topic;
    $("#quizDifficulty").textContent = question.difficulty;
    $("#quizQuestionType").textContent = question.difficulty === "معالجة" ? "سؤال علاج الفجوة" : "سؤال اختيار من متعدد";
    $("#quizPrompt").textContent = question.prompt;
    $("#quizOptions").innerHTML = question.options.map((option, index) => {
      const selected = state.quizSelection && state.quizSelection.index === index;
      const cls = selected ? (state.quizSelection.correct ? "correct" : "incorrect") : "";
      return `<button class="quiz-option ${cls}" data-quiz-index="${index}"><span class="quiz-letter">${String.fromCharCode(65 + index)}</span><span>${escapeHtml(option)}</span></button>`;
    }).join("");
    const feedback = $("#quizFeedback");
    if (state.quizSelection) {
      feedback.className = `quiz-feedback ${state.quizSelection.correct ? "success" : "error"}`;
      feedback.innerHTML = state.quizSelection.correct ? "✓ إجابة سليمة. سيزيد السؤال التالي صعوبة المسار تدريجياً." : `! الإجابة تحتاج مراجعة. أضفنا سؤال معالجة عن «${escapeHtml(question.topic)}» إلى الجلسة.`;
    } else {
      feedback.className = "quiz-feedback hidden";
      feedback.innerHTML = "";
    }
    $("#quizSource").textContent = state.quizSelection ? question.source : "مرجع السؤال سيظهر بعد الإجابة";
    nextButton.disabled = !state.quizSelection;
    nextButton.textContent = "السؤال التالي →";
  }

  function answerQuiz(index) {
    const question = currentQuizQuestion();
    if (!question || !question.options[index]) return;
    if (state.quizSelection) return;
    const correct = index === question.answer;
    state.quizSelection = { index, correct };
    state.quizHistory.push({ topic: question.topic, correct, source: question.source });
    if (correct) addActivity(`إجابة سليمة: ${question.topic}`, "بنك الأسئلة التكيّفي", "+1");
    else addActivity(`فجوة مرصودة: ${question.topic}`, "تمت إضافة سؤال معالجة", "مراجعة");
    saveState();
    renderQuiz();
    renderDashboard();
  }

  function advanceQuiz() {
    if (state.quizIndex >= state.quizQueue.length) {
      state.quizQueue = [0, 1, 2, 3, 4];
      state.quizIndex = 0;
      state.quizSelection = null;
      saveState();
      renderQuiz();
      showToast("بدأت جلسة تكيفية جديدة.");
      return;
    }
    if (!state.quizSelection) return;
    const question = currentQuizQuestion();
    if (!state.quizSelection.correct && question.remediation !== null && question.remediation !== undefined) {
      const nextIndex = state.quizIndex + 1;
      if (state.quizQueue[nextIndex] !== question.remediation) state.quizQueue.splice(nextIndex, 0, question.remediation);
    }
    state.quizIndex += 1;
    state.quizSelection = null;
    saveState();
    renderQuiz();
  }

  function renderWeaknesses() {
    const list = $("#weaknessList");
    const misses = {};
    state.quizHistory.filter((item) => !item.correct).forEach((item) => { misses[item.topic] = (misses[item.topic] || 0) + 1; });
    const entries = Object.entries(misses).sort((a, b) => b[1] - a[1]).slice(0, 4);
    if (!entries.length) { list.innerHTML = '<div class="empty-state compact">أجب عن سؤالين لتظهر الإشارة.</div>'; return; }
    list.innerHTML = entries.map(([topic, count]) => `<div class="weakness-row"><span>!</span><div><strong>${escapeHtml(topic)}</strong><small>${count} محاولة تحتاج مراجعة</small></div><i class="weakness-bar"><i style="width:${Math.min(100, 42 + count * 18)}%"></i></i></div>`).join("");
  }

  function renderMap() {
    const active = $(".map-switcher button.active")?.dataset.map || "claimMap";
    $$(".map-switcher button").forEach((button) => button.classList.toggle("active", button.dataset.map === active));
    $$(".map-canvas").forEach((canvas) => canvas.classList.toggle("hidden", canvas.id !== active));
  }

  function localAI(type, prompt, draft) {
    const text = `${prompt || ""} ${draft || ""}`.toLowerCase();
    const points = [];
    const sources = [];
    let score = 66;
    if (text.includes("تبليغ") || type === "notice") {
      sources.push("المادة 49", "كتاب المرافعات ص 155–170");
      points.push({ tone: "ok", title: "محور التبليغ", text: "تحقق من هوية المعلن إليه، العنوان المعتمد، الوسيلة، وأثر الاستلام أو الرفض قبل ترتيب بدء الميعاد." });
      points.push({ tone: "warn", title: "سؤال تحقق", text: "هل أرفقت في المسودة دليلاً على وصول الورقة أو واقعة الرفض؟ اسم الوسيلة وحده لا يجيب عن هذا السؤال." });
    } else if (text.includes("حجز تحفظ") || text.includes("8 أيام") || type === "objection") {
      sources.push("المادة 247", "كتاب التنفيذ ص 153–250");
      points.push({ tone: "ok", title: "محور الإجراء المؤقت", text: "أبرز الحق الظاهر، وجه الاستعجال، والخطر الذي يهدد الضمان، ثم حدّد الأموال محل الإجراء دون تعميم." });
      points.push({ tone: "fix", title: "ميعاد لا يُغفل", text: "أضف تنبيهاً لرفع دعوى الموضوع خلال ثمانية أيام، وبيّن أثر التخلف عن الميعاد في طلبك." });
    } else if (text.includes("إشكال") || text.includes("وقف التنفيذ")) {
      sources.push("المادة 239", "المادة 241");
      points.push({ tone: "ok", title: "تحديد نوع المنازعة", text: "سمِّ المنازعة وقتية أو موضوعية، واشرح الأثر الذي تطلبه: استمرار التنفيذ أم وقفه مؤقتاً أم الفصل في أصل الحق." });
      points.push({ tone: "warn", title: "لا تفترض الوقف", text: "أضف بياناً لوجه الجدية والضرر، وراجع شرط الكفالة عند طلب الوقف في المنازعة الموضوعية." });
    } else if (text.includes("توزيع") || type === "execution") {
      sources.push("المادتان 233 و310", "كتاب التنفيذ ص 251–262");
      points.push({ tone: "ok", title: "تسلسل التنفيذ", text: "رتب السند والإعلان ومهلة الوفاء ثم الحجز أو التحصيل، ولا تقفز إلى التوزيع قبل تكوّن حصيلة قابلة للتوزيع." });
      points.push({ tone: "warn", title: "تخصيص أداة الحجز", text: "حدد هل المال لدى المدين أم لدى الغير؛ فالحجز لدى الغير يحتاج أمراً وإعلاناً وتقريراً من الغير." });
    } else {
      sources.push("المادة 44", "المادة 47", "كتاب المرافعات ص 132–179");
      points.push({ tone: "ok", title: "هيكل المسودة", text: "ابدأ باسم المحكمة، بيانات الخصوم، الوقائع، الطلبات، والأسانيد، ثم اربط كل طلب بواقعة ونتيجة إجرائية." });
      points.push({ tone: "warn", title: "نقطة ناقصة محتملة", text: "أضف الميعاد أو واقعة الإعلان أو سند الاختصاص إن لم تكن ظاهرة في النص الذي كتبته." });
    }
    if (draft && draft.length > 160) {
      score += 12;
      points.push({ tone: "ok", title: "تفصيل جيد", text: "المسودة تتضمن مادة كافية للتحليل الأولي. اطلب من الأستاذ مراجعة الأسماء والوقائع الواقعية قبل اعتمادها في التدريب." });
    } else {
      points.push({ tone: "fix", title: "مطلوب من الطالب", text: "أضف واقعة محددة وطلباً نهائياً واضحاً حتى يستطيع المساعد اختبار الصلة بين الوقائع والإجراء." });
    }
    return { score: Math.min(98, score), headline: score > 78 ? "بنية واعدة تحتاج صقلاً" : "مسودة أولية تحتاج استكمالاً", points, sources };
  }

  async function askAI() {
    const draft = $("#aiDraft").value.trim();
    const type = state.aiType;
    const prompt = draft || "راجع عناصر هذه المسودة وحدد نقاط القوة والنقص.";
    state.draft = draft;
    saveState();
    const button = $("#analyzeDraft");
    button.disabled = true;
    button.innerHTML = "يحلل المسودة…";
    let result;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1300);
      const response = await fetch("/api/ai/coach", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, prompt, draft, teacherMode: $("#teacherMode")?.checked !== false }), signal: controller.signal });
      clearTimeout(timeout);
      if (!response.ok) throw new Error("AI endpoint unavailable");
      result = await response.json();
    } catch (error) {
      result = localAI(type, prompt, draft);
    }
    renderAIResult(result);
    state.files += 1;
    addActivity("تحليل مسودة بالمدرب الذكي", documentTypeLabel(type), `${result.score || 0}%`);
    saveState();
    renderDashboard();
    button.disabled = false;
    button.innerHTML = "حلّل المسودة <span>✦</span>";
  }

  function documentTypeLabel(type) { return { claim: "صحيفة دعوى", execution: "طلب تنفيذ", objection: "اعتراض / إشكال", notice: "محضر تبليغ" }[type] || "مذكرة"; }

  function renderAIResult(result) {
    const response = $("#aiResponse");
    const points = Array.isArray(result.points) ? result.points : [];
    response.innerHTML = `<div class="ai-result-score"><span class="score-ring">${escapeHtml(result.score || 0)}%</span><div><strong>${escapeHtml(result.headline || "مراجعة أولية")}</strong><small>مؤشر تدريبي قابل للمراجعة مع الأستاذ</small></div></div><div class="ai-feedback-list">${points.map((point) => `<div class="ai-feedback-item ${escapeHtml(point.tone || "")}\"><strong>${escapeHtml(point.title)}</strong><p>${escapeHtml(point.text)}</p></div>`).join("")}</div><div class="ai-sources"><strong>مراجع مقترحة:</strong> ${(result.sources || []).map((source) => `<span>${escapeHtml(source)}</span>`).join("")}</div>`;
  }

  function judgmentSentences(text) {
    return text
      .replace(/\u00a0/g, " ")
      .replace(/\r/g, "")
      .split(/\n+|(?<=[.!؟؛])\s+/u)
      .map((sentence) => sentence.replace(/\s+/g, " ").trim())
      .filter((sentence) => sentence.length > 16);
  }

  function uniqueJudgment(items) {
    return [...new Set(items.map((item) => String(item || "").trim()).filter(Boolean))];
  }

  function pickJudgment(sentences, patterns, limit = 4) {
    return uniqueJudgment(sentences.filter((sentence) => patterns.some((pattern) => pattern.test(sentence)))).slice(0, limit);
  }

  function judgmentList(items, empty = "لم تُستخرج هذه الخانة آلياً؛ راجع النص الأصلي وأكملها مع الأستاذ.") {
    const values = items.length ? items : [empty];
    return values.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }

  function analyzeJudgmentLocal(text, title = "حكم مدني غير معنْون") {
    const sentences = judgmentSentences(text);
    const facts = pickJudgment(sentences, [/بتاريخ|وقع|حادث|عقد|ضرر|إصابة|اتفاق|واقعة|أقام|استأجر|تعاقد|أدى|نشأ/u], 5);
    const parties = pickJudgment(sentences, [/المدعي|المدعى عليه|الطاعن|المطعون عليه|المستأنف|المستأنف عليه|طالب|ضد/u], 5);
    const claims = pickJudgment(sentences, [/يلتمس|طلب|طلبات|دفع|يدفع|احتج|أسس|يستند|ينعى|تمسك/u], 5);
    const procedure = pickJudgment(sentences, [/محكمة|مجلس|ابتدائي|استئناف|نقض|طعن|حكم|قرار|قضت|أيدت|نقضت|إحالة/u], 6);
    const operative = pickJudgment(sentences, [/لهذه الأسباب|حكمت المحكمة|قضت المحكمة|قضت|حكمت|منطوق|أيدت|نقضت|رفضت|قبلت|صرحت/u], 4);
    const legalBases = pickJudgment(sentences, [/المادة|الفصل|القانون|مرسوم|قرار تشريعي|قانون/u], 6);
    const subjectLines = pickJudgment(sentences, [/مسؤولية|تعويض|عقد|بطلان|اختصاص|حيازة|إثبات|تنفيذ|ملكية|فسخ|إخلال|ضرر/u], 4);
    const dates = uniqueJudgment((text.match(/(?:بتاريخ|في|يوم)\s*\d{1,4}[\/.-]\d{1,2}[\/.-]\d{1,4}/gu) || []).slice(0, 6));
    const courts = uniqueJudgment((text.match(/(?:محكمة|مجلس|غرفة)[^،؛.\n]{0,70}/gu) || []).slice(0, 4));
    const caseNumber = (text.match(/(?:رقم|عدد)\s*[\w\-/]+/u) || [""])[0];
    const lower = text.toLowerCase();
    let issue;
    if (lower.includes("مسؤولية حارس") || lower.includes("حارس الشيء")) issue = "ما مدى توافر شروط مسؤولية حارس الشيء، وما وسائل دفعها، وكيف طبقتها المحكمة على وقائع النازلة؟";
    else if (lower.includes("اختصاص")) issue = "ما مدى اختصاص الجهة القضائية بالفصل في النزاع، وما الأثر المترتب على سلامة أو مخالفة قواعد الاختصاص؟";
    else if (lower.includes("بطلان") || lower.includes("إعلان") || lower.includes("تبليغ")) issue = "ما مدى صحة الإجراء محل النزاع، وما أثر العيب المدعى به على حقوق الدفاع وعلى النتيجة القضائية؟";
    else if (lower.includes("عقد") || lower.includes("فسخ") || lower.includes("إخلال")) issue = "ما القاعدة التي تحكم الالتزام أو الإخلال العقدي محل النزاع، وكيف أسقطتها المحكمة على الوقائع والأدلة؟";
    else if (lower.includes("تعويض") || lower.includes("ضرر")) issue = "ما شروط قيام المسؤولية واستحقاق التعويض، وهل أقامت المحكمة صلة كافية بين الفعل والضرر والنتيجة؟";
    else issue = "ما القاعدة القانونية التي تحكم النزاع، وكيف انتقلت المحكمة من الوقائع والادعاءات إلى الحل الوارد في المنطوق؟";

    const summaryParts = uniqueJudgment([...facts.slice(0, 2), ...procedure.slice(0, 2), ...claims.slice(0, 1)]);
    const summary = summaryParts.length ? summaryParts.join(" ") : "يحتاج الحكم إلى استخراج يدوي للوقائع والإجراءات قبل تحرير المقدمة.";
    const intro = `يتناول ${title} نزاعاً مدنياً يدور حول: ${issue} وتتلخص وقائعه وإجراءاته في: ${summary} ثم انتهت المحكمة إلى الحل الآتي: ${operative[0] || "يجب نقل المنطوق بدقة من الحكم الأصلي."}`;
    const objective = legalBases.length
      ? `تبدأ القراءة الموضوعية من ${legalBases.slice(0, 3).join("، ")}، ثم تفحص كيفية تفسير المحكمة للنص وربطه بوقائع الحكم. يجب مقارنة هذا التطبيق بالاجتهاد القضائي والاتجاه الفقهي ذي الصلة، لا الاكتفاء بترديد النتيجة.`
      : "لم يظهر في النص المقدم رقم مادة أو فصل واضح؛ أضف النصوص التي بنت عليها المحكمة حكمها، ثم اختبر وضوحها وتفسيرها وصلتها بالوقائع.";
    const personal = operative.length
      ? `التقييم الأولي: يظهر أن مركز التحليل يجب أن ينصب على تسبيب المحكمة قبل منطوقها، وعلى سؤال ما إذا كانت النتيجة قد التزمت بالقاعدة ووزعت عبء الإثبات توزيعاً سليماً. ${operative[0]}`
      : "التقييم الشخصي مؤجل إلى حين إدخال منطوق الحكم وحيثياته كاملة؛ لا يصح تقييم حكم دون معرفة الطريق الذي سلكته المحكمة.";
    const conclusion = "تخلص المسودة إلى أن قيمة الحكم لا تُقاس بالمنطوق وحده، بل بسلامة الانتقال من الوقائع إلى القاعدة ثم إلى النتيجة. بعد استكمال النصوص والاجتهادات السابقة، حدّد هل يكرّس الحكم اتجاهاً مستقراً أم يمثل تحولاً أو تمييزاً عن اتجاه سابق.";
    const missing = [];
    if (facts.length < 2) missing.push("الوقائع وتسلسلها الزمني");
    if (!parties.length) missing.push("أطراف النزاع وموضوعه");
    if (!claims.length) missing.push("طلبات الخصوم ودفوعهم");
    if (!procedure.length) missing.push("المراحل القضائية السابقة");
    if (!operative.length) missing.push("المنطوق أو الحل القضائي");
    if (!legalBases.length) missing.push("النصوص القانونية المستند إليها");
    const checks = [
      { label: "ظروف القضية", done: facts.length >= 2 },
      { label: "الأطراف والطلبات", done: parties.length > 0 && claims.length > 0 },
      { label: "المسار القضائي", done: procedure.length > 0 },
      { label: "الإشكال والمنطوق", done: operative.length > 0 },
      { label: "النصوص القانونية", done: legalBases.length > 0 },
    ];
    const score = Math.round((checks.filter((item) => item.done).length / checks.length) * 100);
    return { title, score, wordCount: text.split(/\s+/).filter(Boolean).length, dates, courts, caseNumber, facts, parties, claims, procedure, operative, legalBases, subjectLines, issue, intro, objective, personal, conclusion, missing, checks, reference: "التعليق على قرار: منهجية وتطبيق، مجلة المعرفة، العدد 14، مارس 2024، ص 421–428" };
  }

  function renderJudgment() {
    const textField = $("#judgmentText");
    const titleField = $("#judgmentTitle");
    if (!textField || !titleField) return;
    if (document.activeElement !== textField) textField.value = state.judgmentText || "";
    if (document.activeElement !== titleField) titleField.value = state.judgmentTitle || "";
    $("#judgmentCharCount").textContent = `${wordCount(textField.value)} كلمة`;
    $("#judgmentFileName").textContent = state.judgmentFileName ? `مرفق: ${state.judgmentFileName} · يمكنك مراجعة النص في المربع أدناه` : "لم يرفق ملف بعد · النص يبقى على هذا الجهاز";
    const result = $("#judgmentResult");
    if (!result) return;
    if (!state.judgmentAnalysis) {
      result.innerHTML = '<div class="judgment-empty"><div class="judgment-empty-icon">◈</div><h3>تقرير التحليل سيظهر هنا</h3><p>ابدأ بإدخال نص الحكم. سيحافظ التقرير على صلته بالحكم نفسه، ولا يحوله إلى بحث نظري منفصل عنه.</p><div class="judgment-empty-list"><span>✓ مسودة الوقائع والإجراءات</span><span>✓ الإشكال القانوني والمنطوق</span><span>✓ تصميم التعليق ومواطن التقييم</span></div></div>';
      return;
    }
    const analysis = state.judgmentAnalysis;
    const list = judgmentList;
    result.innerHTML = `<div class="judgment-report"><div class="judgment-report-head"><div><p class="eyebrow">تقرير تحليل أولي</p><h3>${escapeHtml(analysis.title)}</h3><small>${escapeHtml(analysis.reference)}</small></div><span class="judgment-score">${analysis.score}%<small>اكتمال الاستخراج</small></span></div><div class="judgment-kpi-grid"><div><span>عدد الكلمات</span><strong>${analysis.wordCount}</strong></div><div><span>التواريخ</span><strong>${analysis.dates.length}</strong></div><div><span>النصوص</span><strong>${analysis.legalBases.length}</strong></div><div><span>النواقص</span><strong>${analysis.missing.length}</strong></div></div><div class="judgment-report-section"><div class="judgment-section-head"><span>01</span><div><p class="eyebrow">مرحلة المسودة</p><h4>ظروف القضية وبناء الملف</h4></div></div><div class="judgment-two-col"><div><h5>الوقائع المستخرجة</h5><ul>${list(analysis.facts)}</ul></div><div><h5>الأطراف والطلبات</h5><ul>${list(uniqueJudgment([...analysis.parties, ...analysis.claims]))}</ul></div></div><div class="judgment-timeline"><strong>المسار القضائي</strong><ul>${list(analysis.procedure, "لم تظهر مراحل قضائية صريحة؛ استخرج المحكمة الابتدائية والاستئناف والنقض إن وجدت.")}</ul></div></div><div class="judgment-report-section"><div class="judgment-section-head"><span>02</span><div><p class="eyebrow">الإشكال والمنطوق</p><h4>من الادعاءات إلى السؤال القانوني</h4></div></div><div class="judgment-issue"><span>الإشكال القانوني المقترح</span><p>${escapeHtml(analysis.issue)}</p></div><div class="judgment-two-col"><div><h5>النصوص والأسس الظاهرة</h5><ul>${list(analysis.legalBases, "لم يظهر نص قانوني محدد في المقطع المدخل.")}</ul></div><div><h5>المنطوق / الحل القضائي</h5><ul>${list(analysis.operative, "انقل منطوق الحكم حرفياً من النسخة الأصلية قبل اعتماد التقرير.")}</ul></div></div></div><div class="judgment-report-section"><div class="judgment-section-head"><span>03</span><div><p class="eyebrow">التحليل والتعليق</p><h4>تصميم قابل للتحرير مع الأستاذ</h4></div></div><div class="judgment-writing-block"><h5>مقدمة مقترحة</h5><p>${escapeHtml(analysis.intro)}</p></div><div class="judgment-writing-block objective"><h5>العرض الموضوعي</h5><p>${escapeHtml(analysis.objective)}</p><div class="judgment-evidence"><strong>مواطن الربط:</strong><ul>${list(analysis.subjectLines, "حدّد القاعدة والوقائع التي طبقتها المحكمة في كل نقطة.")}</ul></div></div><div class="judgment-writing-block personal"><h5>التقييم الشخصي</h5><p>${escapeHtml(analysis.personal)}</p></div><div class="judgment-writing-block"><h5>خاتمة مقترحة</h5><p>${escapeHtml(analysis.conclusion)}</p></div></div><div class="judgment-checklist"><div><p class="eyebrow">قائمة المراجعة</p><h4>قبل تسليم التعليق</h4></div><div class="judgment-check-items">${analysis.checks.map((item) => `<span class="${item.done ? "done" : "pending"}">${item.done ? "✓" : "!"} ${escapeHtml(item.label)}</span>`).join("")}</div>${analysis.missing.length ? `<p class="judgment-missing"><strong>يحتاج استكمالاً:</strong> ${escapeHtml(analysis.missing.join("، "))}</p>` : `<p class="judgment-ready">اكتمل الاستخراج الأولي. راجع كل فقرة على الحكم الأصلي قبل اعتمادها.</p>`}</div><div class="judgment-disclaimer">هذا تحليل تعليمي أولي يعتمد على النص المدخل. لا يمثل رأياً قضائياً أو استشارة قانونية، ولا يحل محل القراءة المتكررة للحكم وإشراف الأستاذ.</div></div>`;
  }

  async function handleJudgmentFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    state.judgmentFileName = file.name;
    saveState();
    const extension = file.name.toLowerCase().split(".").pop();
    if (["txt", "md", "html"].includes(extension) || file.type.startsWith("text/")) {
      try {
        state.judgmentText = await file.text();
        saveState();
        $("#judgmentText").value = state.judgmentText;
        $("#judgmentCharCount").textContent = `${wordCount(state.judgmentText)} كلمة`;
        showToast("تم استيراد النص. راجعه ثم ابدأ التحليل.");
      } catch (error) {
        showToast("تعذر قراءة الملف النصي؛ الصق النص يدوياً.");
      }
    } else {
      showToast("تم إرفاق ملف الحكم. لأعلى دقة تعليمية، الصق نصه في المربع ثم حلّله.");
    }
    renderJudgment();
  }

  function loadJudgmentExample() {
    const exampleTitle = "حكم مدني في مسؤولية حارس الشيء";
    const exampleText = "أقام المدعي دعوى مدنية ضد مالك فندق طالباً التعويض عن إصابة لحقت به بعد سقوطه في حفرة المصعد أثناء إقامته بالفندق. قدم المدعي شواهد طبية ورسالة صادرة عن إدارة الفندق تثبت وقوع الحادث والضرر، بينما طلب المدعى عليه إدخال شركة التأمين في الخصومة. دفعت شركة التأمين بعدم الإشعار وبأن المدعي لم يثبت سبب الحادث ولا العلاقة السببية. قضت المحكمة الابتدائية بعدم قبول الدعوى، ثم أيدت محكمة الاستئناف الحكم تأسيساً على نقص الإثبات. طعن المدعي بالنقض ناعياً تحريف الوقائع والخطأ في التعليل، وتمسك بأن المصعد تدخل إيجابياً في إحداث الضرر وأن حراسة الشيء مفترضة في مالكه. تتمثل المسألة القانونية في شروط مسؤولية حارس الشيء ووسائل دفعها ومدى توافرها في النازلة. واستند الحكم إلى الفصل 88 من قانون الالتزامات والعقود، وانتهت محكمة النقض إلى نقض القرار المطعون فيه لأن المسؤولية الخاصة تقوم على خطأ مفترض ولا يكفي إلزام المضرور بإثبات الخطأ بذات الطريقة المقررة للمسؤولية العامة.";
    state.judgmentTitle = exampleTitle;
    state.judgmentText = exampleText;
    state.judgmentFileName = "مثال_تدريبي_مجهول.txt";
    state.judgmentAnalysis = null;
    saveState();
    renderJudgment();
    showToast("تم تحميل مثال تدريبي مجهول. اضغط «حلّل الحكم وفق المنهجية».");
  }

  function analyzeJudgment() {
    const text = $("#judgmentText").value.trim();
    const title = $("#judgmentTitle").value.trim() || "حكم مدني غير معنْون";
    if (text.length < 120) {
      showToast("أدخل نصاً أطول يتضمن الوقائع والحيثيات والمنطوق حتى يكون التحليل مفيداً.");
      return;
    }
    state.judgmentTitle = title;
    state.judgmentText = text;
    state.judgmentAnalysis = analyzeJudgmentLocal(text, title);
    state.files += 1;
    addActivity("تحليل حكم مدني", title, `${state.judgmentAnalysis.score}%`);
    saveState();
    renderJudgment();
    renderDashboard();
    showToast("اكتمل التقرير الأولي. راجع مواطن الاستكمال مع الأستاذ.");
  }

  function renderNotice() {
    if (!$("#noticeDate").value) $("#noticeDate").value = today;
    if (!state.noticeResult) return;
    renderNoticeResult(state.noticeResult);
  }

  function buildNotice() {
    const target = $("#noticeTarget").value;
    const method = $("#noticeMethod").value;
    const date = $("#noticeDate").value || today;
    const identity = $("#noticeIdentity").value;
    const address = $("#noticeAddress").checked;
    const receipt = $("#noticeReceipt").checked;
    const language = $("#noticeLanguage").checked;
    let valid = true;
    const reasons = [];
    if (method === "wrong") { valid = false; reasons.push("الوسيلة المختارة لا تُنتج أثراً كافياً في هذا السيناريو."); }
    if (!address) { valid = false; reasons.push("العنوان غير مثبت في السجل المعتمد."); }
    if (!receipt) { valid = false; reasons.push("لا يوجد أثر استلام أو رفض يمكن الرجوع إليه."); }
    if (!language) { valid = false; reasons.push("لم يثبت تمكين المعلن إليه من فهم مضمون الورقة."); }
    if (identity === "none" && ["personal", "workplace"].includes(method)) { valid = false; reasons.push("تعذر إثبات هوية المستلم في التسليم المباشر."); }
    if (target === "unknown" && method !== "publication") { valid = false; reasons.push("مع الموطن غير المعلوم، اختبر مسار النشر أو الإجراء الذي يقرره القاضي."); }
    if (target === "abroad" && !["electronic", "publication"].includes(method)) { valid = false; reasons.push("المسار المختار لا يعالج واقعة الإقامة خارج الدولة في هذه المحاكاة."); }
    if (target !== "unknown" && method === "publication") { valid = false; reasons.push("النشر ليس الخيار الافتراضي مع توافر عنوان معلوم في هذا السيناريو."); }
    if (valid) reasons.push("توافرت عناصر التوثيق الأساسية في واقعة التبليغ الافتراضية.");
    const result = { valid, target, method, date, identity, reasons, id: `NT-${Math.floor(1000 + Math.random() * 9000)}` };
    state.noticeResult = result;
    state.files += 1;
    addActivity(`إنشاء محضر تبليغ ${valid ? "سليم" : "قابل للاعتراض"}`, noticeTargetLabel(target), valid ? "أثر منتج" : "مراجعة");
    saveState();
    renderNoticeResult(result);
    renderDashboard();
    showToast(valid ? "أُنشئ محضر تبليغ افتراضي قابل للتتبع." : "أُنشئ المحضر مع تنبيه إلى مواضع الخطر.");
  }

  function noticeTargetLabel(target) { return { person: "شخص طبيعي", company: "شركة / شخص اعتباري", unknown: "موطن غير معلوم", abroad: "مقيم خارج الدولة" }[target] || target; }
  function noticeMethodLabel(method) { return { electronic: "تبليغ إلكتروني موثق", personal: "تسليم شخصي", workplace: "في محل العمل", publication: "النشر", wrong: "وسيلة غير منتجة" }[method] || method; }

  function renderNoticeResult(result) {
    const card = $("#noticeResult").parentElement;
    card.classList.toggle("valid", result.valid);
    card.classList.toggle("invalid", !result.valid);
    $("#noticeResult").innerHTML = `<div class="notice-result"><div class="notice-result-head"><div class="notice-icon">${result.valid ? "✓" : "!"}</div><div><h3>محضر تبليغ ${result.valid ? "مستوفٍ مبدئياً" : "يحتاج مراجعة"}</h3><small>${escapeHtml(result.id)} · ${escapeHtml(result.date)}</small></div><span class="result-badge ${result.valid ? "valid" : "invalid"}">${result.valid ? "منتج للأثر" : "قابل للاعتراض"}</span></div><div class="notice-reason">${result.reasons.map((reason) => `<div>• ${escapeHtml(reason)}</div>`).join("")}</div><div class="notice-meta"><div><span>المبلّغ إليه</span><strong>${escapeHtml(noticeTargetLabel(result.target))}</strong></div><div><span>الوسيلة</span><strong>${escapeHtml(noticeMethodLabel(result.method))}</strong></div><div><span>إثبات الهوية</span><strong>${result.identity === "verified" ? "متحقق" : result.identity === "delegate" ? "وكيل / موظف" : "غير كافٍ"}</strong></div><div><span>أثر المحضر</span><strong>${result.valid ? "بدء فحص الميعاد" : "لا يعتمد قبل الإصلاح"}</strong></div></div><div class="notice-result-foot">المحاكاة لا تحسم صحة إعلان واقعي؛ راجع المادة 49 وبيانات الواقعة مع الأستاذ.</div></div>`;
  }

  const executionChoices = {
    garnishment: { title: "الحجز لدى الغير", description: "أموال المدين الموجودة لدى بنك أو عميل أو جهة أخرى.", steps: ["أمر الحجز", "إعلان الغير", "تقرير الغير خلال الميعاد", "تحصيل المبلغ", "فتح التوزيع"], note: "المادتان 252 و256: يتحول الغير إلى طرف إجرائي في سلسلة الحجز والتقرير." },
    movables: { title: "حجز المنقولات", description: "أموال منقولة مملوكة للمدين قابلة للجرد والبيع وفق الإجراء.", steps: ["أمر الحجز", "الانتقال والجرد", "محضر الحجز", "البيع بالمزاد", "إيداع الحصيلة"], note: "أضف إلى الملف وصف المنقولات ومكانها ومحضر الحجز قبل اختبار البيع." },
    realestate: { title: "حجز العقار", description: "عقار مسجل باسم المدين، مع مراعاة بيانات القيد والبيع.", steps: ["التحقق من القيد", "إعلان الحجز", "وصف العقار", "إجراءات البيع", "إيداع الحصيلة"], note: "تظهر في المسار متطلبات التحقق من الملكية ووصف المال قبل البيع والتوزيع." },
  };

  function renderExecution() {
    $$("#executionOptions button").forEach((button) => button.classList.toggle("active", button.dataset.execution === state.executionChoice));
    if (!state.executionChoice) return;
    const choice = executionChoices[state.executionChoice];
    $("#executionFeedback").innerHTML = `<div class="execution-path"><h4>تسلسل ${escapeHtml(choice.title)}</h4><div class="path-steps">${choice.steps.map((step) => `<span>${escapeHtml(step)}</span>`).join("")}</div><div class="execution-note"><strong>§</strong><span>${escapeHtml(choice.note)}</span></div></div>`;
    const timeline = $("#executionTimeline");
    timeline.innerHTML = `<div class="timeline-item completed"><span>✓</span><div><strong>إيداع طلب التنفيذ</strong><small>المادة 206 · تحت إشراف قاضي التنفيذ</small></div></div><div class="timeline-item completed"><span>✓</span><div><strong>إعلان السند التنفيذي</strong><small>انقضاء مهلة الوفاء الطوعي</small></div></div><div class="timeline-item completed"><span>✓</span><div><strong>اختيار ${escapeHtml(choice.title)}</strong><small>تم إنشاء مسار إجرائي افتراضي</small></div></div><div class="timeline-item pending"><span>04</span><div><strong>${escapeHtml(choice.steps[1])}</strong><small>الخطوة التالية في المحاكاة</small></div></div><div class="timeline-item"><span>05</span><div><strong>التحصيل والتوزيع</strong><small>يفتح بعد استكمال التسلسل</small></div></div>`;
  }

  function chooseExecution(choice) {
    if (!executionChoices[choice]) return;
    const changed = state.executionChoice !== choice;
    state.executionChoice = choice;
    if (changed) {
      addActivity(`تحديد أداة التنفيذ: ${executionChoices[choice].title}`, "غرفة التنفيذ الافتراضي", "مسار جاهز");
      state.files += 1;
    }
    saveState();
    renderExecution();
    renderDashboard();
    showToast(`تم فتح مسار ${executionChoices[choice].title}.`);
  }

  function renderSources() {
    const filter = $("#sourceFilter .active")?.dataset.filter || "all";
    $$("#sourceGrid .source-card").forEach((card) => { card.style.display = filter === "all" || card.dataset.source === filter ? "flex" : "none"; });
  }

  function resetProgress() {
    if (!window.confirm("سيؤدي ذلك إلى مسح تقدمك المحلي في المختبر. هل تريد المتابعة؟")) return;
    state = { ...defaultState };
    saveState();
    renderView(state.view);
    renderDashboard();
    showToast("تمت إعادة ضبط التقدم المحلي.");
  }

  function downloadReport() {
    const lines = [
      "تقرير مختبر ياسين شامي للمرافعات والتنفيذ الجبري",
      "كلية القانون — جامعة الإمارات العربية المتحدة",
      `تاريخ التصدير: ${new Date().toLocaleString("ar-AE")}`,
      "",
      `المسار الحالي: ${currentScenario().title}`,
      `رصيد المحاكاة: ${state.simScore} نقطة`,
      `الملفات المنجزة: ${state.files}`,
      ...(state.judgmentAnalysis ? ["", `آخر حكم محلل: ${state.judgmentAnalysis.title}`, `اكتمال الاستخراج: ${state.judgmentAnalysis.score}%`, `الإشكال المقترح: ${state.judgmentAnalysis.issue}`] : []),
      "",
      "السجل:",
      ...state.activity.map((item) => `- ${item.title} | ${item.detail} | ${item.score || "محفوظ"} | ${item.at}`),
      "",
      "تنبيه: هذا التقرير تعليمي، ولا يمثل ملفاً قضائياً أو مشورة قانونية.",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "تقرير_مختبر_ياسين_شامي.txt";
    link.click();
    URL.revokeObjectURL(url);
    showToast("تم إعداد التقرير للتنزيل.");
  }

  function bindEvents() {
    document.addEventListener("click", (event) => {
      const viewTrigger = event.target.closest("[data-view]");
      if (viewTrigger) {
        event.preventDefault();
        if (viewTrigger.dataset.scenario) switchScenario(viewTrigger.dataset.scenario);
        setView(viewTrigger.dataset.view);
        return;
      }
      const scenarioTrigger = event.target.closest("[data-scenario]");
      if (scenarioTrigger && scenarioTrigger.closest("#scenarioSwitcher")) { switchScenario(scenarioTrigger.dataset.scenario); return; }
      const decision = event.target.closest("[data-decision-index]");
      if (decision) { chooseDecision(Number(decision.dataset.decisionIndex)); return; }
      const quizOption = event.target.closest("[data-quiz-index]");
      if (quizOption) { answerQuiz(Number(quizOption.dataset.quizIndex)); return; }
      const mapTrigger = event.target.closest("[data-map]");
      if (mapTrigger) { $$(".map-switcher button").forEach((button) => button.classList.toggle("active", button === mapTrigger)); $$(".map-canvas").forEach((canvas) => canvas.classList.toggle("hidden", canvas.id !== mapTrigger.dataset.map)); return; }
      const role = event.target.closest("[data-role]");
      if (role && role.closest("#rolePicker")) { state.role = role.dataset.role; saveState(); renderCourt(); return; }
      const docTab = event.target.closest("[data-doc-type]");
      if (docTab && docTab.closest(".workbench-tabs")) { state.aiType = docTab.dataset.docType; saveState(); renderAI(); return; }
      const promptChip = event.target.closest("[data-prompt]");
      if (promptChip) { $("#aiDraft").value = promptChip.dataset.prompt; state.draft = promptChip.dataset.prompt; renderAI(); setView("ai"); $("#aiDraft").focus(); return; }
      const exec = event.target.closest("[data-execution]");
      if (exec) { chooseExecution(exec.dataset.execution); return; }
    });

    $("#mobileMenu").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
    $("#resetProgress").addEventListener("click", resetProgress);
    $("#downloadReport").addEventListener("click", downloadReport);
    $("#simNext").addEventListener("click", advanceStage);
    $("#simPrev").addEventListener("click", () => { if (state.stage > 0) { state.stage -= 1; saveState(); renderSimulator(); } });
    $("#quizNext").addEventListener("click", advanceQuiz);
    $("#courtSpeak").addEventListener("click", courtSpeak);
    $("#aiDraft").addEventListener("input", (event) => { state.draft = event.target.value; $("#draftCount").textContent = `${wordCount(event.target.value)} كلمة`; saveState(); });
    $("#analyzeDraft").addEventListener("click", askAI);
    $("#judgmentFile").addEventListener("change", handleJudgmentFile);
    $("#loadJudgmentExample").addEventListener("click", loadJudgmentExample);
    $("#judgmentTitle").addEventListener("input", (event) => { state.judgmentTitle = event.target.value; saveState(); });
    $("#judgmentText").addEventListener("input", (event) => { state.judgmentText = event.target.value; $("#judgmentCharCount").textContent = `${wordCount(event.target.value)} كلمة`; saveState(); });
    $("#analyzeJudgment").addEventListener("click", analyzeJudgment);
    $("#generateNotice").addEventListener("click", buildNotice);
    $("#clearExecution").addEventListener("click", () => { state.executionChoice = null; saveState(); renderExecution(); showToast("تمت إعادة غرفة التنفيذ إلى نقطة الاختيار."); });
    $("#sourceFilter").addEventListener("click", (event) => { const filterButton = event.target.closest("button[data-filter]"); if (!filterButton) return; $$("#sourceFilter button").forEach((button) => button.classList.toggle("active", button === filterButton)); renderSources(); });
  }

  function init() {
    bindEvents();
    renderDashboard();
    setView(state.view || "dashboard");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
