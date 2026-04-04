import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";

/**
 * POST /api/parse-docx?type=dialogue|grammar
 * 
 * Accepts a .docx file and parses its text content.
 * Returns raw text lines for the client to process.
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
    const result = await mammoth.extractRawText({ buffer });
    const rawText = result.value;

    if (type === "dialogue") {
      const dialogues = parseDialogueText(rawText);
      return NextResponse.json({ dialogues });
    } else if (type === "grammar") {
      const grammar = parseGrammarText(rawText);
      return NextResponse.json({ grammar });
    }

    return NextResponse.json({ text: rawText });
  } catch (error) {
    console.error("DOCX parse error:", error);
    return NextResponse.json({ error: "Faylni o'qishda xatolik yuz berdi" }, { status: 500 });
  }
}

/**
 * Parse dialogue text from Word document.
 * 
 * Expected format — each dialogue separated by a blank line,
 * within a dialogue, each line group has 3 lines:
 * 
 * Speaker Xitoycha_matn
 * Pinyin matni
 * Tarjima matni
 * 
 * Or speaker and text separated by colon:
 * Speaker: Xitoycha_matn
 * Pinyin matni
 * Tarjima matni
 * 
 * If the document has section headings (like "Salomlashuv", "Gaplashuv"),
 * they become dialogue group titles.
 */
function parseDialogueText(raw: string): { title: string; dialogueLines: { speaker: string; text: string; pinyin: string; translation: string }[] }[] {
  const lines = raw.split("\n").map(l => l.trim());
  const dialogues: { title: string; dialogueLines: { speaker: string; text: string; pinyin: string; translation: string }[] }[] = [];

  let currentTitle = "";
  let currentLines: { speaker: string; text: string; pinyin: string; translation: string }[] = [];
  let buffer: string[] = [];

  const flushBuffer = () => {
    if (buffer.length >= 3) {
      // Process buffer in groups of 3
      for (let i = 0; i + 2 < buffer.length; i += 3) {
        const firstLine = buffer[i];
        const pinyin = buffer[i + 1];
        const translation = buffer[i + 2];

        // Parse speaker and text from first line
        let speaker = "";
        let text = "";
        
        // Try "Speaker: text" or "Speaker text" with Chinese chars
        const colonMatch = firstLine.match(/^(.+?)[:\uff1a]\s*(.+)$/);
        if (colonMatch) {
          speaker = colonMatch[1].trim();
          text = colonMatch[2].trim();
        } else {
          // Try to find where Chinese characters start
          const chineseMatch = firstLine.match(/^(.+?)\s+([\u4e00-\u9fff].+)$/);
          if (chineseMatch) {
            speaker = chineseMatch[1].trim();
            text = chineseMatch[2].trim();
          } else {
            text = firstLine;
          }
        }

        currentLines.push({ speaker, text, pinyin, translation });
      }
    } else if (buffer.length > 0) {
      // Less than 3 lines — might be a title/heading
      const possibleTitle = buffer.join(" ").trim();
      if (possibleTitle && !possibleTitle.match(/[\u4e00-\u9fff]/)) {
        // No Chinese characters — likely a section title
        if (currentLines.length > 0) {
          dialogues.push({ title: currentTitle || `Dialog ${dialogues.length + 1}`, dialogueLines: currentLines });
          currentLines = [];
        }
        currentTitle = possibleTitle;
      }
    }
    buffer = [];
  };

  for (const line of lines) {
    if (line === "") {
      flushBuffer();
    } else {
      buffer.push(line);
    }
  }
  flushBuffer();

  // Push remaining
  if (currentLines.length > 0) {
    dialogues.push({ title: currentTitle || `Dialog ${dialogues.length + 1}`, dialogueLines: currentLines });
  }

  // If no dialogues parsed, put everything in one
  if (dialogues.length === 0 && lines.filter(l => l).length > 0) {
    dialogues.push({
      title: "Dialog 1",
      dialogueLines: [{
        speaker: "",
        text: lines.filter(l => l).join(" "),
        pinyin: "",
        translation: ""
      }]
    });
  }

  return dialogues;
}

/**
 * Parse grammar text from Word document.
 * 
 * Expected format:
 * 
 * Topic Title
 * 
 * Rule title
 * Explanation text (can be multiple lines)
 * Structure: ...
 * Tip: ...
 * Example: Chinese — Pinyin — Translation
 */
