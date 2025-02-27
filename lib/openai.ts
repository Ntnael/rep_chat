import OpenAI from 'openai';

// Initialize the OpenAI client with the API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateAIResponse(
  userMessage: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<string> {
  try {
    // Prepare the messages array with conversation history and the new user message
    const messages = [
      {
        role: 'system',
        content: 'You are an educational AI assistant designed to help users learn various subjects. Provide helpful, accurate, and concise responses.',
      },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 500,
    });

    // Extract and return the AI's response
    const aiResponse = response.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response.';
    return aiResponse;
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error('Failed to generate AI response');
  }
} 