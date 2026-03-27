import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Folder, CheckSquare, Users, Activity, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
  projectCount: number;
  taskCount: number;
  teamCount: number;
  completionRate: number;
  recentTasks: {
    _id: string;
    title: string;
    status: string;
    createdAt: string;
    projectId?: { name: string };
    assignedTo?: { name: string };
  }[];
  activeProjects: {
    _id: string;
    name: string;
    totalTasks: number;
    completedTasks: number;
    progress: number;
  }[];
}

const timeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval >= 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval >= 1) return Math.floor(interval) + "m ago";
  return "Just now";
};

const getInitials = (name: string) => {
  const parts = name.split(' ');
  return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0].toUpperCase();
};

const DashboardPage = () => {
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch dashboard stats");
        setStats(await response.json());
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-8 max-w-5xl mx-auto pb-10">
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-[15px]">
            Welcome back, {user?.name.split(' ')[0] || "User"}. Here's your overview.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary/50" /></div>
        ) : (
          <>
            {/* NEW 2x2 GRID STAT CARDS - THEMED */}
            <div className="grid gap-4 md:grid-cols-2">
              
              {/* Total Projects */}
              <Card className="border border-gray-200 dark:border-gray-800 shadow-sm rounded-xl bg-white dark:bg-gray-900">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <p className="text-[15px] font-medium text-gray-500 dark:text-gray-400">Total Projects</p>
                    <Folder className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                  </div>
                  <div className="mt-4">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100">{stats?.projectCount || 0}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">+2 this week</p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Active Tasks */}
              <Card className="border border-gray-200 dark:border-gray-800 shadow-sm rounded-xl bg-white dark:bg-gray-900">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <p className="text-[15px] font-medium text-gray-500 dark:text-gray-400">Active Tasks</p>
                    <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                  </div>
                  <div className="mt-4">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100">{stats?.taskCount || 0}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">8 due today</p>
                  </div>
                </CardContent>
              </Card>

              {/* Team Members */}
              <Card className="border border-gray-200 dark:border-gray-800 shadow-sm rounded-xl bg-white dark:bg-gray-900">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <p className="text-[15px] font-medium text-gray-500 dark:text-gray-400">Team Members</p>
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                  </div>
                  <div className="mt-4">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100">{stats?.teamCount || 0}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">1 pending invite</p>
                  </div>
                </CardContent>
              </Card>

              {/* Completion Rate */}
              <Card className="border border-gray-200 dark:border-gray-800 shadow-sm rounded-xl bg-white dark:bg-gray-900">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <p className="text-[15px] font-medium text-gray-500 dark:text-gray-400">Completion Rate</p>
                    <Activity className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                  </div>
                  <div className="mt-4">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100">{stats?.completionRate || 0}%</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">+5% vs last week</p>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Recent Activity & Active Projects Grid - THEMED */}
            <div className="grid gap-6 md:grid-cols-1">
              
              {/* RECENT ACTIVITY CARD */}
              <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 rounded-xl overflow-hidden mt-4">
                <CardHeader className="pb-2 pt-6 px-6">
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-4">
                  {stats?.recentTasks && stats.recentTasks.length > 0 ? (
                    <div className="space-y-6">
                      {stats.recentTasks.map((task) => {
                        const actionUser = task.assignedTo?.name || user?.name || "Someone";
                        const actionText = task.status === 'done' ? "completed task" : "created task";
                        
                        return (
                          <div key={task._id} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full bg-[#eef2ff] dark:bg-blue-950 flex items-center justify-center text-sm font-medium text-[#4f46e5] dark:text-blue-300">
                                {getInitials(actionUser)}
                              </div>
                              <p className="text-[15px] text-gray-800 dark:text-gray-200">
                                <span className="font-medium text-gray-900 dark:text-gray-100">{actionUser}</span>
                                <span className="text-gray-500 dark:text-gray-400 mx-1.5">{actionText}</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">{task.title}</span>
                              </p>
                            </div>
                            <span className="text-sm text-gray-400 dark:text-gray-500">{timeAgo(task.createdAt)}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">No activity recorded yet.</div>
                  )}
                </CardContent>
              </Card>

              {/* ACTIVE PROJECTS CARD */}
              <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 rounded-xl overflow-hidden mt-2">
                <CardHeader className="pb-2 pt-6 px-6">
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Active Projects</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-4">
                  {stats?.activeProjects && stats.activeProjects.length > 0 ? (
                    <div className="space-y-8">
                      {stats.activeProjects.map((project) => (
                        <div key={project._id} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[16px] font-medium text-gray-900 dark:text-gray-100">{project.name}</h4>
                            <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md px-2.5 py-0.5">
                              Active
                            </Badge>
                          </div>
                          
                          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                            <div 
                              className="bg-[#3b66f5] dark:bg-blue-600 h-full rounded-full transition-all duration-500 ease-out" 
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                          
                          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 font-medium">
                            <span>{project.completedTasks}/{project.totalTasks} tasks</span>
                            <span>{project.progress}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">No active projects to display.</div>
                  )}
                </CardContent>
              </Card>

            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default DashboardPage;