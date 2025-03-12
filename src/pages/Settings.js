"use client"

import { useState } from "react"
import { ArrowLeft, Moon, Sun, RefreshCw, Download, Upload, FileJson } from "lucide-react"
import { Link } from "react-router-dom"
import { resetData, exportData, importData, reloadFromJSON } from "../services/dataService"
import { useTheme } from "../contexts/theme-context"

function Settings() {
  const { darkMode, toggleDarkMode } = useTheme()
  const [importStatus, setImportStatus] = useState("")
  const [reloadStatus, setReloadStatus] = useState("")

  const handleResetData = () => {
    if (
      window.confirm(
        "Tem certeza que deseja resetar todos os dados para o estado inicial? Esta ação não pode ser desfeita.",
      )
    ) {
      resetData()
      alert("Dados resetados com sucesso!")
    }
  }

  const handleExportData = () => {
    const data = exportData()
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "sistema-dados-" + new Date().toISOString().split("T")[0] + ".json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportData = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        importData(data)
        setImportStatus("Dados importados com sucesso!")
        setTimeout(() => setImportStatus(""), 3000)
      } catch (error) {
        setImportStatus("Erro ao importar dados: " + error.message)
      }
    }
    reader.readAsText(file)
  }

  // Nova função para recarregar dados dos arquivos JSON
  const handleReloadFromJSON = () => {
    if (
      window.confirm(
        "Tem certeza que deseja recarregar os dados dos arquivos JSON? Isso substituirá os dados atuais no localStorage.",
      )
    ) {
      const data = reloadFromJSON()
      setReloadStatus(
        `Dados recarregados com sucesso! (${data.clients.length} clientes, ${data.services.length} serviços, ${data.appointments.length} agendamentos)`,
      )
      setTimeout(() => setReloadStatus(""), 5000)
    }
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Navbar */}
      <nav className="border-b bg-background transition-colors duration-300">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
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
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">Gerencie os dados do sistema</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Gerenciamento de Dados */}
          <div className="rounded-lg border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Gerenciamento de Dados</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-md font-medium mb-2">Resetar Dados</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Restaura todos os dados para o estado inicial dos arquivos JSON.
                </p>
                <button
                  onClick={handleResetData}
                  className="flex items-center gap-2 rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-all duration-300 transform hover:scale-105"
                >
                  <RefreshCw className="h-4 w-4" />
                  Resetar Dados
                </button>
              </div>

              {/* Nova opção para recarregar dados dos arquivos JSON */}
              <div>
                <h3 className="text-md font-medium mb-2">Recarregar Arquivos JSON</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Recarrega os dados diretamente dos arquivos JSON, ignorando o localStorage atual.
                </p>
                <button
                  onClick={handleReloadFromJSON}
                  className="flex items-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
                >
                  <FileJson className="h-4 w-4" />
                  Recarregar Arquivos JSON
                </button>
                {reloadStatus && <p className="mt-2 text-sm text-green-500 animate-fadeIn">{reloadStatus}</p>}
              </div>

              <div>
                <h3 className="text-md font-medium mb-2">Exportar Dados</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Baixa todos os dados atuais do sistema em um arquivo JSON.
                </p>
                <button
                  onClick={handleExportData}
                  className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
                >
                  <Download className="h-4 w-4" />
                  Exportar Dados
                </button>
              </div>

              <div>
                <h3 className="text-md font-medium mb-2">Importar Dados</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Carrega dados de um arquivo JSON exportado anteriormente.
                </p>
                <label className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 cursor-pointer transition-all duration-300 transform hover:scale-105">
                  <Upload className="h-4 w-4" />
                  Importar Dados
                  <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                </label>
                {importStatus && (
                  <p
                    className={`mt-2 text-sm ${importStatus.includes("Erro") ? "text-red-500" : "text-green-500"} animate-fadeIn`}
                  >
                    {importStatus}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Informações do Sistema */}
          <div className="rounded-lg border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Informações do Sistema</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-md font-medium mb-2">Sobre</h3>
                <p className="text-sm text-muted-foreground">
                  Sistema de Gerenciamento de Clientes, Serviços e Agendamentos
                </p>
                <p className="text-sm text-muted-foreground mt-1">Versão 1.1.0</p>
              </div>

              <div>
                <h3 className="text-md font-medium mb-2">Armazenamento</h3>
                <p className="text-sm text-muted-foreground">
                  Os dados são carregados inicialmente de arquivos JSON e armazenados no localStorage do navegador.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Para atualizar os dados após modificar os arquivos JSON, use a opção "Recarregar Arquivos JSON".
                </p>
              </div>

              <div>
                <h3 className="text-md font-medium mb-2">Estrutura de Dados</h3>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  <li>Clientes: nome, email, telefone</li>
                  <li>Serviços: nome, preço, descrição</li>
                  <li>Agendamentos: cliente, serviço, data, hora, status, observações</li>
                </ul>
              </div>

              <div className="p-4 bg-accent/30 rounded-lg mt-4">
                <h3 className="text-md font-medium mb-2">Dica</h3>
                <p className="text-sm text-muted-foreground">
                  Se você modificou os arquivos JSON diretamente e deseja ver as alterações refletidas no sistema, use o
                  botão "Recarregar Arquivos JSON" acima.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings

