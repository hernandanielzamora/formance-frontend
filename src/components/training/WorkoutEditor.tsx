"use client";
import { useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/api/client";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { type Exercise, type WorkoutEntry } from "@/lib/training";

export default function WorkoutEditor({
  exercises,
  onSaved,
  onCancel,
}: {
  exercises: Exercise[];
  onSaved: () => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [focus, setFocus] = useState("Cuerpo completo");
  const [entries, setEntries] = useState<WorkoutEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  function change(
    index: number,
    key: keyof Omit<WorkoutEntry, "exerciseId">,
    value: number,
  ) {
    setEntries((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)),
    );
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await apiRequest(
        "training/workouts",
        {
          method: "POST",
          body: JSON.stringify({ name, focus, exercises: entries }),
        },
        getFirebaseAuth(),
      );
      await onSaved();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No pudimos guardar el workout.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="training-editor">
      <div className="editor-heading">
        <div>
          <p className="eyebrow">TU SESIÓN DE ENTRENAMIENTO</p>
          <h2>Crear workout</h2>
        </div>
        <button type="button" disabled={busy} onClick={onCancel}>
          Cancelar
        </button>
      </div>
      <p>
        Agregá ejercicios en el orden en que querés realizarlos. Las series y
        repeticiones son lo planificado; el registro real se sumará después.
      </p>
      <form onSubmit={save}>
        <div className="personal-grid">
          <label>
            Nombre
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={80}
              placeholder="Ej. Mi tren superior"
            />
          </label>
          <label>
            Enfoque
            <input
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              required
              maxLength={80}
            />
          </label>
        </div>
        <label>
          Agregar ejercicio
          <select
            disabled={busy || entries.length >= 20}
            value=""
            onChange={(e) => {
              if (e.target.value)
                setEntries([
                  ...entries,
                  {
                    exerciseId: e.target.value,
                    sets: 3,
                    repsMin: 8,
                    repsMax: 12,
                    restSeconds: 90,
                  },
                ]);
            }}
          >
            <option value="">Elegí un ejercicio…</option>
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>
        </label>
        {entries.map((entry, index) => (
          <article
            className="workout-entry"
            key={`${entry.exerciseId}-${index}`}
          >
            <div className="entry-title">
              <strong>
                {index + 1}.{" "}
                {exercises.find((e) => e.id === entry.exerciseId)?.name}
              </strong>
              <div>
                <button
                  type="button"
                  disabled={busy || index === 0}
                  aria-label={`Subir ejercicio ${index + 1}`}
                  onClick={() => {
                    const rows = [...entries];
                    [rows[index - 1], rows[index]] = [
                      rows[index],
                      rows[index - 1],
                    ];
                    setEntries(rows);
                  }}
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={busy}
                  aria-label={`Quitar ejercicio ${index + 1}`}
                  onClick={() =>
                    setEntries(entries.filter((_, i) => i !== index))
                  }
                >
                  ×
                </button>
              </div>
            </div>
            <div className="entry-values">
              {(["sets", "repsMin", "repsMax", "restSeconds"] as const).map(
                (key) => (
                  <label key={key}>
                    {
                      {
                        sets: "Series",
                        repsMin: "Reps mín.",
                        repsMax: "Reps máx.",
                        restSeconds: "Descanso (s)",
                      }[key]
                    }
                    <input
                      type="number"
                      value={entry[key]}
                      onChange={(e) =>
                        change(index, key, Number(e.target.value))
                      }
                      min={key === "restSeconds" ? 0 : 1}
                      max={
                        key === "sets" ? 10 : key === "restSeconds" ? 600 : 100
                      }
                      required
                    />
                  </label>
                ),
              )}
            </div>
          </article>
        ))}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="primary-button" disabled={busy || !entries.length}>
          {busy ? "Guardando…" : "Guardar workout"}
        </button>
      </form>
    </section>
  );
}
