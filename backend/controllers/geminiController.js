const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const { cosineSimilarity } = require("../utils/similarity");

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

// Dynamic prompting
exports.dynamicCategorize = async (req, res) => {
  const { transaction, amount, date } = req.body;
  try {
    const prompt = `
      Categorize the following financial transaction into one of these categories: Food, Transport, Bills, Entertainment, Other.
      Provide the category and a brief reason based on the transaction details.
      
      Transaction Details:
      Description: ${transaction}
      Amount: $${parseFloat(amount).toFixed(2)}
      Date: ${date}
      
      Return the response in this format:
      Category: <category>
      Reason: <reason>
    `;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    const [categoryLine, ...reasonLines] = responseText.split('\n');
    const category = categoryLine.replace('Category: ', '').trim();
    const reason = reasonLines.join(' ').replace('Reason: ', '').trim();
    res.json({ category, reason });
  } catch (error) {
    res.status(500).json({ error: 'Failed to categorize transaction' });
  }
};

// Embeddings and similarity
exports.categorizeWithSimilarity = async (req, res) => {
  const { transaction } = req.body;

  try {
    const categoryExamples = {
      Food: 'Groceries, restaurants, cafes, food delivery, snacks, drinks',
      Transport: 'Taxi rides, Uber, bus tickets, fuel purchase, metro pass',
      Bills: 'Electricity bill, water bill, internet subscription, phone recharge',
      Entertainment: 'Netflix, Spotify, movies, concerts, gaming, theme parks',
      Other: 'General shopping, random purchases, miscellaneous spending'
    };

    // Create embedding model
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

    // Embed the transaction
    const transactionEmbedding = await embeddingModel.embedContent(transaction);

    let maxSimilarity = -1;
    let bestCategory = 'Other';

    // Compare against each example
    for (const [category, example] of Object.entries(categoryExamples)) {
      const categoryEmbedding = await embeddingModel.embedContent(example);
      const similarity = cosineSimilarity(transactionEmbedding.embedding.values, categoryEmbedding.embedding.values);

      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        bestCategory = category;
      }
    }

    res.json({ category: bestCategory, similarity: maxSimilarity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to categorize transaction' });
}
};
