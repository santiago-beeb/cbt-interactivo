import { useState, useRef } from "react";
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
   DATOS (PELIGROS)
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
  const [completed, setCompleted] = useState(false);

  const successAudio = useRef(new Audio(successSound));
  const errorAudio = useRef(new Audio(errorSound));

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (completed) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    const dangerFound = dangers.find(
      (danger) => distance(clickX, clickY, danger.x, danger.y) <= danger.radius
    );

    if (dangerFound) {
      if (found.includes(dangerFound.id)) {
        setFeedback(
          "⚠️ Este riesgo ya fue identificado. Continúa observando el área."
        );
        return;
      }

      successAudio.current.currentTime = 0;
      successAudio.current.play();

      const updatedFound = [...found, dangerFound.id];
      setFound(updatedFound);

      setFeedback(`✅ ${dangerFound.message}\n\n${dangerFound.explanation}`);

      if (updatedFound.length === dangers.length) {
        setCompleted(true);
      }
    } else {
      errorAudio.current.currentTime = 0;
      errorAudio.current.play();

      setFeedback(
        "❌ Este punto no representa un riesgo en este escenario. Continúa observando el área."
      );
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  return (
    <div>
      {/* ENUNCIADO */}
      <div>
        <strong>🛡️ Identificación de Riesgos en el Área de Trabajo</strong>
        <p style={{ marginTop: "6px" }}>
          Observa la imagen y marca los lugares que representen un riesgo para
          la seguridad.
        </p>
      </div>

      {/* ESCENARIO */}
      <div
        onClick={handleClick}
        className={shake ? "shake" : ""}
        style={{
          position: "relative",
          width: "800px",
          cursor: completed ? "default" : "crosshair",
          userSelect: "none",
        }}
      >
        <img
          src={fabrica}
          alt="Fábrica"
          style={{ width: "100%", display: "block" }}
        />

        {/* MARCADORES */}
        {dangers.map(
          (danger) =>
            found.includes(danger.id) && (
              <div
                key={danger.id}
                className="pulse"
                style={{
                  position: "absolute",
                  left: `${danger.x}%`,
                  top: `${danger.y}%`,
                  width: `${danger.radius * 2}%`,
                  height: `${danger.radius * 2}%`,
                  border: "3px solid lime",
                  borderRadius: "50%",
                  transform: "translate(-50%, -50%)",
                  pointerEvents: "none",
                }}
              />
            )
        )}

        {/* CONTADOR */}
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "#000",
            color: "white",
            padding: "6px 10px",
            borderRadius: "6px",
          }}
        >
          {found.length} / {dangers.length}
        </div>
      </div>

      {/* FEEDBACK */}
      <div
        style={{
          marginTop: "12px",
          padding: "12px",
          background: "#222",
          color: "white",
          borderRadius: "8px",
          whiteSpace: "pre-line",
        }}
      >
        {feedback}

        {completed && (
          <div style={{ marginTop: "12px", textAlign: "right" }}>
            <button
              onClick={() =>
                setFeedback(
                  "🎉 Actividad completada\n\n" +
                    "Has identificado correctamente todos los riesgos presentes en el área.\n\n" +
                    "• Derrames de líquidos: pueden causar resbalones.\n" +
                    "• Pisos sucios o desordenados: aumentan el riesgo de caídas.\n" +
                    "• Máquinas averiadas: pueden provocar accidentes graves.\n\n" +
                    "Reconocer los peligros es el primer paso para prevenir accidentes y proteger tu vida y la de tus compañeros."
                )
              }
              style={{
                padding: "8px 14px",
                background: "#4caf50",
                border: "none",
                borderRadius: "6px",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Continuar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
