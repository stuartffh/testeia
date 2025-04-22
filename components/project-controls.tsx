'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Play, Square, RotateCw, HardDrive, FolderTree, Plus } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Project {
  name: string;
  path: string;
}

export default function ProjectControls() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [serverStatus, setServerStatus] = useState<'stopped' | 'running'>('stopped');
  const [newProjectName, setNewProjectName] = useState<string>('');
  const [isCreatingProject, setIsCreatingProject] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
    checkServerStatus();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(data.projects || []);
      
      // If there's a current project set in the system, select it
      if (data.currentProject) {
        setSelectedProject(data.currentProject);
      } else if (data.projects && data.projects.length > 0) {
        setSelectedProject(data.projects[0].path);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const checkServerStatus = async () => {
    try {
      const response = await fetch('/api/server/status');
      const data = await response.json();
      setServerStatus(data.status || 'stopped');
    } catch (error) {
      console.error('Failed to check server status:', error);
      setServerStatus('stopped');
    }
  };

  const handleStartServer = async () => {
    if (!selectedProject) {
      toast({
        title: 'No project selected',
        description: 'Please select a project first',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/server/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectPath: selectedProject }),
      });
      
      if (response.ok) {
        setServerStatus('running');
        toast({
          title: 'Server started',
          description: 'Development server is now running',
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to start server');
      }
    } catch (error: any) {
      toast({
        title: 'Failed to start server',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleStopServer = async () => {
    try {
      const response = await fetch('/api/server/stop', {
        method: 'POST',
      });
      
      if (response.ok) {
        setServerStatus('stopped');
        toast({
          title: 'Server stopped',
          description: 'Development server has been stopped',
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to stop server');
      }
    } catch (error: any) {
      toast({
        title: 'Failed to stop server',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleRestartServer = async () => {
    try {
      await handleStopServer();
      setTimeout(async () => {
        await handleStartServer();
      }, 1000);
    } catch (error: any) {
      toast({
        title: 'Failed to restart server',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast({
        title: 'Invalid project name',
        description: 'Please enter a valid project name',
        variant: 'destructive',
      });
      return;
    }

    setIsCreatingProject(true);

    try {
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newProjectName.trim() }),
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Project created',
          description: `Project "${newProjectName}" has been created successfully`,
        });
        
        // Update the projects list and select the new project
        await fetchProjects();
        setSelectedProject(data.projectPath);
        setNewProjectName('');
        setIsDialogOpen(false);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create project');
      }
    } catch (error: any) {
      toast({
        title: 'Failed to create project',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleProjectChange = async (value: string) => {
    try {
      // If the server is running, stop it before changing projects
      if (serverStatus === 'running') {
        await handleStopServer();
      }
      
      // Set the new selected project
      setSelectedProject(value);
      
      // Notify the backend about the project change
      await fetch('/api/projects/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectPath: value }),
      });
      
      toast({
        title: 'Project switched',
        description: `Now working with ${projects.find(p => p.path === value)?.name || value}`,
      });
    } catch (error) {
      console.error('Failed to switch projects:', error);
      toast({
        title: 'Failed to switch projects',
        description: 'An error occurred while switching projects',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Select Project</Label>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-3.5 w-3.5 mr-1" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Enter a name for your new Next.js project.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="my-nextjs-app"
                  className="mt-2"
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateProject}
                  disabled={isCreatingProject || !newProjectName.trim()}
                >
                  {isCreatingProject ? 'Creating...' : 'Create Project'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <Select value={selectedProject} onValueChange={handleProjectChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects.length > 0 ? (
              projects.map((project) => (
                <SelectItem key={project.path} value={project.path}>
                  <div className="flex items-center">
                    <FolderTree className="h-4 w-4 mr-2 text-muted-foreground" />
                    {project.name}
                  </div>
                </SelectItem>
              ))
            ) : (
              <SelectItem value="none" disabled>
                No projects available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Server Controls</Label>
        <div className="flex items-center space-x-2">
          {serverStatus === 'stopped' ? (
            <Button 
              variant="default" 
              onClick={handleStartServer} 
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!selectedProject}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Dev Server
            </Button>
          ) : (
            <Button 
              variant="default" 
              onClick={handleStopServer} 
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop Server
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleRestartServer}
            disabled={serverStatus === 'stopped' || !selectedProject}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="pt-2 border-t">
        <div className="flex items-center">
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${serverStatus === 'running' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-muted-foreground">Server: {serverStatus === 'running' ? 'Running' : 'Stopped'}</span>
          </div>
          {selectedProject && (
            <div className="ml-auto text-xs text-muted-foreground flex items-center">
              <HardDrive className="h-3 w-3 mr-1" />
              {projects.find(p => p.path === selectedProject)?.name || 'Unknown project'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}