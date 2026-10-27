import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { InMemoryTaskRepository } from '../../src/features/tasks/in-memory-task-repository'
import { useTasks } from '../../src/features/tasks/hooks/use-tasks'

describe('task list actions', () => {
  it('adds pending tasks and filters results', async () => {
    const repository = new InMemoryTaskRepository()
    const { result } = renderHook(() => useTasks(repository))

    await act(async () => {
      await result.current.addTask({ title: 'Plan sprint', description: 'Prepare backlog' })
    })

    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.tasks[0]).toMatchObject({ title: 'Plan sprint', status: 'pending' })

    await act(async () => {
      result.current.setFilter('pending')
    })
    expect(result.current.filteredTasks).toHaveLength(1)

    await act(async () => {
      await result.current.addTask({ title: 'Review PR', description: '' })
    })

    await act(async () => {
      result.current.setFilter('done')
    })
    expect(result.current.filteredTasks).toHaveLength(0)
  })
})
