'use client';

import { useState, useEffect } from 'react';
import FileTree from '@/components/file-tree';
import CodeEditor from '@/components/code-editor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { saveFile } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function EditorPage() {
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [originalContent, setOriginalContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch('/api/files');
        const data = await response.json();
        if (data.files) {
          setFiles(data.files);
        }
      } catch (error) {
        console.error('Failed to fetch files:', error);
      }
    };

    fetchFiles();
  }, []);

  const handleFileSelect = async (file: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/files?path=${encodeURIComponent(file)}`);
      const data = await response.json();
      if (data.content) {
        setContent(data.content);
        setOriginalContent(data.content);
        setSelectedFile(file);
      }
    } catch (error) {
      console.error('Failed to fetch file content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedFile) return;

    try {
      await saveFile(selectedFile, content);
      setOriginalContent(content);
      toast({
        title: 'File saved',
        description: `${selectedFile} has been saved successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error saving file',
        description: 'An error occurred while saving the file',
        variant: 'destructive',
      });
    }
  };

  const isModified = content !== originalContent;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Project Editor</h1>
      <Tabs defaultValue="editor" className="w-full">
        <TabsList>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="diff">Diff View</TabsTrigger>
        </TabsList>
        <TabsContent value="editor" className="border rounded-lg p-0 mt-2">
          <div className="flex h-[calc(100vh-200px)]">
            <div className="w-1/4 border-r overflow-auto p-2">
              <FileTree files={files} onSelectFile={handleFileSelect} />
            </div>
            <div className="w-3/4 flex flex-col">
              <div className="flex justify-between items-center p-2 border-b">
                <div className="text-sm font-mono truncate">
                  {selectedFile || 'No file selected'}
                </div>
                <Button 
                  size="sm" 
                  onClick={handleSave} 
                  disabled={!selectedFile || !isModified}
                  className={isModified ? 'bg-blue-500 hover:bg-blue-600' : ''}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
              <div className="flex-grow">
                <CodeEditor
                  value={content}
                  onChange={setContent}
                  language={selectedFile?.split('.').pop() || 'typescript'}
                  loading={loading}
                />
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="diff" className="mt-2">
          <div className="h-[calc(100vh-200px)] border rounded-lg p-4">
            {selectedFile ? (
              <div className="h-full">
                {/* Diff view implementation would go here */}
                <p className="text-muted-foreground">
                  Diff view coming soon. This will show changes between the original and modified file.
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Select a file to view diff</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}