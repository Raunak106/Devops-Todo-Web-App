import { TaskFilters, Priority } from "@/types/task";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Trash2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskFiltersBarProps {
  filters: TaskFilters;
  onFilterChange: (filters: TaskFilters) => void;
  onClearCompleted: () => void;
  hasCompleted: boolean;
}

const TaskFiltersBar = ({
  filters,
  onFilterChange,
  onClearCompleted,
  hasCompleted,
}: TaskFiltersBarProps) => {
  const isFiltering = filters.search || filters.status !== "all" || filters.priority !== "all";

  return (
    <div className="glass-card p-4 animate-fade-in relative overflow-hidden">
      {/* Active filter indicator */}
      {isFiltering && (
        <div className="absolute top-2 right-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <Sparkles className="h-3 w-3" />
            Filtering
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-300",
            filters.search ? "text-primary" : "text-muted-foreground group-focus-within:text-primary"
          )} />
          <Input
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="pl-10 h-11 border-2 transition-all duration-300 focus:border-primary focus:shadow-lg focus:shadow-primary/10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select
            value={filters.status}
            onValueChange={(v) =>
              onFilterChange({ ...filters, status: v as TaskFilters["status"] })
            }
          >
            <SelectTrigger className={cn(
              "w-36 h-11 border-2 transition-all duration-300",
              filters.status !== "all" && "border-primary bg-primary/5"
            )}>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-warning" />
                  Pending
                </span>
              </SelectItem>
              <SelectItem value="completed">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  Completed
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.priority}
            onValueChange={(v) =>
              onFilterChange({ ...filters, priority: v as TaskFilters["priority"] })
            }
          >
            <SelectTrigger className={cn(
              "w-36 h-11 border-2 transition-all duration-300",
              filters.priority !== "all" && "border-primary bg-primary/5"
            )}>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-destructive shadow-lg shadow-destructive/30" />
                  High
                </span>
              </SelectItem>
              <SelectItem value="medium">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-warning shadow-lg shadow-warning/30" />
                  Medium
                </span>
              </SelectItem>
              <SelectItem value="low">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-success shadow-lg shadow-success/30" />
                  Low
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          {hasCompleted && (
            <Button 
              variant="outline" 
              onClick={onClearCompleted} 
              className="gap-2 h-11 border-2 hover:border-destructive hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Clear Completed</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskFiltersBar;
