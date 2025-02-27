import { Adapter } from "next-auth/adapters";
import { v4 as uuid } from "uuid";
import { docClient, TABLES } from "../amplify-db-config";

export function DynamoDBAdapter(): Adapter {
  return {
    async createUser(user) {
      const id = uuid();
      const newUser = {
        id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await docClient.put({
        TableName: TABLES.USERS,
        Item: newUser,
      });

      return newUser;
    },

    async getUser(id) {
      const result = await docClient.get({
        TableName: TABLES.USERS,
        Key: { id },
      });

      return result.Item || null;
    },

    async getUserByEmail(email) {
      const result = await docClient.query({
        TableName: TABLES.USERS,
        IndexName: "EmailIndex",
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: {
          ":email": email,
        },
      });

      return result.Items?.[0] || null;
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const result = await docClient.query({
        TableName: TABLES.ACCOUNTS,
        IndexName: "ProviderAccountIndex",
        KeyConditionExpression: "provider = :provider AND providerAccountId = :providerAccountId",
        ExpressionAttributeValues: {
          ":provider": provider,
          ":providerAccountId": providerAccountId,
        },
      });

      const account = result.Items?.[0];
      if (!account) return null;

      const userResult = await docClient.get({
        TableName: TABLES.USERS,
        Key: { id: account.userId },
      });

      return userResult.Item || null;
    },

    async updateUser(user) {
      const updatedUser = {
        ...user,
        updatedAt: new Date().toISOString(),
      };

      await docClient.put({
        TableName: TABLES.USERS,
        Item: updatedUser,
      });

      return updatedUser;
    },

    async deleteUser(userId) {
      // Delete user
      await docClient.delete({
        TableName: TABLES.USERS,
        Key: { id: userId },
      });

      // Delete user's sessions
      const sessionsResult = await docClient.query({
        TableName: TABLES.SESSIONS,
        IndexName: "UserIdIndex",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      });

      const sessions = sessionsResult.Items || [];
      for (const session of sessions) {
        await docClient.delete({
          TableName: TABLES.SESSIONS,
          Key: { sessionToken: session.sessionToken },
        });
      }

      // Delete user's accounts
      const accountsResult = await docClient.query({
        TableName: TABLES.ACCOUNTS,
        IndexName: "UserIdIndex",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      });

      const accounts = accountsResult.Items || [];
      for (const account of accounts) {
        await docClient.delete({
          TableName: TABLES.ACCOUNTS,
          Key: { id: account.id },
        });
      }
    },

    async linkAccount(account) {
      const newAccount = {
        id: uuid(),
        userId: account.userId,
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        refresh_token: account.refresh_token,
        access_token: account.access_token,
        expires_at: account.expires_at,
        token_type: account.token_type,
        scope: account.scope,
        id_token: account.id_token,
        session_state: account.session_state,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await docClient.put({
        TableName: TABLES.ACCOUNTS,
        Item: newAccount,
      });

      return newAccount;
    },

    async unlinkAccount({ providerAccountId, provider }) {
      const result = await docClient.query({
        TableName: TABLES.ACCOUNTS,
        IndexName: "ProviderAccountIndex",
        KeyConditionExpression: "provider = :provider AND providerAccountId = :providerAccountId",
        ExpressionAttributeValues: {
          ":provider": provider,
          ":providerAccountId": providerAccountId,
        },
      });

      const account = result.Items?.[0];
      if (!account) return;

      await docClient.delete({
        TableName: TABLES.ACCOUNTS,
        Key: { id: account.id },
      });
    },

    async createSession(session) {
      const newSession = {
        sessionToken: session.sessionToken,
        userId: session.userId,
        expires: session.expires.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await docClient.put({
        TableName: TABLES.SESSIONS,
        Item: newSession,
      });

      return newSession;
    },

    async getSessionAndUser(sessionToken) {
      const sessionResult = await docClient.get({
        TableName: TABLES.SESSIONS,
        Key: { sessionToken },
      });

      const session = sessionResult.Item;
      if (!session) return null;

      const userResult = await docClient.get({
        TableName: TABLES.USERS,
        Key: { id: session.userId },
      });

      const user = userResult.Item;
      if (!user) return null;

      return {
        session: {
          ...session,
          expires: new Date(session.expires),
        },
        user,
      };
    },

    async updateSession(session) {
      const updatedSession = {
        ...session,
        expires: session.expires.toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await docClient.put({
        TableName: TABLES.SESSIONS,
        Item: updatedSession,
      });

      return updatedSession;
    },

    async deleteSession(sessionToken) {
      await docClient.delete({
        TableName: TABLES.SESSIONS,
        Key: { sessionToken },
      });
    },
  };
} 