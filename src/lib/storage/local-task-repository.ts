import type { Task } from '../../features/tasks/models/task'
import type { TaskRepository } from '../../features/tasks/task-repository'
import { isTaskStatus } from '../../features/tasks/models/task'

const STORAGE_KEY = 'curso-pswe-07.tasks'

export function validateTaskCollection(value: unknown): Task[] {
  if (!Array.isArray(value)) {
    throw new Error('The stored tasks are not valid.')
  }

  const tasks: Task[] = []

  for (const item of value) {
    if (!item || typeof item !== 'object') {
      throw new Error('The stored tasks are invalid.')
    }

    const task = item as Partial<Task>
    if (typeof task.id !== 'string' || task.id.length === 0) {
      throw new Error('The stored tasks are invalid.')
    }

    if (typeof task.title !== 'string' || task.title.trim().length === 0) {
      throw new Error('The stored tasks are invalid.')
    }

    if (typeof task.description !== 'string') {
      throw new Error('The stored tasks are invalid.')
    }

    if (!isTaskStatus(task.status ?? '')) {
      throw new Error('The stored tasks are invalid.')
    }

    const duplicate = tasks.some((existingTask) => existingTask.id === task.id)
    if (duplicate) {
      throw new Error('The stored tasks are invalid.')
    }

    tasks.push({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status ?? 'pending',
    })
  }

  return tasks
}

export class LocalTaskRepository implements TaskRepository {
  private readonly storageKey: string

  constructor(storageKey = STORAGE_KEY) {
    this.storageKey = storageKey
  }

  async loadTasks(): Promise<Task[]> {
    if (typeof window === 'undefined') {
      return []
    }

    try {
      const rawValue = window.localStorage.getItem(this.storageKey)
      if (rawValue === null) {
        return []
      }

      return validateTaskCollection(JSON.parse(rawValue))
    } catch {
      throw new Error('Tasks could not be loaded.')
    }
  }

  async saveTasks(tasks: Task[]): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('The tasks could not be saved.')
    }

    try {
      const collection = tasks.map((task) => ({ ...task }))
      window.localStorage.setItem(this.storageKey, JSON.stringify(collection))
    } catch {
      throw new Error('Tasks could not be saved.')
    }
  }
}
