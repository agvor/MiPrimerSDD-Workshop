import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../../src/App'

describe('task maintenance', () => {
  it('edits, toggles, and deletes a task', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /add task/i }))
    await user.type(screen.getByLabelText(/title/i), 'Refine backlog')
    await user.click(screen.getByRole('button', { name: /^save$/i }))

    await user.click(screen.getByRole('button', { name: /refine backlog/i }))
    expect(screen.getByText('No description')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /edit/i }))
    const titleInput = screen.getByLabelText(/title/i)
    await user.clear(titleInput)
    await user.type(titleInput, 'Refine backlog plan')
    await user.type(screen.getByLabelText(/description/i), 'Outline the sprint goals')
    await user.click(screen.getByRole('button', { name: /^save$/i }))
    expect(screen.getByText('Refine backlog plan')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /mark as done/i }))
    expect(screen.getByRole('button', { name: /mark as not done/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /mark as not done/i }))
    expect(screen.getByRole('button', { name: /mark as done/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /delete/i }))
    expect(screen.getByText(/delete task\?/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^cancel$/i }))
    expect(screen.getByText('Refine backlog plan')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /delete/i }))
    await user.click(screen.getAllByRole('button', { name: /^delete$/i })[1])
    expect(screen.getByText('No tasks yet. Add a task to get started.')).toBeInTheDocument()
  })
})
