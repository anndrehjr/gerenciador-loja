// Importar os dados iniciais dos arquivos JSON
import initialClients from "../data/clients.json"
import initialServices from "../data/services.json"
import initialAppointments from "../data/appointments.json"

// Versão dos dados para controle de atualizações
const DATA_VERSION = "1.2" // Incrementado para forçar atualização dos dados

// Inicializa os dados do localStorage ou usa os dados dos arquivos JSON
const initializeData = () => {
  // Verificar se a versão dos dados é a atual
  const currentVersion = localStorage.getItem("dataVersion")
  
  // Se a versão for diferente ou não existir, forçar atualização dos dados
  if (currentVersion !== DATA_VERSION) {
    console.log("Atualizando dados para a versão", DATA_VERSION)
    localStorage.setItem("clients", JSON.stringify(initialClients))
    localStorage.setItem("services", JSON.stringify(initialServices))
    localStorage.setItem("appointments", JSON.stringify(initialAppointments))
    localStorage.setItem("dataVersion", DATA_VERSION)
    return
  }
  
  // Inicialização normal se a versão for a mesma
  if (!localStorage.getItem("clients")) {
    localStorage.setItem("clients", JSON.stringify(initialClients))
  }

  if (!localStorage.getItem("services")) {
    localStorage.setItem("services", JSON.stringify(initialServices))
  }

  if (!localStorage.getItem("appointments")) {
    localStorage.setItem("appointments", JSON.stringify(initialAppointments))
  }
}

// Corrigir o status "completo" para "concluido" nos dados de agendamentos
const fixAppointmentStatus = () => {
  const appointments = JSON.parse(localStorage.getItem("appointments") || "[]")
  const fixedAppointments = appointments.map(appointment => {
    if (appointment.status === "completo") {
      return { ...appointment, status: "concluido" }
    }
    return appointment
  })
  localStorage.setItem("appointments", JSON.stringify(fixedAppointments))
}

export const getClients = () => {
  initializeData()
  return JSON.parse(localStorage.getItem("clients"))
}

export const getServices = () => {
  initializeData()
  return JSON.parse(localStorage.getItem("services"))
}

export const getAppointments = () => {
  initializeData()
  fixAppointmentStatus() // Corrigir status antes de retornar
  return JSON.parse(localStorage.getItem("appointments"))
}

export const saveClients = (clients) => {
  localStorage.setItem("clients", JSON.stringify(clients))
}

export const saveServices = (services) => {
  localStorage.setItem("services", JSON.stringify(services))
}

export const saveAppointments = (appointments) => {
  localStorage.setItem("appointments", JSON.stringify(appointments))
}

// Funções auxiliares para obter detalhes de clientes e serviços
export const getClientById = (clientId) => {
  const clients = getClients()
  return clients.find((client) => client.id === Number(clientId))
}

export const getServiceById = (serviceId) => {
  const services = getServices()
  return services.find((service) => service.id === Number(serviceId))
}

// Função para resetar os dados para o estado inicial
export const resetData = () => {
  localStorage.setItem("clients", JSON.stringify(initialClients))
  localStorage.setItem("services", JSON.stringify(initialServices))
  localStorage.setItem("appointments", JSON.stringify(initialAppointments))
  localStorage.setItem("dataVersion", DATA_VERSION)
}

// Função para forçar a atualização dos dados a partir dos arquivos JSON
export const reloadFromJSON = () => {
  localStorage.removeItem("dataVersion") // Remove a versão para forçar atualização
  initializeData() // Reinicializa os dados
  return {
    clients: initialClients,
    services: initialServices,
    appointments: initialAppointments
  }
}

// Função para exportar todos os dados atuais
export const exportData = () => {
  return {
    clients: getClients(),
    services: getServices(),
    appointments: getAppointments(),
  }
}

// Função para importar dados
export const importData = (data) => {
  if (data.clients) localStorage.setItem("clients", JSON.stringify(data.clients))
  if (data.services) localStorage.setItem("services", JSON.stringify(data.services))
  if (data.appointments) localStorage.setItem("appointments", JSON.stringify(data.appointments))
}
