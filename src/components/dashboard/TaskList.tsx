import { Task } from "@/types/task";
import TaskItem from "./TaskItem";
import { ListTodo, Sparkles } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Pick<Task, "title" | "priority" | "dueDate">>) => void;
  onDelete: (id: string) => void;
  emptyMessage?: string;
}

const TaskList = ({ tasks, onToggle, onUpdate, onDelete, emptyMessage = "No tasks found" }: TaskListProps) => {
  if (tasks.length === 0) {
    return (
      <div className="glass-card p-12 text-center relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        
        <div className="relative z-10">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <ListTodo className="h-10 w-10 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-muted-foreground mb-2">{emptyMessage}</p>
          <p className="text-sm text-muted-foreground/70">Create a new task to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.length > 0 && (
        <div className="flex items-center gap-2 px-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>{tasks.length} task{tasks.length > 1 ? "s" : ""}</span>
        </div>
      )}
      {tasks.map((task, index) => (
        <div
          key={task.id}
          className="opacity-0 animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <TaskItem
            task={task}
            onToggle={onToggle}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
};

export default TaskList;
