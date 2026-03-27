import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Building2 } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [workspaceName, setWorkspaceName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Grab the global create function we made earlier!
  const { createWorkspace } = useWorkspace();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceName.trim()) return;
    
    setIsLoading(true);
    try {
      // 1. Create the workspace in the database
      await createWorkspace(workspaceName);
      
      // 2. Redirect them into the main app!
      setTimeout(() => {
        navigate("/dashboard");
      }, 800);
      
    } catch (error: any) {
      toast.error(error.message || "Failed to create workspace");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-md shadow-lg dark:bg-gray-900 dark:border-gray-800">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-[#eef2ff] dark:bg-blue-900/30 rounded-full flex items-center justify-center shadow-sm border border-blue-100 dark:border-blue-800">
              <Building2 className="h-8 w-8 text-[#3b66f5] dark:text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold dark:text-gray-100">Welcome to the App!</CardTitle>
          <CardDescription className="dark:text-gray-400 text-[15px]">
            Let's get started by creating your very first workspace. You can invite your team later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="workspaceName" className="dark:text-gray-300 font-medium">Workspace Name</Label>
              <Input 
                id="workspaceName" 
                placeholder="e.g. Acme Corporation" 
                required 
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus-visible:ring-[#3b66f5] py-5 text-md"
              />
            </div>
            <Button type="submit" className="w-full bg-[#3b66f5] hover:bg-[#3157db] text-white py-6 text-md font-medium" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              Create Workspace & Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingPage;