export interface Word {
  hanzi: string;
  pinyin: string;
  translation: string;
  image?: string;
  audio?: string;
}

export interface DialogueLine {
  speaker: string;
  text: string;
  pinyin: string;
  translation: string;
  audio?: string;
}

/* ── Grammatika uchun ── */
export interface GrammarExample {
  chinese: string;
  pinyin: string;
  translation: string;
  note?: string;
}

export interface GrammarRule {
  id: string;
  title: string;
  explanation: string;
  structure?: string;
  examples: GrammarExample[];
  tip?: string;
}

/* ── Vazifalar uchun ── */
export interface TaskOption {
  id: string;
  text: string;
}

export interface Task {
  id: string;
  type: "multiple-choice" | "fill-blank" | "match" | "translate" | "true-false" | "order";
  question: string;
  hint?: string;
  options?: TaskOption[];
  correctAnswer: string;
  explanation?: string;
  /* match type uchun */
  matchPairs?: { left: string; right: string }[];
  /* order type uchun */
  correctOrder?: string[];
}

export interface LessonSection {
  id: string;
  title: string;
  type: "words" | "writing" | "dialogue" | "grammar" | "tasks";
  children?: { id: string; title: string; dialogueLines?: DialogueLine[]; grammarRules?: GrammarRule[] }[];
}

export interface Lesson {
  id: number;
  title: string;
  name: string;
  description: string;
  image?: string;
  locked: boolean;
  words?: Word[];
  sections?: LessonSection[];
  tasks?: Task[];
  writingSheets?: string[];
}

export interface Course {
  slug: string;
  title: string;
  level: string;
  image: string;
  features: string[];
  description: string;
  duration: string;
  lessonsCount: string;
  wordsCount: string;
  grammarCount: string;
  price: string;
  priceNote: string;
  lessons: Lesson[];
}

