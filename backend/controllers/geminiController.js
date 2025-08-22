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


// --- CoT: Few-Shot (preferred) ---
exports.cotCategorize = async (req, res) => {
  try {
    const { transaction } = req.body;

    const prompt = `
      You are a finance categorization assistant.
      Task: Categorize the transaction into exactly one of: Food, Transport, Bills, Entertainment, Other.
      Think step by step, then OUTPUT ONLY JSON as:
      {"category":"<Food|Transport|Bills|Entertainment|Other>","brief_reason":"<max 1 sentence>"}

      Examples (reasoning shown, but final outputs are JSON only):

      Example 1
      Transaction: "Uber ride to office ₹220"
      Reasoning: "Uber is a ride-hailing service, clearly transportation."
      Output: {"category":"Transport","brief_reason":"Uber ride is transportation."}

      Example 2
      Transaction: "Netflix monthly plan ₹649"
      Reasoning: "Netflix is a streaming service used for entertainment."
      Output: {"category":"Entertainment","brief_reason":"Netflix is an entertainment subscription."}

      Now classify:
      Transaction: "${transaction}"
      Return only the JSON object.
      `;

    const result = await model.generateContent(prompt);

    let text = result.response.text().trim();

    // clean out accidental markdown fences
    text = text.replace(/```json|```/g, "").trim();

    // parse safely
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      const catMatch = text.match(/"category"\s*:\s*"([^"]+)"/i);
      const reasonMatch = text.match(/"brief_reason"\s*:\s*"([^"]+)"/i);
      data = {
        category: catMatch ? catMatch[1] : "Other",
        brief_reason: reasonMatch ? reasonMatch[1] : "Could not parse reason"
      };
    }

    return res.json(data);
  } catch (err) {
    console.error("cotCategorize error:", err);
    return res.status(500).json({ error: "Failed to run CoT categorize" });
  }
};
