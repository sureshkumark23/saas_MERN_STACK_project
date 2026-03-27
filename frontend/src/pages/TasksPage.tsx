import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom"; 
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Loader2, GripVertical, MessageSquare, Send, LayoutList, CalendarDays } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWorkspace } from "@/context/WorkspaceContext"; // <-- NEW IMPORT

interface Project { _id: string; name: string; }
interface Comment { _id?: string; text: string; userName: string; createdAt: string; }
interface Task { _id: string; title: string; description: string; status: string; priority: string; projectId: string; createdAt: string; comments?: Comment[]; }

const COLUMNS = [
  { id: "todo", title: "To Do", color: "bg-slate-100 dark:bg-gray-900" },
  { id: "in-progress", title: "In Progress", color: "bg-blue-50 dark:bg-gray-900" },
  { id: "done", title: "Done", color: "bg-green-50 dark:bg-gray-900" }
];

const TasksPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlProjectId = searchParams.get("projectId");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newComment, setNewComment] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState(urlProjectId || "");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { activeWorkspace } = useWorkspace(); // <-- NEW CONTEXT HOOK

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const fetchTasksUrl = urlProjectId 
        ? `${import.meta.env.VITE_API_URL}/tasks?projectId=${urlProjectId}`
        : `${import.meta.env.VITE_API_URL}/tasks`;

      const [tasksRes, projectsRes] = await Promise.all([
        fetch(fetchTasksUrl, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/projects`, { headers })
      ]);

      if (!tasksRes.ok || !projectsRes.ok) throw new Error("Failed to fetch data");
      
      setTasks(await tasksRes.json());
      
      const loadedProjects = await projectsRes.json();
      setProjects(loadedProjects);
      
      if (!urlProjectId && loadedProjects.length > 0 && !projectId) {
        setProjectId(loadedProjects[0]._id);
      }
    } catch (error: any) { toast.error(error.message); } 
    finally { setIsLoading(false); }
  };

  // <-- NEW MAGIC: Add activeWorkspace to dependency array
  useEffect(() => { 
    if (activeWorkspace) {
      fetchData(); 
    }
  }, [urlProjectId, activeWorkspace]); 

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return toast.error("Please select a project.");
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, description, projectId, status, priority }),
      });

      if (!response.ok) throw new Error("Failed to create task");

      toast.success("Task created!");
      setIsCreateDialogOpen(false);
      setTitle(""); setDescription(""); setStatus("todo"); setPriority("medium");
      fetchData();
    } catch (error: any) { toast.error(error.message); } 
    finally { setIsSubmitting(false); }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newComment.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${selectedTask._id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: newComment, userName: user.name }),
      });
      if (!response.ok) throw new Error("Failed to post comment");
      const updatedTask = await response.json();
      setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
      setSelectedTask(updatedTask);
      setNewComment("");
    } catch (error: any) { toast.error(error.message); }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => e.dataTransfer.setData("taskId", taskId);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const task = tasks.find(t => t._id === taskId);
    if (!task || task.status === newStatus) return;

    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    try {
      const token = localStorage.getItem("token");
      await fetch(`${import.meta.env.VITE_API_URL}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch { toast.error("Failed to save move."); fetchData(); }
  };

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'high': return "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900";
      case 'medium': return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-900";
      case 'low': return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 h-full flex flex-col">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              {urlProjectId ? "Project Tasks" : "All Tasks"}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Manage workflow and collaborate.</p>
          </div>

          <div className="flex items-center gap-3">
            {urlProjectId && (
              <Button variant="secondary" onClick={() => setSearchParams({})} className="flex items-center gap-2">
                <LayoutList className="h-4 w-4" /> View All Tasks
              </Button>
            )}

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2"><Plus className="h-4 w-4" /> Create Task</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] dark:bg-gray-900 dark:border-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-xl dark:text-gray-100">Create Task</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTask} className="space-y-6 mt-2">
                  <div className="space-y-2">
                    <Label className="text-gray-600 dark:text-gray-300">Title</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title..." required className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"/>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-600 dark:text-gray-300">Description</Label>
                    <textarea 
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                      placeholder="Add details..." 
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-600 dark:text-gray-300">Project</Label>
                      <Select value={projectId} onValueChange={setProjectId} required>
                        <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                          {projects.map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-600 dark:text-gray-300">Status</Label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-600 dark:text-gray-300">Priority</Label>
                      <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter className="sm:justify-end gap-2 pt-4">
                    <DialogClose asChild>
                      <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Task"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
        ) : (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 items-start pb-6">
            {COLUMNS.map(column => {
              const columnTasks = tasks.filter(t => t.status === column.id);
              return (
                <div key={column.id} className={`${column.color} rounded-xl p-4 min-h-[500px] flex flex-col border dark:border-gray-800`} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, column.id)}>
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">{column.title}</h3>
                    <Badge variant="secondary" className="bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400">{columnTasks.length}</Badge>
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-3">
                    {columnTasks.map(task => {
                      const project = projects.find(p => p._id === task.projectId);
                      return (
                        <Card 
                          key={task._id} 
                          draggable
                          onDragStart={(e) => handleDragStart(e, task._id)}
                          onClick={() => setSelectedTask(task)}
                          className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all border-none shadow-sm bg-white dark:bg-gray-950"
                        >
                          <CardContent className="p-4 flex flex-col gap-3">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-medium text-sm leading-snug text-gray-900 dark:text-gray-100">{task.title}</h4>
                              <GripVertical className="h-4 w-4 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-0.5 cursor-grab" />
                            </div>
                            
                            {task.description && <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{task.description}</p>}

                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={`text-[10px] capitalize ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </Badge>
                              {!urlProjectId && (
                                <Badge variant="outline" className="text-[10px] bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-normal truncate max-w-[120px]">
                                  {project?.name || "No Project"}
                                </Badge>
                              )}
                            </div>

                            <div className="pt-3 border-t dark:border-gray-800 mt-auto flex items-center justify-between">
                              <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                                <MessageSquare className="h-3 w-3" />
                                <span>{task.comments?.length || 0}</span>
                              </div>
                              <div className="h-6 w-6 rounded-full bg-primary/10 dark:bg-blue-950 flex items-center justify-center text-[10px] font-medium text-primary dark:text-blue-300 border border-primary/20 dark:border-blue-900">
                                U
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <Dialog open={selectedTask !== null} onOpenChange={(open) => !open && setSelectedTask(null)}>
          <DialogContent className="sm:max-w-[700px] flex flex-col h-[85vh] max-h-[800px] p-0 overflow-hidden dark:bg-gray-900 dark:border-gray-800">
            
            <div className="p-6 border-b dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 flex-shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className={`capitalize ${getPriorityColor(selectedTask?.priority || 'medium')}`}>
                  {selectedTask?.priority} Priority
                </Badge>
                <Badge variant="secondary" className="capitalize dark:bg-gray-800 dark:text-gray-300">
                  {selectedTask?.status.replace('-', ' ')}
                </Badge>
              </div>
              <DialogTitle className="text-2xl font-bold dark:text-gray-100">{selectedTask?.title}</DialogTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{selectedTask?.description || "No description provided."}</p>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col p-6 bg-white dark:bg-gray-950">
              <h4 className="font-semibold text-sm mb-4 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <MessageSquare className="h-4 w-4" /> Discussion Thread
              </h4>
              
              <ScrollArea className="flex-1 pr-4 mb-4">
                <div className="space-y-4">
                  {selectedTask?.comments?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
                      <MessageSquare className="h-10 w-10 mb-2 opacity-20" />
                      <p className="text-sm">No comments yet. Start the conversation!</p>
                    </div>
                  ) : (
                    selectedTask?.comments?.map((comment, i) => (
                      <div key={i} className="bg-slate-50 dark:bg-gray-900 p-4 rounded-xl text-sm border border-slate-100 dark:border-gray-800">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-primary dark:text-blue-400">{comment.userName}</span>
                          <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium tracking-wider">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{comment.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
              
              <form onSubmit={handleAddComment} className="flex gap-3 flex-shrink-0 pt-2">
                <Input 
                  placeholder="Write a comment..." 
                  value={newComment} 
                  onChange={(e) => setNewComment(e.target.value)} 
                  className="flex-1 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus-visible:ring-primary/50"
                />
                <Button type="submit" disabled={!newComment.trim()} className="px-6">
                  <Send className="h-4 w-4 mr-2" /> Post
                </Button>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default TasksPage;