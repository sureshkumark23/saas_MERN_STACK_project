import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, CheckSquare, Users, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const stats = [
  { label: "Total Projects", value: "12", icon: FolderKanban, change: "+2 this week" },
  { label: "Active Tasks", value: "47", icon: CheckSquare, change: "8 due today" },
  { label: "Team Members", value: "9", icon: Users, change: "1 pending invite" },
  { label: "Completion Rate", value: "73%", icon: Activity, change: "+5% vs last week" },
];

const recentActivity = [
  { user: "SC", name: "Sarah Chen", action: "completed task", target: "Design System Review", time: "5m ago" },
  { user: "MR", name: "Mike Ross", action: "created project", target: "Mobile App v2", time: "1h ago" },
  { user: "AL", name: "Amy Lee", action: "commented on", target: "API Integration", time: "2h ago" },
  { user: "JD", name: "John Doe", action: "moved task to Done", target: "Landing Page", time: "3h ago" },
  { user: "KP", name: "Kate Park", action: "assigned task to Mike", target: "Backend Setup", time: "5h ago" },
];

const activeProjects = [
  { name: "Website Redesign", progress: 72, tasks: "18/25", status: "Active" },
  { name: "Mobile App", progress: 45, tasks: "9/20", status: "Active" },
  { name: "API Integration", progress: 90, tasks: "27/30", status: "Active" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  return (
    <AppLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item}>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back, John. Here's your overview.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <motion.div key={s.label} variants={item}>
              <Card className="border-border hover:shadow-md transition-shadow">
                <CardContent className="pt-5 pb-4 px-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">{s.label}</span>
                    <s.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{s.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{s.change}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={item} className="lg:col-span-2">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((a, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">{a.user}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium text-foreground">{a.name}</span>{" "}
                        <span className="text-muted-foreground">{a.action}</span>{" "}
                        <span className="font-medium text-foreground">{a.target}</span>
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{a.time}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Active Projects</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeProjects.map((p) => (
                  <div key={p.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{p.name}</span>
                      <Badge variant="secondary" className="text-xs">{p.status}</Badge>
                    </div>
                    <Progress value={p.progress} className="h-1.5" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{p.tasks} tasks</span>
                      <span>{p.progress}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
