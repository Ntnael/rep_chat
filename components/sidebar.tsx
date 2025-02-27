"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, MessageSquare, Settings, BookOpen, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  onNewChat: () => void;
}

export function Sidebar({ onNewChat }: SidebarProps) {
  const [conversations, setConversations] = useState([
    { id: '1', title: 'Introduction to Algebra' },
    { id: '2', title: 'Newton\'s Laws of Motion' },
    { id: '3', title: 'World War II Causes' },
  ]);
  
  const [activeConversation, setActiveConversation] = useState('1');

  return (
    <div className="flex flex-col h-full w-64 bg-muted/40 border-r">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-6">
          <GraduationCap className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">EduAI</h1>
        </div>
        
        <Button className="w-full justify-start" onClick={onNewChat}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Conversation
        </Button>
      </div>
      
      <Separator />
      
      <ScrollArea className="flex-1 px-2 py-4">
        <div className="space-y-1">
          {conversations.map((conversation) => (
            <Button
              key={conversation.id}
              variant={activeConversation === conversation.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                activeConversation === conversation.id && "font-medium"
              )}
              onClick={() => setActiveConversation(conversation.id)}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              <span className="truncate">{conversation.title}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <BookOpen className="h-5 w-5" />
          </Button>
          <ThemeToggle />
        </div>
        
        <div className="text-xs text-muted-foreground text-center">
          © 2025 EduAI Learning Platform
        </div>
      </div>
    </div>
  );
}