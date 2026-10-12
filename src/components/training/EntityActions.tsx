import { type Permissions } from '@/lib/training';
export default function EntityActions({ permissions, busy, onEdit, onDelete }: { permissions: Permissions; busy?: boolean; onEdit: () => void; onDelete: () => void }) {
  const explanation = 'Solo el propietario o un administrador puede realizar esta acción.';
  return <div className="library-actions"><button disabled={busy || !permissions.canEdit} title={permissions.canEdit ? 'Editar' : explanation} onClick={onEdit}>Editar</button><button className="danger-button" disabled={busy || !permissions.canDelete} title={permissions.canDelete ? 'Borrar de la biblioteca' : explanation} onClick={onDelete}>Borrar</button></div>;
}
