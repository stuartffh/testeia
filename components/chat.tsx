'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ArrowUp, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { getAiResponse } from '@/lib/api';
import Markdown from 'react-markdown';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<'connected' | 'disconnected' | 'unknown'>('unknown');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkAiStatus();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkAiStatus = async () => {
    try {
      const response = await fetch('/api/ai/status');
      if (response.ok) {
        setAiStatus('connected');
      } else {
        setAiStatus('disconnected');
      }
    } catch (error) {
      setAiStatus('disconnected');
    }
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getAiResponse(input.trim(), messages);
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.content || 'Sorry, I could not process your request.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // If the response includes file changes, show a toast notification
      if (response.changes && response.changes.length > 0) {
        toast({
          title: 'Files updated',
          description: `${response.changes.length} files have been updated.`,
        });
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      toast({
        title: 'Error',
        description: 'Failed to get a response from the AI. Please check your connection.',
        variant: 'destructive',
      });

      // Check AI status again
      checkAiStatus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-220px)]">
      <Card className="flex-grow flex flex-col overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="flex-grow p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center p-8">
                <div className="max-w-sm mx-auto">
                  <h3 className="text-lg font-semibold mb-2">Welcome to AI Coder</h3>
                  <p className="text-muted-foreground mb-4">
                    Ask the AI to help you create, modify, or understand Next.js code. The AI can generate files and modify your project based on your instructions.
                  </p>
                  <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                    <strong>Try asking:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Create a simple login form with validation</li>
                      <li>Add a dark mode toggle to my app</li>
                      <li>Create an API endpoint to fetch user data</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="prose dark:prose-invert prose-sm max-w-none">
                        <Markdown>{message.content}</Markdown>
                      </div>
                    ) : (
                      <p>{message.content}</p>
                    )}
                    <div
                      className={`text-xs mt-1 ${
                        message.role === 'user'
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-4 flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the AI to help with your Next.js project..."
              className="min-h-[60px]"
              disabled={isLoading || aiStatus !== 'connected'}
            />
            <Button
              className="shrink-0"
              size="icon"
              disabled={!input.trim() || isLoading || aiStatus !== 'connected'}
              onClick={handleSendMessage}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2 px-1">
            <div className="flex items-center">
              <div
                className={`h-2 w-2 rounded-full mr-2 ${
                  aiStatus === 'connected'
                    ? 'bg-green-500'
                    : aiStatus === 'disconnected'
                    ? 'bg-red-500'
                    : 'bg-yellow-500'
                }`}
              ></div>
              <span className="text-xs text-muted-foreground">
                {aiStatus === 'connected'
                  ? 'AI connected'
                  : aiStatus === 'disconnected'
                  ? 'AI disconnected'
                  : 'Checking AI connection...'}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {messages.length > 0 && `${messages.length} messages`}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}