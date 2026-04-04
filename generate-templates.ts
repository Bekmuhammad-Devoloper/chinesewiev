/**
 * Generate template Word files for Dialog and Grammar
 * Run: npx tsx generate-templates.ts
 */
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from "docx";
import * as fs from "fs";

async function generateDialogTemplate() {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Title
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [
            new TextRun({ text: "DIALOG NAMUNASI", bold: true, size: 32, font: "Arial" }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [
            new TextRun({ text: "(Bu faylni o'zgartirib, o'z dialoglaringizni yozing)", size: 20, color: "888888", font: "Arial" }),
          ],
        }),

        // ═══════════════════════════════════
        // Dialog 1: Salomlashuv
        // ═══════════════════════════════════
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 600, after: 200 },
          children: [
            new TextRun({ text: "Salomlashuv", bold: true, size: 28, font: "Arial" }),
          ],
        }),

        // Line 1
        new Paragraph({
          spacing: { before: 200 },
          children: [
            new TextRun({ text: "李明 (Lǐ Míng): ", bold: true, size: 24, font: "Arial" }),
            new TextRun({ text: "你好！我是李明。", size: 24, font: "SimSun" }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Nǐ hǎo! Wǒ shì Lǐ Míng.", size: 22, italics: true, color: "E8632B", font: "Arial" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({ text: "Salom! Men Li Mingman.", size: 22, font: "Arial" }),
          ],
        }),

        // Line 2
        new Paragraph({
          spacing: { before: 200 },
          children: [
            new TextRun({ text: "王芳 (Wáng Fāng): ", bold: true, size: 24, font: "Arial" }),
            new TextRun({ text: "你好！我是王芳。你好吗？", size: 24, font: "SimSun" }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Nǐ hǎo! Wǒ shì Wáng Fāng. Nǐ hǎo ma?", size: 22, italics: true, color: "E8632B", font: "Arial" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({ text: "Salom! Men Vang Fangman. Qalaysiz?", size: 22, font: "Arial" }),
          ],
        }),

        // Line 3
        new Paragraph({
          spacing: { before: 200 },
          children: [
            new TextRun({ text: "李明: ", bold: true, size: 24, font: "Arial" }),
            new TextRun({ text: "我很好，谢谢！你呢？", size: 24, font: "SimSun" }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Wǒ hěn hǎo, xièxie! Nǐ ne?", size: 22, italics: true, color: "E8632B", font: "Arial" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({ text: "Men juda yaxshiman, rahmat! Siz-chi?", size: 22, font: "Arial" }),
          ],
        }),

        // Line 4
        new Paragraph({
          spacing: { before: 200 },
          children: [
            new TextRun({ text: "王芳: ", bold: true, size: 24, font: "Arial" }),
            new TextRun({ text: "我也很好。再见！", size: 24, font: "SimSun" }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Wǒ yě hěn hǎo. Zàijiàn!", size: 22, italics: true, color: "E8632B", font: "Arial" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 400 },
          children: [
            new TextRun({ text: "Men ham yaxshiman. Xayr!", size: 22, font: "Arial" }),
          ],
        }),

        // ═══════════════════════════════════
        // Dialog 2: Gaplashuv
        // ═══════════════════════════════════
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 600, after: 200 },
          children: [
            new TextRun({ text: "Gaplashuv", bold: true, size: 28, font: "Arial" }),
          ],
        }),

        // Line 1
        new Paragraph({
          spacing: { before: 200 },
          children: [
            new TextRun({ text: "张伟 (Zhāng Wěi): ", bold: true, size: 24, font: "Arial" }),
            new TextRun({ text: "你叫什么名字？", size: 24, font: "SimSun" }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Nǐ jiào shénme míngzì?", size: 22, italics: true, color: "E8632B", font: "Arial" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({ text: "Ismingiz nima?", size: 22, font: "Arial" }),
          ],
        }),

        // Line 2
        new Paragraph({
          spacing: { before: 200 },
          children: [
            new TextRun({ text: "赵强 (Zhào Qiáng): ", bold: true, size: 24, font: "Arial" }),
            new TextRun({ text: "我叫赵强。你是哪国人？", size: 24, font: "SimSun" }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Wǒ jiào Zhào Qiáng. Nǐ shì nǎ guó rén?", size: 22, italics: true, color: "E8632B", font: "Arial" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({ text: "Mening ismim Jao Chyang. Siz qayerliksiz?", size: 22, font: "Arial" }),
          ],
        }),

        // ═══════════════════════════════════
        // Instructions
        // ═══════════════════════════════════
        new Paragraph({
          spacing: { before: 800 },
          border: {
            top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
          },
          children: [],
        }),
        new Paragraph({
          spacing: { before: 200 },
          children: [
            new TextRun({ text: "📌 QOIDA:", bold: true, size: 22, color: "E8632B", font: "Arial" }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Har bir dialog uchun Heading 1 sarlavha qo'ying (dialog nomi bo'ladi)", size: 20, font: "Arial" }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Har bir dialog satri 3 ta paragrafdan iborat:", size: 20, font: "Arial" }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "  1-qator: So'zlovchi: Xitoycha matn", size: 20, font: "Arial" }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "  2-qator: Pinyin", size: 20, font: "Arial" }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "  3-qator: Tarjima", size: 20, font: "Arial" }),
          ],
        }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("public/assets/dialog-shablon.docx", buffer);
  console.log("✅ Dialog shablon yaratildi: public/assets/dialog-shablon.docx");
}

