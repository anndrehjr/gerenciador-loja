"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Moon, Sun, Plus, Pencil, Trash2, Calendar, Search, X, Filter } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { getClients, saveClients } from "../services/dataService"
import { useTheme } from "../contexts/theme-context"

function Clients() {
  const { darkMode, toggleDarkMode } = useTheme()
  const [clients, setClients] = useState([])
  const [filteredClients, setFilteredClients] = useState([])
  const [editingClient, setEditingClient] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [filters, setFilters] = useState({
    search: "",
    showFilters: false,
  })
  const navigate = useNavigate()

  useEffect(() => {
    const loadedClients = getClients()
    setClients(loadedClients)
    setFilteredClients(loadedClients)
  }, [])

  // Aplicar filtros quando os clientes ou filtros mudarem
  useEffect(() => {
    applyFilters()
  }, [clients, filters.search])

  const applyFilters = () => {
    let result = [...clients]

    // Filtro de pesquisa (busca em nome, email e telefone)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(
        (client) =>
          client.name.toLowerCase().includes(searchLower) ||
          client.email.toLowerCase().includes(searchLower) ||
          client.phone.toLowerCase().includes(searchLower),
      )
    }

    setFilteredClients(result)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    let updatedClients
    if (editingClient) {
      // Editar cliente existente
      updatedClients = clients.map((client) =>
        client.id === editingClient.id ? { ...formData, id: client.id } : client,
      )
    } else {
      // Adicionar novo cliente
      const newClient = {
        id: clients.length > 0 ? Math.max(...clients.map((c) => c.id)) + 1 : 1,
        ...formData,
      }
      updatedClients = [...clients, newClient]
    }
    setClients(updatedClients)
    saveClients(updatedClients)
    setEditingClient(null)
    setFormData({ name: "", email: "", phone: "" })
  }

  const handleEdit = (client) => {
    setEditingClient(client)
    setFormData(client)
  }

  const handleDelete = (id) => {
    const updatedClients = clients.filter((client) => client.id !== id)
    setClients(updatedClients)
    saveClients(updatedClients)
  }

  // Função para navegar para a página de agendamentos com o cliente pré-selecionado
  const handleScheduleService = (clientId) => {
    navigate(`/appointments?clientId=${clientId}`)
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      showFilters: false,
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b bg-background">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-2 rounded-md text-sm font-medium hover:text-primary">
              <ArrowLeft className="h-5 w-5" />
              Voltar ao Dashboard
            </Link>
          </div>
          <button onClick={toggleDarkMode} className="rounded-full p-2 hover:bg-accent">
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <div className="container mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Gerenciar Clientes</h1>
          <p className="text-muted-foreground">Adicione, edite ou remova clientes</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="mb-8 rounded-lg border bg-card p-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-md border bg-background px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-md border bg-background px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-md border bg-background px-3 py-2"
                required
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              {editingClient ? "Atualizar Cliente" : "Adicionar Cliente"}
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
                placeholder="Buscar por nome, email ou telefone..."
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

              {filters.search && (
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
              {/* Filtros adicionais podem ser implementados aqui */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Utilize os filtros para encontrar clientes específicos. A busca atual encontrou{" "}
                  {filteredClients.length} cliente(s).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Lista de Clientes */}
        <div className="rounded-lg border bg-card">
          <div className="p-4">
            <h2 className="text-lg font-semibold">Clientes Cadastrados ({filteredClients.length})</h2>
          </div>
          <div className="border-t">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Nome</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Telefone</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <tr key={client.id} className="border-t hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-sm">{client.name}</td>
                      <td className="px-4 py-3 text-sm">{client.email}</td>
                      <td className="px-4 py-3 text-sm">{client.phone}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleScheduleService(client.id)}
                            className="rounded-md p-2 hover:bg-accent text-primary"
                            title="Agendar serviço"
                          >
                            <Calendar className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(client)}
                            className="rounded-md p-2 hover:bg-accent"
                            title="Editar cliente"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(client.id)}
                            className="rounded-md p-2 hover:bg-accent"
                            title="Excluir cliente"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-muted-foreground">
                      Nenhum cliente encontrado com os filtros aplicados.
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

export default Clients

