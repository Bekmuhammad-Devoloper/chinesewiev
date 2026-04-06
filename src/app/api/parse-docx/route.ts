import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";

/**
 * POST /api/parse-docx?type=dialogue|grammar
 * 
 * Accepts a .docx file, converts to HTML with mammoth,
 * then parses headings + paragraphs into structured data.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = req.nextUrl.searchParams.get("type") || "dialogue";

    if (!file) {
      return NextResponse.json({ error: "Fayl topilmadi" }, { status: 400 });
    }

    // Validate file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    if (!validTypes.includes(file.type) && !file.name.endsWith(".docx") && !file.name.endsWith(".doc")) {
      return NextResponse.json({ error: "Faqat Word (.docx) fayl qabul qilinadi" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Get HTML to detect headings, bold, structure
    const htmlResult = await mammoth.convertToHtml({ buffer }, {
      styleMap: [
        "u => u",
        "strike => s",
      ],
    });
    const html = htmlResult.value;

    // Also get raw text as fallback
    const textResult = await mammoth.extractRawText({ buffer });
    const rawText = textResult.value;

    // Raw HTML mode — return full formatted HTML from Word
    if (type === "raw") {
      return NextResponse.json({ html });
    }

    if (type === "dialogue") {
      const dialogues = parseDialogueFromHtml(html, rawText);
      return NextResponse.json({ dialogues });
    } else if (type === "grammar") {
      const grammar = parseGrammarFromHtml(html, rawText);
      return NextResponse.json({ grammar });
    }

    return NextResponse.json({ text: rawText });
  } catch (error) {
    console.error("DOCX parse error:", error);
    return NextResponse.json({ error: "Faylni o'qishda xatolik yuz berdi" }, { status: 500 });
  }
}

/* ════════════════════════════════════════════════════════
 *  HELPER: strip HTML tags → plain text
 * ════════════════════════════════════════════════════════ */
function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ").trim();
}

/* ════════════════════════════════════════════════════════
 *  HELPER: split HTML into structural blocks (headings + paragraphs)
 * ════════════════════════════════════════════════════════ */
interface HtmlBlock {
  type: "heading" | "paragraph" | "list-item";
  level?: number; // h1=1, h2=2 etc
  text: string;
  html: string;
}

function parseHtmlBlocks(html: string): HtmlBlock[] {
  const blocks: HtmlBlock[] = [];
  // Match headings, paragraphs, list items
  const regex = /<(h[1-6]|p|li)[^>]*>([\s\S]*?)<\/\1>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const tag = match[1].toLowerCase();
    const content = match[2];
    const text = stripTags(content).trim();
    if (!text) continue;

    if (tag.startsWith("h")) {
      blocks.push({ type: "heading", level: parseInt(tag[1]), text, html: content });
    } else if (tag === "li") {
      blocks.push({ type: "list-item", text, html: content });
    } else {
      blocks.push({ type: "paragraph", text, html: content });
    }
  }

  // If no blocks parsed from HTML, fall back to splitting raw text by newlines
  if (blocks.length === 0) {
    const lines = stripTags(html).split("\n").map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      blocks.push({ type: "paragraph", text: line, html: line });
    }
  }

  return blocks;
}

/* ════════════════════════════════════════════════════════
 *  HELPER: detect if text contains Chinese characters
 * ════════════════════════════════════════════════════════ */
function hasChinese(text: string): boolean {
  return /[\u4e00-\u9fff\u3400-\u4dbf]/.test(text);
}

/* ════════════════════════════════════════════════════════
 *  HELPER: detect if text looks like pinyin (Latin with tone marks or numbers)
 * ════════════════════════════════════════════════════════ */
