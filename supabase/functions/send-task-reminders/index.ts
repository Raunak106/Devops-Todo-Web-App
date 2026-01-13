import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendEmail(to: string, subject: string, html: string) {
  console.log(`Sending email to ${to} with subject: ${subject}`);
  
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "TaskFlow <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error(`Failed to send email: ${error}`);
    throw new Error(`Failed to send email: ${error}`);
  }

  return res.json();
}

function formatInterval(minutes: number): string {
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  if (minutes === 60) return "1 hour";
  if (minutes < 1440) return `${minutes / 60} hours`;
  return "1 day";
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting task reminder check...");

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY is not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all incomplete tasks with reminders enabled
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select(`
        id,
        title,
        priority,
        due_date,
        user_id,
        last_reminder_sent,
        reminder_interval
      `)
      .eq("completed", false)
      .eq("reminder_enabled", true)
      .not("reminder_interval", "is", null)
      .gt("reminder_interval", 0);

    if (tasksError) {
      console.error("Error fetching tasks:", tasksError);
      throw tasksError;
    }

    console.log(`Found ${tasks?.length || 0} tasks with reminders enabled`);

    if (!tasks || tasks.length === 0) {
      return new Response(
        JSON.stringify({ message: "No tasks need reminders", sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Filter tasks that need reminders based on their individual intervals
    const now = new Date();
    const tasksNeedingReminders = tasks.filter((task) => {
      if (!task.last_reminder_sent) return true;
      
      const lastSent = new Date(task.last_reminder_sent);
      const intervalMs = (task.reminder_interval || 60) * 60 * 1000; // Convert minutes to ms
      const nextReminderTime = new Date(lastSent.getTime() + intervalMs);
      
      return now >= nextReminderTime;
    });

    console.log(`${tasksNeedingReminders.length} tasks need reminders now`);

    if (tasksNeedingReminders.length === 0) {
      return new Response(
        JSON.stringify({ message: "No tasks due for reminders yet", sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Group tasks by user
    const tasksByUser: Record<string, typeof tasksNeedingReminders> = {};
    for (const task of tasksNeedingReminders) {
      if (!tasksByUser[task.user_id]) {
        tasksByUser[task.user_id] = [];
      }
      tasksByUser[task.user_id].push(task);
    }

    let emailsSent = 0;
    const taskIdsToUpdate: string[] = [];

    for (const [userId, userTasks] of Object.entries(tasksByUser)) {
      // Get user email from profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("email, name")
        .eq("user_id", userId)
        .maybeSingle();

      if (profileError || !profile?.email) {
        console.error(`Could not find email for user ${userId}:`, profileError);
        continue;
      }

      // Build email content
      const taskList = userTasks.map((task) => {
        const priorityEmoji = task.priority === "high" ? "🔴" : task.priority === "medium" ? "🟡" : "🟢";
        const dueInfo = task.due_date ? ` (Due: ${task.due_date})` : "";
        const intervalInfo = ` - Reminding every ${formatInterval(task.reminder_interval || 60)}`;
        return `${priorityEmoji} ${task.title}${dueInfo}${intervalInfo}`;
      }).join("<br>");

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #7c3aed, #06b6d4, #ec4899); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0; }
            .tasks { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
            .task-list { margin: 0; padding: 0; list-style: none; }
            .task-item { padding: 12px; background: white; border-radius: 8px; margin-bottom: 8px; border-left: 4px solid #7c3aed; }
            .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Task Reminder</h1>
              <p>You have ${userTasks.length} pending task${userTasks.length > 1 ? "s" : ""}</p>
            </div>
            <div class="tasks">
              <p>Hi ${profile.name || "there"}! 👋</p>
              <p>Here are your pending tasks with reminders enabled:</p>
              <div class="task-list">
                ${taskList}
              </div>
            </div>
            <div class="footer">
              <p>Complete your tasks to stop receiving reminders.</p>
              <p>— TaskFlow</p>
            </div>
          </div>
        </body>
        </html>
      `;

      try {
        const emailResponse = await sendEmail(
          profile.email,
          `⏰ Task Reminder: ${userTasks.length} pending task${userTasks.length > 1 ? "s" : ""}`,
          html
        );

        console.log(`Email sent to ${profile.email}:`, emailResponse);
        emailsSent++;

        // Mark tasks as reminded
        taskIdsToUpdate.push(...userTasks.map((t) => t.id));
      } catch (emailError) {
        console.error(`Failed to send email to ${profile.email}:`, emailError);
      }
    }

    // Update last_reminder_sent for all processed tasks
    if (taskIdsToUpdate.length > 0) {
      const { error: updateError } = await supabase
        .from("tasks")
        .update({ last_reminder_sent: new Date().toISOString() })
        .in("id", taskIdsToUpdate);

      if (updateError) {
        console.error("Error updating reminder timestamps:", updateError);
      }
    }

    console.log(`Reminder job complete. Emails sent: ${emailsSent}`);

    return new Response(
      JSON.stringify({ message: "Reminders sent", sent: emailsSent }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-task-reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
