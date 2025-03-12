"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Moon, Sun, Plus, Pencil, Trash2, Search, X, Filter, SortAsc, SortDesc } from "lucide-react"
import { Link } from "react-router-dom"
import { getServices, saveServices } from "../services/dataService"
import { useTheme } from "../contexts/theme-context"

function Services() {
  const { darkMode, toggleDarkMode } = useTheme()
  const [services, setServices] = useState([])
  const [filteredServices, setFilteredServices] = useState([])
  const [editingService, setEditingService] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
  })
  const [filters, setFilters] = useState({
    search: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "name", // name, price
    sortOrder: "asc", // asc, desc
    showFilters: false,
  })

  useEffect(() => {
    const loadedServices = getServices()
    setServices(loadedServices)
    setFilteredServices(loadedServices)
  }, [])

  // Aplicar filtros quando os serviços ou filtros mudarem
  useEffect(() => {
    applyFilters()
  }, [services, filters])

  const applyFilters = () => {
    let result = [...services]

    // Filtro de pesquisa (busca em nome e descrição)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(
        (service) =>
          service.name.toLowerCase().includes(searchLower) || service.description.toLowerCase().includes(searchLower),
      )
    }

    // Filtro de preço mínimo
    if (filters.minPrice) {
      const minPrice = Number.parseFloat(filters.minPrice)
      result = result.filter((service) => service.price >= minPrice)
    }

    // Filtro de preço máximo
    if (filters.maxPrice) {
      const maxPrice = Number.parseFloat(filters.maxPrice)
      result = result.filter((service) => service.price <= maxPrice)
    }

    // Ordenação
    result.sort((a, b) => {
      if (filters.sortBy === "name") {
        return filters.sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      } else if (filters.sortBy === "price") {
        return filters.sortOrder === "asc" ? a.price - b.price : b.price - a.price
      }
      return 0
    })

    setFilteredServices(result)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    let updatedServices
    if (editingService) {
      // Editar serviço existente
      updatedServices = services.map((service) =>
        service.id === editingService.id
          ? { ...formData, id: service.id, price: Number.parseFloat(formData.price) }
          : service,
      )
    } else {
      // Adicionar novo serviço
      const newService = {
        id: services.length > 0 ? Math.max(...services.map((s) => s.id)) + 1 : 1,
        ...formData,
        price: Number.parseFloat(formData.price),
      }
      updatedServices = [...services, newService]
    }
    setServices(updatedServices)
    saveServices(updatedServices)
    setEditingService(null)
    setFormData({ name: "", price: "", description: "" })
  }

  const handleEdit = (service) => {
    setEditingService(service)
    setFormData({ ...service, price: service.price.toString() })
  }

  const handleDelete = (id) => {
    const updatedServices = services.filter((service) => service.id !== id)
    setServices(updatedServices)
    saveServices(updatedServices)
  }

  const toggleSortOrder = () => {
    setFilters({
      ...filters,
      sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
    })
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "name",
      sortOrder: "asc",
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
          <h1 className="text-2xl font-bold">Gerenciar Serviços</h1>
          <p className="text-muted-foreground">Adicione, edite ou remova serviços</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="mb-8 rounded-lg border bg-card p-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium mb-1">Nome do Serviço</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-md border bg-background px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Preço</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full rounded-md border bg-background px-3 py-2"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              {editingService ? "Atualizar Serviço" : "Adicionar Serviço"}
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
                placeholder="Buscar por nome ou descrição..."
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

              <button
                type="button"
                onClick={toggleSortOrder}
                className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
                title={`Ordenar por ${filters.sortBy === "name" ? "nome" : "preço"} (${filters.sortOrder === "asc" ? "crescente" : "decrescente"})`}
              >
                {filters.sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                {filters.sortBy === "name" ? "Nome" : "Preço"}
              </button>

              {(filters.search ||
                filters.minPrice ||
                filters.maxPrice ||
                filters.sortBy !== "name" ||
                filters.sortOrder !== "asc") && (
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
                <label className="block text-sm font-medium mb-1">Ordenar por</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2"
                >
                  <option value="name">Nome</option>
                  <option value="price">Preço</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Preço mínimo</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2"
                  min="0"
                  step="0.01"
                  placeholder="R$ 0,00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Preço máximo</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2"
                  min="0"
                  step="0.01"
                  placeholder="R$ 999,99"
                />
              </div>
            </div>
          )}
        </div>

        {/* Lista de Serviços */}
        <div className="rounded-lg border bg-card">
          <div className="p-4">
            <h2 className="text-lg font-semibold">Serviços Cadastrados ({filteredServices.length})</h2>
          </div>
          <div className="border-t">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Nome</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Preço</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Descrição</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <tr key={service.id} className="border-t hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-sm">{service.name}</td>
                      <td className="px-4 py-3 text-sm">
                        {service.price.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm">{service.description}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(service)}
                            className="rounded-md p-2 hover:bg-accent"
                            title="Editar serviço"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(service.id)}
                            className="rounded-md p-2 hover:bg-accent"
                            title="Excluir serviço"
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
                      Nenhum serviço encontrado com os filtros aplicados.
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

export default Services

