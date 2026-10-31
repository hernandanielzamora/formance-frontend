'use client';
import { useRef, useState } from 'react';
const captures = [
  ['01-perfil-objetivo.png','Perfil y objetivo · captura E4'],
  ['02-entrenamiento.png','Entrenamiento registrado'],
  ['03-alimentacion-ia.png','Alimentación e interpretación asistida'],
  ['04-peso-progreso.png','Peso y progreso'],
  ['05-reporte-ia.png','Reporte semanal y análisis guardado'],
];
export function DemoAccess() {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const [index,setIndex] = useState(0);
  return <div className="p-demo-access" data-presentation-interactive>
    <a className="p-cta" href="/app" target="_blank" rel="noopener noreferrer">Ver Formance en acción →</a>
    <button ref={opener} className="p-demo-backup" onClick={()=>{setIndex(0);dialog.current?.showModal();}}>Ver capturas de respaldo</button>
    <dialog ref={dialog} className="p-demo-gallery" aria-label="Capturas de respaldo" onClose={()=>opener.current?.focus()}>
      <div className="p-gallery-toolbar"><strong>{captures[index][1]}</strong><button onClick={()=>dialog.current?.close()}>Cerrar respaldo</button></div>
      <img src={`/presentation/demo/${captures[index][0]}`} alt={captures[index][1]}/>
      <div className="p-gallery-toolbar"><button disabled={index===0} onClick={()=>setIndex(index-1)}>Captura anterior</button><span>{index+1} / {captures.length}</span><button disabled={index===captures.length-1} onClick={()=>setIndex(index+1)}>Captura siguiente</button></div>
    </dialog>
  </div>;
}
