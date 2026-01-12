import { useState, useEffect, useCallback } from "react";
import { Task, Priority, TaskFilters, TaskStats } from "@/types/task";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const isToday = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const useTasks = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TaskFilters>({
    status: "all",
    priority: "all",
    search: "",
  });

  const fetchTasks = useCallback(async () => {
    if (!session?.user?.id) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mappedTasks: Task[] = (data || []).map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description || undefined,
        completed: t.completed,
        priority: t.priority as Priority,
        dueDate: t.due_date,
        createdAt: t.created_at,
        completedAt: t.completed ? t.updated_at : null,
        userId: t.user_id,
        reminderEnabled: t.reminder_enabled,
        lastReminderSent: t.last_reminder_sent,
      }));

      setTasks(mappedTasks);
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = useCallback(
    async (title: string, priority: Priority, dueDate: string | null, reminderEnabled: boolean = false) => {
      if (!session?.user?.id) return;

      try {
        const { data, error } = await supabase
          .from("tasks")
          .insert({
            title,
            priority,
            due_date: dueDate,
            user_id: session.user.id,
            reminder_enabled: reminderEnabled,
          })
          .select()
          .single();

        if (error) throw error;

        const newTask: Task = {
          id: data.id,
          title: data.title,
          description: data.description || undefined,
          completed: data.completed,
          priority: data.priority as Priority,
          dueDate: data.due_date,
          createdAt: data.created_at,
          completedAt: null,
          userId: data.user_id,
          reminderEnabled: data.reminder_enabled,
          lastReminderSent: data.last_reminder_sent,
        };

        setTasks((prev) => [newTask, ...prev]);
      } catch (error: any) {
        console.error("Error adding task:", error);
        toast({
          title: "Error",
          description: "Failed to add task",
          variant: "destructive",
        });
      }
    },
    [session?.user?.id, toast]
  );

  const updateTask = useCallback(
    async (id: string, updates: Partial<Pick<Task, "title" | "priority" | "dueDate" | "reminderEnabled">>) => {
      try {
        const dbUpdates: any = {};
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
        if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
        if (updates.reminderEnabled !== undefined) dbUpdates.reminder_enabled = updates.reminderEnabled;

        const { error } = await supabase
          .from("tasks")
          .update(dbUpdates)
          .eq("id", id);

        if (error) throw error;

        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
        );
      } catch (error: any) {
        console.error("Error updating task:", error);
        toast({
          title: "Error",
          description: "Failed to update task",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase.from("tasks").delete().eq("id", id);

        if (error) throw error;

        setTasks((prev) => prev.filter((t) => t.id !== id));
      } catch (error: any) {
        console.error("Error deleting task:", error);
        toast({
          title: "Error",
          description: "Failed to delete task",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const toggleComplete = useCallback(
    async (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      try {
        const { error } = await supabase
          .from("tasks")
          .update({ completed: !task.completed })
          .eq("id", id);

        if (error) throw error;

        setTasks((prev) =>
          prev.map((t) =>
            t.id === id
              ? {
                  ...t,
                  completed: !t.completed,
                  completedAt: !t.completed ? new Date().toISOString() : null,
                }
              : t
          )
        );
      } catch (error: any) {
        console.error("Error toggling task:", error);
        toast({
          title: "Error",
          description: "Failed to update task",
          variant: "destructive",
        });
      }
    },
    [tasks, toast]
  );

  const clearCompleted = useCallback(async () => {
    const completedIds = tasks.filter((t) => t.completed).map((t) => t.id);
    if (completedIds.length === 0) return;

    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .in("id", completedIds);

      if (error) throw error;

      setTasks((prev) => prev.filter((t) => !t.completed));
    } catch (error: any) {
      console.error("Error clearing completed:", error);
      toast({
        title: "Error",
        description: "Failed to clear completed tasks",
        variant: "destructive",
      });
    }
  }, [tasks, toast]);

  const filteredTasks = tasks.filter((task) => {
    if (filters.status === "completed" && !task.completed) return false;
    if (filters.status === "pending" && task.completed) return false;
    if (filters.priority !== "all" && task.priority !== filters.priority) return false;
    if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const stats: TaskStats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    pending: tasks.filter((t) => !t.completed).length,
    completedToday: tasks.filter((t) => t.completed && t.completedAt && isToday(t.completedAt)).length,
    pendingToday: tasks.filter((t) => !t.completed && t.dueDate && isToday(t.dueDate)).length,
    progressPercent: tasks.length > 0 ? Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100) : 0,
  };

  const groupedTasks = {
    completedToday: tasks.filter((t) => t.completed && t.completedAt && isToday(t.completedAt)),
    completedEarlier: tasks.filter((t) => t.completed && t.completedAt && !isToday(t.completedAt)),
    pending: tasks.filter((t) => !t.completed),
  };

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    filters,
    setFilters,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    clearCompleted,
    stats,
    groupedTasks,
    loading,
    refetch: fetchTasks,
  };
};
