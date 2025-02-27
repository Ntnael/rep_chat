import { NextResponse } from 'next/server';

// This is a mock API route that simulates an LLM API response
// In a real application, you would integrate with an actual LLM API like OpenAI

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple response logic based on keywords in the message
    let response = '';
    
    if (message.toLowerCase().includes('math') || message.toLowerCase().includes('mathematics')) {
      response = "Mathematics is the study of numbers, quantities, and shapes. It's a fundamental discipline that helps us understand patterns and relationships in the world. What specific area of mathematics would you like to explore?";
    } 
    else if (message.toLowerCase().includes('science')) {
      response = "Science is a systematic approach to understanding the natural world through observation and experimentation. It encompasses fields like physics, chemistry, biology, and more. Which scientific concept are you interested in learning about?";
    }
    else if (message.toLowerCase().includes('history')) {
      response = "History is the study of past events, particularly human affairs. It helps us understand how our present world came to be. Is there a specific historical period or event you'd like to discuss?";
    }
    else if (message.toLowerCase().includes('literature')) {
      response = "Literature encompasses written works valued for their form, ideas, and emotional impact. It includes poetry, novels, plays, and more. Which literary work or author are you interested in exploring?";
    }
    else if (message.toLowerCase().includes('computer') || message.toLowerCase().includes('programming')) {
      response = "Computer science is the study of computers and computational systems, including programming, algorithms, data structures, and more. What aspect of computer science would you like to learn about?";
    }
    else {
      response = "That's an interesting question! I'm here to help with your educational queries. Could you provide more details about what you'd like to learn?";
    }
    
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error processing chat request:', error);
    return NextResponse.json(
      { error: 'Failed to process your request' },
      { status: 500 }
    );
  }
}