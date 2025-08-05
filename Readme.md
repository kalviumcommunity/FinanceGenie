# FinanceGenie – Your Smart Budget Assistant


## 📘 Project Overview

**FinanceGenie** is a smart budgeting assistant that helps users track expenses, manage financial goals, and understand their spending patterns using conversational AI. 

Users can:
- Ask natural language questions like “What did I spend most on in June?”
- Automatically add new expenses or generate monthly reports
- View clean, structured summaries of income and spending
- Get insights using historical data like past reports and notes

FinanceGenie is powered by Large Language Models (LLMs) enhanced with four core AI capabilities:

1. **Prompting**
2. **Retrieval-Augmented Generation (RAG)**
3. **Structured Output**
4. **Function Calling**

---

## 🧠 Core AI Concepts and Implementation

---

### 🔹 1. Prompting

**Prompting** is how the AI understands and responds to user queries using natural language. Carefully engineered prompts guide the LLM to:
- Interpret user intent clearly
- Respond in a consistent and useful format
- Avoid ambiguity or off-topic answers

#### 🔧 How Prompting Works in FinanceGenie:
- We create **system prompts** that define the assistant's role (e.g., “You are a budget advisor…”).
- We use **user prompts** like:  
  > “Summarize my spending last month.”  
  > “How can I cut back on entertainment expenses?”

### 🔹 2. Retrieval-Augmented Generation (RAG)

**RAG** enhances the AI’s answers by pulling in real, user-specific data—like old budget reports, transaction logs, or notes—and using it to answer questions.

#### 🔧 How RAG Works in FinanceGenie:
- We store **user history** (past budgets, expenses, reports, notes) in a **vector database** like FAISS or ChromaDB.
- When a user asks a question, like:  
  > “Did I spend more on groceries in May or June?”  
  1. The query is **embedded** into a vector.
  2. The system performs a **semantic search** in the vector DB.
  3. The top relevant documents are **retrieved** and added to the prompt.
  4. The LLM uses this additional context to form a more accurate answer.

### 🔹 3. Structured Output

**Structured Output** ensures that the AI’s responses are not just plain text, but in a predictable format like **JSON** or **tables**, so they can be parsed, displayed, or stored easily.

#### 🔧 How Structured Output Works in FinanceGenie:
- The LLM is prompted to return data in **structured formats** such as:
  - JSON for API integration
  - Markdown tables for UI rendering
- We use OpenAI’s **function calling-compatible outputs** or parsing libraries to ensure correct formatting.

### 🔹 4. Function Calling

**Function Calling** allows the AI model to execute backend operations in response to user commands expressed in natural language. Instead of just replying with information, the LLM understands the intent and **calls actual backend functions** to perform tasks like logging an expense, generating a report, or comparing two months’ budgets.