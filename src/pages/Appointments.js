"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Moon, Sun, Plus, Pencil, Trash2, UserPlus, Search, X, Filter, Calendar } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import {
  getAppointments,
  saveAppointments,
  getClients,
  getServices,
  getClientById,
  getServiceById,
} from "../services/dataService"
import { useTheme } from "../contexts/theme-context"

function formatDateTime(dateString) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function Appointments() {
  const { darkMode, toggleDarkMode } = useTheme()
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [clients, setClients] = useState([])
  const [services, setServices] = useState([])
  const [editingAppointment, setEditingAppointment] = useState(null)
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    clientId: "",
    serviceId: "",
    date: "",
    time: "",
    status: "agendado",
    notes: "",
  })
  const [filters, setFilters] = useState({
    search: "",
    clientId: "",
    serviceId: "",
    status: "",
    dateFrom: "",
    dateTo: "",
    showFilters: false,
  })

  useEffect(() => {
    // Verificar se há um clientId na URL
    const params = new URLSearchParams(window.location.search)
    const clientId = params.get("clientId")

    if (clientId) {
      setFormData((prev) => ({
        ...prev,
        clientId: clientId,
      }))
      setFilters((prev) => ({
        ...prev,
        clientId: clientId,
      }))
    }
  }, [])

  useEffect(() => {
    const loadedAppointments = getAppointments()
    setAppointments(loadedAppointments)
    setFilteredAppointments(loadedAppointments)
    setClients(getClients())
    setServices(getServices())
  }, [])

  // Aplicar filtros quando os agendamentos ou filtros mudarem
  useEffect(() => {
    applyFilters()
  }, [appointments, filters])

  const applyFilters = () => {
    let result = [...appointments]

    // Filtro de pesquisa (busca em notas)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter((appointment) => {
        const client = getClientById(appointment.clientId)
        const service = getServiceById(appointment.serviceId)
        const clientName = client ? client.name.toLowerCase() : ""
        const serviceName = service ? service.name.toLowerCase() : ""
        const notes = appointment.notes ? appointment.notes.toLowerCase() : ""

        return clientName.includes(searchLower) || serviceName.includes(searchLower) || notes.includes(searchLower)
      })
    }

    // Filtro por cliente
    if (filters.clientId) {
      result = result.filter((appointment) => appointment.clientId.toString() === filters.clientId)
    }

    // Filtro por serviço
    if (filters.serviceId) {
      result = result.filter((appointment) => appointment.serviceId.toString() === filters.serviceId)
    }

    // Filtro por status
    if (filters.status) {
      result = result.filter((appointment) => appointment.status === filters.status)
    }

    // Filtro por data inicial
    if (filters.dateFrom) {
      const dateFrom = new Date(filters.dateFrom)
      dateFrom.setHours(0, 0, 0, 0)
      result = result.filter((appointment) => {
        const appointmentDate = new Date(appointment.date)
        return appointmentDate >= dateFrom
      })
    }

    // Filtro por data final
    if (filters.dateTo) {
      const dateTo = new Date(filters.dateTo)
      dateTo.setHours(23, 59, 59, 999)
      result = result.filter((appointment) => {
        const appointmentDate = new Date(appointment.date)
        return appointmentDate <= dateTo
      })
    }

    // Ordenar por data
    result.sort((a, b) => new Date(a.date) - new Date(b.date))

    setFilteredAppointments(result)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Combinar data e hora em um único formato ISO
    const dateTime = new Date(`${formData.date}T${formData.time}:00`)

    let updatedAppointments
    if (editingAppointment) {
      // Editar agendamento existente
      updatedAppointments = appointments.map((appointment) =>
        appointment.id === editingAppointment.id
          ? {
              ...appointment,
              clientId: Number(formData.clientId),
              serviceId: Number(formData.serviceId),
              date: dateTime.toISOString(),
              status: formData.status,
              notes: formData.notes,
            }
          : appointment,
      )
    } else {
      // Adicionar novo agendamento
      const newAppointment = {
        id: appointments.length > 0 ? Math.max(...appointments.map((a) => a.id)) + 1 : 1,
        clientId: Number(formData.clientId),
        serviceId: Number(formData.serviceId),
        date: dateTime.toISOString(),
        status: formData.status,
        notes: formData.notes,
      }
      updatedAppointments = [...appointments, newAppointment]
    }

    setAppointments(updatedAppointments)
    saveAppointments(updatedAppointments)
    setEditingAppointment(null)
    setFormData({
      clientId: "",
      serviceId: "",
      date: "",
      time: "",
      status: "agendado",
      notes: "",
    })
  }

  const handleEdit = (appointment) => {
    const appointmentDate = new Date(appointment.date)
    const date = appointmentDate.toISOString().split("T")[0]
    const time = appointmentDate.toISOString().split("T")[1].substring(0, 5)

    setEditingAppointment(appointment)
    setFormData({
      clientId: appointment.clientId.toString(),
      serviceId: appointment.serviceId.toString(),
      date: date,
      time: time,
      status: appointment.status,
      notes: appointment.notes || "",
    })
  }

  const handleDelete = (id) => {
    const updatedAppointments = appointments.filter((appointment) => appointment.id !== id)
    setAppointments(updatedAppointments)
    saveAppointments(updatedAppointments)
  }

  // Função para obter o nome do cliente pelo ID
  const getClientName = (clientId) => {
    const client = getClientById(clientId)
    return client ? client.name : "Cliente não encontrado"
  }

  // Função para obter o nome do serviço pelo ID
  const getServiceName = (serviceId) => {
    const service = getServiceById(serviceId)
    return service ? service.name : "Serviço não encontrado"
  }

  // Função para navegar para a página de cadastro de clientes
  const navigateToAddClient = () => {
    navigate("/clients")
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      clientId: "",
      serviceId: "",
      status: "",
      dateFrom: "",
      dateTo: "",
      showFilters: false,
    })
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Navbar */}
      <nav className="border-b bg-background transition-colors duration-300">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 rounded-md text-sm font-medium hover:text-primary transition-colors duration-300"
            >
              <ArrowLeft className="h-5 w-5" />
              Voltar ao Dashboard
            </Link>
          </div>
          <button onClick={toggleDarkMode} className="rounded-full p-2 hover:bg-accent transition-colors duration-300">
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <div className="container mx-auto p-4">
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-2xl font-bold">Gerenciar Agendamentos</h1>
          <p className="text-muted-foreground">Adicione, edite ou remova agendamentos de serviços</p>
        </div>

        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-lg border bg-card p-4 shadow-lg transition-all duration-300 hover:shadow-xl"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <label className="block text-sm font-medium mb-1">Cliente</label>
              <div className="relative">
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 transition-all duration-300 focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={navigateToAddClient}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 bg-primary text-white hover:bg-primary-dark transition-colors duration-300"
                  title="Adicionar novo cliente"
                >
                  <UserPlus className="h-4 w-4" />
                </button>
              </div>
              {clients.length === 0 && (
                <div className="mt-2 flex items-center gap-2 text-sm text-primary">
                  <span>Nenhum cliente cadastrado.</span>
                  <button
                    type="button"
                    onClick={navigateToAddClient}
                    className="flex items-center gap-1 text-primary underline hover:text-primary-dark transition-colors duration-300"
                  >
                    <UserPlus className="h-4 w-4" />
                    Adicionar cliente
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Serviço</label>
              <select
                value={formData.serviceId}
                onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                className="w-full rounded-md border bg-background px-3 py-2 transition-all duration-300 focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Selecione um serviço</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - R$ {service.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full rounded-md border bg-background px-3 py-2 transition-all duration-300 focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hora</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full rounded-md border bg-background px-3 py-2 transition-all duration-300 focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-md border bg-background px-3 py-2 transition-all duration-300 focus:ring-2 focus:ring-primary"
                required
              >
                <option value="agendado">Agendado</option>
                <option value="confirmado">Confirmado</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Observações</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full rounded-md border bg-background px-3 py-2 transition-all duration-300 focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              {editingAppointment ? "Atualizar Agendamento" : "Adicionar Agendamento"}
            </button>
          </div>
        </form>

        {/* Filtros */}
        <div className="mb-6 rounded-lg border bg-card p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative w-full md:w-auto flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por cliente, serviço ou observações..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 rounded-md border bg-background px-3 py-2"
              />
              {filters.search && (
                <button
                  onClick={() => setFilters({ ...filters, search: "" })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setFilters({ ...filters, showFilters: !filters.showFilters })}
                className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                <Filter className="h-4 w-4" />
                Filtros
              </button>

              {(filters.search ||
                filters.clientId ||
                filters.serviceId ||
                filters.status ||
                filters.dateFrom ||
                filters.dateTo) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  <X className="h-4 w-4" />
                  Limpar
                </button>
              )}
            </div>
          </div>

          {filters.showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cliente</label>
                <select
                  value={filters.clientId}
                  onChange={(e) => setFilters({ ...filters, clientId: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2"
                >
                  <option value="">Todos os clientes</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Serviço</label>
                <select
                  value={filters.serviceId}
                  onChange={(e) => setFilters({ ...filters, serviceId: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2"
                >
                  <option value="">Todos os serviços</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2"
                >
                  <option value="">Todos os status</option>
                  <option value="agendado">Agendado</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Data inicial</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    className="w-full pl-10 rounded-md border bg-background px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Data final</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    className="w-full pl-10 rounded-md border bg-background px-3 py-2"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lista de Agendamentos */}
        <div className="rounded-lg border bg-card shadow-lg transition-all duration-300">
          <div className="p-4">
            <h2 className="text-lg font-semibold">Agendamentos ({filteredAppointments.length})</h2>
          </div>
          <div className="border-t">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Cliente</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Serviço</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Data e Hora</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="border-t hover:bg-muted/20 transition-colors duration-200">
                      <td className="px-4 py-3 text-sm">{getClientName(appointment.clientId)}</td>
                      <td className="px-4 py-3 text-sm">{getServiceName(appointment.serviceId)}</td>
                      <td className="px-4 py-3 text-sm">{formatDateTime(appointment.date)}</td>
                      <td className="px-4 py-3 text-sm">
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
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(appointment)}
                            className="rounded-md p-2 hover:bg-accent transition-colors duration-300 transform hover:scale-110"
                            title="Editar agendamento"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(appointment.id)}
                            className="rounded-md p-2 hover:bg-accent transition-colors duration-300 transform hover:scale-110"
                            title="Excluir agendamento"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-muted-foreground">
                      Nenhum agendamento encontrado com os filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Appointments

