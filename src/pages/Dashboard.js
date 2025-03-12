"use client"

import { useState, useEffect } from "react"
import { Moon, Sun, Home, Users, Briefcase, SettingsIcon, Menu, X, Calendar, Globe, BarChart, RefreshCw } from 'lucide-react'
import { Link } from "react-router-dom"
import { getClients, getServices, getAppointments, reloadFromJSON } from "../services/dataService"
import { useTheme } from "../contexts/theme-context"
import { useAuth } from "../contexts/auth-context"
import DashboardCharts from "../components/DashboardCharts"

// Função utilitária para combinar classes condicionalmente
const cn = (...classes) => {
  return classes.filter(Boolean).join(" ")
}

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [clients, setClients] = useState([])
  const [services, setServices] = useState([])
  const [appointments, setAppointments] = useState([])
  const [showCharts, setShowCharts] = useState(true)

  // Importamos o hook useTheme para acessar o contexto
  const { darkMode, toggleDarkMode } = useTheme()
  const { currentUser, logout } = useAuth()

  useEffect(() => {
    setClients(getClients())
    setServices(getServices())
    setAppointments(getAppointments())
  }, [])

  // Alternar a visibilidade da barra lateral
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const lastClient = clients.length > 0 ? clients[clients.length - 1] : null

  // Filtrar apenas agendamentos futuros
  const upcomingAppointments = appointments
    .filter((app) => new Date(app.date) > new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  // Adicione esta função dentro do componente Dashboard, após as outras funções
  const handleReloadData = () => {
    const newData = reloadFromJSON()
    setClients(newData.clients)
    setServices(newData.services)
    setAppointments(newData.appointments)
    alert("Dados atualizados com sucesso!")
  }

  return (
    <div className={cn("flex min-h-screen bg-background text-foreground transition-colors duration-300")}>
      {/* Barra lateral para desktop */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-all duration-300 ease-in-out md:static",
          !sidebarOpen && "md:-translate-x-full",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex h-14 items-center border-b px-4">
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <button onClick={() => setMobileMenuOpen(false)} className="ml-auto rounded-sm opacity-70 md:hidden">
            <X className="h-5 w-5" />
            <span className="sr-only">Fechar menu</span>
          </button>
        </div>
        <nav className="flex-1 overflow-auto py-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Menu</h2>
            <div className="space-y-1">
              <Link
                to="/dashboard"
                className="flex w-full items-center gap-3 rounded-md bg-accent px-4 py-2 text-sm font-medium transition-colors duration-200"
              >
                <Home className="h-4 w-4" />
                Início
              </Link>
              <Link
                to="/clients"
                className="flex w-full items-center gap-3 rounded-md px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
              >
                <Users className="h-4 w-4" />
                Clientes
              </Link>
              <Link
                to="/services"
                className="flex w-full items-center gap-3 rounded-md px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
              >
                <Briefcase className="h-4 w-4" />
                Serviços
              </Link>
              <Link
                to="/appointments"
                className="flex w-full items-center gap-3 rounded-md px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
              >
                <Calendar className="h-4 w-4" />
                Agendamentos
              </Link>
              <Link
                to="/settings"
                className="flex w-full items-center gap-3 rounded-md px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
              >
                <SettingsIcon className="h-4 w-4" />
                Configurações
              </Link>
              <Link
                to="/"
                className="flex w-full items-center gap-3 rounded-md px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
              >
                <Globe className="h-4 w-4" />
                Site da Empresa
              </Link>
            </div>
          </div>
        </nav>
      </aside>

      {/* Conteúdo principal */}
      <div className="flex flex-1 flex-col">
        {/* Cabeçalho */}
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:px-6 transition-colors duration-300">
          <button onClick={() => setMobileMenuOpen(true)} className="rounded-sm md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menu</span>
          </button>
          <button onClick={toggleSidebar} className="hidden rounded-sm md:block">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Alternar barra lateral</span>
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="rounded-full p-1 hover:bg-accent transition-colors duration-200"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span className="sr-only">{darkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}</span>
            </button>
            <button
              onClick={handleReloadData}
              className="rounded-full p-1 hover:bg-accent transition-colors duration-200 ml-2"
              title="Recarregar dados"
            >
              <RefreshCw className="h-5 w-5" />
              <span className="sr-only">Recarregar dados</span>
            </button>

            <div className="ml-2 border-l pl-2">
              <span className="text-sm mr-2">{currentUser?.name}</span>
              <button onClick={logout} className="text-sm text-primary hover:underline">
                Sair
              </button>
            </div>
          </div>
        </header>

        {/* Conteúdo do dashboard */}
        <main className="flex-1 p-4 md:p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Card de clientes */}
            <div className="rounded-lg border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-sm font-medium">Clientes</h3>
              </div>
              <div className="mt-3">
                <p className="text-3xl font-bold">{clients.length}</p>
                <p className="text-xs text-muted-foreground">Total de clientes cadastrados</p>
              </div>
            </div>

            {/* Card de serviços */}
            <div className="rounded-lg border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-sm font-medium">Serviços</h3>
              </div>
              <div className="mt-3">
                <p className="text-3xl font-bold">{services.length}</p>
                <p className="text-xs text-muted-foreground">Total de serviços disponíveis</p>
              </div>
            </div>

            {/* Card de agendamentos */}
            <div className="rounded-lg border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-sm font-medium">Agendamentos</h3>
              </div>
              <div className="mt-3">
                <p className="text-3xl font-bold">{appointments.length}</p>
                <p className="text-xs text-muted-foreground">Total de agendamentos</p>
              </div>
            </div>

            {/* Último cliente cadastrado */}
            {lastClient && (
              <div className="rounded-lg border bg-primary p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary-foreground" />
                  <h3 className="text-sm font-medium text-primary-foreground">Último Cliente Cadastrado</h3>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-primary-foreground">{lastClient.name}</p>
                  <p className="text-sm text-primary-foreground">{lastClient.email}</p>
                  <p className="text-sm text-primary-foreground">{lastClient.phone}</p>
                </div>
              </div>
            )}
          </div>

          {/* Seção de Gráficos */}
          <div className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center">
                <BarChart className="h-5 w-5 mr-2" />
                Análise de Dados
              </h2>
              <button
                onClick={() => setShowCharts(!showCharts)}
                className="text-sm text-primary hover:underline flex items-center"
              >
                {showCharts ? "Ocultar Gráficos" : "Mostrar Gráficos"}
              </button>
            </div>

            {showCharts && (
              <div className="animate-fadeIn">
                <DashboardCharts />
              </div>
            )}
          </div>

          {/* Listas de clientes, serviços e agendamentos */}
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Lista de clientes */}
            <div className="rounded-lg border bg-card shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="flex items-center justify-between border-b p-4">
                <h3 className="font-semibold">Clientes</h3>
                <Link to="/clients" className="text-sm text-primary hover:underline transition-colors duration-200">
                  Ver todos
                </Link>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  {clients.slice(0, 3).map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors duration-200"
                    >
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                      </div>
                    </div>
                  ))}
                  {clients.length === 0 && (
                    <div className="rounded-lg border p-3 text-center text-muted-foreground">
                      Nenhum cliente cadastrado
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Lista de serviços */}
            <div className="rounded-lg border bg-card shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="flex items-center justify-between border-b p-4">
                <h3 className="font-semibold">Serviços</h3>
                <Link to="/services" className="text-sm text-primary hover:underline transition-colors duration-200">
                  Ver todos
                </Link>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  {services.slice(0, 3).map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors duration-200"
                    >
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          R$ {service.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {services.length === 0 && (
                    <div className="rounded-lg border p-3 text-center text-muted-foreground">
                      Nenhum serviço cadastrado
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Lista de próximos agendamentos */}
            <div className="rounded-lg border bg-card shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="flex items-center justify-between border-b p-4">
                <h3 className="font-semibold">Próximos Agendamentos</h3>
                <Link
                  to="/appointments"
                  className="text-sm text-primary hover:underline transition-colors duration-200"
                >
                  Ver todos
                </Link>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  {upcomingAppointments.slice(0, 3).map((appointment) => {
                    const client = clients.find((c) => c.id === appointment.clientId) || {
                      name: "Cliente não encontrado",
                    }
                    const service = services.find((s) => s.id === appointment.serviceId) || {
                      name: "Serviço não encontrado",
                    }
                    const appointmentDate = new Date(appointment.date)

                    return (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors duration-200"
                      >
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-muted-foreground">{service.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {appointmentDate.toLocaleDateString("pt-BR")} às{" "}
                            {appointmentDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            appointment.status === "agendado"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                              : appointment.status === "confirmado"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                : appointment.status === "concluido"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          } transition-all duration-300`}
                        >
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </div>
                    )
                  })}
                  {upcomingAppointments.length === 0 && (
                    <div className="rounded-lg border p-3 text-center text-muted-foreground">
                      Nenhum agendamento próximo
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Banner do site da empresa */}
          <div className="mt-6">
            <div className="rounded-lg border bg-gradient-to-r from-primary/20 to-primary/5 p-6 shadow-sm">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Visite o Site da Empresa</h3>
                  <p className="text-muted-foreground mb-4">
                    Conheça nosso site institucional e descubra todos os serviços que oferecemos.
                  </p>
                </div>
                <Link
                  to="/"
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
                >
                  <Globe className="h-5 w-5 mr-2 inline-block" />
                  Acessar o Site
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
