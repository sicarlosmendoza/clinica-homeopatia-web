"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { actualizarFotoPaciente } from "@/app/actions/pacientes.actions";

interface CapturaFotoProps {
  pacienteId: string;
  fotoActual?: string | null;
  inicialNombre: string;
}

export default function CapturaFotoModal({
  pacienteId,
  fotoActual,
  inicialNombre,
}: CapturaFotoProps) {
  const [abierto, setAbierto] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [fotoTomada, setFotoTomada] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorCamara, setErrorCamara] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Iniciar la cámara al abrir el modal
  useEffect(() => {
    if (abierto && !fotoTomada) {
      iniciarCamara();
    } else {
      detenerCamara();
    }
    return () => detenerCamara();
  }, [abierto, fotoTomada]);

  async function iniciarCamara() {
    setErrorCamara(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 480, facingMode: "user" },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error(err);
      setErrorCamara("No se pudo acceder a la webcam. Verifica los permisos del navegador.");
    }
  }

  function detenerCamara() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }

  function tomarFoto() {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = 400;
    canvas.height = 400;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Dibujar imagen centrada en formato cuadrado
      ctx.drawImage(video, 0, 0, 400, 400);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setFotoTomada(dataUrl);
      detenerCamara();
    }
  }

  async function handleGuardar() {
    if (!fotoTomada) return;
    setGuardando(true);
    const res = await actualizarFotoPaciente(pacienteId, fotoTomada);
    setGuardando(false);
    if (res.success) {
      setAbierto(false);
      setFotoTomada(null);
    }
  }

  function cerrarModal() {
    detenerCamara();
    setFotoTomada(null);
    setAbierto(false);
  }

  return (
    <>
      {/* AVATAR CON BOTÓN DE CÁMARA */}
      <div className="relative group cursor-pointer" onClick={() => setAbierto(true)}>
        {fotoActual ? (
          <img
            src={fotoActual}
            alt="Foto del paciente"
            className="h-20 w-20 rounded-2xl object-cover shadow-md shadow-purple-200 border-2 border-purple-200"
          />
        ) : (
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-3xl font-extrabold shadow-md shadow-purple-200">
            {inicialNombre}
          </div>
        )}
        
        {/* Indicador visual al pasar el cursor */}
        <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-white text-xs font-semibold text-center px-1">📷 Cambiar</span>
        </div>
      </div>

      {/* MODAL FLOTANTE */}
      {abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-purple-100">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-800 text-lg">Fotografía del Paciente</h3>
              <button onClick={cerrarModal} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            {/* VISOR DE CÁMARA / VISTA PREVIA */}
            <div className="relative aspect-square w-full bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center">
              {errorCamara ? (
                <p className="text-rose-400 text-xs text-center px-4">{errorCamara}</p>
              ) : fotoTomada ? (
                <img src={fotoTomada} alt="Captura" className="w-full h-full object-cover" />
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror"
                  style={{ transform: "scaleX(-1)" }}
                />
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="flex justify-between items-center gap-3 pt-2">
              <Button variant="outline" onClick={cerrarModal} disabled={guardando}>
                Cancelar
              </Button>

              {!fotoTomada ? (
                <Button
                  onClick={tomarFoto}
                  disabled={!!errorCamara}
                  className="bg-violet-600 hover:bg-violet-700 text-white"
                >
                  📸 Tomar Foto
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setFotoTomada(null);
                      iniciarCamara();
                    }}
                    disabled={guardando}
                  >
                    🔄 Repetir
                  </Button>
                  <Button
                    onClick={handleGuardar}
                    disabled={guardando}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {guardando ? "Guardando..." : "✅ Guardar Foto"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}