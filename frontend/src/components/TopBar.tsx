import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { toast } from "sonner";

export function TopBar() {
  const { toggleSidebar } = useSidebar();
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. Remove the security token and user data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // 2. Show a toast message
    toast.success("Logged out successfully");
    
    // 3. Kick them back to the login screen
    navigate("/login");
  };

  return (
    <header className="h-16 border-b flex items-center justify-between px-6 bg-white">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="font-semibold text-lg hidden sm:block">Dashboard</h2>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}