export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  dueDate: string | null;
  createdAt: string;
  completedAt: string | null;
  userId: string;
  reminderEnabled: boolean;
  lastReminderSent: string | null;
}

export interface TaskFilters {
  status: "all" | "completed" | "pending";
  priority: "all" | Priority;
  search: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  completedToday: number;
  pendingToday: number;
  progressPercent: number;
}
