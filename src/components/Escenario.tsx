import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Escenario.css";

import fabrica from "../assets/fabrica.png";
import successSound from "../assets/sounds/success.mp3";
import errorSound from "../assets/sounds/error.mp3";

/* =======================
   TIPOS
======================= */
type DangerZone = {
  id: string;
  x: number;
  y: number;
  radius: number;
  message: string;
  explanation: string;
};

/* =======================
   DATOS
======================= */
const dangers: DangerZone[] = [
  {
    id: "derrame",
    x: 65,
    y: 80,
    radius: 9,
    message: "Derrame de líquido identificado",
    explanation:
      "Los derrames de líquidos aumentan el riesgo de resbalones y caídas, lo que puede provocar lesiones graves.",
  },
  {
    id: "piso",
    x: 15,
    y: 85,
    radius: 9,
    message: "Piso sucio identificado",
    explanation:
      "Un piso sucio o desordenado dificulta la movilidad segura y aumenta el riesgo de accidentes.",
  },
  {
    id: "maquina",
    x: 77,
    y: 45,
    radius: 9,
    message: "Máquina averiada identificada",
    explanation:
      "Las máquinas en mal estado representan un riesgo mecánico que puede causar atrapamientos o quemaduras.",
  },
];

/* =======================
   UTILIDAD
======================= */
function distance(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

/* =======================
   COMPONENTE
======================= */
export default function Escenario() {
  const [feedback, setFeedback] = useState(
    "Observa con atención la imagen. Existen 3 situaciones de riesgo. Haz clic sobre los lugares que consideres peligrosos."
  );
  const [found, setFound] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const [mostrarFinal, setMostrarFinal] = useState(false);

  const navigate = useNavigate();

  const successAudio = useRef(new Audio(successSound));
  const errorAudio = useRef(new Audio(errorSound));

  const actividadCompleta = found.length === dangers.length;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mostrarFinal) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    const dangerFound = dangers.find(
      (danger) => distance(clickX, clickY, danger.x, danger.y) <= danger.radius
    );

    if (dangerFound) {
      if (found.includes(dangerFound.id)) {
        setFeedback("⚠️ Este riesgo ya fue identificado.");
        return;
      }

      successAudio.current.currentTime = 0;
      successAudio.current.play();

      setFound([...found, dangerFound.id]);
      setFeedback(`✅ ${dangerFound.message}\n\n${dangerFound.explanation}`);
    } else {
      errorAudio.current.currentTime = 0;
      errorAudio.current.play();

      setFeedback("❌ Este punto no representa un riesgo.");
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  return (
    <div className="escenario-container">
      {/* ENUNCIADO */}
      <div className="escenario-header">
        <strong>🛡️ Identificación de Riesgos</strong>
        <p>Observa la imagen y marca los lugares peligrosos.</p>
      </div>

      {/* ESCENARIO */}
      <div
        className={`escenario-imagen ${shake ? "shake" : ""}`}
        onClick={handleClick}
      >
        <img src={fabrica} alt="Fábrica" />

        {/* MARCADORES */}
        {dangers.map(
          (danger) =>
            found.includes(danger.id) && (
              <div
                key={danger.id}
                className="marcador pulse"
                style={{
                  left: `${danger.x}%`,
                  top: `${danger.y}%`,
                  width: `${danger.radius * 2}%`,
                  height: `${danger.radius * 2}%`,
                }}
              />
            )
        )}

        {/* CONTADOR */}
        <div className="contador">
          {found.length} / {dangers.length}
        </div>
      </div>

      {/* FEEDBACK */}
      <div className="feedback">
        {feedback}

        {actividadCompleta && !mostrarFinal && (
          <div className="acciones">
            <button onClick={() => setMostrarFinal(true)}>Continuar</button>
          </div>
        )}
      </div>

      {/* FINAL */}
      {mostrarFinal && (
        <>
          <div className="final">
            🎉 <strong>Actividad completada</strong>
            {"\n\n"}Has identificado correctamente todos los riesgos.
          </div>

          <button
            className="btn-siguiente"
            onClick={() => {
              localStorage.setItem("modulo_riesgos", "completado");
              navigate("/partes-maquina");
            }}
          >
            ▶ Ir a la siguiente actividad
          </button>
        </>
      )}
    </div>
  );
}
