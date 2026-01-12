import { format } from "date-fns";

export const formatDisplayDate = (dateStr: string): string => {
  try {
    return format(new Date(dateStr), "MMM d, yyyy");
  } catch {
    return dateStr;
  }
};

export const getTimeGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

export const getCurrentDateTime = () => {
  const now = new Date();
  return {
    date: format(now, "EEEE, MMMM d, yyyy"),
    time: format(now, "h:mm:ss a"),
  };
};
