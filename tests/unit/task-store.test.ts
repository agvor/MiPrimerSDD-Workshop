import { afterEach, describe, expect, it } from 'vitest'
import { LocalTaskRepository, validateTaskCollection } from '../../src/lib/storage/local-task-repository'

describe('task storage contract', () => {
  afterEach(() => {
    window.localStorage.clear()
  })

  it('loads an empty collection when storage is empty', async () => {
    const repository = new LocalTaskRepository()
    await expect(repository.loadTasks()).resolves.toEqual([])
  })

  it('saves and loads valid task collections', async () => {
    const repository = new LocalTaskRepository()
    const tasks = [
      { id: 'task-1', title: 'Write update', description: 'Share status', status: 'pending' },
      { id: 'task-2', title: 'Review PR', description: '', status: 'done' },
    ]

    await repository.saveTasks(tasks)
    await expect(repository.loadTasks()).resolves.toEqual(tasks)
  })

  it('rejects malformed stored data without replacing it', async () => {
    window.localStorage.setItem('curso-pswe-07.tasks', '{bad json')
    const repository = new LocalTaskRepository()

    await expect(repository.loadTasks()).rejects.toThrow()
    expect(window.localStorage.getItem('curso-pswe-07.tasks')).toBe('{bad json')
  })

  it('validates shape and duplicate ids', () => {
    expect(() => validateTaskCollection([{ id: 'a', title: 'ok', description: '', status: 'pending' }])).not.toThrow()
    expect(() => validateTaskCollection([{ id: 'a', title: ' ', description: '', status: 'pending' }])).toThrow()
    expect(() => validateTaskCollection([{ id: 'a', title: 'ok', description: '', status: 'waiting' }])).toThrow()
    expect(() => validateTaskCollection([{ id: 'a', title: 'ok', description: '', status: 'pending' }, { id: 'a', title: 'done', description: '', status: 'done' }])).toThrow()
  })
})
