import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useTasks } from '../../src/features/tasks/hooks/use-tasks'
import { InMemoryTaskRepository } from '../../src/features/tasks/in-memory-task-repository'

describe('task actions', () => {
  it('updates a task, toggles status, and removes a task', async () => {
    const repository = new InMemoryTaskRepository([
      { id: 'task-1', title: 'Write draft', description: 'Draft update', status: 'pending' },
    ])
    const { result } = renderHook(() => useTasks(repository))

    await act(async () => {
      await result.current.updateTask('task-1', { title: 'Write final draft', description: 'Updated notes' })
    })

    expect(result.current.tasks[0]).toMatchObject({
      id: 'task-1',
      title: 'Write final draft',
      description: 'Updated notes',
      status: 'pending',
    })

    await act(async () => {
      await result.current.toggleTaskStatus('task-1')
    })

    expect(result.current.tasks[0].status).toBe('done')

    await act(async () => {
      await result.current.deleteTask('task-1')
    })

    expect(result.current.tasks).toEqual([])
  })
})
