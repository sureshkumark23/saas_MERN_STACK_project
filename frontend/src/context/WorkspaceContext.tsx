import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

interface Workspace {
  _id: string;
  name: string;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  switchWorkspace: (workspace: Workspace) => Promise<void>;
  createWorkspace: (name: string) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>; // <-- NEW FUNCTION DEFINITION
  renameWorkspace: (id: string, newName: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${import.meta.env.VITE_API_URL}/workspaces`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
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
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/workspaces/switch/${workspace._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
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
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/workspaces`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      
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

  // <-- NEW RENAME FUNCTION
  const renameWorkspace = async (id: string, newName: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/workspaces/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newName })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to rename workspace");
      }

      const data = await res.json();

      // Instantly update the global state so the sidebar and headers change!
      const updatedWorkspaces = workspaces.map(w => w._id === id ? { ...w, name: data.workspace.name } : w);
      setWorkspaces(updatedWorkspaces);

      if (activeWorkspace?._id === id) {
        setActiveWorkspace(data.workspace);
      }

      toast.success("Workspace renamed successfully!");
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  };

  // <-- NEW DELETE FUNCTION
  const deleteWorkspace = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/workspaces/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete workspace");
      }

      // Remove the deleted workspace from our UI list
      const updatedWorkspaces = workspaces.filter(w => w._id !== id);
      setWorkspaces(updatedWorkspaces);

      // If they deleted the workspace they are currently looking at, switch them to the first available one automatically!
      if (activeWorkspace?._id === id && updatedWorkspaces.length > 0) {
        await switchWorkspace(updatedWorkspaces[0]);
      }
      
      toast.success("Workspace deleted successfully");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
   // ADD renameWorkspace to the value object!
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