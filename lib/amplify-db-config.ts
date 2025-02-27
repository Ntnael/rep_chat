import { PrismaClient } from '@prisma/client';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client
export const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// Create a DocumentClient for easier DynamoDB operations
export const docClient = DynamoDBDocument.from(dynamoClient);

// For development, we'll still use Prisma with PostgreSQL
// For production on Amplify, we'll use DynamoDB
const isProd = process.env.NODE_ENV === 'production';

// Initialize Prisma client for development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Table names for DynamoDB
export const TABLES = {
  USERS: 'EduAI-Users',
  SESSIONS: 'EduAI-Sessions',
  ACCOUNTS: 'EduAI-Accounts',
  CONVERSATIONS: 'EduAI-Conversations',
  MESSAGES: 'EduAI-Messages',
  QUESTIONS: 'EduAI-Questions',
  CACHE: 'EduAI-Cache',
};

// Helper functions for DynamoDB operations
export const dynamoDb = {
  // User operations
  async getUser(id: string) {
    if (!isProd) return prisma.user.findUnique({ where: { id } });
    
    const result = await docClient.get({
      TableName: TABLES.USERS,
      Key: { id },
    });
    return result.Item;
  },
  
  async getUserByEmail(email: string) {
    if (!isProd) return prisma.user.findUnique({ where: { email } });
    
    const result = await docClient.query({
      TableName: TABLES.USERS,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
    });
    return result.Items?.[0];
  },
  
  async createUser(user: any) {
    if (!isProd) return prisma.user.create({ data: user });
    
    await docClient.put({
      TableName: TABLES.USERS,
      Item: {
        ...user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
    return user;
  },
  
  // Session operations
  async getSession(sessionToken: string) {
    if (!isProd) return prisma.session.findUnique({ where: { sessionToken } });
    
    const result = await docClient.get({
      TableName: TABLES.SESSIONS,
      Key: { sessionToken },
    });
    return result.Item;
  },
  
  async createSession(session: any) {
    if (!isProd) return prisma.session.create({ data: session });
    
    await docClient.put({
      TableName: TABLES.SESSIONS,
      Item: session,
    });
    return session;
  },
  
  async deleteSession(sessionToken: string) {
    if (!isProd) return prisma.session.delete({ where: { sessionToken } });
    
    await docClient.delete({
      TableName: TABLES.SESSIONS,
      Key: { sessionToken },
    });
    return { sessionToken };
  },
  
  // Conversation operations
  async getConversations(userId: string) {
    if (!isProd) {
      return prisma.conversation.findMany({
        where: {
          participants: {
            some: {
              userId,
            },
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
    }
    
    const result = await docClient.query({
      TableName: TABLES.CONVERSATIONS,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    });
    return result.Items;
  },
  
  async createConversation(conversation: any) {
    if (!isProd) {
      return prisma.conversation.create({
        data: {
          title: conversation.title,
          participants: {
            create: {
              userId: conversation.userId,
            },
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });
    }
    
    const newConversation = {
      id: conversation.id,
      title: conversation.title,
      userId: conversation.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await docClient.put({
      TableName: TABLES.CONVERSATIONS,
      Item: newConversation,
    });
    return newConversation;
  },
  
  // Message operations
  async getMessages(conversationId: string) {
    if (!isProd) {
      return prisma.message.findMany({
        where: {
          conversationId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
    }
    
    const result = await docClient.query({
      TableName: TABLES.MESSAGES,
      KeyConditionExpression: 'conversationId = :conversationId',
      ExpressionAttributeValues: {
        ':conversationId': conversationId,
      },
      ScanIndexForward: true, // true for ascending order by sort key
    });
    return result.Items;
  },
  
  async createMessage(message: any) {
    if (!isProd) {
      return prisma.message.create({
        data: message,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });
    }
    
    const newMessage = {
      ...message,
      createdAt: new Date().toISOString(),
    };
    
    await docClient.put({
      TableName: TABLES.MESSAGES,
      Item: newMessage,
    });
    return newMessage;
  },
  
  // Cache operations
  async getCacheItem(key: string) {
    if (!isProd) {
      // In development, we don't need caching
      return null;
    }
    
    const result = await docClient.get({
      TableName: TABLES.CACHE,
      Key: { key },
    });
    
    const item = result.Item;
    if (!item) return null;
    
    // Check if cache is expired
    if (item.expiresAt && new Date(item.expiresAt) < new Date()) {
      await docClient.delete({
        TableName: TABLES.CACHE,
        Key: { key },
      });
      return null;
    }
    
    return item.value;
  },
  
  async setCacheItem(key: string, value: any, ttl: number = 3600) {
    if (!isProd) {
      // In development, we don't need caching
      return;
    }
    
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + ttl);
    
    await docClient.put({
      TableName: TABLES.CACHE,
      Item: {
        key,
        value,
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString(),
      },
    });
  },
  
  // Questions operations
  async getQuestionsByTopic(topic: string) {
    if (!isProd) {
      // In development, we'll use a mock implementation
      return [
        { id: '1', topic, question_text: 'What is the capital of France?', difficulty: 'easy' },
        { id: '2', topic, question_text: 'What is the square root of 144?', difficulty: 'medium' },
        { id: '3', topic, question_text: 'Explain the theory of relativity.', difficulty: 'hard' },
      ];
    }
    
    const result = await docClient.query({
      TableName: TABLES.QUESTIONS,
      IndexName: 'TopicIndex',
      KeyConditionExpression: 'topic = :topic',
      ExpressionAttributeValues: {
        ':topic': topic,
      },
    });
    return result.Items;
  },
}; 