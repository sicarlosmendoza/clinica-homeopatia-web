"use client";

import { Button } from "@/components/ui/button";

export default function BotonImprimir() {
  return (
    <Button 
      onClick={() => window.print()} 
      className="bg-purple-700 hover:bg-purple-800 text-white shadow-md font-bold px-6"
    >
      🖨️ Generar PDF / Imprimir
    </Button>
  );
}