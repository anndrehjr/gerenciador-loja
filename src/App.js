'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from './components/Card';
import { Button } from './components/Button';
import { Github, ExternalLink, ChevronDown, Sun, Moon, Linkedin, Mail, User, Briefcase, FolderOpen } from 'lucide-react';
import { SiAsterisk, SiNextdotjs, SiNodedotjs, SiPhp, SiHtml5, SiCss3, SiMysql, SiLinux, SiGithub } from 'react-icons/si';

const projects = [
  {
    id: 1,
    title: "E-Commerce ",
    description: "Bem-vindo ao Mugs & More, um site de loja online para produtos personalizados, como canecas, cadernos e muito mais! 🌟 O objetivo é oferecer uma experiência única aos nossos clientes com designs exclusivos e uma navegação simples e intuitiva.",
    imageUrl: "/1.png",
    projectUrl: "https://www.personalizado-aguiar.shop",
    githubUrl: "https://github.com/anndrehjr/E-Commerce",
  },
  {
    id: 2,
    title: "Jogo da Memoria Anime",
    description: "Um jogo divertido e interativo de Memória projetado para desafiar suas habilidades de memorização. Vire as cartas para encontrar pares correspondentes e complete o jogo o mais rápido possível!",
    imageUrl: "/2.png",
    projectUrl: "https://anime-memoria.netlify.app",
    githubUrl: "https://github.com/anndrehjr/Jogo-da-memoria",
  },
  {
    id: 3,
    title: "Ferramentas Uteis",
    description: "Uma coleção super legal de ferramentas de conversão para facilitar sua vida! 🎯",
    imageUrl: "/3.png",
    projectUrl: "https://ferramentas-jr.vercel.app",
    githubUrl: "https://github.com/anndrehjr/ferramantas-jr",
  },
   {
    id:4,
    title:" Site De Serviços" ,
    description:"Um site de serviços para empresas e profissionais autônomos. 🚀",
    imageUrl: "/4.png",
    projectUrl:"https://servico-aguiar.vercel.app",
    githubUrl:"https://github.com/anndrehjr/servico-aguiar",
   },
   {
    id:5,
    title:"E-Commerce-Fazendas",
    description:"Site para demonstrar propriedades rurais, como sítios e fazendas. 🌟",
    imageUrl:"/5.png",
    projectUrl:"https://e-commerc-fazendas.vercel.app",
    githubUrl:"https://github.com/anndrehjr/e-commerce_fazendas",
  }

];


const timelineData = [
  {
    title: "Desenvolvedor Front-End",
    company: "Freelance",
    period: "2024 - Presente",
    description: "Como desenvolvedor front-end, sou responsável por criar interfaces de usuário dinâmicas e responsivas, utilizando HTML, CSS e JavaScript para garantir uma experiência fluida e intuitiva."
  },
  {
    title: "Suporte VOIP",
    company: "Phonevox Group",
    period: "2024 - Presente",
    description: "Atendimento especializado em VOIP (telefonia IP) e suporte a servidores em nuvem e locais. Criação de fluxos automatizados que melhoraram a eficiência no atendimento."
  },
  {
    title: "Web Designer",
    company: "Freelance",
    period: "2019 - Presente",
    description: "Como web designer, crio layouts atraentes e funcionais, sempre focando na melhor experiência do usuário e garantindo uma identidade visual única para cada projeto"
  },
  {
    title: "Instrutor de Informática",
    company: "Prepara Cursos",
    period: "2017 - 2019",
    description: "Desenvolvi e implementei planos de aula, auxiliei os alunos noaprendizado de pacotes de software, linguagens de programaçãoe outras habilidades técnicas, além de fornecer suporteindividualizado conforme necessário"
  },
  {
    title: "Tecnico Em Informatica",
    company: "Assim Provedor de Internet / Freelance",
    period: "2014 - 2017",
    description: "Como técnico em informática, sou responsável por solucionar problemas técnicos e fornecer suporte em hardware e software, garantindo o bom funcionamento dos sistemas."
  },
];

const navItems = [
  { id: 'sobre', icon: User, label: 'Sobre' },
  { id: 'experiencias', icon: Briefcase, label: 'Experiências' },
  { id: 'projetos', icon: FolderOpen, label: 'Projetos' },
  { id: 'contato', icon: Mail, label: 'Contato' },
];