async function generateGrammarTemplate() {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Title
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [
            new TextRun({ text: "GRAMMATIKA NAMUNASI", bold: true, size: 32, font: "Arial" }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [
            new TextRun({ text: "(Bu faylni o'zgartirib, o'z grammatika qoidalaringizni yozing)", size: 20, color: "888888", font: "Arial" }),
          ],
        }),

        // ═══════════════════════════════════
        // Topic 1: Salomlashuv grammatikasi
        // ═══════════════════════════════════
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 600, after: 200 },
          children: [
            new TextRun({ text: "Salomlashuv grammatikasi", bold: true, size: 28, font: "Arial" }),
          ],
        }),

        // Rule 1
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 400, after: 100 },
          children: [
            new TextRun({ text: "\"是\" (shì) — \"bo'lmoq\" fe'li", bold: true, size: 24, font: "Arial" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({ text: "\"是\" (shì) xitoy tilida eng ko'p ishlatiladigan fe'llardan biri bo'lib, \"bo'lmoq\" ma'nosini anglatadi. U ega va to'ldiruvchi o'rtasida keladi.", size: 22, font: "Arial" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({ text: "Struktura: ", bold: true, size: 22, font: "Arial" }),
            new TextRun({ text: "Ega + 是 + To'ldiruvchi", size: 22, font: "Arial" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 50 },
          children: [
            new TextRun({ text: "Misol: ", bold: true, size: 22, font: "Arial" }),
            new TextRun({ text: "我是学生 — Wǒ shì xuéshēng — Men talabaman", size: 22, font: "Arial" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 50 },
          children: [
            new TextRun({ text: "他是老师 — Tā shì lǎoshī — U o'qituvchi", size: 22, font: "Arial" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({ text: "Maslahat: ", bold: true, size: 22, font: "Arial" }),
            new TextRun({ text: "\"是\" ni inkor qilish uchun oldiga \"不\" (bù) qo'ying: 我不是学生", size: 22, font: "Arial" }),
          ],
        }),

        // Rule 2
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 400, after: 100 },
          children: [
            new TextRun({ text: "\"你好\" (nǐ hǎo) — Salomlashish", bold: true, size: 24, font: "Arial" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({ text: "\"你好\" xitoy tilida eng keng tarqalgan salomlashish ifodasi. \"你\" (nǐ) — \"sen/siz\", \"好\" (hǎo) — \"yaxshi\" ma'nosini beradi.", size: 22, font: "Arial" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 50 },
          children: [
            new TextRun({ text: "Misol: ", bold: true, size: 22, font: "Arial" }),
            new TextRun({ text: "你好！ — Nǐ hǎo! — Salom!", size: 22, font: "Arial" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 50 },
          children: [
            new TextRun({ text: "老师好！ — Lǎoshī hǎo! — Salom, ustoz!", size: 22, font: "Arial" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({ text: "Maslahat: ", bold: true, size: 22, font: "Arial" }),
            new TextRun({ text: "Rasmiy hollarda \"您好\" (nín hǎo) ishlating", size: 22, font: "Arial" }),
          ],
        }),

        // ═══════════════════════════════════
        // Topic 2: Gaplar
        // ═══════════════════════════════════
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 600, after: 200 },
          children: [
            new TextRun({ text: "Gaplar", bold: true, size: 28, font: "Arial" }),
          ],
        }),

        // Rule 1
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 400, after: 100 },
          children: [
            new TextRun({ text: "So'roq gap \"吗\" (ma) bilan", bold: true, size: 24, font: "Arial" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({ text: "Xitoy tilida oddiy gapni so'roq gapga aylantirish uchun oxiriga \"吗\" (ma) qo'shiladi. Gap tuzilishi o'zgarmaydi.", size: 22, font: "Arial" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({ text: "Struktura: ", bold: true, size: 22, font: "Arial" }),
            new TextRun({ text: "Darak gap + 吗？", size: 22, font: "Arial" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 50 },
          children: [
            new TextRun({ text: "Misol: ", bold: true, size: 22, font: "Arial" }),
            new TextRun({ text: "你好吗？ — Nǐ hǎo ma? — Qalaysiz?", size: 22, font: "Arial" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 50 },
          children: [
            new TextRun({ text: "你是学生吗？ — Nǐ shì xuéshēng ma? — Siz talabamisiz?", size: 22, font: "Arial" }),
          ],
        }),

        // ═══════════════════════════════════
        // Instructions
        // ═══════════════════════════════════
        new Paragraph({
          spacing: { before: 800 },
          border: {
            top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
          },
          children: [],
        }),
        new Paragraph({
          spacing: { before: 200 },
          children: [
            new TextRun({ text: "📌 QOIDA:", bold: true, size: 22, color: "E8632B", font: "Arial" }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Heading 1 — mavzu nomi (masalan: Salomlashuv grammatikasi)", size: 20, font: "Arial" }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Heading 3 yoki Bold matn — qoida sarlavhasi", size: 20, font: "Arial" }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Oddiy matn — tushuntirish", size: 20, font: "Arial" }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• \"Struktura: ...\" — gap tuzilishi", size: 20, font: "Arial" }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• \"Misol: 汉字 — Pinyin — Tarjima\" — misol", size: 20, font: "Arial" }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• \"Maslahat: ...\" — foydali maslahat", size: 20, font: "Arial" }),
          ],
        }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("public/assets/grammatika-shablon.docx", buffer);
  console.log("✅ Grammatika shablon yaratildi: public/assets/grammatika-shablon.docx");
}

async function main() {
  await generateDialogTemplate();
  await generateGrammarTemplate();
  console.log("\n🎉 Barcha shablonlar tayyor!");
}

main().catch(console.error);
