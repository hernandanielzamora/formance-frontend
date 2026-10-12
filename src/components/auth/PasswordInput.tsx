'use client';
import { useState } from 'react';
import Icon from '@/components/ui/Icon';
export default function PasswordInput({ name, label, register = false, confirm = false }: { name: string; label: string; register?: boolean; confirm?: boolean }) {
  const [visible, setVisible] = useState(false);
  return <label>{label}<span className="password-field"><input name={name} type={visible ? 'text' : 'password'} autoComplete={register ? 'new-password' : 'current-password'} required minLength={register ? 8 : undefined} maxLength={128} placeholder={confirm ? 'Repetí tu contraseña' : register ? 'Al menos 8 caracteres' : 'Tu contraseña'} /><button type="button" className="password-toggle" onClick={() => setVisible(!visible)} aria-label={`${visible ? 'Ocultar' : 'Mostrar'} ${label.toLowerCase()}`} aria-pressed={visible}><Icon name={visible ? 'eye-off' : 'eye'} /></button></span></label>;
}
