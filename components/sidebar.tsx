"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  PlusCircle, 
  MessageSquare, 
  Settings, 
  BookOpen, 
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  const [collapsed, setCollapsed] = useState(false);
  const { data: session } = useSession();
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!session?.user?.name) return 'U';
    return session.user.name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="relative flex h-full">
      {/* Toggle button */}
      <Button 
        variant="secondary" 
        size="icon" 
        className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10 rounded-full shadow-md border border-border h-8 w-8"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>
      
      <div 
        className={cn(
          "flex flex-col h-full bg-muted/40 border-r transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="p-4">
          <div className="flex items-center gap-2 mb-6">
            <GraduationCap className="h-6 w-6 text-primary" />
            {!collapsed && <h1 className="text-xl font-bold">EduAI</h1>}
          </div>
          
          <Button 
            className={cn(
              "justify-start", 
              collapsed ? "w-8 p-0 h-8" : "w-full"
            )} 
            onClick={onNewChat}
          >
            <PlusCircle className={cn("h-4 w-4", !collapsed && "mr-2")} />
            {!collapsed && "New Conversation"}
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
                  activeConversation === conversation.id && "font-medium",
                  collapsed && "p-2"
                )}
                onClick={() => setActiveConversation(conversation.id)}
              >
                <MessageSquare className={cn("h-4 w-4", !collapsed && "mr-2")} />
                {!collapsed && <span className="truncate">{conversation.title}</span>}
              </Button>
            ))}
          </div>
        </ScrollArea>
        
        {/* User profile at bottom */}
        <div className="p-4 border-t">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            {!collapsed && (
              <Button variant="ghost" size="icon">
                <BookOpen className="h-5 w-5" />
              </Button>
            )}
            <ThemeToggle />
          </div>
          
          {/* User profile */}
          <div className={cn(
            "flex items-center gap-2 p-2 rounded-lg bg-muted/60 mt-2",
            collapsed && "justify-center"
          )}>
            <Avatar className="h-8 w-8 rounded-full">
              <AvatarImage src={session?.user?.image || ''} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {session?.user?.email || ''}
                </p>
              </div>
            )}
          </div>
          
          {!collapsed && (
            <div className="text-xs text-muted-foreground text-center mt-4">
              © 2025 EduAI Learning Platform
            </div>
          )}
        </div>
      </div>
    </div>
  );
}