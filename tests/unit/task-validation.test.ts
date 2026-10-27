import { describe, expect, it } from 'vitest'
import { validateTaskTitle } from '../../src/features/tasks/validation/task-validation'

describe('task validation', () => {
  it('rejects blank or whitespace-only titles', () => {
    expect(validateTaskTitle('   ')).toBe('Title is required.')
    expect(validateTaskTitle('')).toBe('Title is required.')
  })

  it('accepts non-empty titles', () => {
    expect(validateTaskTitle('Write report')).toBeNull()
    expect(validateTaskTitle('  Write report  ')).toBeNull()
  })
})
