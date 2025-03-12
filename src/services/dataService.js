// Dados iniciais em vez de importar de arquivos JSON
const initialClients = [
  {
    "id": 1,
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "phone": "(11) 99999-9999"
  },
  {
    "id": 2,
    "name": "Maria Oliveira",
    "email": "maria@exemplo.com",
    "phone": "(11) 88888-8888"
  },
  {
    "id": 3,
    "name": "Carlos Santos",
    "email": "carlos@exemplo.com",
    "phone": "(11) 97777-7777"
  },
  {
    "id": 4,
    "name": "Ana Souza",
    "email": "ana@exemplo.com",
    "phone": "(11) 96666-6666"
  },
  {
    "id": 5,
    "name": "Pedro Lima",
    "email": "pedro@exemplo.com",
    "phone": "(11) 95555-5555"
  },
  {
    "id": 6,
    "name": "Fernanda Costa",
    "email": "fernanda@exemplo.com",
    "phone": "(11) 94444-4444"
  },
  {
    "id": 7,
    "name": "Lucas Pereira",
    "email": "lucas@exemplo.com",
    "phone": "(11) 93333-3333"
  },
  {
    "id": 8,
    "name": "Juliana Mendes",
    "email": "juliana@exemplo.com",
    "phone": "(11) 92222-2222"
  },
  {
    "id": 9,
    "name": "Ricardo Almeida",
    "email": "ricardo@exemplo.com",
    "phone": "(11) 91111-1111"
  },
  {
    "id": 10,
    "name": "Camila Rocha",
    "email": "camila@exemplo.com",
    "phone": "(11) 90000-0000"
  },
  {
    "id": 11,
    "name": "Gabriel Martins",
    "email": "gabriel@exemplo.com",
    "phone": "(11) 98888-1234"
  },
  {
    "id": 12,
    "name": "Patrícia Nunes",
    "email": "patricia@exemplo.com",
    "phone": "(11) 97777-5678"
  }
];

const initialServices = [
  {
    "id": 1,
    "name": "Corte de Cabelo Feminino",
    "price": 50,
    "description": "Corte profissional para cabelos femininos"
  },
  {
    "id": 2,
    "name": "Corte de Cabelo Masculino",
    "price": 40,
    "description": "Corte profissional para cabelos masculinos"
  },
  {
    "id": 3,
    "name": "Corte Infantil",
    "price": 35,
    "description": "Corte especial para crianças"
  },
  {
    "id": 4,
    "name": "Escova Simples",
    "price": 30,
    "description": "Escova tradicional para modelagem dos fios"
  },
  {
    "id": 5,
    "name": "Escova Modelada",
    "price": 40,
    "description": "Escova com modelagem para diferentes estilos"
  },
  {
    "id": 6,
    "name": "Hidratação Capilar",
    "price": 60,
    "description": "Tratamento para hidratação profunda dos fios"
  },
  {
    "id": 7,
    "name": "Reconstrução Capilar",
    "price": 90,
    "description": "Tratamento para recuperação de cabelos danificados"
  },
  {
    "id": 8,
    "name": "Progressiva",
    "price": 180,
    "description": "Alisamento capilar duradouro"
  },
  {
    "id": 9,
    "name": "Botox Capilar",
    "price": 150,
    "description": "Tratamento para reduzir volume e frizz"
  },
  {
    "id": 10,
    "name": "Selagem Capilar",
    "price": 130,
    "description": "Fechamento das cutículas para um cabelo mais brilhoso"
  }
];

const initialAppointments = [
  {
    "id": 1,
    "clientId": 1,
    "serviceId": 1,
    "date": "2025-03-15T10:00:00",
    "status": "agendado",
    "notes": "Primeira consulta"
  },
  {
    "id": 2,
    "clientId": 2,
    "serviceId": 5,
    "date": "2025-03-16T14:00:00",
    "status": "confirmado",
    "notes": "Cliente pediu modelagem específica"
  },
  {
    "id": 3,
    "clientId": 3,
    "serviceId": 8,
    "date": "2025-03-17T09:30:00",
    "status": "concluido",
    "notes": "Cliente muito satisfeito"
  },
  {
    "id": 4,
    "clientId": 4,
    "serviceId": 12,
    "date": "2025-03-18T13:00:00",
    "status": "cancelado",
    "notes": "Cliente desmarcou por imprevisto"
  },
  {
    "id": 5,
    "clientId": 5,
    "serviceId": 17,
    "date": "2025-03-19T15:00:00",
    "status": "agendado",
    "notes": "Cliente quer um formato diferente"
  },
  {
    "id": 6,
    "clientId": 6,
    "serviceId": 23,
    "date": "2025-03-20T16:00:00",
    "status": "confirmado",
    "notes": "Cliente preferiu unhas naturais"
  }
];

// Versão dos dados para controle de atualizações
const DATA_VERSION = "1.2" 

// Inicializa os dados do localStorage ou usa os dados dos arrays acima
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

// Função para forçar a atualização dos dados a partir dos arrays iniciais
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