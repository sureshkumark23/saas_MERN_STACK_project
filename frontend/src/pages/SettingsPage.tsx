import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { User as UserIcon, Shield, Loader2 } from "lucide-react";

const SettingsPage = () => {
  // Profile State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Security State
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  useEffect(() => {
    // Load existing user info from local storage when the page opens
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setName(parsedUser.name || "");
      setEmail(parsedUser.email || "");
    }
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingProfile(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, email }),
      });

      if (!response.ok) throw new Error("Failed to update profile");
      const updatedUser = await response.json();

      // Update local storage so the new name instantly shows in the sidebar/header
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Profile updated successfully!");
      
      // Reload the page slightly so the header avatar grabs the new initials
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match!");
    }
    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters.");
    }

    setIsLoadingPassword(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) throw new Error("Failed to update password");

      toast.success("Password updated successfully!");
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoadingPassword(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl mx-auto pb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your account preferences and security.</p>
        </div>

        <div className="grid gap-6">
          
          {/* PROFILE SETTINGS CARD */}
          <Card className="dark:bg-gray-900 dark:border-gray-800 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl dark:text-gray-100">
                <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" /> Profile Settings
              </CardTitle>
              <CardDescription className="dark:text-gray-400">Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-5 max-w-md">
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">Full Name</Label>
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus-visible:ring-[#3b66f5]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">Email Address</Label>
                  <Input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus-visible:ring-[#3b66f5]"
                  />
                </div>
                <Button type="submit" disabled={isLoadingProfile} className="bg-[#3b66f5] hover:bg-[#3157db] text-white w-full sm:w-auto mt-2">
                  {isLoadingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* SECURITY CARD */}
          <Card className="dark:bg-gray-900 dark:border-gray-800 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl dark:text-gray-100">
                <Shield className="h-5 w-5 text-gray-500 dark:text-gray-400" /> Security
              </CardTitle>
              <CardDescription className="dark:text-gray-400">Update your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-5 max-w-md">
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">New Password</Label>
                  <Input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••"
                    required 
                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus-visible:ring-[#3b66f5]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">Confirm Password</Label>
                  <Input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    placeholder="••••••••"
                    required 
                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus-visible:ring-[#3b66f5]"
                  />
                </div>
                <Button type="submit" disabled={isLoadingPassword} className="bg-[#3b66f5] hover:bg-[#3157db] text-white w-full sm:w-auto mt-2">
                  {isLoadingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
          
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;