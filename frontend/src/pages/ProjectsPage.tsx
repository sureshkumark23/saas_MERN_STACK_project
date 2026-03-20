import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, LayoutGrid, List } from "lucide-react";

const projects = [
  { id: "1", name: "Website Redesign", description: "Redesign the company website with modern UI", progress: 72, status: "Active" as const, members: ["JD", "SC", "MR"], tasks: 25, completed: 18 },
  { id: "2", name: "Mobile App v2", description: "Build the second version of the mobile app", progress: 45, status: "Active" as const, members: ["AL", "KP"], tasks: 20, completed: 9 },
  { id: "3", name: "API Integration", description: "Integrate third-party APIs for payment", progress: 90, status: "Active" as const, members: ["MR", "JD", "AL"], tasks: 30, completed: 27 },
  { id: "4", name: "Brand Guidelines", description: "Create comprehensive brand guidelines", progress: 100, status: "Completed" as const, members: ["SC"], tasks: 12, completed: 12 },
  { id: "5", name: "Analytics Dashboard", description: "Build real-time analytics dashboard", progress: 30, status: "Active" as const, members: ["KP", "JD"], tasks: 15, completed: 5 },
  { id: "6", name: "Email Campaign", description: "Design and implement email marketing", progress: 100, status: "Completed" as const, members: ["AL", "SC"], tasks: 8, completed: 8 },
];

const statusColors: Record<string, string> = {
  Active: "bg-primary/10 text-primary",
  Completed: "bg-success/10 text-success",
};

export default function ProjectsPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const navigate = useNavigate();

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Projects</h1>
            <p className="text-muted-foreground text-sm">{projects.length} projects in workspace</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-border rounded-md">
              <Button
                variant={view === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8 rounded-r-none"
                onClick={() => setView("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={view === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8 rounded-l-none"
                onClick={() => setView("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-1" /> New Project
            </Button>
          </div>
        </div>

        <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
          {projects.map((p) => (
            <Card
              key={p.id}
              className="border-border hover:shadow-md transition-all cursor-pointer group"
              onClick={() => navigate("/tasks")}
            >
              <CardContent className={view === "grid" ? "pt-5 pb-4 px-5 space-y-4" : "py-4 px-5 flex items-center gap-6"}>
                <div className={view === "list" ? "flex-1 min-w-0" : ""}>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{p.name}</h3>
                    <Badge className={`text-xs ${statusColors[p.status]}`}>{p.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{p.description}</p>
                </div>

                <div className={view === "list" ? "flex items-center gap-6" : "space-y-3"}>
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span>{p.completed}/{p.tasks} tasks</span>
                      <span>{p.progress}%</span>
                    </div>
                    <Progress value={p.progress} className="h-1.5" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {p.members.map((m) => (
                        <Avatar key={m} className="h-6 w-6 border-2 border-card">
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px]">{m}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </AppLayout>
  );
}
