'use client';

import { useState, useEffect } from 'react';
import { FolderIcon, FileIcon, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileTreeProps {
  files: string[];
  onSelectFile: (path: string) => void;
}

interface TreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children: TreeNode[];
}

export default function FileTree({ files, onSelectFile }: FileTreeProps) {
  const [tree, setTree] = useState<TreeNode>({ name: '', path: '', isDirectory: true, children: [] });
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  useEffect(() => {
    const rootNode: TreeNode = { name: '', path: '', isDirectory: true, children: [] };
    
    // Sort files so directories appear before files
    const sortedFiles = [...files].sort();
    
    sortedFiles.forEach(file => {
      const parts = file.split('/');
      let currentNode = rootNode;
      
      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1;
        const path = parts.slice(0, index + 1).join('/');
        
        // Check if this node already exists
        let found = currentNode.children.find(child => child.name === part);
        
        if (!found) {
          const newNode: TreeNode = {
            name: part,
            path: path,
            isDirectory: !isLast,
            children: []
          };
          
          currentNode.children.push(newNode);
          found = newNode;
        }
        
        currentNode = found;
      });
    });
    
    // Sort each level - folders first, then alphabetically
    const sortNode = (node: TreeNode) => {
      node.children.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
      
      node.children.forEach(child => {
        if (child.isDirectory) {
          sortNode(child);
        }
      });
    };
    
    sortNode(rootNode);
    setTree(rootNode);
  }, [files]);

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const renderNode = (node: TreeNode, level = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    
    // Don't render the root node, just its children
    if (level === 0) {
      return (
        <div className="py-2">
          {node.children.map(child => renderNode(child, level + 1))}
        </div>
      );
    }
    
    return (
      <div key={node.path} className="select-none">
        <div
          className={cn(
            "flex items-center py-1 px-2 rounded-md hover:bg-accent/50 cursor-pointer",
            "text-sm truncate",
            node.isDirectory ? "font-medium" : ""
          )}
          style={{ paddingLeft: `${level * 12}px` }}
          onClick={() => {
            if (node.isDirectory) {
              toggleFolder(node.path);
            } else {
              onSelectFile(node.path);
            }
          }}
        >
          {node.isDirectory ? (
            <>
              <span className="mr-1">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </span>
              <FolderIcon className="h-4 w-4 mr-2 text-blue-500" />
            </>
          ) : (
            <FileIcon className="h-4 w-4 mr-2 ml-5 text-gray-500" />
          )}
          <span>{node.name}</span>
        </div>
        
        {node.isDirectory && isExpanded && (
          <div>
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="overflow-auto font-mono text-sm">
      {renderNode(tree)}
    </div>
  );
}