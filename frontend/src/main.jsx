import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { ProvedorTema } from "./contextos/ContextoTema.jsx";
import { ProvedorAutenticacao } from "./contextos/ContextoAutenticacao.jsx";
import { ProvedorNotificacoes } from "./contextos/ContextoNotificacoes.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ProvedorTema>
        <ProvedorAutenticacao>
          <ProvedorNotificacoes>
            <App />
          </ProvedorNotificacoes>
        </ProvedorAutenticacao>
      </ProvedorTema>
    </BrowserRouter>
  </React.StrictMode>
);
