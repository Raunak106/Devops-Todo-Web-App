import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendEmail(to: string, subject: string, html: string) {
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
    throw new Error(`Failed to send email: ${error}`);
  }

  return res.json();
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting task reminder check...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all incomplete tasks with reminders enabled
    // that haven't been reminded in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select(`
        id,
        title,
        priority,
        due_date,
        user_id,
        last_reminder_sent
      `)
      .eq("completed", false)
      .eq("reminder_enabled", true)
      .or(`last_reminder_sent.is.null,last_reminder_sent.lt.${oneHourAgo}`);

    if (tasksError) {
      console.error("Error fetching tasks:", tasksError);
      throw tasksError;
    }

    console.log(`Found ${tasks?.length || 0} tasks needing reminders`);

    if (!tasks || tasks.length === 0) {
      return new Response(
        JSON.stringify({ message: "No tasks need reminders", sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Group tasks by user
    const tasksByUser: Record<string, typeof tasks> = {};
    for (const task of tasks) {
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
        return `${priorityEmoji} ${task.title}${dueInfo}`;
      }).join("\n");

      const html = `
        <h2>Task Reminder</h2>
        <p>Hi ${profile.name || "there"},</p>
        <p>You have ${userTasks.length} pending task${userTasks.length > 1 ? "s" : ""} with reminders enabled:</p>
        <pre style="background: #f4f4f4; padding: 15px; border-radius: 5px;">${taskList}</pre>
        <p>This is an hourly reminder. Complete your tasks to stop receiving these reminders.</p>
        <p>Best regards,<br>TaskFlow</p>
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
