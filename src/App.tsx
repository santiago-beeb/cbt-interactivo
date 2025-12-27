import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Escenario from "./components/Escenario";
import PartesMaquina from "./Pages/PartesMaquina/PartesMaquina";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Escenario />} />
        <Route path="/partes-maquina" element={<PartesMaquina />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
