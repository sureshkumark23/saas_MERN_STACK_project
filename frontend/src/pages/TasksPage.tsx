import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, MessageSquare } from "lucide-react";
import { TaskModal } from "@/components/TaskModal";

type Priority = "High" | "Medium" | "Low";
type ColumnId = "todo" | "in-progress" | "done";

interface Task {
  id: string;
  title: string;
  priority: Priority;
  assignee: string;
  dueDate: string;
  comments: number;
  description: string;
}

const initialColumns: Record<ColumnId, { title: string; tasks: Task[] }> = {
  "todo": {
    title: "To Do",
    tasks: [
      { id: "1", title: "Design login page", priority: "High", assignee: "SC", dueDate: "Mar 25", comments: 3, description: "Create a modern login page with social auth options." },
      { id: "2", title: "Set up CI/CD pipeline", priority: "Medium", assignee: "MR", dueDate: "Mar 28", comments: 1, description: "Configure GitHub Actions for automated testing and deployment." },
      { id: "3", title: "Write API documentation", priority: "Low", assignee: "AL", dueDate: "Apr 2", comments: 0, description: "Document all REST endpoints with examples." },
    ],
  },
  "in-progress": {
    title: "In Progress",
    tasks: [
      { id: "4", title: "Implement user dashboard", priority: "High", assignee: "JD", dueDate: "Mar 22", comments: 5, description: "Build the main dashboard with widgets and charts." },
      { id: "5", title: "Database schema migration", priority: "Medium", assignee: "KP", dueDate: "Mar 24", comments: 2, description: "Migrate the database schema to support multi-tenancy." },
    ],
  },
  "done": {
    title: "Done",
    tasks: [
      { id: "6", title: "Project setup & config", priority: "Low", assignee: "JD", dueDate: "Mar 15", comments: 1, description: "Initialize the project with all required dependencies." },
      { id: "7", title: "Design system tokens", priority: "Medium", assignee: "SC", dueDate: "Mar 18", comments: 4, description: "Define colors, typography, and spacing tokens." },
    ],
  },
};

const priorityColors: Record<Priority, string> = {
  High: "bg-priority-high/10 text-priority-high",
  Medium: "bg-priority-medium/10 text-priority-medium",
  Low: "bg-priority-low/10 text-priority-low",
};

const columnColors: Record<ColumnId, string> = {
  "todo": "border-t-muted-foreground/30",
  "in-progress": "border-t-primary",
  "done": "border-t-success",
};

export default function TasksPage() {
  const [columns, setColumns] = useState(initialColumns);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<{ task: Task; fromColumn: ColumnId } | null>(null);

  const handleDragStart = (task: Task, columnId: ColumnId) => {
    setDraggedTask({ task, fromColumn: columnId });
  };

  const handleDrop = (targetColumn: ColumnId) => {
    if (!draggedTask || draggedTask.fromColumn === targetColumn) {
      setDraggedTask(null);
      return;
    }

    setColumns((prev) => {
      const updated = { ...prev };
      updated[draggedTask.fromColumn] = {
        ...updated[draggedTask.fromColumn],
        tasks: updated[draggedTask.fromColumn].tasks.filter((t) => t.id !== draggedTask.task.id),
      };
      updated[targetColumn] = {
        ...updated[targetColumn],
        tasks: [...updated[targetColumn].tasks, draggedTask.task],
      };
      return updated;
    });
    setDraggedTask(null);
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Kanban Board</h1>
            <p className="text-muted-foreground text-sm">Drag tasks between columns to update status</p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-1" /> Add Task
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {(Object.entries(columns) as [ColumnId, typeof columns["todo"]][]).map(([colId, col]) => (
            <div
              key={colId}
              className={`rounded-lg border-t-2 ${columnColors[colId]}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(colId)}
            >
              <Card className="border-border bg-card/50">
                <CardHeader className="pb-3 pt-4 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">{col.title}</CardTitle>
                    <Badge variant="secondary" className="text-xs">{col.tasks.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-3 pb-3 space-y-2.5 min-h-[200px]">
                  <AnimatePresence>
                    {col.tasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        draggable
                        onDragStart={() => handleDragStart(task, colId)}
                        onClick={() => setSelectedTask(task)}
                        className="bg-card border border-border rounded-md p-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-sm font-medium text-foreground leading-tight">{task.title}</h4>
                          <Badge className={`text-[10px] shrink-0 ${priorityColors[task.priority]}`}>
                            {task.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {task.dueDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" /> {task.comments}
                            </span>
                          </div>
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="bg-primary/10 text-primary text-[9px]">{task.assignee}</AvatarFallback>
                          </Avatar>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </motion.div>

      <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} />
    </AppLayout>
  );
}
