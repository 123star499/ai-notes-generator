const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

// Explicitly pass the API key from environment variables
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function generateNotesFromAI(topic, format = "bullet-points") {
  const prompt = `
You are an expert academic tutor and note-maker.
Topic: "${topic}"
Format style: "${format}"

Generate comprehensive, well-structured revision notes.
Structure requirements:
- Title
- Core Summary (2-3 lines)
- Key Concepts (bulleted breakdown)
- Important Definitions / Formulas (if applicable)
- Quick Takeaway

Keep tone clear, scannable, and informative. Return Markdown formatted text.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text;
}

module.exports = { generateNotesFromAI };