import { aplicacao } from "./aplicacao.js";
import { ambiente } from "./configuracao/ambiente.js";
import { iniciarTarefaLembrete } from "./biblioteca/tarefaLembrete.js";
import { whatsAppHabilitado } from "./biblioteca/whatsapp.js";

aplicacao.listen(ambiente.PORT, () => {
  console.log(`API rodando em http://localhost:${ambiente.PORT}`);
  console.log(`Notificações WhatsApp: ${whatsAppHabilitado ? "ativadas" : "desativadas"}`);
  iniciarTarefaLembrete();
});
