import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useDateTime } from "@/hooks/useDateTime";
import { Button } from "@/components/ui/button";
import { LogOut, Sun, Moon, Calendar, Clock, Sparkles } from "lucide-react";

const DashboardHeader = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { greeting, date, time } = useDateTime();

  return (
    <header className="glass-card p-6 md:p-8 mb-6 animate-fade-in relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-secondary/20 to-transparent rounded-tr-full" />
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-warning animate-bounce-subtle" />
            <span className="text-sm font-medium text-muted-foreground">Welcome back!</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold">
            <span className="text-foreground">{greeting}, </span>
            <span className="gradient-text">{user?.name}</span>
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">{date}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-mono font-medium">{time}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="glass h-11 w-11 rounded-xl transition-all duration-300 hover:scale-110 hover:rotate-12"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5 text-warning" />
            )}
          </Button>
          <Button 
            variant="destructive" 
            onClick={logout} 
            className="gap-2 h-11 rounded-xl btn-shine shadow-lg shadow-destructive/20"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
