export function authError(error: unknown): string {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  const messages: Record<string, string> = {
    'auth/invalid-credential': 'El correo o la contraseña no son correctos.',
    'auth/wrong-password': 'El correo o la contraseña no son correctos.',
    'auth/user-not-found': 'El correo o la contraseña no son correctos.',
    'auth/email-already-in-use': 'Ese correo ya tiene una cuenta. Iniciá sesión con el método que usaste para registrarte.',
    'auth/weak-password': 'Elegí una contraseña más segura.',
    'auth/invalid-email': 'Ingresá un correo válido.',
    'auth/popup-closed-by-user': 'Se cerró la ventana de Google. Podés intentarlo otra vez.',
    'auth/popup-blocked': 'El navegador bloqueó la ventana. Permití las ventanas emergentes para continuar.',
    'auth/account-exists-with-different-credential': 'Ese correo utiliza otro método de acceso. Iniciá sesión con ese método.',
    'auth/too-many-requests': 'Hubo demasiados intentos. Esperá unos minutos.',
    'auth/network-request-failed': 'No se pudo conectar. Revisá tu conexión e intentá nuevamente.',
    'auth/operation-not-allowed': 'Este método de acceso todavía no está habilitado.',
    'auth/unauthorized-domain': 'El dominio de esta aplicación no está habilitado para iniciar sesión.',
  };
  return messages[code] || 'No se pudo completar la operación. Intentá nuevamente.';
}