export const courses: Course[] = [
  {
    slug: "hsk-1",
    title: "HSK 1 (3.0)",
    level: "Boshlang'ich",
    image: "/assets/course-1.png",
    features: [
      "Taxminan 500 ta so\u2018z (minimal lug\u2018at hajmi)",
      "48 ta grammatika mavzusi",
      "Asosiy iyerogliflar va ularning yozilish tartibi",
      "Kundalik hayotga oid oddiy dialoglar",
      "Tinglab tushunish va o\u2018qish ko\u2018nikmalari",
    ],
    description:
      "HSK 1 — Xitoy tilini noldan boshlayotganlar uchun mo'ljallangan boshlang'ich daraja. Ushbu kursda siz asosiy so'zlar, oddiy jumlalar va kundalik muloqot uchun zarur bo'lgan bilimlarni egallaysiz.",
    duration: "3 oy",
    lessonsCount: "48 ta dars",
    wordsCount: "500+ so'z",
    grammarCount: "48 mavzu",
    price: "500 000",
    priceNote: "so'm / oyiga",
    lessons: [
      {
        id: 1,
        title: "Darslik 1",
        name: "Salomlashuv",
        description: "Greetings / Salomlashlar",
        image: "/assets/course-1.png",
        locked: false,
        sections: [
          { id: "new-words", title: "Yangi so'zlar", type: "words" },
          { id: "writing", title: "So'z yozilishi", type: "writing" },
          {
            id: "dialogues",
            title: "Dialoglar",
            type: "dialogue",
            children: [
              {
                id: "dialogue-1",
                title: "Salomlashuv",
                dialogueLines: [
                  { speaker: "李明 (Lǐ Míng)", text: "你好！我是李明。", pinyin: "Nǐ hǎo! Wǒ shì Lǐ Míng.", translation: "Salom! Men Li Mingman." },
                  { speaker: "王芳 (Wáng Fāng)", text: "你好！我是王芳。你好吗？", pinyin: "Nǐ hǎo! Wǒ shì Wáng Fāng. Nǐ hǎo ma?", translation: "Salom! Men Vang Fangman. Qalaysiz?" },
                  { speaker: "李明", text: "我很好，谢谢！你呢？", pinyin: "Wǒ hěn hǎo, xiè xie! Nǐ ne?", translation: "Men juda yaxshiman, rahmat! Siz-chi?" },
                  { speaker: "王芳", text: "我也很好。很高兴认识你！", pinyin: "Wǒ yě hěn hǎo. Hěn gāoxìng rènshi nǐ!", translation: "Men ham juda yaxshiman. Tanishganimdan xursandman!" },
                  { speaker: "李明", text: "很高兴认识你！再见！", pinyin: "Hěn gāoxìng rènshi nǐ! Zàijiàn!", translation: "Tanishganimdan xursandman! Xayr!" },
                  { speaker: "王芳", text: "再见！", pinyin: "Zàijiàn!", translation: "Xayr!" },
                ],
              },
              {
                id: "dialogue-2",
                title: "Gaplashuv",
                dialogueLines: [
                  { speaker: "张伟 (Zhāng Wěi)", text: "请问，你好吗？", pinyin: "Qǐngwèn, nǐ hǎo ma?", translation: "Kechirasiz, qalaysiz?" },
                  { speaker: "刘洋 (Liú Yáng)", text: "我很好，谢谢。你好吗？", pinyin: "Wǒ hěn hǎo, xiè xie. Nǐ hǎo ma?", translation: "Men juda yaxshiman, rahmat. Siz-chi?" },
                  { speaker: "张伟", text: "我也很好。你是学生吗？", pinyin: "Wǒ yě hěn hǎo. Nǐ shì xuéshēng ma?", translation: "Men ham yaxshiman. Siz talabamisiz?" },
                  { speaker: "刘洋", text: "是，我是学生。你呢？", pinyin: "Shì, wǒ shì xuéshēng. Nǐ ne?", translation: "Ha, men talabaman. Siz-chi?" },
                  { speaker: "张伟", text: "我也是学生。很高兴认识你！", pinyin: "Wǒ yě shì xuéshēng. Hěn gāoxìng rènshi nǐ!", translation: "Men ham talabaman. Tanishganimdan xursandman!" },
                  { speaker: "刘洋", text: "我也很高兴。谢谢！", pinyin: "Wǒ yě hěn gāoxìng. Xiè xie!", translation: "Men ham xursandman. Rahmat!" },
                ],
              },
              {
                id: "dialogue-3",
                title: "Hayrlashuv",
                dialogueLines: [
                  { speaker: "陈红 (Chén Hóng)", text: "我要走了。再见！", pinyin: "Wǒ yào zǒu le. Zàijiàn!", translation: "Men ketaman. Xayr!" },
                  { speaker: "赵强 (Zhào Qiáng)", text: "再见！明天见！", pinyin: "Zàijiàn! Míngtiān jiàn!", translation: "Xayr! Ertaga ko'rishamiz!" },
                  { speaker: "陈红", text: "好的，明天见！谢谢你！", pinyin: "Hǎo de, míngtiān jiàn! Xiè xie nǐ!", translation: "Yaxshi, ertaga ko'rishamiz! Rahmat sizga!" },
                  { speaker: "赵强", text: "不客气。再见！", pinyin: "Bú kèqi. Zàijiàn!", translation: "Arzimaydi. Xayr!" },
                ],
              },
            ],
          },
          {
            id: "grammar",
            title: "Grammatika",
            type: "grammar",
            children: [
              {
                id: "grammar-1",
                title: "Salomlashuv",
                grammarRules: [
                  {
                    id: "g1-1",
                    title: "你好 (Nǐ hǎo) — Salomlashuv",
                    explanation: "Xitoy tilida eng asosiy salomlashuv iborasi — 你好 (nǐ hǎo). Bu so'zma-so'z \"sen yaxshi\" degan ma'noni bildiradi, lekin salomlashuv sifatida ishlatiladi. Har qanday vaziyatda, rasmiy yoki norasmiy, ishlatish mumkin.",
                    structure: "你好 + (ism)",
                    examples: [
                      { chinese: "你好！", pinyin: "Nǐ hǎo!", translation: "Salom!" },
                      { chinese: "你好，李明！", pinyin: "Nǐ hǎo, Lǐ Míng!", translation: "Salom, Li Ming!" },
                      { chinese: "老师，你好！", pinyin: "Lǎoshī, nǐ hǎo!", translation: "Ustoz, salom!" },
                    ],
                    tip: "Hurmatli murojaat uchun 您好 (nín hǎo) ishlatiladi — bu rasmiyroq shakl."
                  },
                  {
                    id: "g1-2",
                    title: "我是... (Wǒ shì...) — O'zini tanishtirish",
                    explanation: "是 (shì) — \"...dir/-man\" degan ma'noni beruvchi bog'lovchi fe'l. O'zini tanishtirish uchun \"我是 + ism\" strukturasi ishlatiladi.",
                    structure: "我是 + ism/kasb",
                    examples: [
                      { chinese: "我是李明。", pinyin: "Wǒ shì Lǐ Míng.", translation: "Men Li Mingman." },
                      { chinese: "我是学生。", pinyin: "Wǒ shì xuéshēng.", translation: "Men talabaman." },
                      { chinese: "我是老师。", pinyin: "Wǒ shì lǎoshī.", translation: "Men o'qituvchiman." },
                    ],
                    tip: "是 (shì) — inglizcha \"am/is/are\" ga o'xshaydi, lekin sifat bilan ishlatilmaydi!"
                  },
                ],
              },
              {
                id: "grammar-2",
                title: "Gaplar",
                grammarRules: [
                  {
                    id: "g2-1",
                    title: "吗 (ma) — So'roq gap yasash",
                    explanation: "Xitoy tilida ha/yo'q so'roq gapini yasash juda oson — gap oxiriga 吗 (ma) yuklamasini qo'shsangiz bo'ldi. Gap tartibi o'zgarmaydi.",
                    structure: "Darak gap + 吗？",
                    examples: [
                      { chinese: "你好吗？", pinyin: "Nǐ hǎo ma?", translation: "Qalaysiz? (Sen yaxshimisan?)" },
                      { chinese: "你是学生吗？", pinyin: "Nǐ shì xuéshēng ma?", translation: "Sen talabamisan?" },
                      { chinese: "他好吗？", pinyin: "Tā hǎo ma?", translation: "U yaxshimi?" },
                    ],
                    tip: "吗 (ma) faqat ha/yo'q savoliga ishlatiladi. Maxsus savol so'zlari (什么, 谁) bilan ishlatilmaydi."
                  },
                  {
                    id: "g2-2",
                    title: "很 (hěn) + Sifat — Sifatli gap",
                    explanation: "Xitoy tilida sifatli gaplarda 是 (shì) ishlatilmaydi. O'rniga daraja ravishi 很 (hěn) qo'yiladi. 很 bu yerda \"juda\" emas, balki grammatik zaruriyat.",
                    structure: "Ega + 很 + Sifat",
                    examples: [
                      { chinese: "我很好。", pinyin: "Wǒ hěn hǎo.", translation: "Men yaxshiman." },
                      { chinese: "她很高兴。", pinyin: "Tā hěn gāoxìng.", translation: "U xursand." },
                      { chinese: "他很忙。", pinyin: "Tā hěn máng.", translation: "U band." },
                    ],
                    tip: "❌ 我是好 (noto'g'ri!) → ✅ 我很好 (to'g'ri!). Sifat oldida 是 emas, 很 ishlatiladi."
                  },
                  {
                    id: "g2-3",
                    title: "呢 (ne) — \"Siz-chi?\" savoli",
                    explanation: "呢 (ne) yuklamasi oldingi savol kontekstida \"siz-chi?\" / \"sen-chi?\" degan qisqa savolni bildiradi. Butun savolni qaytarish shart emas.",
                    structure: "Ism/Olmosh + 呢？",
                    examples: [
                      { chinese: "我很好。你呢？", pinyin: "Wǒ hěn hǎo. Nǐ ne?", translation: "Men yaxshiman. Sen-chi?" },
                      { chinese: "我是学生。你呢？", pinyin: "Wǒ shì xuéshēng. Nǐ ne?", translation: "Men talabaman. Sen-chi?" },
                    ],
                    tip: "呢 faqat kontekst mavjud bo'lganda ishlatiladi — ya'ni oldin biror gap aytilgan bo'lishi kerak."
                  },
                ],
              },
              {
                id: "grammar-3",
                title: "Hayrbashuv",
                grammarRules: [
                  {
                    id: "g3-1",
                    title: "再见 (Zàijiàn) — Xayrlashuv",
                    explanation: "再见 so'zma-so'z \"yana ko'rishamiz\" degani. Bu eng keng tarqalgan xayrlashuv iborasi. Turli vaziyatlarda boshqa shakllar ham bor.",
                    structure: "再见 / 明天见 / 下次见",
                    examples: [
                      { chinese: "再见！", pinyin: "Zàijiàn!", translation: "Xayr!" },
                      { chinese: "明天见！", pinyin: "Míngtiān jiàn!", translation: "Ertaga ko'rishamiz!" },
                      { chinese: "下次见！", pinyin: "Xià cì jiàn!", translation: "Keyingi safar ko'rishamiz!" },
                    ],
                    tip: "见 (jiàn) — \"ko'rishmoq\" degani. Oldiga vaqt qo'shib turli xayrlashuv iboralari yasash mumkin."
                  },
                  {
                    id: "g3-2",
                    title: "不客气 (Bú kèqi) — Arzimaydi",
                    explanation: "Kimdir 谢谢 (rahmat) deganda, javob sifatida 不客气 ishlatiladi. Bu \"arzimaydi\" / \"hech gap emas\" degan ma'noni beradi.",
                    structure: "谢谢！ → 不客气！",
                    examples: [
                      { chinese: "谢谢你！— 不客气！", pinyin: "Xiè xie nǐ! — Bú kèqi!", translation: "Rahmat sizga! — Arzimaydi!" },
                      { chinese: "谢谢！— 没关系。", pinyin: "Xiè xie! — Méi guānxi.", translation: "Rahmat! — Hech gap emas." },
                    ],
                    tip: "不客气 dan tashqari 没关系 (méi guānxi) va 不用谢 (bú yòng xiè) ham ishlatiladi."
                  },
                ],
              },
            ],
          },
          { id: "tasks", title: "Vazifalar", type: "tasks" },
        ],
        tasks: [
          {
            id: "t1-1",
            type: "multiple-choice",
            question: "\"Salom\" xitoycha qanday aytiladi?",
            options: [
              { id: "a", text: "谢谢 (xiè xie)" },
              { id: "b", text: "你好 (nǐ hǎo)" },
              { id: "c", text: "再见 (zài jiàn)" },
              { id: "d", text: "不 (bù)" },
            ],
            correctAnswer: "b",
            explanation: "你好 (nǐ hǎo) — xitoy tilida eng asosiy salomlashuv iborasi.",
          },
          {
            id: "t1-2",
            type: "multiple-choice",
            question: "Quyidagi gapda bo'sh joyga qaysi so'z qo'yiladi?\n\n你___吗？ (Qalaysiz?)",
            options: [
              { id: "a", text: "是 (shì)" },
              { id: "b", text: "很 (hěn)" },
              { id: "c", text: "好 (hǎo)" },
              { id: "d", text: "呢 (ne)" },
            ],
            correctAnswer: "c",
            explanation: "你好吗？ (Nǐ hǎo ma?) — \"Qalaysiz?\" degan ma'noni beradi. 好 (hǎo) = yaxshi.",
          },
          {
            id: "t1-3",
            type: "fill-blank",
            question: "\"Men yaxshiman\" gapini xitoycha yozing:",
            hint: "我___好。",
            correctAnswer: "很",
            explanation: "我很好 (Wǒ hěn hǎo). Sifat oldida 很 (hěn) ishlatiladi — bu grammatik zaruriyat.",
          },
          {
            id: "t1-4",
            type: "true-false",
            question: "我是好 — bu gap grammatik jihatdan to'g'ri.",
            options: [
              { id: "true", text: "To'g'ri ✓" },
              { id: "false", text: "Noto'g'ri ✗" },
            ],
            correctAnswer: "false",
            explanation: "❌ Noto'g'ri! Sifat oldida 是 emas, 很 ishlatiladi. To'g'ri shakli: 我很好。",
          },
          {
            id: "t1-5",
            type: "multiple-choice",
            question: "\"Xayr\" xitoycha qanday?",
            options: [
              { id: "a", text: "你好 (nǐ hǎo)" },
              { id: "b", text: "谢谢 (xiè xie)" },
              { id: "c", text: "再见 (zài jiàn)" },
              { id: "d", text: "请 (qǐng)" },
            ],
            correctAnswer: "c",
            explanation: "再见 (zài jiàn) — \"yana ko'rishamiz\", ya'ni \"xayr\" degani.",
          },
          {
            id: "t1-6",
            type: "translate",
            question: "Bu gapni o'zbekchaga tarjima qiling:\n\n你好吗？我很好，谢谢！",
            correctAnswer: "Qalaysiz? Men yaxshiman, rahmat!",
            explanation: "你好吗？(Qalaysiz?) 我很好 (Men yaxshiman), 谢谢 (rahmat)!",
          },
          {
            id: "t1-7",
            type: "fill-blank",
            question: "Kimdir \"谢谢\" desa, javob nima?\n\n不___！",
            hint: "Arzimaydi",
            correctAnswer: "客气",
            explanation: "不客气 (Bú kèqi) — \"Arzimaydi\" / \"Hech gap emas\".",
          },
          {
            id: "t1-8",
            type: "multiple-choice",
            question: "呢 (ne) yuklamasi qanday vaziyatda ishlatiladi?",
            options: [
              { id: "a", text: "Ha/yo'q savol berish uchun" },
              { id: "b", text: "\"Siz-chi?\" degan qisqa savol uchun" },
              { id: "c", text: "Inkor gap yasash uchun" },
              { id: "d", text: "Buyruq berish uchun" },
            ],
            correctAnswer: "b",
            explanation: "呢 (ne) — oldingi savol kontekstida \"siz-chi?\" savolini bildiradi. Masalan: 我很好。你呢？",
          },
          {
            id: "t1-9",
            type: "multiple-choice",
            question: "Quyidagi gapda 吗 (ma) ning vazifasi nima?\n\n你是学生吗？",
            options: [
              { id: "a", text: "Gapni inkor qiladi" },
              { id: "b", text: "Gapni so'roq gapga aylantiradi" },
              { id: "c", text: "Gapni buyruq gapga aylantiradi" },
              { id: "d", text: "Hech qanday vazifasi yo'q" },
            ],
            correctAnswer: "b",
            explanation: "吗 (ma) — darak gap oxiriga qo'yilsa, u ha/yo'q so'roq gapiga aylanadi.",
          },
          {
            id: "t1-10",
            type: "translate",
            question: "Bu gapni xitoycha yozing:\n\n\"Men Li Mingman. Tanishganimdan xursandman!\"",
            correctAnswer: "我是李明。很高兴认识你！",
            explanation: "我是李明 (Wǒ shì Lǐ Míng) = Men Li Mingman. 很高兴认识你 (Hěn gāoxìng rènshi nǐ) = Tanishganimdan xursandman.",
          },
        ],
        words: [
          { hanzi: "你好", pinyin: "nǐ hǎo", translation: "Salom", image: "/assets/words/nihao.svg" },
          { hanzi: "你", pinyin: "nǐ", translation: "Sen", image: "/assets/words/ni.svg" },
          { hanzi: "好", pinyin: "hǎo", translation: "Yaxshi", image: "/assets/words/hao.svg" },
          { hanzi: "吗", pinyin: "ma", translation: "So'roq", image: "/assets/words/ma.svg" },
          { hanzi: "我", pinyin: "wǒ", translation: "Men", image: "/assets/words/wo.svg" },
          { hanzi: "很", pinyin: "hěn", translation: "Juda", image: "/assets/words/hen.svg" },
          { hanzi: "谢谢", pinyin: "xiè xie", translation: "Rahmat", image: "/assets/words/xiexie.svg" },
          { hanzi: "不", pinyin: "bù", translation: "Yo'q", image: "/assets/words/bu.svg" },
          { hanzi: "再见", pinyin: "zài jiàn", translation: "Xayr", image: "/assets/words/zaijian.svg" },
          { hanzi: "请", pinyin: "qǐng", translation: "Iltimos", image: "/assets/words/qing.svg" },
        ],
      },
      {
        id: 2,
        title: "Darslik 2",
        name: "Raqamlar",
        description: "Numbers / Raqamlar",
        image: "/assets/course-1.png",
        locked: false,
        sections: [
          { id: "new-words", title: "Yangi so'zlar", type: "words" },
          { id: "writing", title: "So'z yozilishi", type: "writing" },
          {
            id: "dialogues",
            title: "Dialoglar",
            type: "dialogue",
            children: [
              { id: "dialogue-1", title: "Raqamlar" },
              { id: "dialogue-2", title: "Sanash" },
            ],
          },
          {
            id: "grammar",
            title: "Grammatika",
            type: "grammar",
            children: [
              {
                id: "grammar-1",
                title: "Raqamlar",
                grammarRules: [
                  {
                    id: "g2-1",
                    title: "一到十 (Yī dào shí) — 1 dan 10 gacha",
                    explanation: "Xitoy tilida raqamlar juda mantiqiy tuzilgan. 1 dan 10 gacha har bir raqam alohida iyeroglif bilan yoziladi. Bularni yod olish — barcha raqamlarni tushunish uchun asos.",
                    structure: "一(1), 二(2), 三(3), 四(4), 五(5), 六(6), 七(7), 八(8), 九(9), 十(10)",
                    examples: [
                      { chinese: "一个人", pinyin: "yī gè rén", translation: "Bir kishi" },
                      { chinese: "三本书", pinyin: "sān běn shū", translation: "Uchta kitob" },
                      { chinese: "五块钱", pinyin: "wǔ kuài qián", translation: "Besh yuan (pul)" },
                    ],
                    tip: "一 (yī) ning toni kontekstga qarab o'zgaradi: 4-ton oldida → yí (2-ton), boshqa tonlar oldida → yì (4-ton)."
                  },
                  {
                    id: "g2-2",
                    title: "11 dan 99 gacha — Raqam yasash qoidasi",
                    explanation: "11 dan 99 gacha raqamlar juda sodda: o'nliklar soni + 十 + birliklar soni. Masalan: 25 = 二十五 (ikki o'n besh).",
                    structure: "O'nlik + 十 + Birlik",
                    examples: [
                      { chinese: "十一", pinyin: "shí yī", translation: "11 (o'n bir)" },
                      { chinese: "二十", pinyin: "èr shí", translation: "20 (yigirma)" },
                      { chinese: "三十五", pinyin: "sān shí wǔ", translation: "35 (o'ttiz besh)" },
                      { chinese: "九十九", pinyin: "jiǔ shí jiǔ", translation: "99 (to'qson to'qqiz)" },
                    ],
                    tip: "Faqat 十 (10) ni bilsangiz, 11-99 gacha barcha raqamlarni yarata olasiz!"
                  },
                ],
              },
              {
                id: "grammar-2",
                title: "Tartib",
                grammarRules: [
                  {
                    id: "g2-3",
                    title: "第 (Dì) — Tartib raqamlari",
                    explanation: "Tartib raqamlarini (birinchi, ikkinchi...) yasash uchun raqam oldiga 第 (dì) qo'shiladi.",
                    structure: "第 + Raqam",
                    examples: [
                      { chinese: "第一", pinyin: "dì yī", translation: "Birinchi" },
                      { chinese: "第二课", pinyin: "dì èr kè", translation: "Ikkinchi dars" },
                      { chinese: "第三天", pinyin: "dì sān tiān", translation: "Uchinchi kun" },
                      { chinese: "第十名", pinyin: "dì shí míng", translation: "O'ninchi o'rin" },
                    ],
                    tip: "第 + raqam = tartib. Masalan: 第一 = birinchi, 第二 = ikkinchi."
                  },
                  {
                    id: "g2-4",
                    title: "两 (Liǎng) va 二 (Èr) — \"Ikki\" ning ikki shakli",
                    explanation: "Xitoy tilida \"ikki\" ni bildiruvchi ikkita so'z bor: 二 (èr) va 两 (liǎng). 二 sanash va tartibda, 两 esa son birligidan oldin ishlatiladi.",
                    structure: "两 + Son birligi + Ot | 二 (sanashda)",
                    examples: [
                      { chinese: "二十", pinyin: "èr shí", translation: "Yigirma (sanashda 二)" },
                      { chinese: "两个人", pinyin: "liǎng gè rén", translation: "Ikki kishi (son birligi oldida 两)" },
                      { chinese: "两本书", pinyin: "liǎng běn shū", translation: "Ikkita kitob" },
                      { chinese: "第二", pinyin: "dì èr", translation: "Ikkinchi (tartibda 二)" },
                    ],
                    tip: "Son birligi (个, 本, 块...) oldida har doim 两 ishlatiladi, 二 emas!"
                  },
                ],
              },
            ],
          },
          { id: "tasks", title: "Vazifalar", type: "tasks" },
        ],
        tasks: [
          {
            id: "t2-1",
            type: "multiple-choice",
            question: "\"Yetti\" xitoycha qaysi iyeroglif?",
            options: [
              { id: "a", text: "六 (liù)" },
              { id: "b", text: "七 (qī)" },
              { id: "c", text: "八 (bā)" },
              { id: "d", text: "九 (jiǔ)" },
            ],
            correctAnswer: "b",
            explanation: "七 (qī) — yetti. 六=olti, 八=sakkiz, 九=to'qqiz.",
          },
          {
            id: "t2-2",
            type: "fill-blank",
            question: "Raqamni iyeroglif bilan yozing:\n\n25 = ___十五",
            hint: "Ikki",
            correctAnswer: "二",
            explanation: "25 = 二十五 (èr shí wǔ). O'nlik + 十 + birlik.",
          },
          {
            id: "t2-3",
            type: "multiple-choice",
            question: "三十八 (sān shí bā) qaysi raqam?",
            options: [
              { id: "a", text: "28" },
              { id: "b", text: "38" },
              { id: "c", text: "83" },
              { id: "d", text: "308" },
            ],
            correctAnswer: "b",
            explanation: "三十八 = 3×10 + 8 = 38.",
          },
          {
            id: "t2-4",
            type: "true-false",
            question: "两个人 (liǎng gè rén) — bu \"ikki kishi\" degan ma'no beradi.",
            options: [
              { id: "true", text: "To'g'ri ✓" },
              { id: "false", text: "Noto'g'ri ✗" },
            ],
            correctAnswer: "true",
            explanation: "✅ To'g'ri! 两个人 = ikki kishi. Son birligi oldida 两 ishlatiladi.",
          },
          {
            id: "t2-5",
            type: "multiple-choice",
            question: "\"Uchinchi dars\" xitoycha qanday?",
            options: [
              { id: "a", text: "三课 (sān kè)" },
              { id: "b", text: "第三课 (dì sān kè)" },
              { id: "c", text: "三第课 (sān dì kè)" },
              { id: "d", text: "课三 (kè sān)" },
            ],
            correctAnswer: "b",
            explanation: "第 + raqam = tartib. 第三课 = uchinchi dars.",
          },
          {
            id: "t2-6",
            type: "fill-blank",
            question: "Tartib raqamini yozing:\n\nBirinchi = ___一",
            hint: "Tartib qo'shimchasi",
            correctAnswer: "第",
            explanation: "第一 (dì yī) = birinchi. 第 — tartib yasovchi so'z.",
          },
          {
            id: "t2-7",
            type: "translate",
            question: "Bu raqamni xitoycha yozing:\n\n99",
            correctAnswer: "九十九",
            explanation: "99 = 九十九 (jiǔ shí jiǔ) = to'qqiz o'n to'qqiz.",
          },
          {
            id: "t2-8",
            type: "multiple-choice",
            question: "Son birligi oldida qaysi \"ikki\" ishlatiladi?\n\n___本书 (ikkita kitob)",
            options: [
              { id: "a", text: "二 (èr)" },
              { id: "b", text: "两 (liǎng)" },
              { id: "c", text: "双 (shuāng)" },
              { id: "d", text: "对 (duì)" },
            ],
            correctAnswer: "b",
            explanation: "Son birligi (个, 本, 块...) oldida har doim 两 (liǎng) ishlatiladi.",
          },
        ],
        words: [
          { hanzi: "一", pinyin: "yī", translation: "Bir" },
          { hanzi: "二", pinyin: "èr", translation: "Ikki" },
          { hanzi: "三", pinyin: "sān", translation: "Uch" },
          { hanzi: "四", pinyin: "sì", translation: "To'rt" },
          { hanzi: "五", pinyin: "wǔ", translation: "Besh" },
          { hanzi: "六", pinyin: "liù", translation: "Olti" },
          { hanzi: "七", pinyin: "qī", translation: "Yetti" },
          { hanzi: "八", pinyin: "bā", translation: "Sakkiz" },
          { hanzi: "九", pinyin: "jiǔ", translation: "To'qqiz" },
          { hanzi: "十", pinyin: "shí", translation: "O'n" },
        ],
      },
      { id: 3, title: "Darslik 3", name: "Asosiy iboralar", description: "Basic phrases", locked: true },
      { id: 4, title: "Darslik 4", name: "Oila", description: "Family", locked: true },
      { id: 5, title: "Darslik 5", name: "Kasb-hunar", description: "Occupations", locked: true },
      { id: 6, title: "Darslik 6", name: "Vaqt", description: "Time", locked: true },
      { id: 7, title: "Darslik 7", name: "Kunlar", description: "Days", locked: true },
      { id: 8, title: "Darslik 8", name: "Ranglar", description: "Colors", locked: true },
      { id: 9, title: "Darslik 9", name: "Ovqatlar", description: "Food", locked: true },
      { id: 10, title: "Darslik 10", name: "Ichimliklar", description: "Drinks", locked: true },
      { id: 11, title: "Darslik 11", name: "Kiyimlar", description: "Clothing", locked: true },
      { id: 12, title: "Darslik 12", name: "Hayvonlar", description: "Animals", locked: true },
      { id: 13, title: "Darslik 13", name: "Transport", description: "Transport", locked: true },
      { id: 14, title: "Darslik 14", name: "Joylar", description: "Places", locked: true },
      { id: 15, title: "Darslik 15", name: "Ob-havo", description: "Weather", locked: true },
      { id: 16, title: "Darslik 16", name: "Xarid qilish", description: "Shopping", locked: true },
      { id: 17, title: "Darslik 17", name: "Sog'liq", description: "Health", locked: true },
      { id: 18, title: "Darslik 18", name: "Sport", description: "Sports", locked: true },
      { id: 19, title: "Darslik 19", name: "Sayohat", description: "Travel", locked: true },
      { id: 20, title: "Darslik 20", name: "Takrorlash", description: "Review", locked: true },
    ],
  },
  {
    slug: "hsk-2",
    title: "HSK 2 (3.0)",
    level: "O'rta boshlang'ich",
    image: "/assets/course-2.png",
    features: [
      "Taxminan 1 272 ta so\u2018z (umumiy minimal lug\u2018at hajmi)",
      "129 ta grammatika mavzusi (A1\u2013A2 bosqich)",
      "Iyerogliflarni mustaqil yozish va o\u2018qish",
      "Kundalik va oddiy ishbilarmonlik dialoglari",
      "Tinglab tushunish va matn o\u2018qish ko\u2018nikmasi",
    ],
    description:
      "HSK 2 — asosiy bilimlaringizni mustahkamlab, kundalik va oddiy ishbilarmonlik muhitida erkin muloqot qilish darajasiga olib chiqadi. So'z boyligi va grammatikani chuqurroq o'rganasiz.",
    duration: "4 oy",
    lessonsCount: "64 ta dars",
    wordsCount: "1 272+ so'z",
    grammarCount: "129 mavzu",
    price: "600 000",
    priceNote: "so'm / oyiga",
    lessons: [
      { id: 1, title: "Darslik 1", name: "Kirish", description: "Review & Introduction", image: "/assets/course-2.png", locked: false },
      { id: 2, title: "Darslik 2", name: "Kundalik tartib", description: "Daily routines", image: "/assets/course-2.png", locked: false },
      { id: 3, title: "Darslik 3", name: "O'rta iboralar", description: "Intermediate phrases", locked: true },
      { id: 4, title: "Darslik 4", name: "Ish joyi", description: "Workplace", locked: true },
      { id: 5, title: "Darslik 5", name: "Ta'lim", description: "Education", locked: true },
      { id: 6, title: "Darslik 6", name: "Do'stlik", description: "Friendship", locked: true },
      { id: 7, title: "Darslik 7", name: "Madaniyat", description: "Culture", locked: true },
      { id: 8, title: "Darslik 8", name: "Bayramlar", description: "Holidays", locked: true },
      { id: 9, title: "Darslik 9", name: "Telefon", description: "Phone calls", locked: true },
      { id: 10, title: "Darslik 10", name: "Internet", description: "Internet", locked: true },
      { id: 11, title: "Darslik 11", name: "Bank", description: "Banking", locked: true },
      { id: 12, title: "Darslik 12", name: "Mehmonxona", description: "Hotel", locked: true },
      { id: 13, title: "Darslik 13", name: "Restoran", description: "Restaurant", locked: true },
      { id: 14, title: "Darslik 14", name: "Kasalxona", description: "Hospital", locked: true },
      { id: 15, title: "Darslik 15", name: "Do'kon", description: "Store", locked: true },
      { id: 16, title: "Darslik 16", name: "Pochta", description: "Post office", locked: true },
      { id: 17, title: "Darslik 17", name: "Kutubxona", description: "Library", locked: true },
      { id: 18, title: "Darslik 18", name: "Sport zali", description: "Gym", locked: true },
      { id: 19, title: "Darslik 19", name: "Tabiat", description: "Nature", locked: true },
      { id: 20, title: "Darslik 20", name: "Takrorlash", description: "Review", locked: true },
    ],
  },
  {
    slug: "hsk-3",
    title: "HSK 3 (3.0)",
    level: "O'rta daraja",
    image: "/assets/course-3.png",
    features: [
      "Taxminan 2 245 ta so\u2018z (umumiy minimal lug\u2018at hajmi)",
      "210+ ta grammatika mavzusi",
      "Murakkabroq iyerogliflarni o\u2018qish va yozish",
      "Kundalik, ta\u2018lim va ishga oid suhbatlar",
      "Tinglab tushunish + uzunroq matnlarni o\u2018qish",
    ],
    description:
      "HSK 3 — Xitoy tilida ishonchli darajada gaplasha olish, murakkab matnlarni tushunish va ishga oid mavzularda suhbat yurita olish imkonini beradi.",
    duration: "5 oy",
    lessonsCount: "80 ta dars",
    wordsCount: "2 245+ so'z",
    grammarCount: "210+ mavzu",
    price: "700 000",
    priceNote: "so'm / oyiga",
    lessons: [
      { id: 1, title: "Darslik 1", name: "Ilg'or takrorlash", description: "Advanced review", image: "/assets/course-3.png", locked: false },
      { id: 2, title: "Darslik 2", name: "Murakkab gaplar", description: "Complex sentences", image: "/assets/course-3.png", locked: false },
      { id: 3, title: "Darslik 3", name: "Ilg'or iboralar", description: "Advanced phrases", locked: true },
      { id: 4, title: "Darslik 4", name: "Siyosat", description: "Politics", locked: true },
      { id: 5, title: "Darslik 5", name: "Iqtisod", description: "Economics", locked: true },
      { id: 6, title: "Darslik 6", name: "Texnologiya", description: "Technology", locked: true },
      { id: 7, title: "Darslik 7", name: "Ekologiya", description: "Ecology", locked: true },
      { id: 8, title: "Darslik 8", name: "San'at", description: "Art", locked: true },
      { id: 9, title: "Darslik 9", name: "Adabiyot", description: "Literature", locked: true },
      { id: 10, title: "Darslik 10", name: "Tarix", description: "History", locked: true },
      { id: 11, title: "Darslik 11", name: "Geografiya", description: "Geography", locked: true },
      { id: 12, title: "Darslik 12", name: "Fan", description: "Science", locked: true },
      { id: 13, title: "Darslik 13", name: "Tibbiyot", description: "Medicine", locked: true },
      { id: 14, title: "Darslik 14", name: "Huquq", description: "Law", locked: true },
      { id: 15, title: "Darslik 15", name: "Media", description: "Media", locked: true },
      { id: 16, title: "Darslik 16", name: "Falsafa", description: "Philosophy", locked: true },
      { id: 17, title: "Darslik 17", name: "Din", description: "Religion", locked: true },
      { id: 18, title: "Darslik 18", name: "Psixologiya", description: "Psychology", locked: true },
      { id: 19, title: "Darslik 19", name: "Biznes", description: "Business", locked: true },
      { id: 20, title: "Darslik 20", name: "Takrorlash", description: "Review", locked: true },
    ],
  },
];

export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug);
}

export function getLessonById(slug: string, lessonId: number): Lesson | undefined {
  const course = getCourseBySlug(slug);
  return course?.lessons.find((l) => l.id === lessonId);
}
