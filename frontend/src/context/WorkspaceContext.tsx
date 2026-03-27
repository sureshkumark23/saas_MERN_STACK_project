import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api'; // <-- IMPORT YOUR NEW API CLIENT!

interface Workspace {
  _id: string;
  name: string;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  switchWorkspace: (workspace: Workspace) => Promise<void>;
  createWorkspace: (name: string) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  renameWorkspace: (id: string, newName: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        if (!localStorage.getItem("token")) return;

        // LOOK HOW CLEAN THIS IS NOW! 👇
        const { data } = await api.get('/workspaces');
        
        setWorkspaces(data);
        const savedId = localStorage.getItem("activeWorkspaceId");
        const active = data.find((w: any) => w._id === savedId) || data[0];
        setActiveWorkspace(active);
      } catch (err) {
        console.error("Failed to load workspaces");
      }
    };
    fetchWorkspaces();
  }, []);

  const switchWorkspace = async (workspace: Workspace) => {
    try {
      // NO MORE MANUAL TOKENS OR HEADERS! 👇
      const { data } = await api.put(`/workspaces/switch/${workspace._id}`);
      
      if (data.token) localStorage.setItem("token", data.token);
      
      setActiveWorkspace(workspace);
      localStorage.setItem("activeWorkspaceId", workspace._id);
      toast.success(`Switched to ${workspace.name}`);
    } catch (err) {
      toast.error("Failed to switch workspace");
    }
  };

  const createWorkspace = async (name: string) => {
    try {
      const { data } = await api.post('/workspaces', { name });
      
      if (data.token) localStorage.setItem("token", data.token);
      
      const newWorkspace = data.workspace;
      setWorkspaces([...workspaces, newWorkspace]);
      setActiveWorkspace(newWorkspace);
      localStorage.setItem("activeWorkspaceId", newWorkspace._id);
      toast.success(`Created ${newWorkspace.name}`);
    } catch (err) {
      toast.error("Failed to create workspace");
    }
  };

  const renameWorkspace = async (id: string, newName: string) => {
    try {
      const { data } = await api.put(`/workspaces/${id}`, { name: newName });

      const updatedWorkspaces = workspaces.map(w => w._id === id ? { ...w, name: data.workspace.name } : w);
      setWorkspaces(updatedWorkspaces);

      if (activeWorkspace?._id === id) {
        setActiveWorkspace(data.workspace);
      }

      toast.success("Workspace renamed successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to rename workspace");
      throw err;
    }
  };

  const deleteWorkspace = async (id: string) => {
    try {
      await api.delete(`/workspaces/${id}`);

      toast.success("Workspace deleted successfully!");

      const remainingWorkspaces = workspaces.filter(w => w._id !== id);
      
      if (remainingWorkspaces.length > 0) {
        localStorage.setItem("activeWorkspaceId", remainingWorkspaces[0]._id);
      }

      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 800);

    } catch (err: any) {
      console.error("Deletion Error:", err);
      toast.error(err.response?.data?.message || "Failed to delete workspace");
    }
  };

  return (
    <WorkspaceContext.Provider value={{ workspaces, activeWorkspace, switchWorkspace, createWorkspace, deleteWorkspace, renameWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};