const { onRequest } = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/generative-ai");

// --- تهيئة تطبيق Express ---
const app = express();

// --- حل مشكلة الـ CORS بشكل جذري وصحيح ---
// يتيح هذا الـ Middleware للمتصفح (مثل localhost) الاتصال بالسيرفر دون قيود الأمن المحلية
app.use(cors({ origin: true }));

// تفعيل قراءة البيانات القادمة بصيغة JSON
app.use(express.json());

// --- تهيئة مكتبة Google Gemini API ---
// تأكد من تعيين المتغير GEMINI_API_KEY في إعدادات Firebase Cloud Functions
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- الـ Route الرئيسي لمعالجة طلبات الذكاء الاصطناعي ---
app.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;

    // التحقق من وجود النص المرسل
    if (!prompt) {
      return res.status(400).json({ error: "الرجاء إرسال نص الـ prompt في جسم الطلب." });
    }

    // استدعاء الموديل (Gemini 1.5 Flash أو الموديل الذي تعتمد عليه)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // توليد المحتوى بناءً على الطلب القادم من الـ Frontend
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // إرسال النتيجة متوافقة تماماً مع حقل reply المتوقع في الـ Frontend
    return res.status(200).json({ reply: text });

  } catch (error) {
    console.error("Error invoking Gemini API:", error);
    return res.status(500).json({ 
      error: "حدث خطأ داخلي في السيرفر أثناء معالجة الطلب.",
      details: error.message 
    });
  }
});

// --- تصدير الدالة لتشغيلها كـ Cloud Function سحابية ---
// اسم الدالة هنا هو askgemini وهو المسؤول عن توليد الرابط الخارجي
exports.askgemini = onRequest({ cors: true }, app);