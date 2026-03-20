import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar, MessageSquare, Flag, Send } from "lucide-react";

interface Task {
  id: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  assignee: string;
  dueDate: string;
  comments: number;
  description: string;
}

const priorityColors: Record<string, string> = {
  High: "bg-priority-high/10 text-priority-high",
  Medium: "bg-priority-medium/10 text-priority-medium",
  Low: "bg-priority-low/10 text-priority-low",
};

const mockComments = [
  { user: "SC", name: "Sarah Chen", text: "I've started on the wireframes for this.", time: "2h ago" },
  { user: "MR", name: "Mike Ross", text: "Looking good! Let me know if you need help with the API.", time: "1h ago" },
];

export function TaskModal({ task, onClose }: { task: Task | null; onClose: () => void }) {
  return (
    <Dialog open={!!task} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <AnimatePresence>
          {task && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-lg">{task.title}</DialogTitle>
                  <Badge className={`text-xs ${priorityColors[task.priority]}`}>
                    <Flag className="h-3 w-3 mr-1" />
                    {task.priority}
                  </Badge>
                </div>
                <DialogDescription className="sr-only">Task details</DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                <p className="text-sm text-foreground leading-relaxed">{task.description}</p>

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" /> Due: {task.dueDate}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="bg-primary/10 text-primary text-[9px]">{task.assignee}</AvatarFallback>
                    </Avatar>
                    Assigned
                  </span>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-3">
                    <MessageSquare className="h-4 w-4" /> Comments
                  </h4>
                  <div className="space-y-3">
                    {mockComments.map((c, i) => (
                      <div key={i} className="flex gap-2.5">
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px]">{c.user}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">{c.name}</span>
                            <span className="text-xs text-muted-foreground">{c.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{c.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Textarea placeholder="Add a comment..." className="min-h-[60px] text-sm" />
                  <Button size="icon" className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 self-end">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
