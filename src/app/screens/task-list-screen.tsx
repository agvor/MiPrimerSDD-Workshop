import type { Task, TaskFilter } from '../../features/tasks/models/task'

interface TaskListScreenProps {
  tasks: Task[]
  filter: TaskFilter
  onFilterChange: (filter: TaskFilter) => void
  onAddTask: () => void
  onOpenTask: (taskId: string) => void
  emptyMessage: string
}

export function TaskListScreen({
  tasks,
  filter,
  onFilterChange,
  onAddTask,
  onOpenTask,
  emptyMessage,
}: TaskListScreenProps) {
  return (
    <section className="panel task-list-panel">
      <header className="screen-header">
        <div>
          <p className="eyebrow">To-Do List</p>
          <h1>Curso-PSWE-07</h1>
        </div>
        <button type="button" className="primary-button" onClick={onAddTask}>
          Add task
        </button>
      </header>

      <div className="filter-row" role="tablist" aria-label="Task filters">
        {(['all', 'pending', 'done'] as TaskFilter[]).map((option) => (
          <button
            key={option}
            type="button"
            className={filter === option ? 'filter-button active' : 'filter-button'}
            onClick={() => onFilterChange(option)}
            aria-pressed={filter === option}
          >
            {option === 'all' ? 'All' : option === 'pending' ? 'Pending' : 'Done'}
          </button>
        ))}
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state" aria-live="polite">
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <ul className="task-list" aria-live="polite">
          {tasks.map((task) => (
            <li key={task.id}>
              <button type="button" className="task-row" onClick={() => onOpenTask(task.id)}>
                <span className={task.status === 'done' ? 'task-status done' : 'task-status pending'}>
                  {task.status === 'done' ? 'Done' : 'Pending'}
                </span>
                <span className={task.status === 'done' ? 'task-title done' : 'task-title'}>
                  {task.title}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
