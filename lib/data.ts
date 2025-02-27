import { Topic, Question } from '@/types';

// Mock topics for demonstration
export const topics: Topic[] = [
  { id: '1', name: 'Mathematics' },
  { id: '2', name: 'Science' },
  { id: '3', name: 'History' },
  { id: '4', name: 'Literature' },
  { id: '5', name: 'Computer Science' },
];

// Mock questions for demonstration
export const questions: Question[] = [
  { id: '1', question_text: 'What is the Pythagorean theorem?', topic: 'Mathematics' },
  { id: '2', question_text: 'How do you solve quadratic equations?', topic: 'Mathematics' },
  { id: '3', question_text: 'What is the difference between mitosis and meiosis?', topic: 'Science' },
  { id: '4', question_text: 'Explain Newton\'s laws of motion.', topic: 'Science' },
  { id: '5', question_text: 'What were the main causes of World War II?', topic: 'History' },
  { id: '6', question_text: 'Describe the significance of the Industrial Revolution.', topic: 'History' },
  { id: '7', question_text: 'Analyze the themes in Shakespeare\'s Hamlet.', topic: 'Literature' },
  { id: '8', question_text: 'Compare and contrast the writing styles of Jane Austen and Charles Dickens.', topic: 'Literature' },
  { id: '9', question_text: 'What is object-oriented programming?', topic: 'Computer Science' },
  { id: '10', question_text: 'Explain the concept of recursion in programming.', topic: 'Computer Science' },
  { id: '11', question_text: 'What is the difference between HTTP and HTTPS?', topic: 'Computer Science' },
  { id: '12', question_text: 'How does a binary search algorithm work?', topic: 'Computer Science' },
  { id: '13', question_text: 'What is the significance of the number π (pi)?', topic: 'Mathematics' },
  { id: '14', question_text: 'Explain the process of photosynthesis.', topic: 'Science' },
  { id: '15', question_text: 'What were the key events of the French Revolution?', topic: 'History' },
];

// Function to get questions by topic
export function getQuestionsByTopic(topicName: string): Question[] {
  return questions.filter(question => question.topic === topicName);
}

// Function to get all topics
export function getAllTopics(): Topic[] {
  return topics;
}