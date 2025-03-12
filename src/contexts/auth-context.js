"use client"

import { createContext, useContext, useState, useEffect } from "react"

// Criando o contexto de autenticação
const AuthContext = createContext()

// Hook personalizado para usar o contexto de autenticação
export function useAuth() {
  return useContext(AuthContext)
}

// Provedor do contexto de autenticação
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Verificar se o usuário está logado ao carregar a página
  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (user) {
      setCurrentUser(JSON.parse(user))
    }
    setLoading(false)
  }, [])

  // Função para realizar login
  const login = (email, password) => {
    // Simulação de autenticação - em um ambiente real, isso seria uma chamada de API
    return new Promise((resolve, reject) => {
      // Verificar credenciais (exemplo simples)
      if (email === "admin@example.com" && password === "password") {
        const user = {
          id: 1,
          name: "Administrador",
          email: email,
          role: "admin",
        }

        // Salvar usuário no localStorage para persistir a sessão
        localStorage.setItem("currentUser", JSON.stringify(user))
        setCurrentUser(user)
        resolve(user)
      } else {
        reject(new Error("Credenciais inválidas"))
      }
    })
  }

  // Função para realizar logout
  const logout = () => {
    localStorage.removeItem("currentUser")
    setCurrentUser(null)
  }

  // Valor do contexto
  const value = {
    currentUser,
    login,
    logout,
    isAuthenticated: !!currentUser,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