function parseGrammarText(raw: string): { title: string; grammarRules: { id: string; title: string; explanation: string; structure: string; tip: string; examples: { chinese: string; pinyin: string; translation: string }[] }[] }[] {
  const lines = raw.split("\n").map(l => l.trim());
  const topics: { title: string; grammarRules: { id: string; title: string; explanation: string; structure: string; tip: string; examples: { chinese: string; pinyin: string; translation: string }[] }[] }[] = [];

  let currentTopic: typeof topics[0] | null = null;
  let currentRule: typeof topics[0]["grammarRules"][0] | null = null;
  let collectingExplanation = false;

  const flushRule = () => {
    if (currentRule && currentTopic) {
      currentTopic.grammarRules.push(currentRule);
      currentRule = null;
    }
    collectingExplanation = false;
  };

  const flushTopic = () => {
    flushRule();
    if (currentTopic) {
      topics.push(currentTopic);
      currentTopic = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line === "") {
      collectingExplanation = false;
      continue;
    }

    // Check for structure line
    const structMatch = line.match(/^(?:Struktura|Structure|Tuzilma)[:\uff1a]\s*(.+)/i);
    if (structMatch && currentRule) {
      currentRule.structure = structMatch[1].trim();
      collectingExplanation = false;
      continue;
    }

    // Check for tip line
    const tipMatch = line.match(/^(?:Maslahat|Tip|Eslatma)[:\uff1a]\s*(.+)/i);
    if (tipMatch && currentRule) {
      currentRule.tip = tipMatch[1].trim();
      collectingExplanation = false;
      continue;
    }

    // Check for example line
    const exMatch = line.match(/^(?:Misol|Example|Namuna)[:\uff1a]?\s*(.*)/i);
    if (exMatch && currentRule) {
      collectingExplanation = false;
      const exText = exMatch[1].trim();
      if (exText) {
        const parts = exText.split(/\s*[—–-]\s*/);
        currentRule.examples.push({
          chinese: parts[0]?.trim() || "",
          pinyin: parts[1]?.trim() || "",
          translation: parts[2]?.trim() || "",
        });
      }
      continue;
    }

    // Check for example continuation (Chinese — Pinyin — Translation pattern)
    if (currentRule && !collectingExplanation && line.match(/[\u4e00-\u9fff]/) && line.includes("—")) {
      const parts = line.split(/\s*[—–-]\s*/);
      if (parts.length >= 2) {
        currentRule.examples.push({
          chinese: parts[0]?.trim() || "",
          pinyin: parts[1]?.trim() || "",
          translation: parts[2]?.trim() || "",
        });
        continue;
      }
    }

    // Check for explanation line
    const explMatch = line.match(/^(?:Tushuntirish|Explanation|Izoh)[:\uff1a]\s*(.+)/i);
    if (explMatch && currentRule) {
      currentRule.explanation = explMatch[1].trim();
      collectingExplanation = true;
      continue;
    }

    // Check for rule title (line starting with number or "Qoida")
    const ruleMatch = line.match(/^(?:\d+[\.\)]\s*|Qoida[:\s]*)/i);
    if (ruleMatch && currentTopic) {
      flushRule();
      currentRule = {
        id: `gr-${Date.now()}-${i}`,
        title: line.replace(/^\d+[\.\)]\s*/, "").replace(/^Qoida[:\s]*/i, "").trim(),
        explanation: "",
        structure: "",
        tip: "",
        examples: []
      };
      collectingExplanation = true;
      continue;
    }

    // If we're collecting explanation text
    if (collectingExplanation && currentRule) {
      currentRule.explanation += (currentRule.explanation ? "\n" : "") + line;
      continue;
    }

    // Otherwise, treat as a new topic or rule
    if (!currentTopic) {
      currentTopic = { title: line, grammarRules: [] };
    } else if (!currentRule) {
      // This might be a rule title
      currentRule = {
        id: `gr-${Date.now()}-${i}`,
        title: line,
        explanation: "",
        structure: "",
        tip: "",
        examples: []
      };
      collectingExplanation = true;
    } else {
      // Continued text — probably explanation
      currentRule.explanation += (currentRule.explanation ? "\n" : "") + line;
    }
  }

  flushTopic();

  // If nothing parsed, create one topic with the raw text
  if (topics.length === 0 && lines.filter(l => l).length > 0) {
    topics.push({
      title: "Grammatika",
      grammarRules: [{
        id: `gr-${Date.now()}`,
        title: lines.filter(l => l)[0] || "Qoida",
        explanation: lines.filter(l => l).slice(1).join("\n"),
        structure: "",
        tip: "",
        examples: []
      }]
    });
  }

  return topics;
}
