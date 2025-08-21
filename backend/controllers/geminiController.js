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

// One-shot prompting
exports.oneShotCategorize = async (req, res) => {
  const { transaction } = req.body;
  try {
    const prompt = `
      Categorize the following financial transaction into one of these categories: Food, Transport, Bills, Entertainment, Other.
      
      Example:
      Transaction: Uber $12.00
      Category: Transport
      
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

// Multi-shot prompting
exports.multiShotCategorize = async (req, res) => {
  const { transaction } = req.body;
  try {
    const prompt = `
      Categorize the following financial transaction into one of these categories: Food, Transport, Bills, Entertainment, Other.
      
      Examples:
      Transaction: Uber $12.00
      Category: Transport
      Transaction: Netflix $15.99
      Category: Entertainment
      Transaction: Grocery Store $45.00
      Category: Food
      
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
