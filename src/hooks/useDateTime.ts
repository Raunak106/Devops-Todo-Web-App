import { useState, useEffect } from "react";
import { getTimeGreeting, getCurrentDateTime } from "@/lib/dateUtils";

export const useDateTime = () => {
  const [greeting, setGreeting] = useState(getTimeGreeting());
  const [dateTime, setDateTime] = useState(getCurrentDateTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getTimeGreeting());
      setDateTime(getCurrentDateTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return { greeting, ...dateTime };
};
