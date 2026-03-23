const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateSolutions = async (title, description, category) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are an AI assistant for a college support system. Generate alternative solutions for the following issue.

Issue Title: ${title}
Issue Description: ${description}
Category: ${category || 'General'}

Respond ONLY with a valid JSON object:
{
  "solutions": [
    {
      "solution": "description of alternative solution",
      "confidence": number between 0 and 1,
      "steps": ["step 1", "step 2", "step 3"]
    }
  ],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "relatedResources": ["resource 1", "resource 2"]
}`;

    const result = await model.generateContent(prompt);
    const content = result.response.text().trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Gemini response');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    return { success: true, data: analysis, raw: result };
  } catch (error) {
    logger.error(`Gemini service error: ${error.message}`);
    return {
      success: false,
      error: error.message,
      data: {
        solutions: [],
        recommendations: ['Contact department staff for assistance'],
        relatedResources: [],
      },
    };
  }
};

module.exports = { generateSolutions };