export default function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });
  const [activeSection, setActiveSection] = useState('sobre');
  const [githubData, setGithubData] = useState(null);
  const sectionRefs = {
    sobre: useRef(null),
    experiencias: useRef(null),
    projetos: useRef(null),
    contato: useRef(null)
  };

  useEffect(() => {
    // Scroll to top when the component mounts (page is loaded/refreshed)
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark');
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  useEffect(() => {
    const fetchGithubData = async () => {
      try {
        const response = await fetch('https://api.github.com/users/anndrehjr');
        const data = await response.json();
        setGithubData(data);
      } catch (error) {
        console.error('Error fetching GitHub data:', error);
      }
    };
    fetchGithubData();
  }, []);

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    sectionRefs[sectionId].current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  const renderLanding = () => (
    <div className="min-h-screen relative overflow-hidden">
      <div className={`absolute inset-0 transition-opacity duration-1000 ${theme === 'light' ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px] opacity-20"></div>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/30"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: Math.random() * 2 + 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <div className={`absolute inset-0 transition-opacity duration-1000 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255, 255, 255, 0.1)_1px,transparent_1px)] bg-[length:20px_20px] opacity-10"></div>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <div className="relative z-10 h-screen flex flex-col items-center justify-center text-white">
        <motion.h1
          className="text-6xl md:text-8xl font-bold mb-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          ANDRE JUNIOR
        </motion.h1>
        <motion.h2
          className="text-2xl md:text-3xl text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Front-End Developer
        </motion.h2>
        <motion.button
          className="absolute bottom-10 group"
          onClick={() => scrollToSection('sobre')}
          whileHover={{ y: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <ChevronDown size={40} className="text-white/80 group-hover:text-white transition-colors" />
        </motion.button>
      </div>
    </div>
  );

  const renderHeader = () => (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <motion.h1
          className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600 dark:from-blue-400 dark:to-purple-400"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          Meu Portefólio
        </motion.h1>
        <motion.div
          className="flex items-center space-x-6"
          variants={staggerChildren}
          initial="initial"
          animate="animate"
        >
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              className={`capitalize text-sm font-medium transition-colors flex items-center ${
                activeSection === item.id 
                  ? 'text-indigo-600 dark:text-blue-400' 
                  : 'text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-blue-400'
              }`}
              onClick={() => scrollToSection(item.id)}
              variants={fadeInUp}
            >
              <item.icon className="w-5 h-5 lg:mr-2" />
              <span className="hidden lg:inline">{item.label}</span>
            </motion.button>
          ))}
          <motion.button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            variants={fadeInUp}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === 'dark' ? (
                <motion.div
                  key="moon"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon className="w-5 h-5 text-yellow-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="sun"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun className="w-5 h-5 text-yellow-500" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
      </nav>
    </header>
  );

  const renderAboutSection = () => (
    <motion.section
      ref={sectionRefs.sobre}
      id="sobre"
      className="min-h-screen flex flex-col justify-center bg-white dark:bg-gray-900 py-20"
      initial="initial"
      animate="animate"
      variants={staggerChildren}
    >
      <div className="container mx-auto px-6">
        <motion.div variants={fadeInUp} className="text-center mb-8">
          <h2 className="text-4xl font-bold text-indigo-600 dark:text-blue-400">Sobre</h2>
          <p className="text-gray-600 dark:text-gray-400">Vivendo Um Sonho</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div variants={fadeInUp} className="relative">
            <img
              src="/menino.png"
              alt="Developer Illustration"
              className="w-full max-w-md mx-auto rounded-lg shadow-lg"
            />
            <div className="absolute inset-0 bg-indigo-500/20 blur-3xl -z-10"></div>
          </motion.div>

          <motion.div variants={fadeInUp} className="space-y-6">
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Sou um <span className="text-indigo-600 dark:text-blue-400 font-semibold">Front-End Developer</span> com
              experiência de soluções usando Asterisk, Next.js, Node.js, PHP e MySQL.
              🌟 Design e Efeitos Visuais Eficientes 🌟
            </p>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-indigo-600 dark:text-blue-400">Conhecimento e Tecnologias</h3>
              <p className="text-gray-600 dark:text-gray-400">🌐 Minha Stack de Desenvolvimento 📚💻</p>

              <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
                {[
                  { icon: SiAsterisk, name: 'Asterisk' },
                  { icon: SiNextdotjs, name: 'Next.js' },
                  { icon: SiNodedotjs, name: 'Node.js' },
                  { icon: SiPhp, name: 'PHP' },
                  { icon: SiHtml5, name: 'HTML' },
                  { icon: SiCss3, name: 'CSS' },
                  { icon: SiMysql, name: 'MySQL' },
                  { icon: SiLinux, name: 'Linux' },
                  { icon: SiGithub, name: 'GitHub' },
                ].map((tech) => (
                  <motion.div
                    key={tech.name}
                    className="flex flex-col items-center justify-center p-4 bg-indigo-100 dark:bg-indigo-900 rounded-lg text-indigo-700 dark:text-indigo-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <tech.icon className="w-8 h-8 mb-2" />
                    <span className="text-sm text-center">{tech.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );

  const renderExperiencesSection = () => (
    <motion.section
      ref={sectionRefs.experiencias}
      id="experiencias"
      className="min-h-screen flex flex-col justify-center bg-gray-100 dark:bg-gray-800 py-20"
      initial="initial"
      animate="animate"
      variants={staggerChildren}
    >
      <div className="container mx-auto px-6">
        <motion.h2 className="text-4xl font-bold mb-6 text-indigo-600 dark:text-blue-400 text-center" variants={fadeInUp}>Experiências</motion.h2>
        <div className="relative border-l-2 border-indigo-500 dark:border-blue-700 ml-3">
          {timelineData.map((item, index) => (
            <motion.div key={index} className="mb-8 ml-8" variants={fadeInUp}>
              <span className="absolute flex items-center justify-center w-6 h-6 bg-indigo-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-900 dark:bg-indigo-900">
                <svg className="w-2.5 h-2.5 text-indigo-800 dark:text-indigo-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                </svg>
              </span>
              <Card className={`transition-all ${index === 0 ? "border-indigo-500" : ''}`}>
                <CardContent className="p-5">
                  <h3 className="flex items-center mb-1 text-lg font-semibold text-indigo-600 dark:text-blue-400">{item.title}</h3>
                  <h4 className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">{item.company}</h4>
                  <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">{item.period}</time>
                  <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">{item.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );

  const renderProjectsSection = () => (
    <motion.section
      ref={sectionRefs.projetos}
      id="projetos"
      className="min-h-screen flex flex-col justify-center bg-white dark:bg-gray-900 py-20"
      initial="initial"
      animate="animate"
      variants={staggerChildren}
    >
      <div className="container mx-auto px-6">
        <motion.h2 className="text-4xl font-bold mb-6 text-indigo-600 dark:text-blue-400 text-center" variants={fadeInUp}>Meus Projetos</motion.h2>
        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-8" variants={staggerChildren}>
          {projects.map((project) => (
            <motion.div key={project.id} variants={fadeInUp} whileHover={{ y: -5 }}>
              <Card className="h-full flex flex-col">
                <div className="relative h-48 w-full">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <CardContent className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-indigo-600 dark:text-blue-400">{project.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{project.description}</p>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button className="bg-indigo-500 text-white hover:bg-indigo-600 flex-grow">
                      <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visitar
                      </a>
                    </Button>
                    {project.githubUrl !== "anonymous" && (
                      <Button className="bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 flex-grow">
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                          <Github className="w-4 h-4 mr-2" />
                          GitHub
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
  const renderContactSection = () => (
    <motion.section
      ref={sectionRefs.contato}
      id="contato"
      className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900 py-20"
      initial="initial"
      animate="animate"
      variants={staggerChildren}
    >
      <div className="container mx-auto px-6 text-center">
        <motion.h2 className="text-4xl font-bold mb-6 text-white" variants={fadeInUp}>Contato</motion.h2>
        <motion.p className="text-xl mb-8 text-white" variants={fadeInUp}>
          Vamos trabalhar juntos? Entre em contato comigo!
        </motion.p>
        <motion.div className="flex justify-center space-x-4" variants={fadeInUp}>
          {githubData && (
            <Button className="bg-white text-indigo-600 hover:bg-indigo-50 transition-colors duration-300">
              <a href={githubData.html_url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                <Github className="h-5 w-5 mr-2" />
                GitHub
              </a>
            </Button>
          )}
          <Button className="bg-white text-indigo-600 hover:bg-indigo-50 transition-colors duration-300">
            <a href="https://www.linkedin.com/in/anndreh-aguiar/" target="_blank" rel="noopener noreferrer" className="flex items-center">
              <Linkedin className="h-5 w-5 mr-2" />
              LinkedIn
            </a>
          </Button>
          <Button className="bg-white text-indigo-600 hover:bg-indigo-50 transition-colors duration-300">
            <a href="mailto:anndreh01@gmail.com" className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Email
            </a>
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white transition-colors duration-300">
      {renderLanding()}
      {renderHeader()}
      <main>
        {renderAboutSection()}
        {renderExperiencesSection()}
        {renderProjectsSection()}
        {renderContactSection()}
      </main>
    </div>
  );
}