'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';
import { Button } from './ui/button';
import { Code, MessageSquare, Terminal, Brain } from 'lucide-react';

const navItems = [
  { 
    name: 'Chat', 
    href: '/', 
    icon: MessageSquare 
  },
  { 
    name: 'Editor', 
    href: '/editor', 
    icon: Code 
  },
  { 
    name: 'Console', 
    href: '/console', 
    icon: Terminal 
  },
  { 
    name: 'Memória', 
    href: '/memory', 
    icon: Brain 
  },
];

export default function NavBar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">IA Programadora</span>
          </Link>
        </div>
        <nav className="flex flex-1 items-center space-x-1 md:space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.href}
                variant={pathname === item.href ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-9 px-2 text-sm md:h-10 md:px-4 md:text-base",
                  pathname === item.href 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                asChild
              >
                <Link href={item.href} className="flex items-center space-x-1">
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.name}</span>
                </Link>
              </Button>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center space-x-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}