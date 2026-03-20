import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Loader2, Mail, Shield, User as UserIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Define the shape of our Team Member data
interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const TeamPage = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch team members when the page loads
  const fetchTeam = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/team`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch team members");
      
      const data = await response.json();
      setMembers(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  // Handle inviting a new team member
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/team/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, role }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to invite member");

      toast.success(`${name} has been added to the workspace!`);
      setIsDialogOpen(false);
      
      // Reset form
      setName("");
      setEmail("");
      setRole("member");
      
      // Refresh the team list
      fetchTeam();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to render role badges nicely
  const RoleBadge = ({ role }: { role: string }) => {
    switch(role) {
      case 'owner': return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none"><Shield className="h-3 w-3 mr-1"/> Owner</Badge>;
      case 'admin': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none"><Shield className="h-3 w-3 mr-1"/> Admin</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-none"><UserIcon className="h-3 w-3 mr-1"/> Member</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
            <p className="text-gray-500 mt-2">Manage your workspace members and their roles.</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Invite to Workspace</DialogTitle>
                <CardDescription>
                  Add a new member to your team. They will be granted access immediately.
                </CardDescription>
              </DialogHeader>
              <form onSubmit={handleInviteMember} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="e.g. Jane Doe"
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input 
                    type="email"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="jane@company.com"
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Workspace Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin (Can manage projects & team)</SelectItem>
                      <SelectItem value="member">Member (Can manage tasks)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter className="mt-6">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Inviting..." : "Send Invite"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Team Members List */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="border-b bg-gray-50/50 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-gray-500" />
              Active Members ({members.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="divide-y">
                {members.map((member) => (
                  <div key={member._id} className="flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      {/* Avatar Placeholder */}
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      
                      <div>
                        <p className="font-semibold text-gray-900">{member.name}</p>
                        <div className="flex items-center text-sm text-gray-500 mt-0.5">
                          <Mail className="h-3 w-3 mr-1.5" />
                          {member.email}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:block text-xs text-gray-400 mr-4">
                        Joined {new Date(member.createdAt).toLocaleDateString()}
                      </div>
                      <RoleBadge role={member.role} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default TeamPage;