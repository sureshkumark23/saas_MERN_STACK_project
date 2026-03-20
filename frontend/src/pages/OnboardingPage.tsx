import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Building2, Link2, FolderKanban } from "lucide-react";

export default function OnboardingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <FolderKanban className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-foreground">ProjectFlow</span>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Get Started</CardTitle>
            <CardDescription>Create your first workspace or join an existing one</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Building2 className="h-4 w-4 text-primary" />
                Create a Workspace
              </Label>
              <Input placeholder="e.g., Acme Corp" />
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => navigate("/dashboard")}
              >
                Create Workspace
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">OR</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Link2 className="h-4 w-4 text-primary" />
                Join via Invite Link
              </Label>
              <Input placeholder="Paste your invite link" />
              <Button variant="outline" className="w-full" onClick={() => navigate("/dashboard")}>
                Join Workspace
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