function looksLikePinyin(text: string): boolean {
  // Contains pinyin tone marks or is all-latin with tone numbers
  return /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(text) || 
    (/^[a-zA-Z\s,.\-!?;:'"()0-9]+$/.test(text) && /[a-z]/i.test(text) && text.length < 200);
}

/* ════════════════════════════════════════════════════════
 *  DIALOGUE PARSER — from HTML
 * 
 *  Strategy: 
 *  - Headings → dialogue group titles
 *  - Paragraphs → grouped into dialogue lines
 *  - Each line group: 3 consecutive paragraphs
 *    1) "Speaker: Chinese text" or "Speaker Chinese text"
 *    2) Pinyin
 *    3) Translation
 * ════════════════════════════════════════════════════════ */
function parseDialogueFromHtml(html: string, rawText: string): { title: string; dialogueLines: { speaker: string; text: string; pinyin: string; translation: string }[] }[] {
  const blocks = parseHtmlBlocks(html);
  const dialogues: { title: string; dialogueLines: { speaker: string; text: string; pinyin: string; translation: string }[] }[] = [];
  
  let currentTitle = "";
  let paragraphBuffer: string[] = [];

  const flushParagraphs = () => {
    if (paragraphBuffer.length === 0) return;

    const lines: { speaker: string; text: string; pinyin: string; translation: string }[] = [];
    
    // Group paragraphs in sets of 3: (speaker+chinese, pinyin, translation)
    let i = 0;
    while (i < paragraphBuffer.length) {
      const line1 = paragraphBuffer[i];
      
      // Check if this line has Chinese characters (dialogue first line)
      if (hasChinese(line1)) {
        let speaker = "";
        let text = line1;

        // Try to extract speaker: "Speaker: text" or "Speaker（Pinyin）text"
        const colonMatch = line1.match(/^(.+?)[:\uff1a]\s*([\u4e00-\u9fff].+)$/);
        const spaceMatch = line1.match(/^([^\u4e00-\u9fff]+?)\s+([\u4e00-\u9fff].+)$/);
        
        if (colonMatch) {
          speaker = colonMatch[1].trim();
          text = colonMatch[2].trim();
        } else if (spaceMatch && spaceMatch[1].trim().length < 40) {
          speaker = spaceMatch[1].trim();
          text = spaceMatch[2].trim();
        }

        const pinyin = (i + 1 < paragraphBuffer.length) ? paragraphBuffer[i + 1] : "";
        const translation = (i + 2 < paragraphBuffer.length) ? paragraphBuffer[i + 2] : "";
        
        lines.push({ speaker, text, pinyin, translation });
        i += 3;
      } else {
        // Not Chinese — skip (could be a stray header text that wasn't an HTML heading)
        i++;
      }
    }

    if (lines.length > 0) {
      dialogues.push({
        title: currentTitle || `Dialog ${dialogues.length + 1}`,
        dialogueLines: lines
      });
    }
    paragraphBuffer = [];
  };

  for (const block of blocks) {
    if (block.type === "heading") {
      // Flush any accumulated paragraphs as a dialogue
      flushParagraphs();
      currentTitle = block.text;
    } else {
      paragraphBuffer.push(block.text);
    }
  }
  flushParagraphs();

  // If nothing parsed, try raw text line-by-line
  if (dialogues.length === 0) {
    const rawLines = rawText.split("\n").map(l => l.trim()).filter(Boolean);
    const lines: { speaker: string; text: string; pinyin: string; translation: string }[] = [];
    
    for (let i = 0; i < rawLines.length; i += 3) {
      if (i + 2 < rawLines.length && hasChinese(rawLines[i])) {
        let speaker = "", text = rawLines[i];
        const cm = rawLines[i].match(/^(.+?)[:\uff1a]\s*([\u4e00-\u9fff].+)$/);
        if (cm) { speaker = cm[1].trim(); text = cm[2].trim(); }
        lines.push({ speaker, text, pinyin: rawLines[i+1], translation: rawLines[i+2] });
      }
    }
    
    if (lines.length > 0) {
      dialogues.push({ title: "Dialog 1", dialogueLines: lines });
    }
  }

  return dialogues;
}

/* ════════════════════════════════════════════════════════
 *  GRAMMAR PARSER — from HTML
 * 
 *  Strategy: preserve Word structure as-is
 *  - Headings → grammar topic titles
 *  - Bold text at start → rule titles 
 *  - Regular paragraphs → explanation
 *  - Lines with Chinese + pinyin + translation → examples
 *  
 *  Each topic gets ONE rule with all the text as explanation,
 *  so the Word content shows exactly as written.
 * ════════════════════════════════════════════════════════ */
function parseGrammarFromHtml(html: string, rawText: string): { title: string; grammarRules: { id: string; title: string; explanation: string; structure: string; tip: string; examples: { chinese: string; pinyin: string; translation: string }[] }[] }[] {
  const blocks = parseHtmlBlocks(html);
  const topics: { title: string; grammarRules: { id: string; title: string; explanation: string; structure: string; tip: string; examples: { chinese: string; pinyin: string; translation: string }[] }[] }[] = [];

  let currentTopic: typeof topics[0] | null = null;
  let currentRule: typeof topics[0]["grammarRules"][0] | null = null;

  const flushRule = () => {
    if (currentRule && currentTopic) {
      currentRule.explanation = currentRule.explanation.trim();
      currentTopic.grammarRules.push(currentRule);
    }
    currentRule = null;
  };

  const flushTopic = () => {
    flushRule();
    if (currentTopic && (currentTopic.grammarRules.length > 0 || currentTopic.title)) {
      topics.push(currentTopic);
    }
    currentTopic = null;
  };

  const ensureTopic = () => {
    if (!currentTopic) {
      currentTopic = { title: "Grammatika", grammarRules: [] };
    }
  };

  const ensureRule = (title?: string) => {
    ensureTopic();
    if (!currentRule) {
      currentRule = {
        id: `gr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: title || "",
        explanation: "",
        structure: "",
        tip: "",
        examples: []
      };
    }
  };

  for (const block of blocks) {
    const text = block.text;

    if (block.type === "heading") {
      if (block.level && block.level <= 2) {
        // Major heading → new topic
        flushTopic();
        currentTopic = { title: text, grammarRules: [] };
      } else {
        // Sub-heading → new rule title within topic
        ensureTopic();
        flushRule();
        currentRule = {
          id: `gr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title: text,
          explanation: "",
          structure: "",
          tip: "",
          examples: []
        };
      }
      continue;
    }

    // Check for structure/tip patterns
    const structMatch = text.match(/^(?:Struktura|Structure|Tuzilma|Tuzilish)[:\uff1a]\s*(.+)/i);
    if (structMatch) {
      ensureRule();
      currentRule!.structure = structMatch[1].trim();
      continue;
    }

    const tipMatch = text.match(/^(?:Maslahat|Tip|Eslatma|Note)[:\uff1a]\s*(.+)/i);
    if (tipMatch) {
      ensureRule();
      currentRule!.tip = tipMatch[1].trim();
      continue;
    }

    // Check for example pattern: Chinese — Pinyin — Translation
    const exampleMatch = text.match(/^(?:Misol|Example|Namuna)[:\uff1a]?\s*([\u4e00-\u9fff].+)/i);
    if (exampleMatch) {
      ensureRule();
      const parts = exampleMatch[1].split(/\s*[—–\-]\s*/);
      currentRule!.examples.push({
        chinese: parts[0]?.trim() || "",
        pinyin: parts[1]?.trim() || "",
        translation: parts[2]?.trim() || "",
      });
      continue;
    }

    // Check if line itself is Chinese—Pinyin—Translation example
    if (hasChinese(text) && (text.includes("—") || text.includes("–"))) {
      const parts = text.split(/\s*[—–]\s*/);
      if (parts.length >= 2) {
        ensureRule();
        currentRule!.examples.push({
          chinese: parts[0]?.trim() || "",
          pinyin: parts[1]?.trim() || "",
          translation: parts[2]?.trim() || "",
        });
        continue;
      }
    }

    // Check if this looks like a bold/numbered rule title from HTML
    const isBold = /<strong>|<b>/i.test(block.html);
    const isNumbered = /^\d+[\.\)]\s/.test(text);

    if ((isBold || isNumbered) && text.length < 150) {
      ensureTopic();
      flushRule();
      const title = text.replace(/^\d+[\.\)]\s*/, "").trim();
      currentRule = {
        id: `gr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title,
        explanation: "",
        structure: "",
        tip: "",
        examples: []
      };
      continue;
    }

    // Regular paragraph → add to explanation
    ensureRule(text.length < 100 ? text : "");
    if (currentRule!.title === text) {
      // Already used as title, skip
      continue;
    }
    currentRule!.explanation += (currentRule!.explanation ? "\n" : "") + text;
  }

  flushTopic();

  // Fallback: if nothing parsed, use raw text
  if (topics.length === 0) {
    const lines = rawText.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length > 0) {
      topics.push({
        title: lines[0],
        grammarRules: [{
          id: `gr-${Date.now()}`,
          title: lines.length > 1 ? lines[1] : "",
          explanation: lines.slice(2).join("\n"),
          structure: "",
          tip: "",
          examples: []
        }]
      });
    }
  }

  return topics;
}
