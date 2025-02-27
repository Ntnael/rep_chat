"use client";

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { ChatWindow } from '@/components/chat-window';
import { QuestionsPanel } from '@/components/questions-panel';

export default function Home() {
  const [questionsVisible, setQuestionsVisible] = useState(false);

  const toggleQuestions = () => {
    setQuestionsVisible(!questionsVisible);
  };

  const handleSelectQuestion = (question: string) => {
    // In a real app, this would be passed to the chat input
    console.log("Selected question:", question);
    // For now, we'll just close the panel
    setQuestionsVisible(false);
  };

  const handleNewChat = () => {
    // In a real app, this would create a new conversation
    console.log("Creating new chat");
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar onNewChat={handleNewChat} />
      
      <main className={`flex-1 flex flex-col overflow-hidden relative transition-all duration-300 ${questionsVisible ? "mr-[700px]" : ""}`}>
        <ChatWindow 
          toggleQuestions={toggleQuestions} 
          questionsVisible={questionsVisible} 
        />
        
        <QuestionsPanel 
          isVisible={questionsVisible} 
          onClose={toggleQuestions}
          onSelectQuestion={handleSelectQuestion}
        />
      </main>
    </div>
  );
}