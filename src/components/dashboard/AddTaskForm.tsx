import { useState } from "react";
import { Priority } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddTaskFormProps {
  onAdd: (title: string, priority: Priority, dueDate: string | null, reminderEnabled?: boolean) => void;
}

const AddTaskForm = ({ onAdd }: AddTaskFormProps) => {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task title",
        variant: "destructive",
      });
      return;
    }

    onAdd(title.trim(), priority, dueDate || null, reminderEnabled);
    setTitle("");
    setPriority("medium");
    setDueDate("");
    setReminderEnabled(false);

    toast({
      title: "Task added",
      description: reminderEnabled 
        ? "Your new task has been created with hourly email reminders" 
        : "Your new task has been created",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-4 space-y-4 animate-fade-in">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <Plus className="h-5 w-5 text-primary" />
        Add New Task
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="title" className="sr-only">Task Title</Label>
          <Input
            id="title"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-11"
          />
        </div>

        <div>
          <Label htmlFor="priority" className="sr-only">Priority</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  Low
                </span>
              </SelectItem>
              <SelectItem value="medium">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-warning" />
                  Medium
                </span>
              </SelectItem>
              <SelectItem value="high">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-destructive" />
                  High
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="dueDate" className="sr-only">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="h-11"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          <Button type="submit" size="lg" className="px-6">
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="reminder" className="text-sm text-muted-foreground cursor-pointer">
            Email reminder every hour until completed
          </Label>
        </div>
        <Switch
          id="reminder"
          checked={reminderEnabled}
          onCheckedChange={setReminderEnabled}
        />
      </div>
    </form>
  );
};

export default AddTaskForm;
