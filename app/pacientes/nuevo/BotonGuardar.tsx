"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export default function BotonGuardar() {
  // hook de React que detecta si el formulario está cargando/procesando
  const { pending } = useFormStatus();

  return (
    <Button 
      type="submit" 
      size="lg" 
      disabled={pending} 
      className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 disabled:cursor-not-allowed"
    >
      {pending ? "Guardando paciente..." : "Registrar Paciente"}
    </Button>
  );
}