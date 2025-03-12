import React from "react"
import ReactDOM from "react-dom/client"
import "./App.css"
import "./custom-styles.css" // Adicionar esta linha
import Site from "./site"

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <React.StrictMode>
    <Site />
  </React.StrictMode>,
)