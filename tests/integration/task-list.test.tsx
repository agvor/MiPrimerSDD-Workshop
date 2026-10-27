import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../../src/App'

describe('task list screen', () => {
  it('adds a task, opens it, and filters the list', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(
      await screen.findByText('No tasks yet. Add a task to get started.'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /add task/i }))
    await user.type(screen.getByLabelText(/title/i), 'Write report')
    await user.type(screen.getByLabelText(/description/i), 'Prepare summary')
    await user.click(screen.getByRole('button', { name: /^save$/i }))

    expect(screen.getByText('Write report')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /write report/i }))
    expect(screen.getByRole('heading', { name: /write report/i, level: 2 })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /back/i }))

    await user.click(screen.getByRole('button', { name: /add task/i }))
    await user.type(screen.getByLabelText(/title/i), 'Review PR')
    await user.click(screen.getByRole('button', { name: /^save$/i }))

    await user.click(screen.getByRole('button', { name: /write report/i }))
    await user.click(screen.getByRole('button', { name: /mark as done/i }))
    await user.click(screen.getByRole('button', { name: /back/i }))

    await user.click(screen.getByRole('button', { name: /^Done$/i }))
    expect(screen.getByText('Write report')).toBeInTheDocument()
    expect(screen.queryByText('Review PR')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^Pending$/i }))
    expect(screen.getByText('Review PR')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^Done$/i }))
    await user.click(screen.getByRole('button', { name: /^All$/i }))
    expect(screen.getByText('Write report')).toBeInTheDocument()
    expect(screen.getByText('Review PR')).toBeInTheDocument()
  })
})
