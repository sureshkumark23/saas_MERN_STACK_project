import { useState, useEffect, useRef } from "react";
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
  X
} from "lucide-react";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  
  // UI States
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Theme State (Checks local storage or defaults to light)
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );

  // Handle Theme Switching
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

  // Load User Data
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Handle Search Submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to tasks page and pass the search query in the URL
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
      
      {/* MOBILE OVERLAY */}
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
        <div className={`h-16 flex items-center justify-between px-6 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="bg-[#3b66f5] p-1.5 rounded-lg">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            Acme Corp
          </div>
          <button className="md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
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
          
          {/* Left: Mobile menu toggle & Search */}
          <div className="flex items-center gap-4 flex-1">
            <button 
              className="md:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setIsMobileMenuOpen(true)}
            >
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

          {/* Right: Icons & Profile Dropdown */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* THEME TOGGLE */}
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'text-yellow-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* NOTIFICATIONS */}
            <div className="relative">
              <button 
                onClick={() => { setIsNotifOpen(!isNotifOpen); setIsDropdownOpen(false); }}
                className={`relative p-2 rounded-full transition-colors mr-2 ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1.5 h-[18px] w-[18px] rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center border-2 border-white dark:border-gray-900">
                  2
                </span>
              </button>

              {/* Notifications Dropdown Panel */}
              {isNotifOpen && (
                <div className={`absolute right-0 mt-2 w-80 rounded-xl shadow-lg border py-2 z-50 animate-in fade-in slide-in-from-top-2 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 font-semibold text-sm">
                    Recent Notifications
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border-b border-gray-50 dark:border-gray-700">
                      <p className="text-sm"><span className="font-medium text-[#3b66f5]">Sarah</span> mentioned you in a comment.</p>
                      <p className="text-xs text-gray-400 mt-1">10 minutes ago</p>
                    </div>
                    <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                      <p className="text-sm">Your project <span className="font-medium">SaaS MVP</span> reached 100% completion!</p>
                      <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={`h-6 w-px hidden sm:block ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}></div>

            {/* USER PROFILE DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => { setIsDropdownOpen(!isDropdownOpen); setIsNotifOpen(false); }}
                className={`flex items-center gap-2 p-1 pr-3 rounded-full transition-colors focus:outline-none ml-1 ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
              >
                <div className="h-8 w-8 rounded-full bg-[#3b66f5] flex items-center justify-center text-sm font-semibold text-white">
                  {getInitials(user?.name || "User")}
                </div>
                <span className={`text-[15px] font-medium hidden sm:block ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                  {user?.name || "Loading..."}
                </span>
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
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-8 h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};