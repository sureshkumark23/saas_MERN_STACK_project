import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const members = [
  { initials: "JD", name: "John Doe", email: "john@acme.com", role: "Owner", status: "Active" },
  { initials: "SC", name: "Sarah Chen", email: "sarah@acme.com", role: "Admin", status: "Active" },
  { initials: "MR", name: "Mike Ross", email: "mike@acme.com", role: "Member", status: "Active" },
  { initials: "AL", name: "Amy Lee", email: "amy@acme.com", role: "Member", status: "Active" },
  { initials: "KP", name: "Kate Park", email: "kate@acme.com", role: "Member", status: "Pending" },
];

const roleColors: Record<string, string> = {
  Owner: "bg-primary/10 text-primary",
  Admin: "bg-warning/10 text-warning",
  Member: "bg-secondary text-secondary-foreground",
};

export default function TeamPage() {
  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Team Members</h1>
            <p className="text-muted-foreground text-sm">{members.length} members in workspace</p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <UserPlus className="h-4 w-4 mr-1" /> Invite User
          </Button>
        </div>

        <Card className="border-border">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.email}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">{m.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{m.name}</p>
                          <p className="text-xs text-muted-foreground">{m.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${roleColors[m.role]}`}>{m.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={m.status === "Active" ? "secondary" : "outline"} className="text-xs">
                        {m.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Change Role</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </AppLayout>
  );
}
