'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Trash2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getMemory, saveMemory, deleteMemory } from '@/lib/api';

interface MemoryItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function MemoryPage() {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchMemories();
    fetchSystemPrompt();
  }, []);

  const fetchMemories = async () => {
    try {
      const data = await getMemory();
      setMemories(data.memories || []);
    } catch (error) {
      console.error('Failed to fetch memories:', error);
      toast({
        title: 'Error loading memories',
        description: 'Failed to load saved memories',
        variant: 'destructive',
      });
    }
  };

  const fetchSystemPrompt = async () => {
    try {
      const response = await fetch('/api/system-prompt');
      const data = await response.json();
      setSystemPrompt(data.prompt || '');
    } catch (error) {
      console.error('Failed to fetch system prompt:', error);
    }
  };

  const handleSaveMemory = async () => {
    if (!newTitle.trim()) {
      toast({
        title: 'Title required',
        description: 'Please provide a title for your memory',
        variant: 'destructive',
      });
      return;
    }

    if (!newContent.trim()) {
      toast({
        title: 'Content required',
        description: 'Please provide content for your memory',
        variant: 'destructive',
      });
      return;
    }

    try {
      await saveMemory({
        title: newTitle,
        content: newContent,
      });
      
      setNewTitle('');
      setNewContent('');
      fetchMemories();
      
      toast({
        title: 'Memory saved',
        description: 'Your memory has been saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Error saving memory',
        description: 'An error occurred while saving your memory',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      await deleteMemory(id);
      fetchMemories();
      
      toast({
        title: 'Memory deleted',
        description: 'Your memory has been deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error deleting memory',
        description: 'An error occurred while deleting your memory',
        variant: 'destructive',
      });
    }
  };

  const handleSaveSystemPrompt = async () => {
    try {
      await fetch('/api/system-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: systemPrompt }),
      });
      
      toast({
        title: 'System prompt saved',
        description: 'Your system prompt has been updated',
      });
    } catch (error) {
      toast({
        title: 'Error saving system prompt',
        description: 'An error occurred while saving your system prompt',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Memory Management</h1>
      
      <Tabs defaultValue="memory" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="memory">Memory Items</TabsTrigger>
          <TabsTrigger value="system">System Prompt</TabsTrigger>
        </TabsList>
        
        <TabsContent value="memory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Memory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Title</label>
                <Input
                  id="title"
                  placeholder="Memory title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">Content</label>
                <Textarea
                  id="content"
                  placeholder="Enter code snippets, explanations, or context for the AI..."
                  rows={6}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="font-mono"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveMemory} className="w-full">
                <PlusCircle className="h-4 w-4 mr-2" />
                Save to Memory
              </Button>
            </CardFooter>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {memories.map((memory) => (
              <Card key={memory.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50 py-3">
                  <CardTitle className="text-base flex justify-between items-center">
                    <span className="truncate">{memory.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteMemory(memory.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <pre className="text-xs font-mono whitespace-pre-wrap overflow-auto max-h-40">
                    {memory.content}
                  </pre>
                </CardContent>
              </Card>
            ))}
            
            {memories.length === 0 && (
              <div className="col-span-full flex items-center justify-center p-8 bg-muted/20 rounded-lg border border-dashed">
                <p className="text-muted-foreground text-center">
                  No memories saved yet. Create your first memory to help the AI understand your project better.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This is the system prompt that will be sent to the AI with every conversation.
                Use it to define the AI's personality, capabilities, and constraints.
              </p>
              <Textarea
                rows={12}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="font-mono"
                placeholder="You are a Next.js expert. Your goal is to help me build robust Next.js applications..."
              />
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSystemPrompt}>
                <Save className="h-4 w-4 mr-2" />
                Save System Prompt
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}