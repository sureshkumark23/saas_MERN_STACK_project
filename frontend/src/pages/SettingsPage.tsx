import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { User as UserIcon, Shield, Loader2, AlertTriangle, Building2 } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const SettingsPage = () => {
  const [userRole, setUserRole] = useState<string>("member");

  // Profile State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Security State
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  // Workspace Context & State
  const { activeWorkspace, deleteWorkspace, renameWorkspace, workspaces } = useWorkspace();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // NEW: Rename State
  const [editWorkspaceName, setEditWorkspaceName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  // Sync the rename input with the active workspace name
  useEffect(() => {
    if (activeWorkspace) {
      setEditWorkspaceName(activeWorkspace.name);
    }
  }, [activeWorkspace]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setName(parsedUser.name || "");
      setEmail(parsedUser.email || "");
      setUserRole(parsedUser.role || "member"); 
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

      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Profile updated successfully!");
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return toast.error("Passwords do not match!");
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");

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

  const handleRenameWorkspace = async () => {
    if (!activeWorkspace || !editWorkspaceName.trim()) return;
    setIsRenaming(true);
    try {
      await renameWorkspace(activeWorkspace._id, editWorkspaceName);
    } catch (err) {
      // Error handled in context
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!activeWorkspace) return;
    setIsDeleting(true);
    await deleteWorkspace(activeWorkspace._id);
    setIsDeleting(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl mx-auto pb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your account preferences and security.</p>
        </div>

        <div className="grid gap-6">
          
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
                  <Input value={name} onChange={(e) => setName(e.target.value)} required className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus-visible:ring-[#3b66f5]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">Email Address</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus-visible:ring-[#3b66f5]" />
                </div>
                <Button type="submit" disabled={isLoadingProfile} className="bg-[#3b66f5] hover:bg-[#3157db] text-white w-full sm:w-auto mt-2">
                  {isLoadingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

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
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus-visible:ring-[#3b66f5]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">Confirm Password</Label>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus-visible:ring-[#3b66f5]" />
                </div>
                <Button type="submit" disabled={isLoadingPassword} className="bg-[#3b66f5] hover:bg-[#3157db] text-white w-full sm:w-auto mt-2">
                  {isLoadingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* NEW: WORKSPACE SETTINGS - ONLY SHOWS IF USER IS OWNER */}
          {userRole === "owner" && (
            <Card className="dark:bg-gray-900 dark:border-gray-800 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl dark:text-gray-100">
                  <Building2 className="h-5 w-5 text-gray-500 dark:text-gray-400" /> Workspace Settings
                </CardTitle>
                <CardDescription className="dark:text-gray-400">Rename or manage your active workspace.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-w-md">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium">Workspace Name</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={editWorkspaceName} 
                      onChange={(e) => setEditWorkspaceName(e.target.value)} 
                      className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus-visible:ring-[#3b66f5]" 
                    />
                    <Button 
                      onClick={handleRenameWorkspace} 
                      disabled={isRenaming || editWorkspaceName === activeWorkspace?.name} 
                      className="bg-[#3b66f5] hover:bg-[#3157db] text-white"
                    >
                      {isRenaming ? <Loader2 className="h-4 w-4 animate-spin" /> : "Rename"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* DANGER ZONE */}
          {userRole === "owner" && (
            <Card className="border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/10 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-500">
                  <AlertTriangle className="h-5 w-5" /> Danger Zone
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Irreversible and destructive actions for <strong className="text-gray-900 dark:text-gray-200">{activeWorkspace?.name}</strong>.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-red-100 dark:border-red-900/30 rounded-lg bg-white dark:bg-gray-900">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Delete Workspace</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Permanently delete this workspace and all its data. This action cannot be undone.
                    </p>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={workspaces.length <= 1 || isDeleting}>
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Workspace"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="dark:bg-gray-900 dark:border-gray-800">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="dark:text-gray-100">Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-400">
                          This will permanently delete the <strong>{activeWorkspace?.name}</strong> workspace and remove all associated projects, tasks, and team access.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="dark:border-gray-700 dark:text-gray-300">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteWorkspace} className="bg-red-600 hover:bg-red-700 text-white">
                          Yes, delete workspace
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                {workspaces.length <= 1 && (
                  <p className="text-xs text-red-500 mt-3 flex items-center gap-1">
                    * You cannot delete your only workspace. Create another one first.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;