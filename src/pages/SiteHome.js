"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Moon, Sun, Phone, Mail, MapPin, Clock, Instagram, Facebook, Twitter } from "lucide-react"
import { Link } from "react-router-dom"
import { useTheme } from "../contexts/theme-context"
import { useAuth } from "../contexts/auth-context"

function SiteHome() {
  const { darkMode, toggleDarkMode } = useTheme()
  const { isAuthenticated } = useAuth()
  const [activeSection, setActiveSection] = useState("home")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Efeito para detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)

      // Detectar seção ativa baseada no scroll
      const sections = ["home", "services", "gallery", "team", "testimonials", "contact"]

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Serviços oferecidos
  const services = [
    {
      id: 1,
      name: "Corte de Cabelo",
      price: "R$ 50,00",
      description: "Corte moderno com acabamento perfeito",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 2,
      name: "Coloração",
      price: "R$ 120,00",
      description: "Coloração profissional com produtos de qualidade",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 3,
      name: "Tratamento Capilar",
      price: "R$ 80,00",
      description: "Hidratação profunda para cabelos danificados",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 4,
      name: "Manicure",
      price: "R$ 40,00",
      description: "Cuidados completos para suas unhas",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 5,
      name: "Pedicure",
      price: "R$ 45,00",
      description: "Tratamento completo para seus pés",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 6,
      name: "Maquiagem",
      price: "R$ 90,00",
      description: "Maquiagem profissional para qualquer ocasião",
      image: "/placeholder.svg?height=200&width=300",
    },
  ]

  // Equipe
  const team = [
    { id: 1, name: "Ana Silva", role: "Cabeleireira", image: "/placeholder.svg?height=300&width=300" },
    { id: 2, name: "Carlos Santos", role: "Barbeiro", image: "/placeholder.svg?height=300&width=300" },
    { id: 3, name: "Juliana Oliveira", role: "Manicure", image: "/placeholder.svg?height=300&width=300" },
    { id: 4, name: "Roberto Almeida", role: "Maquiador", image: "/placeholder.svg?height=300&width=300" },
  ]

  // Depoimentos
  const testimonials = [
    {
      id: 1,
      name: "Mariana Costa",
      text: "Atendimento excelente! Saí do salão me sentindo renovada e muito mais bonita.",
      rating: 5,
    },
    {
      id: 2,
      name: "Pedro Henrique",
      text: "Profissionais muito competentes. Meu corte ficou exatamente como eu queria.",
      rating: 5,
    },
    {
      id: 3,
      name: "Fernanda Lima",
      text: "Ambiente agradável e atendimento de primeira. Recomendo a todos!",
      rating: 4,
    },
    { id: 4, name: "Lucas Mendes", text: "Serviço de qualidade e preço justo. Voltarei com certeza!", rating: 5 },
  ]

  // Função para renderizar estrelas de avaliação
  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <span key={i} className={`text-yellow-400 ${i < rating ? "opacity-100" : "opacity-30"}`}>
          ★
        </span>
      ))
  }

  // Função para scroll suave até a seção
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: "smooth",
      })
      setActiveSection(sectionId)
      setIsMenuOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-card shadow-md" : "bg-transparent"}`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <Link to={isAuthenticated ? "/dashboard" : "/login"} className="flex items-center gap-2 mr-8">
                <ArrowLeft className="h-5 w-5" />
                <span className="font-bold text-xl">
                  {isAuthenticated ? "Acessar Dashboard" : "Login / Área Restrita"}
                </span>
              </Link>

              {/* Menu para desktop */}
              <div className="hidden md:flex space-x-8">
                <button
                  onClick={() => scrollToSection("home")}
                  className={`text-sm font-medium transition-colors duration-300 ${activeSection === "home" ? "text-primary" : "hover:text-primary"}`}
                >
                  Início
                </button>
                <button
                  onClick={() => scrollToSection("services")}
                  className={`text-sm font-medium transition-colors duration-300 ${activeSection === "services" ? "text-primary" : "hover:text-primary"}`}
                >
                  Serviços
                </button>
                <button
                  onClick={() => scrollToSection("gallery")}
                  className={`text-sm font-medium transition-colors duration-300 ${activeSection === "gallery" ? "text-primary" : "hover:text-primary"}`}
                >
                  Galeria
                </button>
                <button
                  onClick={() => scrollToSection("team")}
                  className={`text-sm font-medium transition-colors duration-300 ${activeSection === "team" ? "text-primary" : "hover:text-primary"}`}
                >
                  Equipe
                </button>
                <button
                  onClick={() => scrollToSection("testimonials")}
                  className={`text-sm font-medium transition-colors duration-300 ${activeSection === "testimonials" ? "text-primary" : "hover:text-primary"}`}
                >
                  Depoimentos
                </button>
                <button
                  onClick={() => scrollToSection("contact")}
                  className={`text-sm font-medium transition-colors duration-300 ${activeSection === "contact" ? "text-primary" : "hover:text-primary"}`}
                >
                  Contato
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <button
                onClick={toggleDarkMode}
                className="rounded-full p-2 hover:bg-accent transition-colors duration-300 mr-4"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Botão de menu mobile */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden rounded-md p-2 hover:bg-accent transition-colors duration-300"
              >
                <div className="w-6 h-0.5 bg-foreground mb-1.5 transition-all duration-300 transform"></div>
                <div className="w-6 h-0.5 bg-foreground mb-1.5 transition-all duration-300 transform"></div>
                <div className="w-6 h-0.5 bg-foreground transition-all duration-300 transform"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Menu mobile */}
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${isMenuOpen ? "max-h-96 border-b" : "max-h-0"}`}
        >
          <div className="container mx-auto px-4 py-4 space-y-4">
            <button
              onClick={() => scrollToSection("home")}
              className={`block w-full text-left px-4 py-2 rounded-md transition-colors duration-300 ${activeSection === "home" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
            >
              Início
            </button>
            <button
              onClick={() => scrollToSection("services")}
              className={`block w-full text-left px-4 py-2 rounded-md transition-colors duration-300 ${activeSection === "services" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
            >
              Serviços
            </button>
            <button
              onClick={() => scrollToSection("gallery")}
              className={`block w-full text-left px-4 py-2 rounded-md transition-colors duration-300 ${activeSection === "gallery" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
            >
              Galeria
            </button>
            <button
              onClick={() => scrollToSection("team")}
              className={`block w-full text-left px-4 py-2 rounded-md transition-colors duration-300 ${activeSection === "team" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
            >
              Equipe
            </button>
            <button
              onClick={() => scrollToSection("testimonials")}
              className={`block w-full text-left px-4 py-2 rounded-md transition-colors duration-300 ${activeSection === "testimonials" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
            >
              Depoimentos
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className={`block w-full text-left px-4 py-2 rounded-md transition-colors duration-300 ${activeSection === "contact" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
            >
              Contato
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="pt-20 min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/20 to-background"
      >
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fadeIn">Salão de Beleza</h1>
          <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto text-muted-foreground animate-fadeIn animation-delay-200">
            Transformando sua beleza com profissionalismo e qualidade
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeIn animation-delay-400">
            <button
              onClick={() => scrollToSection("services")}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
            >
              Nossos Serviços
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="px-8 py-3 bg-card text-foreground border border-border rounded-md font-medium hover:bg-accent transition-all duration-300 transform hover:scale-105"
            >
              Agendar Horário
            </button>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section id="services" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nossos Serviços</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Oferecemos uma variedade de serviços de beleza para atender todas as suas necessidades
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-card border border-border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <img
                  src={service.image || "/placeholder.svg"}
                  alt={service.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                  <p className="text-primary font-bold mb-3">{service.price}</p>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  <button
                    onClick={() => scrollToSection("contact")}
                    className="w-full py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-all duration-300"
                  >
                    Agendar Agora
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Galeria */}
      <section id="gallery" className="py-20 bg-accent/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nossa Galeria</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Confira alguns dos nossos trabalhos realizados</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="relative overflow-hidden rounded-lg aspect-square cursor-pointer group">
                  <img
                    src={`/placeholder.svg?height=300&width=300&text=Trabalho ${i + 1}`}
                    alt={`Trabalho ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white font-medium">Ver detalhes</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Equipe */}
      <section id="team" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nossa Equipe</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Conheça os profissionais que farão você se sentir especial
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <div
                key={member.id}
                className="bg-card border border-border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-center"
              >
                <img src={member.image || "/placeholder.svg"} alt={member.name} className="w-full h-64 object-cover" />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-primary mb-4">{member.role}</p>
                  <div className="flex justify-center space-x-3">
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300">
                      <Instagram className="h-5 w-5" />
                    </a>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300">
                      <Facebook className="h-5 w-5" />
                    </a>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300">
                      <Twitter className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section id="testimonials" className="py-20 bg-accent/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Depoimentos</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Veja o que nossos clientes dizem sobre nós</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-card border border-border rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className="mr-4 text-2xl">❝</div>
                  <div>
                    <p className="mb-2 italic">{testimonial.text}</p>
                    <div className="flex items-center">
                      <div className="mr-2">{renderStars(testimonial.rating)}</div>
                      <span className="text-sm text-muted-foreground">({testimonial.rating}/5)</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-border pt-4">
                  <p className="font-medium">{testimonial.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contact" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Entre em Contato</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Estamos prontos para atender você e responder suas dúvidas
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-6">Informações de Contato</h3>

              <div className="space-y-6">
                <div className="flex items-start">
                  <Phone className="h-6 w-6 mr-4 text-primary" />
                  <div>
                    <h4 className="font-medium mb-1">Telefone</h4>
                    <p className="text-muted-foreground">(11) 99999-9999</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail className="h-6 w-6 mr-4 text-primary" />
                  <div>
                    <h4 className="font-medium mb-1">Email</h4>
                    <p className="text-muted-foreground">contato@salaodebeleza.com</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="h-6 w-6 mr-4 text-primary" />
                  <div>
                    <h4 className="font-medium mb-1">Endereço</h4>
                    <p className="text-muted-foreground">Av. Paulista, 1000 - São Paulo, SP</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="h-6 w-6 mr-4 text-primary" />
                  <div>
                    <h4 className="font-medium mb-1">Horário de Funcionamento</h4>
                    <p className="text-muted-foreground">Segunda a Sábado: 9h às 20h</p>
                    <p className="text-muted-foreground">Domingo: Fechado</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="font-medium mb-4">Redes Sociais</h4>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="bg-card border border-border rounded-full p-3 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a
                    href="#"
                    className="bg-card border border-border rounded-full p-3 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a
                    href="#"
                    className="bg-card border border-border rounded-full p-3 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-6">Envie uma Mensagem</h3>

              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome</label>
                    <input
                      type="text"
                      className="w-full rounded-md border bg-background px-3 py-2 transition-all duration-300 focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full rounded-md border bg-background px-3 py-2 transition-all duration-300 focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Assunto</label>
                  <input
                    type="text"
                    className="w-full rounded-md border bg-background px-3 py-2 transition-all duration-300 focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Mensagem</label>
                  <textarea
                    rows="5"
                    className="w-full rounded-md border bg-background px-3 py-2 transition-all duration-300 focus:ring-2 focus:ring-primary"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
                >
                  Enviar Mensagem
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Salão de Beleza</h3>
              <p className="text-muted-foreground mb-4">
                Transformando sua beleza com profissionalismo e qualidade desde 2010.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Links Rápidos</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => scrollToSection("home")}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300"
                  >
                    Início
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("services")}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300"
                  >
                    Serviços
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("gallery")}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300"
                  >
                    Galeria
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("team")}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300"
                  >
                    Equipe
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Serviços</h4>
              <ul className="space-y-2">
                <li>
                  <span className="text-muted-foreground">Corte de Cabelo</span>
                </li>
                <li>
                  <span className="text-muted-foreground">Coloração</span>
                </li>
                <li>
                  <span className="text-muted-foreground">Tratamento Capilar</span>
                </li>
                <li>
                  <span className="text-muted-foreground">Manicure e Pedicure</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-muted-foreground">(11) 99999-9999</span>
                </li>
                <li className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-muted-foreground">contato@salaodebeleza.com</span>
                </li>
                <li className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-muted-foreground">Av. Paulista, 1000 - São Paulo, SP</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-muted-foreground">
              &copy; {new Date().getFullYear()} Salão de Beleza. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default SiteHome

