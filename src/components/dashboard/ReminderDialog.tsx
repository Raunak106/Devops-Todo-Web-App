import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReminderDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reminderInterval: number | null) => void;
  taskTitle: string;
}

const REMINDER_OPTIONS = [
  { value: 1, label: "1 min", description: "Every minute" },
  { value: 5, label: "5 min", description: "Every 5 minutes" },
  { value: 15, label: "15 min", description: "Every 15 minutes" },
  { value: 30, label: "30 min", description: "Every 30 minutes" },
  { value: 60, label: "1 hour", description: "Every hour" },
  { value: 120, label: "2 hours", description: "Every 2 hours" },
  { value: 1440, label: "1 day", description: "Once a day" },
  { value: null, label: "Never", description: "No reminders", icon: BellOff },
];

const ReminderDialog = ({ open, onClose, onConfirm, taskTitle }: ReminderDialogProps) => {
  const [selectedInterval, setSelectedInterval] = useState<number | null>(null);
  const [step, setStep] = useState<"ask" | "select">("ask");

  const handleYes = () => {
    setStep("select");
  };

  const handleNo = () => {
    onConfirm(null);
    resetAndClose();
  };

  const handleSelect = (value: number | null) => {
    setSelectedInterval(value);
  };

  const handleConfirm = () => {
    onConfirm(selectedInterval);
    resetAndClose();
  };

  const resetAndClose = () => {
    setStep("ask");
    setSelectedInterval(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && resetAndClose()}>
      <DialogContent className="sm:max-w-md overflow-hidden p-0">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-primary via-secondary to-accent p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">
                {step === "ask" ? "Email Notifications" : "Select Reminder Interval"}
              </DialogTitle>
              <DialogDescription className="text-white/80 mt-1">
                {step === "ask" 
                  ? "Stay on top of your tasks" 
                  : "Choose how often you'd like reminders"}
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6">
          {step === "ask" ? (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-medium truncate max-w-[200px]">{taskTitle}</span>
                </div>
                <p className="text-muted-foreground">
                  Would you like to receive email reminders for this task?
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-14 text-lg"
                  onClick={handleNo}
                >
                  <BellOff className="mr-2 h-5 w-5" />
                  No Thanks
                </Button>
                <Button
                  className="flex-1 h-14 text-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  onClick={handleYes}
                >
                  <Bell className="mr-2 h-5 w-5" />
                  Yes, Remind Me
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {REMINDER_OPTIONS.map((option) => {
                  const Icon = option.icon || Clock;
                  const isSelected = selectedInterval === option.value;
                  const isNever = option.value === null;
                  
                  return (
                    <button
                      key={option.label}
                      onClick={() => handleSelect(option.value)}
                      className={cn(
                        "relative p-4 rounded-xl border-2 transition-all duration-200 text-left group",
                        isSelected
                          ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                          : "border-border hover:border-primary/50 hover:bg-muted/50",
                        isNever && "col-span-2"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className={cn(
                            "font-semibold",
                            isSelected && "text-primary"
                          )}>
                            {option.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>

              <Button
                className="w-full h-12 text-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                onClick={handleConfirm}
                disabled={selectedInterval === undefined}
              >
                {selectedInterval === null ? "Skip Reminders" : "Set Reminder"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReminderDialog;
