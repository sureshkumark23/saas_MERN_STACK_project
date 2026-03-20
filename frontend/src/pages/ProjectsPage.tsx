import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Loader2, LayoutGrid, List } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

// Updated Interface to include the new backend stats
interface Project {
  _id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  totalTasks: number;
  completedTasks: number;
  progress: number;
  assignees: { id: string; initials: string }[];
}

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // The toggle state
  
  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch projects");
      setProjects(await response.json());
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, description }),
      });
      if (!response.ok) throw new Error("Failed to create project");

      toast.success("Project created successfully!");
      setIsDialogOpen(false);
      setName(""); setDescription("");
      fetchProjects();
    } catch (error: any) { toast.error(error.message); } 
    finally { setIsSubmitting(false); }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        
        {/* HEADER SECTION EXACTLY LIKE SCREENSHOT */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Projects</h1>
            <p className="text-gray-500 mt-1">{projects.length} projects in workspace</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Grid/List Toggle */}
            <div className="flex items-center bg-white border border-gray-200 rounded-md shadow-sm">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors rounded-l-md ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
              <div className="w-[1px] h-5 bg-gray-200"></div>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors rounded-r-md ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#3b66f5] hover:bg-[#3157db] text-white flex items-center gap-2 shadow-sm">
                  <Plus className="h-4 w-4" /> New Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>Add a new project to your workspace.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateProject} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Project Name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Website Redesign" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Description (Optional)</Label>
                    <textarea 
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                      placeholder="Brief details about this project..."
                    />
                  </div>
                  <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Project"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* PROJECTS DISPLAY */}
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 border border-dashed rounded-xl">
            <p className="text-gray-500 mb-4">You haven't created any projects yet.</p>
            <Button variant="outline" onClick={() => setIsDialogOpen(true)}>Create your first project</Button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-4"}>
            {projects.map((project) => (
              <Card 
                key={project._id} 
                onClick={() => navigate(`/tasks?projectId=${project._id}`)}
                className="hover:shadow-md transition-all cursor-pointer border-gray-200 overflow-hidden"
              >
                <CardContent className="p-6 flex flex-col h-full">
                  
                  {/* Top: Title & Status */}
                  <div className="flex justify-between items-start mb-2 gap-4">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{project.name}</h3>
                    <Badge 
                      variant="secondary" 
                      className={project.status === 'completed' || project.progress === 100 
                        ? 'bg-[#e5f6e6] text-[#2c7a3f] hover:bg-[#e5f6e6] flex-shrink-0' 
                        : 'bg-[#eef2ff] text-[#4f46e5] hover:bg-[#eef2ff] flex-shrink-0'
                      }
                    >
                      {project.status === 'completed' || project.progress === 100 ? 'Completed' : 'Active'}
                    </Badge>
                  </div>
                  
                  {/* Description */}
                  <p className="text-[15px] text-gray-500 mb-6 line-clamp-2 min-h-[44px]">
                    {project.description || "No description provided."}
                  </p>

                  <div className="mt-auto">
                    {/* Progress Bar Area */}
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between text-sm font-medium text-gray-500">
                        <span>{project.completedTasks}/{project.totalTasks} tasks</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-[#3b66f5] h-full rounded-full transition-all duration-500 ease-out" 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Team Avatars */}
                    <div className="flex -space-x-2 overflow-hidden">
                      {project.assignees?.map((user, i) => (
                        <div 
                          key={i} 
                          className="inline-flex h-7 w-7 rounded-full ring-2 ring-white bg-[#eef2ff] items-center justify-center text-[10px] font-bold text-[#4f46e5]"
                        >
                          {user.initials}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ProjectsPage;