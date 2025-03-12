import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './src/components/Card';
import { Button } from './src/components/Button';
import { Github, ExternalLink, ChevronDown } from 'lucide-react';

const projects = [
  {
    id: 1,
    title: "E-Commerce ",
    description: "Bem-vindo ao Mugs & More, um site de loja online para produtos personalizados, como canecas, cadernos e muito mais! 🌟 O objetivo é oferecer uma experiência única aos nossos clientes com designs exclusivos e uma navegação simples e intuitiva.",
    imageUrl: "/1.png",
    projectUrl: "https://personalizadosaguiar.netlify.app",
    githubUrl: "https://github.com/anndrehjr/project-loja-mm",
  },
  {
    id: 2,
    title: "Jogo da Memoria Anime",
    description: "Um jogo divertido e interativo de Memória projetado para desafiar suas habilidades de memorização. Vire as cartas para encontrar pares correspondentes e complete o jogo o mais rápido possível!",
    imageUrl: "/2.png",
    projectUrl: "https://anime-memoria.netlify.app",
    githubUrl: "https://github.com/anndrehjr/Jogo-da-memoria",
  },
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
    title: "Tecnico Em Informatica",
    company: "Assim Provedor de Internet / Freelance",
    period: "2014 - 2019",
    description: "Como técnico em informática, sou responsável por solucionar problemas técnicos e fornecer suporte em hardware e software, garantindo o bom funcionamento dos sistemas."
  },
];

export default function App() {
  const [theme, setTheme] = useState('light');
  const [activeSection, setActiveSection] = useState('sobre');
  const [githubData, setGithubData] = useState(null);
  const sectionRefs = {
    sobre: useRef(null),
    experiencias: useRef(null),
    projetos: useRef(null),
    contato: useRef(null)
  };

  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark');
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

  // Landing Page Section
  const renderLanding = () => (
    <div className="min-h-screen relative bg-gradient-to-br from-red-700 via-red-600 to-red-500 dark:from-red-900 dark:via-blue-900 dark:to-blue-800">
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <motion.h1
          className="text-6xl md:text-8xl font-bold mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          ANDRE JUNIOR
        </motion.h1>
        <motion.h2
          className="text-2xl md:text-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Front-End Developer
        </motion.h2>
        <motion.button
          className="absolute bottom-10 animate-bounce"
          onClick={() => scrollToSection('sobre')}
        >
          <ChevronDown size={40} />
        </motion.button>
      </div>
    </div>
  );

  const renderHeader = () => (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 bg-opacity-80 backdrop-blur-sm">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <motion.h1
          className="text-2xl font-bold text-red-600 dark:text-red-400"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          Meu Portfólio
        </motion.h1>
        <motion.div
          className="flex space-x-4"
          variants={staggerChildren}
          initial="initial"
          animate="animate"
        >
          {['sobre', 'experiencias', 'projetos', 'contato'].map((section) => (
            <motion.button
              key={section}
              className={`capitalize ${activeSection === section ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}`}
              onClick={() => scrollToSection(section)}
              variants={fadeInUp}
            >
              {section}
            </motion.button>
          ))}
          <motion.button
            onClick={toggleTheme}
            variants={fadeInUp}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
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
          <h2 className="text-4xl font-bold text-red-600 dark:text-red-400">Sobre</h2>
          <p className="text-gray-600 dark:text-gray-400">Vivendo Um</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div variants={fadeInUp} className="relative">
            <img
              src="/menino.png?height=400&width=250"
              alt="Developer Illustration"
              className="w-full max-w-md mx-auto"
            />
            <div className="absolute inset-0 bg-red-500/20 blur-3xl -z-10"></div>
          </motion.div>

          <motion.div variants={fadeInUp} className="space-y-6">
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Sou um <span className="text-red-600 dark:text-red-400 font-semibold">Front-End Developer</span> com
              experiência de soluções usando Asterisk, Next.js, Node.js, PHP e MySQL.
              🌟 Design e Efeitos Visuais Eficientes 🌟
            </p>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">Conhecimento e Tecnologias</h3>
              <p className="text-gray-600 dark:text-gray-400">🌐 Minha Stack de Desenvolvimento 📚💻</p>

              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {['Asterisk', 'Next.js', 'Node.js', 'PHP', 'HTML', 'CSS', 'MySQL', 'Linux', 'GitHub'].map((tech) => (
                  <div
                    key={tech}
                    className="px-4 py-2 bg-red-100 dark:bg-red-900 rounded-full text-sm text-red-700 dark:text-red-300 text-center"
                  >
                    {tech}
                  </div>
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
        <motion.h2 className="text-4xl font-bold mb-6 text-red-600 dark:text-red-400 text-center" variants={fadeInUp}>Experiências</motion.h2>
        <div className="relative border-l-2 border-red-500 dark:border-red-700 ml-3">
          {timelineData.map((item, index) => (
            <motion.div key={index} className="mb-8 ml-8" variants={fadeInUp}>
              <span className="absolute flex items-center justify-center w-6 h-6 bg-red-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-900 dark:bg-red-900">
                <svg className="w-2.5 h-2.5 text-red-800 dark:text-red-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                </svg>
              </span>
              <Card className={`transition-all ${index === 0 ? "border-red-500" : ''}`}>
                <CardContent className="p-5">
                  <h3 className="flex items-center mb-1 text-lg font-semibold text-red-600 dark:text-red-400">{item.title}</h3>
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
        <motion.h2 className="text-4xl font-bold mb-6 text-red-600 dark:text-red-400 text-center" variants={fadeInUp}>Meus Projetos</motion.h2>
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
                    <h3 className="text-xl font-semibold mb-2 text-red-600 dark:text-red-400">{project.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{project.description}</p>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button className="bg-red-500 text-white hover:bg-red-600 flex-grow">
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
      className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-red-700 via-red-600 to-red-500 dark:from-red-900 dark:via-blue-900 dark:to-blue-800 py-20"
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
            <Button className="bg-white text-red-600 hover:bg-red-100">
              <a href={githubData.html_url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </a>
            </Button>
          )}
          <Button className="bg-white text-red-600 hover:bg-red-100">
            <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            LinkedIn
          </Button>
          <Button className="bg-white text-red-600 hover:bg-red-100">
            <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 3v18h24V3H0zm21.518 2L12 12.713 2.482 5h19.036zM2 19V7.183l10 8.104 10-8.104V19H2z" />
            </svg>
            Email
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