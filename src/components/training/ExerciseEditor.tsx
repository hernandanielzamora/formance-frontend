'use client';
import { useState, type FormEvent } from 'react';
import { type Exercise } from '@/lib/training';
import { apiRequest } from '@/lib/api/client';
import { getFirebaseAuth } from '@/lib/firebase/client';
export default function ExerciseEditor({ source, onSaved, onCancel }: { source: Exercise | null; onSaved: () => Promise<void>; onCancel: () => void }) {
  const [form, setForm] = useState({ name:source?.name || '', muscle:source?.muscle || '', equipment:source?.equipment || '', instructions:source?.instructions || '' });
  const [busy,setBusy] = useState(false); const [error,setError] = useState('');
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try { await apiRequest(`training/exercises${source ? `/${source.id}` : ''}`, {method:source ? 'PUT':'POST',body:JSON.stringify({...form,...(source?{expectedVersion:source.version}:{})})},getFirebaseAuth()); await onSaved(); }
    catch(e){setError(e instanceof Error?e.message:'No se pudo guardar.');} finally{setBusy(false);}
  }
  return <section className="training-editor"><div className="editor-heading"><h2>{source?'Editar ejercicio':'Crear ejercicio'}</h2><button disabled={busy} onClick={onCancel}>Cancelar</button></div><form onSubmit={save}><div className="personal-grid">{(['name','muscle','equipment'] as const).map(key=><label key={key}>{{name:'Nombre',muscle:'Grupo muscular',equipment:'Equipamiento'}[key]}<input required maxLength={80} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/></label>)}</div><label>Indicaciones<textarea required maxLength={1500} rows={5} value={form.instructions} onChange={e=>setForm({...form,instructions:e.target.value})}/></label>{error&&<p className="form-error" role="alert">{error}</p>}<button className="primary-button" disabled={busy}>{busy?'Guardando…':'Guardar ejercicio'}</button></form></section>;
}
