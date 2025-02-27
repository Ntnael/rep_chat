"use client";

import { useState, useEffect } from 'react';
import { Question, Topic } from '@/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

interface QuestionsPanelProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectQuestion: (question: string) => void;
}

export function QuestionsPanel({ isVisible, onClose, onSelectQuestion }: QuestionsPanelProps) {
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch topics from API
  useEffect(() => {
    async function fetchTopics() {
      try {
        // In a real app, this would be an API call
        // For now, we'll use the mock data directly
        const mockTopics = [
          { id: '1', name: 'Mathematics' },
          { id: '2', name: 'Science' },
          { id: '3', name: 'History' },
          { id: '4', name: 'Literature' },
          { id: '5', name: 'Computer Science' },
        ];
        
        setTopics(mockTopics);
        
        // Set default topic if none selected
        if (!selectedTopic && mockTopics.length > 0) {
          setSelectedTopic(mockTopics[0].name);
        }
      } catch (error) {
        console.error('Error fetching topics:', error);
      }
    }
    
    fetchTopics();
  }, []);

  // Fetch questions when topic changes
  useEffect(() => {
    async function fetchQuestions() {
      if (!selectedTopic) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/questions?topic=${encodeURIComponent(selectedTopic)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }
        
        const data = await response.json();
        setQuestions(data.questions);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setQuestions([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchQuestions();
  }, [selectedTopic]);

  const handleTopicChange = (value: string) => {
    setSelectedTopic(value);
  };

  const handleQuestionClick = (question: Question) => {
    onSelectQuestion(question.question_text);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 w-[700px] h-[700px] bg-card border rounded-xl shadow-xl z-10 flex flex-col">
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-xl font-semibold">Suggested Questions</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-muted">
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="p-6 border-b">
        <div className="mb-2 text-sm font-medium text-muted-foreground">Select a topic to explore</div>
        <Select value={selectedTopic} onValueChange={handleTopicChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a topic" />
          </SelectTrigger>
          <SelectContent>
            {topics.map((topic) => (
              <SelectItem key={topic.id} value={topic.name}>
                {topic.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-16 bg-muted/60 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : (
            <>
              {selectedTopic && (
                <h3 className="text-lg font-medium mb-4">{selectedTopic} Questions</h3>
              )}
              {questions.length > 0 ? (
                <div className="grid gap-3">
                  {questions.map((question) => (
                    <Button
                      key={question.id}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-4 px-5 hover:bg-muted/50 hover:border-primary/50 transition-colors"
                      onClick={() => handleQuestionClick(question)}
                    >
                      <div>
                        <span className="text-primary font-medium">Q:</span> {question.question_text}
                      </div>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-60 text-center">
                  <p className="text-muted-foreground mb-2">No questions available for this topic.</p>
                  <p className="text-sm text-muted-foreground">Try selecting a different topic from the dropdown above.</p>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}