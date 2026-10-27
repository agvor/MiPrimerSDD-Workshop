import { useState, type FormEvent } from 'react'
import type { TaskFormValues } from '../hooks/use-tasks'

interface TaskFormProps {
  title?: string
  description?: string
  submitLabel?: string
  onSubmit: (values: TaskFormValues) => Promise<void> | void
  onCancel?: () => void
  submitDisabled?: boolean
  error?: string | null
}

export function TaskForm({
  title = '',
  description = '',
  submitLabel = 'Save',
  onSubmit,
  onCancel,
  submitDisabled = false,
  error = null,
}: TaskFormProps) {
  const [draftTitle, setDraftTitle] = useState(title)
  const [draftDescription, setDraftDescription] = useState(description)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await onSubmit({ title: draftTitle, description: draftDescription })
  }

  return (
    <section className="panel task-form-panel" aria-label="Task form">
      <h2>{submitLabel === 'Save' ? 'Add task' : 'Edit task'}</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="task-title">Title</label>
        <input
          id="task-title"
          name="title"
          value={draftTitle}
          onChange={(event) => setDraftTitle(event.target.value)}
          placeholder="Task title"
          aria-invalid={Boolean(error)}
        />

        <label htmlFor="task-description">Description</label>
        <textarea
          id="task-description"
          name="description"
          value={draftDescription}
          onChange={(event) => setDraftDescription(event.target.value)}
          placeholder="Optional description"
        />

        {error ? <p className="form-error">{error}</p> : null}

        <div className="task-form-actions">
          {onCancel ? (
            <button type="button" className="secondary-button" onClick={onCancel}>
              Cancel
            </button>
          ) : null}
          <button type="submit" className="primary-button" disabled={submitDisabled}>
            {submitLabel}
          </button>
        </div>
      </form>
    </section>
  )
}
