"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import { getClients, getServices, getAppointments } from "../services/dataService"
import { useTheme } from "../contexts/theme-context"

function DashboardCharts() {
  const [clients, setClients] = useState([])
  const [services, setServices] = useState([])
  const [appointments, setAppointments] = useState([])
  const { darkMode } = useTheme()

  // Cores para os gráficos
  const COLORS = {
    primary: "hsl(var(--primary))",
    secondary: "hsl(var(--secondary))",
    accent: "hsl(var(--accent))",
    background: darkMode ? "#1f2937" : "#ffffff",
    text: darkMode ? "#f9fafb" : "#111827",
    grid: darkMode ? "#374151" : "#e5e7eb",
    statusColors: {
      agendado: "#3b82f6",
      confirmado: "#f59e0b",
      concluido: "#10b981",
      cancelado: "#ef4444",
    },
  }

  // Cores para o gráfico de pizza
  const STATUS_COLORS = [
    COLORS.statusColors.agendado,
    COLORS.statusColors.confirmado,
    COLORS.statusColors.concluido,
    COLORS.statusColors.cancelado,
  ]

  useEffect(() => {
    setClients(getClients())
    setServices(getServices())
    setAppointments(getAppointments())
  }, [])

  // Dados para o gráfico de status de agendamentos
  const getAppointmentStatusData = () => {
    return [
      {
        name: "Agendado",
        value: appointments.filter((a) => a.status === "agendado").length,
      },
      {
        name: "Confirmado",
        value: appointments.filter((a) => a.status === "confirmado").length,
      },
      {
        name: "Concluído",
        value: appointments.filter((a) => a.status === "concluido").length,
      },
      {
        name: "Cancelado",
        value: appointments.filter((a) => a.status === "cancelado").length,
      },
    ]
  }

  // Dados para o gráfico de serviços mais populares
  const getPopularServicesData = () => {
    // Contar a frequência de cada serviço
    const serviceCounts = {}
    appointments.forEach((appointment) => {
      const serviceId = appointment.serviceId
      serviceCounts[serviceId] = (serviceCounts[serviceId] || 0) + 1
    })

    // Ordenar serviços por popularidade
    const sortedServices = Object.entries(serviceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5) // Top 5 serviços

    // Criar array de dados para o gráfico
    return sortedServices.map(([serviceId, count]) => {
      const service = services.find((s) => s.id === Number.parseInt(serviceId))
      return {
        name: service ? service.name : "Desconhecido",
        value: count,
      }
    })
  }

  // Dados para o gráfico de receita por serviço
  const getRevenueByServiceData = () => {
    // Calcular receita por serviço
    const serviceRevenue = {}

    appointments.forEach((appointment) => {
      if (appointment.status === "concluido") {
        const serviceId = appointment.serviceId
        const service = services.find((s) => s.id === serviceId)

        if (service) {
          serviceRevenue[serviceId] = (serviceRevenue[serviceId] || 0) + service.price
        }
      }
    })

    // Ordenar serviços por receita
    const sortedServices = Object.entries(serviceRevenue)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5) // Top 5 serviços

    // Criar array de dados para o gráfico
    return sortedServices.map(([serviceId, revenue]) => {
      const service = services.find((s) => s.id === Number.parseInt(serviceId))
      return {
        name: service ? service.name : "Desconhecido",
        value: revenue,
      }
    })
  }

  // Dados para o gráfico de agendamentos por dia da semana
  const getAppointmentsByDayData = () => {
    const daysOfWeek = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
    const appointmentsByDay = Array(7).fill(0)

    appointments.forEach((appointment) => {
      const date = new Date(appointment.date)
      const dayOfWeek = date.getDay() // 0 = Domingo, 1 = Segunda, etc.
      appointmentsByDay[dayOfWeek]++
    })

    return daysOfWeek.map((day, index) => ({
      name: day,
      value: appointmentsByDay[index],
    }))
  }

  // Dados para o gráfico de novos clientes por mês
  const getNewClientsByMonthData = () => {
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
    const clientsByMonth = Array(12).fill(0)

    // Simulando dados de clientes por mês (em um sistema real, usaríamos datas reais de cadastro)
    clients.forEach((client, index) => {
      // Distribuindo clientes aleatoriamente pelos meses para demonstração
      const month = index % 12
      clientsByMonth[month]++
    })

    return months.map((month, index) => ({
      name: month,
      value: clientsByMonth[index],
    }))
  }

  // Componente personalizado para o tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-2 rounded-md shadow-md">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-primary">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      )
    }
    return null
  }

  // Renderizador personalizado para rótulos no gráfico de pizza
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Gráfico de Status de Agendamentos */}
      <div className="rounded-lg border bg-card p-4 shadow-sm transition-all duration-300 hover:shadow-md">
        <h3 className="mb-4 text-lg font-semibold">Status dos Agendamentos</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={getAppointmentStatusData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getAppointmentStatusData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Serviços Populares */}
      <div className="rounded-lg border bg-card p-4 shadow-sm transition-all duration-300 hover:shadow-md">
        <h3 className="mb-4 text-lg font-semibold">Serviços Mais Populares</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={getPopularServicesData()}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
              <XAxis dataKey="name" tick={{ fill: COLORS.text }} />
              <YAxis tick={{ fill: COLORS.text }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Agendamentos" fill={COLORS.statusColors.agendado} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Receita por Serviço */}
      <div className="rounded-lg border bg-card p-4 shadow-sm transition-all duration-300 hover:shadow-md">
        <h3 className="mb-4 text-lg font-semibold">Receita por Serviço (R$)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={getRevenueByServiceData()}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
              <XAxis dataKey="name" tick={{ fill: COLORS.text }} />
              <YAxis tick={{ fill: COLORS.text }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Receita (R$)" fill={COLORS.statusColors.concluido} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Agendamentos por Dia da Semana */}
      <div className="rounded-lg border bg-card p-4 shadow-sm transition-all duration-300 hover:shadow-md">
        <h3 className="mb-4 text-lg font-semibold">Agendamentos por Dia da Semana</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={getAppointmentsByDayData()}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
              <XAxis dataKey="name" tick={{ fill: COLORS.text }} />
              <YAxis tick={{ fill: COLORS.text }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Agendamentos" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Novos Clientes por Mês */}
      <div className="rounded-lg border bg-card p-4 shadow-sm transition-all duration-300 hover:shadow-md col-span-1 md:col-span-2">
        <h3 className="mb-4 text-lg font-semibold">Novos Clientes por Mês</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={getNewClientsByMonthData()}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
              <XAxis dataKey="name" tick={{ fill: COLORS.text }} />
              <YAxis tick={{ fill: COLORS.text }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                name="Novos Clientes"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default DashboardCharts

