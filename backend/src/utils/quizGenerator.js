const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Uses Gemini to generate a JSON array of quiz questions strictly from the given transcript.
 * @param {String} targetTopic - The topic of the subtopic
 * @param {String} transcript - The YouTube transcript text
 */
const generateQuizFromTranscript = async (targetTopic, transcript) => {
    if (!transcript) return null;
    
    // Constraint 1: Truncate transcript to first 15k chars to save tokens
    const limitedTranscript = transcript.substring(0, 15000);

    const prompt = `
    Create a multiple-choice quiz (3 to 6 questions) to test comprehension of the topic: '${targetTopic}'. 
    The questions MUST be based STRICTLY on the facts in the provided transcript. 
    
    Output ONLY a valid JSON array of objects matching this exact structure:
    [
      {
        "question": "What is the primary function of...?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "Option B",
        "explanation": "Option B is correct because..."
      }
    ]
    
    CRITICAL: The 'correctAnswer' string MUST be an exact, character-for-character match with one of the strings in the 'options' array. This is required so the frontend can check the user's answer directly without needing an AI.
    
    TRANSCRIPT:
    ${limitedTranscript}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', // Constraint 2: Use 2.5-flash
            contents: prompt,
            config: {
                // Constraint 2: Force strict JSON output
                responseMimeType: "application/json",
            }
        });

        const resultText = response.text;
        const resultData = JSON.parse(resultText);
        return resultData;
    } catch (error) {
        console.error("Quiz Generation Failed:", error);
        return null;
    }
};

module.exports = { generateQuizFromTranscript };
