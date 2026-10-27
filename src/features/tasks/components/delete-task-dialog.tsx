interface DeleteTaskDialogProps {
  taskTitle: string
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

export function DeleteTaskDialog({
  taskTitle,
  onConfirm,
  onCancel,
}: DeleteTaskDialogProps) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Delete task">
      <div className="modal-card warning">
        <h2>Delete task?</h2>
        <p>
          Are you sure you want to delete <strong>{taskTitle}</strong>?
        </p>
        <div className="task-form-actions">
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="danger-button" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
