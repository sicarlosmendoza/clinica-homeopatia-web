"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { crearReservaPublica } from "@/app/actions/reservas.actions";

interface Horario {
  id: string;
  medico_id: string;
  sede_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  activo: boolean;
}

export default function FormularioReserva({ 
  sedes, 
  medicos, 
  horarios,
  citas = [] 
}: { 
  sedes: any[]; 
  medicos: any[]; 
  horarios: Horario[]; 
  citas?: any[];
}) {
  const [paso, setPaso] = useState<number>(1);
  const [sedeId, setSedeId] = useState<string | null>(null);
  const [medicoId, setMedicoId] = useState<string | null>(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<{
    fechaISO: string;
    diaDB: number;
    diaNombre: string;
    numeroDia: number;
    mesNombre: string;
  } | null>(null);
  const [horaSeleccionada, setHoraSeleccionada] = useState<string | null>(null);
  const [citaConfirmada, setCitaConfirmada] = useState<boolean>(false);

  // Estados de control para Terceros y Anti-bot
  const [esParaTercero, setEsParaTercero] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [isPending, startTransition] = useTransition();
  const [errorReserva, setErrorReserva] = useState<string | null>(null);

  // Datos del formulario
  const [formData, setFormData] = useState({
    nombrePaciente: "",
    nombreTutor: "",
    telefono: "",
    correo: "",
    motivo: ""
  });

  const sedeActual = sedes.find((s) => s.id === sedeId);
  const medicoActual = medicos.find((m) => m.id === medicoId);

  const medicosDisponibles = sedeId 
    ? medicos.filter((m) => horarios.some((h) => h.sede_id === sedeId && h.medico_id === m.id && h.activo))
    : [];

  const horariosValidos = horarios.filter(
    (h) => h.sede_id === sedeId && h.medico_id === medicoId && h.activo
  );

  const diasAtencion = Array.from(new Set(horariosValidos.map((h) => Number(h.dia_semana))));

  const obtenerProximasFechas = () => {
    const fechas = [];
    const hoy = new Date();
    const nombresDias = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const nombresMeses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

    for (let i = 1; i <= 35; i++) {
      const d = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + i);
      const jsDay = d.getDay();
      const diaDB = jsDay === 0 ? 7 : jsDay;

      if (diasAtencion.includes(diaDB)) {
        fechas.push({
          fechaISO: d.toISOString().split("T")[0],
          diaDB,
          diaNombre: nombresDias[diaDB],
          numeroDia: d.getDate(),
          mesNombre: nombresMeses[d.getMonth()]
        });
      }
    }
    return fechas;
  };

  const obtenerIntervalosHoras = () => {
    if (!fechaSeleccionada) return [];

    const horariosDelDia = horariosValidos.filter((h) => Number(h.dia_semana) === fechaSeleccionada.diaDB);
    const slots: string[] = [];

    horariosDelDia.forEach((h) => {
      const [hIni, mIni] = h.hora_inicio.split(":").map(Number);
      const [hFin, mFin] = h.hora_fin.split(":").map(Number);
      let minActual = hIni * 60 + mIni;
      const minFin = hFin * 60 + mFin;

      while (minActual + 60 <= minFin) {
        const horas = Math.floor(minActual / 60).toString().padStart(2, "0");
        const minutos = (minActual % 60).toString().padStart(2, "0");
        slots.push(`${horas}:${minutos}`);
        minActual += 60;
      }
    });

    return slots.sort();
  };

  const estaHoraOcupada = (horaStr: string) => {
    if (!fechaSeleccionada || !medicoId) return false;

    return citas.some((c) => {
      if (c.medico_id !== medicoId) return false;

      const fechaCita = new Date(c.fecha_cita);
      const año = fechaCita.getFullYear();
      const mes = String(fechaCita.getMonth() + 1).padStart(2, "0");
      const dia = String(fechaCita.getDate()).padStart(2, "0");
      const fechaCitaISO = `${año}-${mes}-${dia}`;

      const horas = String(fechaCita.getHours()).padStart(2, "0");
      const minutos = String(fechaCita.getMinutes()).padStart(2, "0");
      const horaCitaStr = `${horas}:${minutos}`;

      return fechaCitaISO === fechaSeleccionada.fechaISO && horaCitaStr === horaStr;
    });
  };

  const proximasFechas = paso === 3 ? obtenerProximasFechas() : [];
  const horasDisponibles = paso === 3 && fechaSeleccionada ? obtenerIntervalosHoras() : [];

  const handleConfirmarCita = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorReserva(null);

    if (!sedeId || !medicoId || !fechaSeleccionada || !horaSeleccionada) {
      setErrorReserva("Faltan datos de la cita. Regresa e inténtalo de nuevo.");
      return;
    }

    startTransition(async () => {
      const res = await crearReservaPublica({
        sede_id: sedeId,
        medico_id: medicoId,
        fecha_iso: fechaSeleccionada.fechaISO,
        hora: horaSeleccionada,
        nombre_paciente: formData.nombrePaciente,
        es_tercero: esParaTercero,
        nombre_tutor: esParaTercero ? formData.nombreTutor : undefined,
        telefono: formData.telefono,
        correo: formData.correo,
        motivo: formData.motivo,
        honeypot // Si un bot lo llena, el servidor lo rechaza
      });

      if (res.success) {
        setCitaConfirmada(true);
      } else {
        setErrorReserva(res.error || "Ocurrió un error al agendar tu cita.");
      }
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
      
      {/* Barra de progreso */}
      <div className="bg-slate-100 flex h-2">
        <div 
          className={`bg-purple-600 transition-all duration-500 ${
            paso === 1 ? 'w-1/4' : paso === 2 ? 'w-2/4' : paso === 3 ? 'w-3/4' : 'w-full'
          }`} 
        />
      </div>

      <div className="p-6 md:p-10">
        
        {/* PASO 1: SELECCIONAR SEDE */}
        {paso === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-800">1. ¿Dónde te gustaría atenderte?</h2>
              <p className="text-sm text-slate-500 mt-1">Selecciona el consultorio que más te convenga.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sedes.map((sede) => (
                <div 
                  key={sede.id} 
                  onClick={() => { 
                    setSedeId(sede.id); 
                    setMedicoId(null);
                    setFechaSeleccionada(null);
                    setHoraSeleccionada(null);
                    setPaso(2); 
                  }}
                  className="cursor-pointer border-2 border-slate-200 rounded-2xl p-5 hover:border-purple-500 hover:shadow-lg transition-all flex flex-col justify-between group bg-white"
                >
                  <div>
                    {sede.imagen_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={sede.imagen_url} 
                        alt={sede.nombre} 
                        className="w-full h-40 object-cover rounded-xl mb-3 border border-slate-200 shadow-inner" 
                      />
                    ) : (
                      <div className="w-full h-32 bg-purple-50 rounded-xl mb-3 flex items-center justify-center text-4xl border border-purple-100 text-purple-400">
                        🏢
                      </div>
                    )}

                    <h3 className="font-bold text-xl text-slate-900 group-hover:text-purple-700 transition-colors">
                      {sede.nombre}
                    </h3>

                    {sede.descripcion && (
                      <p className="text-sm text-slate-600 mt-1 mb-3 line-clamp-2">
                        {sede.descripcion}
                      </p>
                    )}

                    {sede.direccion && (
                      <p className="text-xs text-slate-600 mb-2 flex items-start gap-1">
                        <span className="shrink-0 text-slate-400">📍</span>
                        <span>{sede.direccion}</span>
                      </p>
                    )}

                    {sede.direccion && (
                      <div 
                        className="w-full h-44 rounded-xl overflow-hidden border border-slate-200 my-3 relative shadow-inner bg-slate-100"
                        onClick={(e) => e.stopPropagation()} 
                      >
                        <iframe
                          title={`Mapa de ${sede.nombre}`}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(sede.direccion)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                        />
                      </div>
                    )}

                    {sede.telefono && (
                      <div className="flex items-center gap-2 text-xs text-slate-600 my-1">
                        <span>📞</span>
                        <a 
                          href={`tel:${sede.telefono}`}
                          onClick={(e) => e.stopPropagation()} 
                          className="hover:text-purple-700 hover:underline"
                        >
                          {sede.telefono}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
                    {sede.link_maps && (
                      <a 
                        href={sede.link_maps} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()} 
                        className="text-center text-xs font-semibold text-blue-600 hover:underline py-1"
                      >
                        Abrir en app de Google Maps ↗
                      </a>
                    )}

                    <Button 
                      type="button" 
                      className="w-full bg-slate-900 group-hover:bg-purple-700 text-white rounded-xl transition-colors h-11"
                    >
                      Elegir este Consultorio →
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PASO 2: SELECCIONAR MÉDICO */}
        {paso === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-4 mb-6">
              <button 
                onClick={() => setPaso(1)} 
                className="text-slate-500 hover:text-slate-800 font-bold text-sm bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                ← Volver a Sedes
              </button>
              <div>
                <h2 className="text-2xl font-black text-slate-800">2. Elige a tu Médico</h2>
                <p className="text-xs text-purple-700 font-bold mt-0.5">Sede: {sedeActual?.nombre}</p>
              </div>
            </div>
            
            {medicosDisponibles.length === 0 ? (
              <div className="text-center p-10 bg-slate-50 rounded-2xl border-dashed border-2 border-slate-200">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-slate-700 font-medium text-lg">No hay médicos con agenda abierta en este consultorio.</p>
                <p className="text-slate-500 text-sm mt-1 mb-6">Prueba seleccionando otra sede.</p>
                <Button onClick={() => setPaso(1)} variant="outline">Elegir otra sede</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {medicosDisponibles.map((medico) => (
                  <div 
                    key={medico.id} 
                    onClick={() => { 
                      setMedicoId(medico.id); 
                      setFechaSeleccionada(null);
                      setHoraSeleccionada(null);
                      setPaso(3); 
                    }}
                    className="cursor-pointer border-2 border-slate-200 rounded-2xl p-5 hover:border-purple-500 hover:bg-purple-50 transition-all flex items-center justify-between shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center text-2xl border border-purple-200 shrink-0">
                        🩺
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">{medico.nombre}</h3>
                        <p className="text-sm text-slate-500">{medico.especialidad}</p>
                      </div>
                    </div>
                    <span className="text-purple-600 font-bold text-lg">➔</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PASO 3: SELECCIONAR FECHA Y HORA */}
        {paso === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
            <div className="flex items-center gap-4 mb-2">
              <button 
                onClick={() => setPaso(2)} 
                className="text-slate-500 hover:text-slate-800 font-bold text-sm bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                ← Volver a Médicos
              </button>
              <div>
                <h2 className="text-2xl font-black text-slate-800">3. Elige Fecha y Horario</h2>
                <p className="text-xs text-purple-700 font-semibold mt-0.5">
                  {medicoActual?.nombre} • {sedeActual?.nombre}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">
                1. Fechas con atención disponible:
              </label>

              {proximasFechas.length === 0 ? (
                <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
                  No hay días configurados para este médico en esta sede.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-1">
                  {proximasFechas.map((f) => {
                    const estaSeleccionada = fechaSeleccionada?.fechaISO === f.fechaISO;
                    return (
                      <button
                        type="button"
                        key={f.fechaISO}
                        onClick={() => {
                          setFechaSeleccionada(f);
                          setHoraSeleccionada(null);
                        }}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          estaSeleccionada
                            ? "bg-purple-700 text-white border-purple-700 shadow-md scale-102"
                            : "bg-slate-50 hover:bg-purple-50 border-slate-200 text-slate-700"
                        }`}
                      >
                        <div className="text-xs uppercase font-extrabold tracking-wider opacity-80">{f.diaNombre}</div>
                        <div className="text-2xl font-black my-0.5">{f.numeroDia}</div>
                        <div className="text-xs font-semibold opacity-90">{f.mesNombre}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {fechaSeleccionada && (
              <div className="pt-4 border-t border-slate-100 animate-in fade-in duration-300">
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  2. Horas disponibles para el {fechaSeleccionada.diaNombre} {fechaSeleccionada.numeroDia} de {fechaSeleccionada.mesNombre}:
                </label>

                {horasDisponibles.length === 0 ? (
                  <p className="text-sm text-slate-500">No se encontraron turnos para este día.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {horasDisponibles.map((hora) => {
                      const ocupada = estaHoraOcupada(hora);
                      const estaSeleccionada = horaSeleccionada === hora;

                      if (ocupada) {
                        return (
                          <div
                            key={hora}
                            className="py-2.5 px-2 rounded-xl text-xs font-bold border border-slate-200 bg-slate-100 text-slate-400 flex flex-col items-center justify-center cursor-not-allowed select-none opacity-70"
                          >
                            <span className="line-through">{hora} hrs</span>
                            <span className="text-[10px] uppercase tracking-wider font-extrabold text-red-400 mt-0.5">Ocupado</span>
                          </div>
                        );
                      }

                      return (
                        <button
                          type="button"
                          key={hora}
                          onClick={() => setHoraSeleccionada(hora)}
                          className={`py-2.5 px-2 rounded-xl text-sm font-bold border transition-all ${
                            estaSeleccionada
                              ? "bg-purple-700 text-white border-purple-700 shadow-md scale-102"
                              : "bg-white hover:bg-slate-50 border-slate-200 text-slate-800"
                          }`}
                        >
                          {hora} hrs
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="pt-4">
              <Button
                type="button"
                disabled={!fechaSeleccionada || !horaSeleccionada}
                onClick={() => setPaso(4)}
                className="w-full h-12 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold transition-all disabled:opacity-40"
              >
                Continuar con mis datos →
              </Button>
            </div>
          </div>
        )}

        {/* PASO 4: CONFIRMACIÓN Y DATOS DEL PACIENTE / TUTOR */}
        {paso === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            {citaConfirmada ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto shadow-inner">
                  ✓
                </div>
                <h2 className="text-3xl font-black text-slate-800">¡Cita Solicitada con Éxito!</h2>
                <p className="text-slate-600 max-w-md mx-auto text-sm">
                  Hemos registrado la cita para <strong>{formData.nombrePaciente}</strong> con <strong>{medicoActual?.nombre}</strong> el 
                  <strong> {fechaSeleccionada?.diaNombre} {fechaSeleccionada?.numeroDia} de {fechaSeleccionada?.mesNombre} a las {horaSeleccionada} hrs</strong> en la sede <strong>{sedeActual?.nombre}</strong>.
                </p>
                <div className="pt-4">
                  <Button 
                    type="button" 
                    onClick={() => {
                      setPaso(1);
                      setCitaConfirmada(false);
                      setFechaSeleccionada(null);
                      setHoraSeleccionada(null);
                      setEsParaTercero(false);
                      setFormData({
                        nombrePaciente: "",
                        nombreTutor: "",
                        telefono: "",
                        correo: "",
                        motivo: ""
                      });
                    }}
                    className="bg-slate-900 text-white rounded-xl px-8"
                  >
                    Agendar otra cita
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setPaso(3)} 
                    className="text-slate-500 hover:text-slate-800 font-bold text-sm bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    ← Cambiar Fecha / Hora
                  </button>
                  <h2 className="text-2xl font-black text-slate-800">4. Datos de la Cita</h2>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-sm text-purple-900 space-y-1">
                  <p><strong>Consultorio:</strong> {sedeActual?.nombre}</p>
                  <p><strong>Médico:</strong> {medicoActual?.nombre}</p>
                  <p><strong>Horario:</strong> {fechaSeleccionada?.diaNombre} {fechaSeleccionada?.numeroDia} de {fechaSeleccionada?.mesNombre} a las {horaSeleccionada} hrs</p>
                </div>

                <form onSubmit={handleConfirmarCita} className="space-y-5">
                  
                  {/* CAMPO HONEYPOT INVISIBLE PARA BOTS */}
                  <div className="hidden" aria-hidden="true" style={{ display: "none" }}>
                    <input 
                      type="text" 
                      name="website_url"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>

                  {/* SELECTOR: ¿AGENDA PARA UN HIJO O TERCERO? */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-800">¿La consulta es para otra persona?</p>
                      <p className="text-xs text-slate-500">Actívalo si estás agendando para tu hijo, hija o familiar.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={esParaTercero}
                        onChange={(e) => setEsParaTercero(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  {/* BLOQUE DE DATOS */}
                  {esParaTercero ? (
                    <div className="space-y-4 border-l-2 border-purple-500 pl-4 py-1">
                      <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wider">
                        1. Datos del Paciente (Menor o Familiar)
                      </h3>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Nombre Completo del Paciente *
                        </label>
                        <input 
                          type="text" 
                          required 
                          value={formData.nombrePaciente}
                          onChange={(e) => setFormData({ ...formData, nombrePaciente: e.target.value })}
                          placeholder="Nombre del niño/a o familiar que tomará la consulta"
                          className="w-full p-3 border rounded-xl"
                        />
                      </div>

                      <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wider pt-2">
                        2. Datos del Tutor o Responsable
                      </h3>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Tu Nombre Completo (Madre, Padre o Tutor) *
                        </label>
                        <input 
                          type="text" 
                          required 
                          value={formData.nombreTutor}
                          onChange={(e) => setFormData({ ...formData, nombreTutor: e.target.value })}
                          placeholder="Ej. María Elena Morales"
                          className="w-full p-3 border rounded-xl"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Nombre Completo del Paciente *
                      </label>
                      <input 
                        type="text" 
                        required 
                        value={formData.nombrePaciente}
                        onChange={(e) => setFormData({ ...formData, nombrePaciente: e.target.value })}
                        placeholder="Ej. Juan Pérez López"
                        className="w-full p-3 border rounded-xl"
                      />
                    </div>
                  )}

                  {/* CONTACTO: TELÉFONO Y CORREO (DEL TUTOR O DEL PROPIO PACIENTE) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        WhatsApp / Teléfono *
                      </label>
                      <input 
                        type="tel" 
                        required 
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        placeholder="Ej. 33 1234 5678"
                        className="w-full p-3 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Correo Electrónico *
                      </label>
                      <input 
                        type="email" 
                        required 
                        value={formData.correo}
                        onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                        placeholder="ejemplo@correo.com"
                        className="w-full p-3 border rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Motivo o síntomas principales (opcional)
                    </label>
                    <textarea 
                      rows={2}
                      value={formData.motivo}
                      onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                      placeholder="Primera vez, tos persistente, control de tratamiento, etc."
                      className="w-full p-3 border rounded-xl resize-none"
                    />
                  </div>

                  {errorReserva && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-200 text-sm font-bold">
                      ⚠️ {errorReserva}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    disabled={isPending}
                    className="w-full h-12 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl"
                  >
                    {isPending ? "Procesando Cita..." : "Confirmar Reservación de Cita"}
                  </Button>
                </form>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}