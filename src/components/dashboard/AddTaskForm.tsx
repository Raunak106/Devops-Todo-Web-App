import { useState } from "react";
import { Priority } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Sparkles } from "lucide-react";
import ReminderDialog from "./ReminderDialog";

interface AddTaskFormProps {
  onAdd: (title: string, priority: Priority, dueDate: string | null, reminderInterval?: number | null) => void;
}

const AddTaskForm = ({ onAdd }: AddTaskFormProps) => {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [showReminderDialog, setShowReminderDialog] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    // Show reminder dialog instead of immediately adding
    setShowReminderDialog(true);
  };

  const handleReminderConfirm = (reminderInterval: number | null) => {
    onAdd(title.trim(), priority, dueDate || null, reminderInterval);
    setTitle("");
    setPriority("medium");
    setDueDate("");
    setShowReminderDialog(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5 animate-fade-in relative overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/10 via-secondary/5 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-accent/10 to-transparent rounded-tr-full" />
        
        <div className="flex items-center gap-3 mb-2 relative z-10">
          <div className="p-3 bg-gradient-to-r from-primary to-secondary rounded-xl shadow-lg shadow-primary/30 animate-pulse-glow">
            <Plus className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">Add New Task</h3>
            <p className="text-sm text-muted-foreground">Create a task and set smart reminders</p>
          </div>
          <Sparkles className="h-5 w-5 text-warning ml-auto animate-bounce-subtle" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 relative z-10">
          <div className="md:col-span-5">
            <Label htmlFor="title" className="sr-only">Task Title</Label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-13 text-base border-2 focus:border-primary focus:shadow-lg focus:shadow-primary/10 transition-all duration-300"
            />
          </div>

          <div className="md:col-span-3">
            <Label htmlFor="priority" className="sr-only">Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
              <SelectTrigger className="h-13 border-2 transition-all duration-300 hover:border-primary/50">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-success shadow-lg shadow-success/30" />
                    Low Priority
                  </span>
                </SelectItem>
                <SelectItem value="medium">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-warning shadow-lg shadow-warning/30" />
                    Medium Priority
                  </span>
                </SelectItem>
                <SelectItem value="high">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-destructive shadow-lg shadow-destructive/30" />
                    High Priority
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-3">
            <Label htmlFor="dueDate" className="sr-only">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="h-13 border-2 transition-all duration-300 hover:border-primary/50"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="md:col-span-1">
            <Button 
              type="submit" 
              size="lg" 
              className="w-full h-13 bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 transition-all duration-300 shadow-lg shadow-primary/30 btn-shine disabled:opacity-50"
              disabled={!title.trim()}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </form>

      <ReminderDialog
        open={showReminderDialog}
        onClose={() => setShowReminderDialog(false)}
        onConfirm={handleReminderConfirm}
        taskTitle={title}
      />
    </>
  );
};

export default AddTaskForm;
