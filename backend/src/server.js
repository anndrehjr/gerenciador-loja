import { app } from "./app.js";
import { env } from "./config/env.js";
import { startReminderJob } from "./lib/reminderJob.js";
import { isWhatsAppEnabled } from "./lib/whatsapp.js";

app.listen(env.PORT, () => {
  console.log(`API rodando em http://localhost:${env.PORT}`);
  console.log(`Notificações WhatsApp: ${isWhatsAppEnabled ? "ativadas" : "desativadas"}`);
  startReminderJob();
});
