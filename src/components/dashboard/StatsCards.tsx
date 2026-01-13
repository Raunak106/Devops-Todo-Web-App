import { TaskStats } from "@/types/task";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Clock,
  ListTodo,
  TrendingUp,
  Calendar,
  Target,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  stats: TaskStats;
}

const StatsCards = ({ stats }: StatsCardsProps) => {
  const cards = [
    {
      title: "Total Tasks",
      value: stats.total,
      icon: ListTodo,
      gradient: "from-primary/20 via-primary/10 to-transparent",
      iconBg: "bg-primary",
      glow: "shadow-primary/20",
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      gradient: "from-success/20 via-success/10 to-transparent",
      iconBg: "bg-success",
      glow: "shadow-success/20",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock,
      gradient: "from-warning/20 via-warning/10 to-transparent",
      iconBg: "bg-warning",
      glow: "shadow-warning/20",
    },
    {
      title: "Done Today",
      value: stats.completedToday,
      icon: Target,
      gradient: "from-secondary/20 via-secondary/10 to-transparent",
      iconBg: "bg-secondary",
      glow: "shadow-secondary/20",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <div
            key={card.title}
            className={cn(
              "interactive-card p-5 relative overflow-hidden opacity-0 animate-fade-in",
              `shadow-lg ${card.glow}`
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Gradient overlay */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-50",
              card.gradient
            )} />
            
            <div className="relative z-10 flex items-center gap-4">
              <div className={cn(
                "p-3 rounded-xl shadow-lg",
                card.iconBg
              )}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{card.value}</p>
                <p className="text-sm text-muted-foreground font-medium">{card.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-5 relative overflow-hidden opacity-0 animate-fade-in stagger-5">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-secondary">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-semibold text-foreground">Overall Progress</span>
                <p className="text-xs text-muted-foreground">Keep up the great work!</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Zap className={cn(
                "h-5 w-5",
                stats.progressPercent >= 50 ? "text-warning animate-bounce-subtle" : "text-muted-foreground"
              )} />
              <span className="text-2xl font-bold gradient-text">{stats.progressPercent}%</span>
            </div>
          </div>
          
          <div className="relative">
            <Progress 
              value={stats.progressPercent} 
              className="h-4 bg-muted/50" 
            />
            {stats.progressPercent >= 100 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-success-foreground">🎉 All done!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {stats.pendingToday > 0 && (
        <div className="glass-card p-4 border-l-4 border-l-warning relative overflow-hidden opacity-0 animate-slide-in-right stagger-5">
          <div className="absolute right-0 top-0 w-20 h-20 bg-gradient-to-bl from-warning/20 to-transparent rounded-bl-full" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2 rounded-lg bg-warning/10">
              <Calendar className="h-5 w-5 text-warning animate-wiggle" />
            </div>
            <div>
              <span className="text-foreground font-semibold">
                {stats.pendingToday} task{stats.pendingToday > 1 ? "s" : ""} due today
              </span>
              <p className="text-xs text-muted-foreground">Don't forget to complete them!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsCards;
