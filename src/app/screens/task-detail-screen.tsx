import type { Task } from '../../features/tasks/models/task'

interface TaskDetailScreenProps {
  task: Task
  onBack: () => void
  onEdit: () => void
  onToggleStatus: () => void
  onDelete: () => void
}

export function TaskDetailScreen({
  task,
  onBack,
  onEdit,
  onToggleStatus,
  onDelete,
}: TaskDetailScreenProps) {
  const statusLabel = task.status === 'done' ? 'Done' : 'Pending'

  return (
    <section className="panel task-detail-panel" aria-label="Task detail">
      <header className="detail-header">
        <button type="button" className="back-button" onClick={onBack} aria-label="Back to task list">
          ← Back
        </button>
      </header>

      <div className="task-detail-top">
        <div>
          <p className="eyebrow">Task</p>
          <h2>{task.title}</h2>
        </div>
        <span className={task.status === 'done' ? 'task-status detail done' : 'task-status detail pending'}>
          {statusLabel}
        </span>
      </div>

      <div className="detail-body">
        <p className={task.description ? 'task-description' : 'task-description empty'}>
          {task.description || 'No description'}
        </p>
      </div>

      <div className="detail-actions">
        <button type="button" className="secondary-button" onClick={onEdit}>
          Edit
        </button>
        <button type="button" className="primary-button" onClick={onToggleStatus}>
          {task.status === 'done' ? 'Mark as not done' : 'Mark as done'}
        </button>
        <button type="button" className="danger-button" onClick={onDelete}>
          Delete
        </button>
      </div>
    </section>
  )
}
