const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

// Explicitly pass the API key from environment variables
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function generateNotesFromAI(topic, format = "bullet-points") {
  const prompt = `
You are a dedicated Academic Study Assistant and Revision Note Maker.

User Input Topic: "${topic}"
Requested Format: "${format}"

STRICT FILTERING RULES:
1. First, evaluate whether the user input topic is an educational, technical, academic, or professional learning subject (e.g., Computer Science, Engineering, Mathematics, Science, Literature, History, Economics, Languages, etc.).
2. If the topic is non-academic (e.g., casual greeting, chit-chat, cooking recipe, movie/celebrity gossip, jokes, gaming talk, general entertainment, or abusive/inappropriate prompts), DO NOT generate revision notes. Instead, strictly return EXACTLY this message:
"⚠️ **Educational Topics Only**: This tool is designed strictly for academic study and learning topics. Please enter a valid educational subject, concept, or curriculum topic to generate notes."

IF THE TOPIC IS ACADEMIC:
Generate comprehensive, well-structured revision notes with the following structure:
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