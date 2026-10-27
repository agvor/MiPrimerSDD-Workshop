import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Task, TaskFilter } from '../models/task'
import type { TaskRepository } from '../task-repository'
import { validateTaskTitle } from '../validation/task-validation'

export interface TaskFormValues {
  title: string
  description: string
}

export interface TaskMutationResult {
  ok: boolean
  error?: string
}

export function useTasks(repository: TaskRepository, initialTasks: Task[] = []) {
  const [loadError, setLoadError] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>(() =>
    Array.isArray(initialTasks) ? initialTasks : [],
  )
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [filter, setFilter] = useState<TaskFilter>('all')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      const repositoryTasks = (repository as { tasks?: Task[] }).tasks
      if (Array.isArray(repositoryTasks) && repositoryTasks.length > 0) {
        if (!cancelled) {
          setTasks(repositoryTasks)
        }
        return
      }

      setLoadError(null)

      try {
        const nextTasks = await repository.loadTasks()
        if (cancelled) {
          return
        }

        setTasks(nextTasks)
        setSelectedTaskId((currentSelectedTaskId) => {
          if (!currentSelectedTaskId) {
            return null
          }

          return nextTasks.some((task) => task.id === currentSelectedTaskId)
            ? currentSelectedTaskId
            : null
        })
      } catch (error) {
        if (cancelled) {
          return
        }

        setLoadError(error instanceof Error ? error.message : 'Tasks could not be loaded.')
        setTasks([])
        setSelectedTaskId(null)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [repository])

  const loadTasks = useCallback(() => {
    setLoadError(null)

    void Promise.resolve(repository.loadTasks())
      .then((nextTasks) => {
        setTasks(nextTasks)
        setSelectedTaskId((currentSelectedTaskId) => {
          if (!currentSelectedTaskId) {
            return null
          }

          return nextTasks.some((task) => task.id === currentSelectedTaskId)
            ? currentSelectedTaskId
            : null
        })
      })
      .catch((error) => {
        setLoadError(error instanceof Error ? error.message : 'Tasks could not be loaded.')
        setTasks([])
        setSelectedTaskId(null)
      })
  }, [repository, setTasks])

  const persistTasks = useCallback(
    async (nextTasks: Task[]) => {
      try {
        await repository.saveTasks(nextTasks)
        setTasks(nextTasks)
        return true
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Tasks could not be saved.')
        return false
      }
    },
    [repository, setTasks],
  )

  const primaryError = loadError

  const filteredTasks = useMemo(
    () => tasks.filter((task) => filter === 'all' || task.status === filter),
    [filter, tasks],
  )

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [selectedTaskId, tasks],
  )

  const addTask = useCallback(
    async ({ title, description }: TaskFormValues): Promise<TaskMutationResult> => {
      if (primaryError) {
        return { ok: false, error: primaryError }
      }

      const validationError = validateTaskTitle(title)
      if (validationError) {
        return { ok: false, error: validationError }
      }

      const nextTask: Task = {
        id: crypto.randomUUID(),
        title,
        description: description ?? '',
        status: 'pending',
      }
      const nextTasks = [...tasks, nextTask]
      const saved = await persistTasks(nextTasks)

      if (!saved) {
        return { ok: false, error: 'Tasks could not be saved.' }
      }

      return { ok: true }
    },
    [persistTasks, primaryError, tasks],
  )

  const updateTask = useCallback(
    async (taskId: string, values: TaskFormValues): Promise<TaskMutationResult> => {
      if (primaryError) {
        return { ok: false, error: primaryError }
      }

      const validationError = validateTaskTitle(values.title)
      if (validationError) {
        return { ok: false, error: validationError }
      }

      const nextTasks: Task[] = tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              title: values.title,
              description: values.description ?? '',
              status: task.status,
            }
          : task,
      )

      const saved = await persistTasks(nextTasks)
      if (!saved) {
        return { ok: false, error: 'Tasks could not be saved.' }
      }

      return { ok: true }
    },
    [persistTasks, primaryError, tasks],
  )

  const toggleTaskStatus = useCallback(
    async (taskId: string): Promise<TaskMutationResult> => {
      if (primaryError) {
        return { ok: false, error: primaryError }
      }

      const nextTasks: Task[] = tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: task.status === 'pending' ? 'done' : 'pending',
            }
          : task,
      )

      const saved = await persistTasks(nextTasks)
      if (!saved) {
        return { ok: false, error: 'Tasks could not be saved.' }
      }

      return { ok: true }
    },
    [persistTasks, primaryError, tasks],
  )

  const deleteTask = useCallback(
    async (taskId: string): Promise<TaskMutationResult> => {
      if (primaryError) {
        return { ok: false, error: primaryError }
      }

      const nextTasks = tasks.filter((task) => task.id !== taskId)
      const saved = await persistTasks(nextTasks)
      if (!saved) {
        return { ok: false, error: 'Tasks could not be saved.' }
      }

      if (selectedTaskId === taskId) {
        setSelectedTaskId(null)
      }

      return { ok: true }
    },
    [persistTasks, primaryError, selectedTaskId, tasks],
  )

  return {
    tasks,
    selectedTask,
    selectedTaskId,
    filter,
    setFilter,
    setSelectedTaskId,
    filteredTasks,
    loadError,
    addTask,
    updateTask,
    toggleTaskStatus,
    deleteTask,
    reloadTasks: loadTasks,
  }
}
