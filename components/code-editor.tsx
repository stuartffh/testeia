'use client';

import { useEffect, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Skeleton } from '@/components/ui/skeleton';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  loading?: boolean;
}

export default function CodeEditor({
  value,
  onChange,
  language = 'typescript',
  loading = false,
}: CodeEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'vs-dark' | 'vs-light'>('vs-dark');

  useEffect(() => {
    setMounted(true);
    // Check if we should use light or dark theme based on system preference
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(isDarkMode ? 'vs-dark' : 'vs-light');

    // Listen for theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'vs-dark' : 'vs-light');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleEditorDidMount: OnMount = (editor) => {
    editor.focus();
  };

  const getLanguageFromExtension = (language: string): string => {
    const mapping: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      md: 'markdown',
      json: 'json',
      css: 'css',
      scss: 'scss',
      html: 'html',
      py: 'python',
      // Add more mappings as needed
    };
    
    return mapping[language] || language;
  };

  if (!mounted) {
    return <Skeleton className="h-full w-full" />;
  }

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted/20">
        <div className="text-muted-foreground">Loading file content...</div>
      </div>
    );
  }

  return (
    <Editor
      height="100%"
      language={getLanguageFromExtension(language)}
      value={value}
      onChange={(value) => onChange(value || '')}
      theme={theme}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: 'on',
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
      }}
      onMount={handleEditorDidMount}
    />
  );
}