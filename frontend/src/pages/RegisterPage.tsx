import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, LayoutDashboard } from "lucide-react";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // This will pop up the "This email is already registered" message!
        throw new Error(data.message || "Registration failed");
      }

      // Save token and redirect to onboarding to create their first workspace
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      toast.success("Account created successfully!");
      navigate("/onboarding"); 
      
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-md shadow-lg dark:bg-gray-900 dark:border-gray-800">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 bg-[#3b66f5] rounded-xl flex items-center justify-center shadow-sm">
              <LayoutDashboard className="h-7 w-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold dark:text-gray-100">Create an account</CardTitle>
          <CardDescription className="dark:text-gray-400">
            Enter your details below to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="dark:text-gray-300">Full Name</Label>
              <Input 
                id="name" 
                placeholder="John Doe" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus-visible:ring-[#3b66f5]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-gray-300">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="john@company.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus-visible:ring-[#3b66f5]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="dark:text-gray-300">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus-visible:ring-[#3b66f5]"
              />
            </div>
            <Button type="submit" className="w-full bg-[#3b66f5] hover:bg-[#3157db] text-white py-5" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              Sign Up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t dark:border-gray-800 pt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-[#3b66f5] hover:underline font-medium">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterPage;