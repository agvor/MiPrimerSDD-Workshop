import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { TaskDetailScreen } from './app/screens/task-detail-screen'
import { TaskListScreen } from './app/screens/task-list-screen'
import { DeleteTaskDialog } from './features/tasks/components/delete-task-dialog'
import { TaskForm } from './features/tasks/components/task-form'
import { useTasks } from './features/tasks/hooks/use-tasks'
import type { TaskFilter } from './features/tasks/models/task'
import { LocalTaskRepository } from './lib/storage/local-task-repository'

function App() {
  const repository = useMemo(() => new LocalTaskRepository(), [])
  const {
    tasks,
    selectedTask,
    selectedTaskId,
    setSelectedTaskId,
    filter,
    setFilter,
    filteredTasks,
    loadError,
    addTask,
    updateTask,
    toggleTaskStatus,
    deleteTask,
  } = useTasks(repository)

  const [isCreatingTask, setIsCreatingTask] = useState(false)
  const [isEditingTask, setIsEditingTask] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Curso-PSWE-07'
  }, [])

  const listEmptyMessage =
    tasks.length === 0 ? 'No tasks yet. Add a task to get started.' : 'No tasks match this filter.'

  const handleListTaskOpen = (taskId: string) => {
    setIsCreatingTask(false)
    setIsEditingTask(false)
    setFormError(null)
    setSelectedTaskId(taskId)
  }

  const handleCreateTask = async (values: { title: string; description: string }) => {
    const result = await addTask(values)
    if (!result.ok) {
      setFormError(result.error ?? 'Title is required.')
      return
    }

    setIsCreatingTask(false)
    setFormError(null)
  }

  const handleUpdateTask = async (values: { title: string; description: string }) => {
    if (!selectedTaskId) {
      return
    }

    const result = await updateTask(selectedTaskId, values)
    if (!result.ok) {
      setFormError(result.error ?? 'Title is required.')
      return
    }

    setIsEditingTask(false)
    setFormError(null)
  }

  const handleToggleStatus = async () => {
    if (!selectedTaskId) {
      return
    }

    const result = await toggleTaskStatus(selectedTaskId)
    if (!result.ok) {
      setFormError(result.error ?? 'Unable to update task.')
    }
  }

  const handleDeleteTask = async () => {
    if (!pendingDeleteId) {
      return
    }

    const result = await deleteTask(pendingDeleteId)
    if (!result.ok) {
      setFormError(result.error ?? 'Unable to delete task.')
      return
    }

    setPendingDeleteId(null)
    setFormError(null)
  }

  let screenContent

  if (loadError) {
    screenContent = (
      <section className="panel error-panel" aria-live="polite">
        <h1>Curso-PSWE-07</h1>
        <p>{loadError}</p>
      </section>
    )
  } else if (isCreatingTask) {
    screenContent = (
      <TaskForm
        title=""
        description=""
        submitLabel="Save"
        onSubmit={handleCreateTask}
        onCancel={() => {
          setIsCreatingTask(false)
          setFormError(null)
        }}
        error={formError}
      />
    )
  } else if (selectedTask && isEditingTask) {
    screenContent = (
      <TaskForm
        title={selectedTask.title}
        description={selectedTask.description}
        submitLabel="Save"
        onSubmit={handleUpdateTask}
        onCancel={() => {
          setIsEditingTask(false)
          setFormError(null)
        }}
        error={formError}
      />
    )
  } else if (selectedTask) {
    screenContent = (
      <TaskDetailScreen
        task={selectedTask}
        onBack={() => {
          setIsEditingTask(false)
          setFormError(null)
          setSelectedTaskId(null)
        }}
        onEdit={() => {
          setFormError(null)
          setIsEditingTask(true)
        }}
        onToggleStatus={handleToggleStatus}
        onDelete={() => setPendingDeleteId(selectedTask.id)}
      />
    )
  } else {
    screenContent = (
      <TaskListScreen
        tasks={filteredTasks}
        filter={filter}
        onFilterChange={(nextFilter: TaskFilter) => setFilter(nextFilter)}
        onAddTask={() => {
          setFormError(null)
          setIsCreatingTask(true)
        }}
        onOpenTask={handleListTaskOpen}
        emptyMessage={listEmptyMessage}
      />
    )
  }

  return (
    <main className="app-shell">
      {screenContent}
      {pendingDeleteId ? (
        <DeleteTaskDialog
          taskTitle={tasks.find((task) => task.id === pendingDeleteId)?.title ?? 'this task'}
          onConfirm={handleDeleteTask}
          onCancel={() => {
            setPendingDeleteId(null)
            setFormError(null)
          }}
        />
      ) : null}
    </main>
  )
}

export default App
