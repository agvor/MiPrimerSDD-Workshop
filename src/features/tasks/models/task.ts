export type TaskStatus = 'pending' | 'done'

export type TaskFilter = 'all' | 'pending' | 'done'

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
}

export const TASK_FILTERS: TaskFilter[] = ['all', 'pending', 'done']

export function isTaskStatus(value: string): value is TaskStatus {
  return value === 'pending' || value === 'done'
}

export function createTask(
  id: string,
  title: string,
  description = '',
  status: TaskStatus = 'pending',
): Task {
  return { id, title, description, status }
}
