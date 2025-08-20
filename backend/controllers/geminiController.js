const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Zero-shot prompting
exports.zeroShotCategorize = async (req, res) => {
  const { transaction } = req.body;
  try {
    const prompt = `
      Categorize the following financial transaction into one of these categories: Food, Transport, Bills, Entertainment, Other.
      Transaction: ${transaction}
      Return only the category name.
    `;
    const result = await model.generateContent(prompt);
    const category = result.response.text().trim();
    res.json({ category });
  } catch (error) {
    res.status(500).json({ error: 'Failed to categorize transaction' });
  }
};