export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Topic {
  id: string;
  name: string;
}

export interface Question {
  id: string;
  question_text: string;
  topic: string;
}