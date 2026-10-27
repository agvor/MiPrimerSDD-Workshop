import type { Task } from './models/task'

export interface TaskRepository {
  loadTasks: () => Promise<Task[]> | Task[]
  saveTasks: (tasks: Task[]) => Promise<void> | void
}
