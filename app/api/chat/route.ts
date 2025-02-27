import { NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/openai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';

// Determine if we're in production (Amplify) or development
const isProd = process.env.NODE_ENV === 'production';

// This is a mock API route that simulates an LLM API response
// In a real application, you would integrate with an actual LLM API like OpenAI

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { message, conversationHistory } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Create a cache key based on the message and conversation history
    const cacheKey = crypto
      .createHash('md5')
      .update(JSON.stringify({ message, conversationHistory }))
      .digest('hex');

    let response;

    // Check cache in production
    if (isProd) {
      const { dynamoDb } = await import('@/lib/amplify-db-config');
      
      // Try to get from cache first
      const cachedResponse = await dynamoDb.getCacheItem(`chat:${cacheKey}`);
      
      if (cachedResponse) {
        console.log('Cache hit for query:', cacheKey);
        response = cachedResponse;
      } else {
        console.log('Cache miss for query:', cacheKey);
        // Generate AI response using OpenAI
        response = await generateAIResponse(message, conversationHistory);
        
        // Cache the response (1 hour TTL)
        await dynamoDb.setCacheItem(`chat:${cacheKey}`, response, 3600);
      }
    } else {
      // In development, just generate the response without caching
      response = await generateAIResponse(message, conversationHistory);
    }

    // Log the interaction for analytics (in production)
    if (isProd && session?.user?.id) {
      const { dynamoDb } = await import('@/lib/amplify-db-config');
      const interactionId = crypto.randomUUID();
      
      // Store in DynamoDB (we could create a separate table for this)
      await dynamoDb.createMessage({
        id: interactionId,
        userId: session.user.id,
        content: message,
        role: 'user',
        timestamp: new Date().toISOString(),
      });
      
      await dynamoDb.createMessage({
        id: crypto.randomUUID(),
        userId: session.user.id,
        content: response,
        role: 'assistant',
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}