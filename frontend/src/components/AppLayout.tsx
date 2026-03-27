import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  LayoutDashboard,
  Folder,
  CheckSquare,
  Users,
  Settings,
  Search,
  Moon,
  Sun,
  Bell,
  LogOut,
  User as UserIcon,
  Menu,
  Building2,
  X,
  ChevronDown,
  Check,
  Plus
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// IMPORT THE NEW GLOBAL WORKSPACE CONTEXT
import { useWorkspace } from "@/context/WorkspaceContext";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  
  // UI States
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 
  // Global Workspace Hook (Replaces all the local fetch/state logic!)
  const { workspaces, activeWorkspace, switchWorkspace, createWorkspace } = useWorkspace();
  
  // Local states just for the Create Dialog UI
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    
    await createWorkspace(newWorkspaceName);
    
    // Close the dialog and clear the input after creation
    setIsCreateWorkspaceOpen(false);
    setNewWorkspaceName("");
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tasks?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const getInitials = (name: string) => {
    const parts = name?.split(' ') || ['U'];
    return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0].toUpperCase();
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Projects", path: "/projects", icon: Folder },
    { name: "Tasks", path: "/tasks", icon: CheckSquare },
    { name: "Team", path: "/team", icon: Users },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-50/50 text-gray-900'}`}>
      
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out
        md:relative md:translate-x-0 flex flex-col border-r
        ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* DYNAMIC WORKSPACE SWITCHER */}
        <div className={`h-16 flex items-center justify-between px-4 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
          <DropdownMenu>
            <DropdownMenuTrigger className={`flex flex-1 items-center justify-between px-2 py-1.5 rounded-lg transition-colors outline-none ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
              <div className="flex items-center gap-2 font-bold text-lg">
                <div className="bg-[#3b66f5] p-1.5 rounded-md flex-shrink-0">
                  <Building2 className="h-4 w-4 text-white" />
                </div>
                <span className="truncate max-w-[130px] text-left">{activeWorkspace?.name || "Loading..."}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="start" className="w-56 mt-2 dark:bg-gray-900 dark:border-gray-800">
              <DropdownMenuLabel className="text-xs text-gray-500 uppercase tracking-wider">Workspaces</DropdownMenuLabel>
              
              {/* Maps over context workspaces */}
              {workspaces.map((workspace) => (
                <DropdownMenuItem 
                  key={workspace._id}
                  onClick={() => switchWorkspace(workspace)} 
                  className="flex items-center justify-between cursor-pointer py-2 dark:text-gray-200 dark:focus:bg-gray-800"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="h-6 w-6 rounded bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold flex-shrink-0">
                      {workspace.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate max-w-[130px]">{workspace.name}</span>
                  </div>
                  {activeWorkspace?._id === workspace._id && <Check className="h-4 w-4 text-gray-900 dark:text-gray-100 flex-shrink-0" />}
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuSeparator className="dark:bg-gray-800" />
              
              <DropdownMenuItem 
                onClick={() => setIsCreateWorkspaceOpen(true)} 
                className="cursor-pointer py-2 text-[#3b66f5] dark:text-blue-400 focus:text-[#3b66f5] dark:focus:text-blue-400 font-medium dark:focus:bg-gray-800"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button className="md:hidden ml-2" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 mb-4 px-2 uppercase tracking-wider">Navigation</div>
          {navItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive 
                    ? "bg-blue-50 text-[#3b66f5] font-medium dark:bg-blue-900/20 dark:text-blue-400" 
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* TOP NAVIGATION HEADER */}
        <header className={`h-16 border-b flex items-center justify-between px-4 sm:px-6 z-10 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-4 flex-1">
            <button className="md:hidden text-gray-500 hover:text-gray-700" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
            <form onSubmit={handleSearch} className="relative hidden sm:block w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks (Press Enter)..."
                className={`pl-9 h-10 w-full rounded-lg focus-visible:ring-[#3b66f5] ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500' : 'bg-gray-50/50 border-gray-200'}`}
              />
            </form>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={toggleTheme} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'text-yellow-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}>
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <div className="relative">
              <button onClick={() => { setIsNotifOpen(!isNotifOpen); setIsDropdownOpen(false); }} className={`relative p-2 rounded-full transition-colors mr-2 ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}>
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1.5 h-[18px] w-[18px] rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center border-2 border-white dark:border-gray-900">2</span>
              </button>

              {isNotifOpen && (
                <div className={`absolute right-0 mt-2 w-80 rounded-xl shadow-lg border py-2 z-50 animate-in fade-in slide-in-from-top-2 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 font-semibold text-sm">Recent Notifications</div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border-b border-gray-50 dark:border-gray-700">
                      <p className="text-sm"><span className="font-medium text-[#3b66f5]">Sarah</span> mentioned you in a comment.</p>
                      <p className="text-xs text-gray-400 mt-1">10 minutes ago</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={`h-6 w-px hidden sm:block ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}></div>

            <div className="relative">
              <button onClick={() => { setIsDropdownOpen(!isDropdownOpen); setIsNotifOpen(false); }} className={`flex items-center gap-2 p-1 pr-3 rounded-full transition-colors focus:outline-none ml-1 ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                <div className="h-8 w-8 rounded-full bg-[#3b66f5] flex items-center justify-center text-sm font-semibold text-white">
                  {getInitials(user?.name || "User")}
                </div>
                <span className={`text-[15px] font-medium hidden sm:block ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{user?.name || "Loading..."}</span>
              </button>

              {isDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-lg border py-1 z-50 animate-in fade-in slide-in-from-top-2 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                  <button onClick={() => { navigate('/settings'); setIsDropdownOpen(false); }} className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium w-full text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <UserIcon className="h-4 w-4 text-gray-400" /> Profile
                  </button>
                  <button onClick={() => { navigate('/settings'); setIsDropdownOpen(false); }} className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium w-full text-left ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <Settings className="h-4 w-4 text-gray-400" /> Settings
                  </button>
                  <div className={`h-px my-1 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}></div>
                  <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left">
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-8 h-full bg-gray-50/50 dark:bg-gray-950">
            {children}
          </div>
        </main>
      </div>

      {/* CREATE WORKSPACE DIALOG */}
      <Dialog open={isCreateWorkspaceOpen} onOpenChange={setIsCreateWorkspaceOpen}>
        <DialogContent className="sm:max-w-[425px] dark:bg-gray-900 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Create Workspace</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Set up a new workspace to manage a different team or company.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateWorkspace} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Workspace Name</Label>
              <Input 
                value={newWorkspaceName} 
                onChange={(e) => setNewWorkspaceName(e.target.value)} 
                placeholder="e.g. Acme Marketing" 
                required 
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="dark:border-gray-700 dark:text-gray-300">Cancel</Button>
              </DialogClose>
              <Button type="submit">Create Workspace</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};