const OpenAI = require('openai');
const logger = require('../utils/logger');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const analyzeTicket = async (title, description, departments) => {
  try {
    const departmentList = departments.map((d) => d.name).join(', ');

    const prompt = `You are an AI assistant for a college support ticket system. Analyze the following support ticket and provide structured guidance.

Ticket Title: ${title}
Ticket Description: ${description}

Available Departments: ${departmentList}

Respond ONLY with a valid JSON object in the following format:
{
  "category": "string - specific category of the issue",
  "suggestedDepartment": "string - exact department name from the list above",
  "priority": "low|medium|high|urgent",
  "sentimentScore": number between -1 and 1,
  "urgencyScore": number between 0 and 10,
  "keywords": ["array", "of", "key", "terms"],
  "summary": "brief one-sentence summary",
  "solutions": [
    {
      "solution": "description of the solution",
      "confidence": number between 0 and 1,
      "steps": ["step 1", "step 2"]
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content.trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in OpenAI response');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    return { success: true, data: analysis, raw: response };
  } catch (error) {
    logger.error(`OpenAI service error: ${error.message}`);
    return {
      success: false,
      error: error.message,
      data: {
        category: 'General',
        suggestedDepartment: departments[0]?.name || 'Administration',
        priority: 'medium',
        sentimentScore: 0,
        urgencyScore: 5,
        keywords: [],
        summary: title,
        solutions: [],
      },
    };
  }
};

module.exports = { analyzeTicket };
