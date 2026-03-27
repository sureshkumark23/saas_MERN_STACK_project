import api from "@/lib/api";
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
import { useWorkspace } from "@/context/WorkspaceContext"; // <-- NEW GLOBAL IMPORT

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

  // <-- GRAB THE ACTIVE WORKSPACE
  const { activeWorkspace } = useWorkspace(); 

  // Fetch team members
  const fetchTeam = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/team');
      setMembers(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch team members");
    } finally {
      setIsLoading(false);
    }
  };

  // <-- MAGIC RE-FETCH ON WORKSPACE SWITCH
  useEffect(() => {
    if (activeWorkspace) {
      fetchTeam();
    }
  }, [activeWorkspace]);

  // Handle inviting a new team member
 const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post('/team/invite', { name, email, role });

      toast.success(`${name} has been added to the workspace!`);
      setIsDialogOpen(false);
      setName(""); setEmail(""); setRole("member");
      fetchTeam();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to invite member");
    } finally {
      setIsSubmitting(false);
    }
  };
  // Helper to render role badges nicely with Dark Mode support
  const RoleBadge = ({ role }: { role: string }) => {
    switch(role) {
      case 'owner': 
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none dark:bg-purple-900/30 dark:text-purple-400"><Shield className="h-3 w-3 mr-1"/> Owner</Badge>;
      case 'admin': 
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none dark:bg-blue-900/30 dark:text-blue-400"><Shield className="h-3 w-3 mr-1"/> Admin</Badge>;
      default: 
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-none dark:bg-gray-800 dark:text-gray-300"><UserIcon className="h-3 w-3 mr-1"/> Member</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Team Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your workspace members and their roles.</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#3b66f5] hover:bg-[#3157db] text-white flex items-center gap-2 shadow-sm">
                <Plus className="h-4 w-4" /> Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] dark:bg-gray-900 dark:border-gray-800">
              <DialogHeader>
                <DialogTitle className="dark:text-gray-100">Invite to Workspace</DialogTitle>
                <CardDescription className="dark:text-gray-400">
                  Add a new member to your team. They will be granted access immediately.
                </CardDescription>
              </DialogHeader>
              <form onSubmit={handleInviteMember} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="dark:text-gray-300">Full Name</Label>
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="e.g. Jane Doe"
                    required 
                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus-visible:ring-[#3b66f5]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="dark:text-gray-300">Email Address</Label>
                  <Input 
                    type="email"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="jane@company.com"
                    required 
                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus-visible:ring-[#3b66f5]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="dark:text-gray-300">Workspace Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                      <SelectItem value="admin">Admin (Can manage projects & team)</SelectItem>
                      <SelectItem value="member">Member (Can manage tasks)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter className="mt-6">
                  <DialogClose asChild>
                    <Button type="button" variant="outline" className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={isSubmitting} className="bg-[#3b66f5] hover:bg-[#3157db] text-white">
                    {isSubmitting ? "Inviting..." : "Send Invite"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Team Members List */}
        <Card className="shadow-sm border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 pb-4 rounded-t-xl">
            <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              Active Members ({members.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {members.map((member) => (
                  <div key={member._id} className="flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      {/* Avatar Placeholder */}
                      <div className="h-10 w-10 rounded-full bg-[#eef2ff] dark:bg-blue-950 flex items-center justify-center text-[#4f46e5] dark:text-blue-300 font-bold border border-blue-100 dark:border-blue-900">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{member.name}</p>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          <Mail className="h-3 w-3 mr-1.5" />
                          {member.email}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:block text-xs text-gray-400 dark:text-gray-500 mr-4">
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