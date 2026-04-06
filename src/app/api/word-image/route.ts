import { NextRequest, NextResponse } from "next/server";

/**
 * Uzbekcha/Xitoycha so'zni Inglizchaga tarjima qilib, Pixabay'dan rasm qidirish.
 * GET /api/word-image?hanzi=你好&translation=Salom
 */

// Xitoycha → Inglizcha
const hanziToEn: Record<string, string> = {
  "你好": "hello greeting", "你": "you person", "好": "good thumbs up",
  "吗": "question", "我": "me person", "很": "very star",
  "谢谢": "thank you", "不": "no stop", "再见": "goodbye wave",
  "请": "please", "是": "yes check", "他": "man boy", "她": "woman girl",
  "们": "people group", "也": "together",
  "一": "number one", "二": "number two", "三": "number three",
  "四": "number four", "五": "number five hand", "六": "number six",
  "七": "number seven", "八": "number eight", "九": "number nine",
  "十": "number ten", "零": "zero",
  "爸爸": "father family", "妈妈": "mother family", "哥哥": "brother boy",
  "姐姐": "sister girl", "弟弟": "little brother", "妹妹": "little sister",
  "爷爷": "grandfather", "奶奶": "grandmother", "家": "house home family",
  "人": "person human", "朋友": "friends", "老师": "teacher classroom",
  "学生": "student studying", "医生": "doctor medical",
  "米饭": "rice food", "面条": "noodles", "饺子": "dumplings",
  "面包": "bread", "水果": "fruit colorful", "苹果": "apple fruit",
  "水": "water glass", "茶": "tea cup", "咖啡": "coffee",
  "猫": "cat kitten cute", "狗": "dog puppy", "鸟": "bird",
  "鱼": "fish", "马": "horse", "兔子": "rabbit bunny",
  "花": "flower garden", "树": "tree nature", "山": "mountain",
  "海": "ocean sea", "太阳": "sun sunshine", "月亮": "moon night",
  "书": "book reading", "电脑": "computer laptop", "手机": "smartphone",
  "车": "car automobile", "飞机": "airplane", "火车": "train",
  "学校": "school building", "医院": "hospital",
  "天气": "weather", "下雨": "rain", "下雪": "snow winter",
  "热": "hot sun", "冷": "cold winter",
  "足球": "football soccer", "篮球": "basketball",
  "钱": "money coins", "衣服": "clothes fashion",
  "爱": "love heart", "高兴": "happy smile",
};

// Uzbekcha → Inglizcha
const uzToEn: Record<string, string> = {
  "salom": "hello greeting", "sen": "person", "yaxshi": "good",
  "men": "person", "rahmat": "thank you", "xayr": "goodbye wave",
  "iltimos": "please", "juda": "very", "ham": "together",
  "bir": "number one", "ikki": "number two", "uch": "number three",
  "to'rt": "number four", "besh": "number five", "olti": "number six",
  "yetti": "number seven", "sakkiz": "number eight", "to'qqiz": "number nine",
  "o'n": "number ten", "nol": "zero",
  "ota": "father family", "ona": "mother family", "aka": "brother",
  "opa": "sister", "oila": "happy family", "bola": "child kid",
  "do'st": "friends", "o'qituvchi": "teacher", "talaba": "student",
  "shifokor": "doctor", "haydovchi": "driver car",
  "bugun": "today calendar", "ertaga": "tomorrow sunrise", "kecha": "yesterday",
  "qizil": "red color", "ko'k": "blue sky", "yashil": "green nature",
  "sariq": "yellow sun", "oq": "white clean", "qora": "black dark",
  "guruch": "rice food", "non": "bread", "go'sht": "meat food",
  "baliq": "fish", "meva": "fruit", "sabzavot": "vegetables",
  "suv": "water glass", "choy": "tea cup", "kofe": "coffee", "sut": "milk",
  "mushuk": "cat cute", "it": "dog puppy", "qush": "bird",
  "ot": "horse", "sigir": "cow farm", "qo'y": "sheep",
  "mashina": "car", "avtobus": "bus", "poyezd": "train", "samolyot": "airplane",
  "maktab": "school", "kasalxona": "hospital", "do'kon": "shop store",
  "issiq": "hot sun", "sovuq": "cold winter", "yomg'ir": "rain",
  "qor": "snow winter", "quyosh": "sun bright",
  "futbol": "football soccer", "basketbol": "basketball",
  "kitob": "book reading", "qalam": "pen pencil", "kompyuter": "computer",
  "telefon": "phone", "gul": "flower", "daraxt": "tree nature",
  "tog'": "mountain", "dengiz": "sea ocean",
  "sevgi": "love heart", "xursand": "happy smile",
  "pul": "money", "kiyim": "clothes",
  "so'roq": "question mark",
};

// In-memory kesh (24 soat)
const imageCache = new Map<string, { url: string | null; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 soat

function getSearchQuery(hanzi: string, translation: string): string {
  if (hanziToEn[hanzi]) return hanziToEn[hanzi];
  const lower = translation.toLowerCase().trim();
  if (uzToEn[lower]) return uzToEn[lower];
  for (const [key, value] of Object.entries(uzToEn)) {
    if (lower.includes(key) || key.includes(lower)) return value;
  }
  // Fallback: tarjimani ishlatish
  return translation;
}

const PIXABAY_KEY = process.env.PIXABAY_API_KEY || "";

export async function GET(req: NextRequest) {
  const hanzi = req.nextUrl.searchParams.get("hanzi") || "";
  const translation = req.nextUrl.searchParams.get("translation") || "";

  if (!hanzi && !translation) {
    return NextResponse.json({ error: "hanzi yoki translation kerak" }, { status: 400 });
  }

  const cacheKey = `${hanzi}|${translation}`;

  // Keshdan tekshirish
  const cached = imageCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({ url: cached.url });
  }

  const query = getSearchQuery(hanzi, translation);

  if (!PIXABAY_KEY) {
    return NextResponse.json({ url: null, error: "API key not configured" });
  }

  try {
    // Avval illustration qidirish (bolalarga mos)
    const url1 = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(query)}&image_type=illustration&safesearch=true&per_page=3`;
    const res1 = await fetch(url1);
    const data1 = await res1.json();

    if (data1.hits?.length > 0) {
      const imageUrl = data1.hits[0].webformatURL;
      imageCache.set(cacheKey, { url: imageUrl, timestamp: Date.now() });
      return NextResponse.json({ url: imageUrl });
    }

    // Illustration topilmasa, photo qidirish
    const url2 = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(query)}&image_type=photo&safesearch=true&per_page=3`;
    const res2 = await fetch(url2);
    const data2 = await res2.json();

    if (data2.hits?.length > 0) {
      const imageUrl = data2.hits[0].webformatURL;
      imageCache.set(cacheKey, { url: imageUrl, timestamp: Date.now() });
      return NextResponse.json({ url: imageUrl });
    }

    // Hech narsa topilmasa
    imageCache.set(cacheKey, { url: null, timestamp: Date.now() });
    return NextResponse.json({ url: null });
  } catch {
    return NextResponse.json({ url: null, error: "Rasm qidirishda xatolik" });
  }
}
