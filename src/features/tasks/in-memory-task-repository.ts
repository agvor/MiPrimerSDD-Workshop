import type { Task } from './models/task'
import type { TaskRepository } from './task-repository'

export class InMemoryTaskRepository implements TaskRepository {
  private tasks: Task[]

  constructor(initialTasks: Task[] = []) {
    this.tasks = initialTasks.map((task) => ({ ...task }))
  }

  async loadTasks(): Promise<Task[]> {
    return this.tasks.map((task) => ({ ...task }))
  }

  async saveTasks(tasks: Task[]): Promise<void> {
    this.tasks = tasks.map((task) => ({ ...task }))
  }
}
