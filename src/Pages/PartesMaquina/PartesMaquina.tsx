import React, { useRef, useState } from "react";
import "./PartesMaquina.css";

import maquina from "../../assets/maquina.png";
import motor from "../../assets/motor.png";
import engranaje from "../../assets/engranaje.png";
import correa from "../../assets/correa.png";

import successSound from "../../assets/sounds/success.mp3";
import errorSound from "../../assets/sounds/error.mp3";

type ParteID = "motor" | "engranaje" | "correa";

interface Parte {
  id: ParteID;
  img: string;
}

interface Zona {
  id: ParteID;
  x: number;
  y: number;
}

const PARTES: Parte[] = [
  { id: "motor", img: motor },
  { id: "engranaje", img: engranaje },
  { id: "correa", img: correa },
];

const ZONAS: Zona[] = [
  { id: "motor", x: 78, y: 57 },
  { id: "engranaje", x: 75, y: 26 },
  { id: "correa", x: 28, y: 40 },
];

export default function PartesMaquina(): React.ReactElement {
  const maquinaRef = useRef<HTMLDivElement>(null);

  const [colocadas, setColocadas] = useState<
    Partial<Record<ParteID, { img: string; x: number; y: number }>>
  >({});
  const [hoverZona, setHoverZona] = useState<ParteID | null>(null);
  const [feedback, setFeedback] = useState(
    "Arrastra cada parte y colócala en su posición correcta."
  );

  const successAudio = useRef(new Audio(successSound));
  const errorAudio = useRef(new Audio(errorSound));

  /* ------------------ DRAG OVER GLOBAL ------------------ */
  const handleDragOverMaquina = (e: React.DragEvent) => {
    e.preventDefault();
    if (!maquinaRef.current) return;

    const rect = maquinaRef.current.getBoundingClientRect();

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const mouseXPerc = (mouseX / rect.width) * 100;
    const mouseYPerc = (mouseY / rect.height) * 100;

    let zonaDetectada: ParteID | null = null;

    ZONAS.forEach((zona) => {
      if (colocadas[zona.id]) return;

      const dx = mouseXPerc - zona.x;
      const dy = mouseYPerc - zona.y;
      const distancia = Math.sqrt(dx * dx + dy * dy);

      if (distancia < 8) {
        zonaDetectada = zona.id;
      }
    });

    setHoverZona(zonaDetectada);
  };

  /* ------------------ DROP ------------------ */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    if (!hoverZona) return;

    const parteId = e.dataTransfer.getData("parteId") as ParteID;
    const zona = ZONAS.find((z) => z.id === hoverZona);
    if (!zona) return;

    if (parteId !== zona.id || colocadas[parteId]) {
      errorAudio.current.currentTime = 0;
      errorAudio.current.play();
      setFeedback("❌ Esta pieza no corresponde a esa zona.");
      setHoverZona(null);
      return;
    }

    const parte = PARTES.find((p) => p.id === parteId);
    if (!parte) return;

    setColocadas((prev) => ({
      ...prev,
      [parteId]: {
        img: parte.img,
        x: zona.x,
        y: zona.y,
      },
    }));

    successAudio.current.currentTime = 0;
    successAudio.current.play();
    setFeedback(`✅ ${parteId} colocada correctamente`);
    setHoverZona(null);
  };

  const actividadCompleta = ZONAS.every((z) => colocadas[z.id]);

  return (
    <div className="pm-container">
      <h2>🛠️ Armado seguro de la máquina</h2>
      <p className="pm-instruccion">{feedback}</p>

      <div className="pm-zona-trabajo">
        <div
          className="pm-maquina"
          ref={maquinaRef}
          onDragOver={handleDragOverMaquina}
          onDrop={handleDrop}
          onDragLeave={() => setHoverZona(null)}
        >
          <img src={maquina} alt="Máquina industrial" />

          {ZONAS.map((zona) => (
            <div
              key={zona.id}
              className={`pm-zona ${
                hoverZona === zona.id ? "brillo" : ""
              } ${colocadas[zona.id] ? "colocada" : ""}`}
              style={{
                left: `${zona.x}%`,
                top: `${zona.y}%`,
              }}
            />
          ))}

          {Object.entries(colocadas).map(([id, data]) =>
            data ? (
              <img
                key={id}
                src={data.img}
                alt={id}
                className="pm-parte-colocada"
                style={{
                  left: `${data.x}%`,
                  top: `${data.y}%`,
                }}
              />
            ) : null
          )}
        </div>

        <div className="pm-partes">
          <strong>Partes disponibles</strong>
          {PARTES.map(
            (parte) =>
              !colocadas[parte.id] && (
                <img
                  key={parte.id}
                  src={parte.img}
                  alt={parte.id}
                  draggable
                  className="pm-parte"
                  onDragStart={(e) => {
                    e.dataTransfer.setData("parteId", parte.id);
                    e.dataTransfer.setDragImage(
                      e.currentTarget,
                      e.currentTarget.width / 2,
                      e.currentTarget.height / 2
                    );
                  }}
                />
              )
          )}
        </div>
      </div>

      {actividadCompleta && (
        <div className="pm-exito">
          🎉 <strong>Actividad completada</strong>
          <p>
            Has armado correctamente la máquina. Un correcto montaje es
            fundamental para una operación segura y eficiente.
          </p>
        </div>
      )}
    </div>
  );
}
