"use client";

import { useRef, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/types';
import { ChatMessage } from '@/components/chat-message';
import { ChatInput } from '@/components/chat-input';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  toggleQuestions: () => void;
  questionsVisible: boolean;
}

export function ChatWindow({ toggleQuestions, questionsVisible }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your educational AI assistant. How can I help you learn today?',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const getAIResponse = async (userMessage: string): Promise<string> => {
    try {
      // Prepare conversation history for the API
      const conversationHistory = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          conversationHistory
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }
      
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error fetching AI response:', error);
      throw error;
    }
  };

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Get AI response
      const responseContent = await getAIResponse(content);
      
      // Add AI message
      const aiMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
      console.error("Error getting AI response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
        
        {isLoading && (
          <div className="flex items-center justify-start gap-2 animate-pulse">
            <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
              <span className="h-4 w-4 bg-muted-foreground/50 rounded-full"></span>
            </div>
            <div className="h-10 w-24 bg-muted rounded-lg"></div>
          </div>
        )}
      </div>
      
      <div className="border-t p-4">
        <div className="flex items-center justify-between mb-2">
          <Button 
            variant={questionsVisible ? "secondary" : "outline"}
            size="sm" 
            onClick={toggleQuestions}
            className={cn(
              questionsVisible ? "bg-primary/10 border-primary/50" : "",
              "rounded-full"
            )}
          >
            <Lightbulb className={`h-4 w-4 mr-2 ${questionsVisible ? "text-primary" : ""}`} />
            {questionsVisible ? "Hide Questions" : "Show Questions"}
          </Button>
          <div className="text-xs text-muted-foreground">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
        <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}