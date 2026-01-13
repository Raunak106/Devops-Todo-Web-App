import { useState } from "react";
import { Task, Priority } from "@/types/task";
import { formatDisplayDate } from "@/lib/dateUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, Check, X, Calendar, Bell, BellOff, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Pick<Task, "title" | "priority" | "dueDate">>) => void;
  onDelete: (id: string) => void;
}

const priorityConfig: Record<Priority, { color: string; bg: string; glow: string; label: string }> = {
  low: { 
    color: "text-success", 
    bg: "bg-success", 
    glow: "shadow-success/30",
    label: "Low" 
  },
  medium: { 
    color: "text-warning", 
    bg: "bg-warning", 
    glow: "shadow-warning/30",
    label: "Medium" 
  },
  high: { 
    color: "text-destructive", 
    bg: "bg-destructive", 
    glow: "shadow-destructive/30",
    label: "High" 
  },
};

const TaskItem = ({ task, onToggle, onUpdate, onDelete }: TaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editPriority, setEditPriority] = useState<Priority>(task.priority);
  const [editDueDate, setEditDueDate] = useState(task.dueDate || "");
  const [isHovered, setIsHovered] = useState(false);

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate(task.id, {
        title: editTitle.trim(),
        priority: editPriority,
        dueDate: editDueDate || null,
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditPriority(task.priority);
    setEditDueDate(task.dueDate || "");
    setIsEditing(false);
  };

  const config = priorityConfig[task.priority];

  if (isEditing) {
    return (
      <div className="glass-card p-5 space-y-4 animate-scale-in border-2 border-primary/30">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Pencil className="h-4 w-4 text-primary" />
          <span>Editing task</span>
        </div>
        <Input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder="Task title"
          autoFocus
          className="h-12 text-base border-2"
        />
        <div className="flex flex-wrap gap-3">
          <Select value={editPriority} onValueChange={(v) => setEditPriority(v as Priority)}>
            <SelectTrigger className="w-36 h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-success" />
                  Low
                </span>
              </SelectItem>
              <SelectItem value="medium">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-warning" />
                  Medium
                </span>
              </SelectItem>
              <SelectItem value="high">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-destructive" />
                  High
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={editDueDate}
            onChange={(e) => setEditDueDate(e.target.value)}
            className="w-44 h-11"
          />
          <div className="flex gap-2 ml-auto">
            <Button 
              size="lg" 
              onClick={handleSave}
              className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              <Check className="h-4 w-4" />
              Save
            </Button>
            <Button size="lg" variant="outline" onClick={handleCancel} className="gap-2">
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "glass-card p-4 flex items-center gap-4 transition-all duration-300 group relative overflow-hidden",
        task.completed && "opacity-60",
        isHovered && !task.completed && `shadow-lg ${config.glow}`
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Priority indicator line */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1 transition-all duration-300",
        config.bg,
        isHovered && "w-1.5"
      )} />

      {/* Completed celebration effect */}
      {task.completed && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <Sparkles className="h-5 w-5 text-success animate-bounce-subtle" />
        </div>
      )}

      <div className="ml-2">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggle(task.id)}
          className={cn(
            "h-6 w-6 rounded-full transition-all duration-300",
            task.completed && "bg-success border-success"
          )}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "font-medium text-foreground truncate text-base transition-all",
            task.completed && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </p>
        <div className="flex items-center gap-3 mt-1.5">
          {task.dueDate && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
              <Calendar className="h-3 w-3" />
              <span>{formatDisplayDate(task.dueDate)}</span>
            </div>
          )}
          {task.reminderEnabled && (
            <div className="flex items-center gap-1.5 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
              <Bell className="h-3 w-3" />
              <span>Reminder on</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-lg transition-transform duration-300",
            config.bg,
            config.glow,
            isHovered && "scale-110"
          )}
        >
          {config.label}
        </span>

        <div className={cn(
          "flex items-center gap-1 transition-all duration-300",
          isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
        )}>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsEditing(true)}
            className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary"
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(task.id)}
            className="h-9 w-9 rounded-xl hover:bg-destructive/10 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
