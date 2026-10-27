import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../../src/App'

describe('task persistence', () => {
  it('persists tasks across app re-renders', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)

    await user.click(screen.getByRole('button', { name: /add task/i }))
    await user.type(screen.getByLabelText(/title/i), 'Persist task')
    await user.click(screen.getByRole('button', { name: /^save$/i }))

    unmount()
    render(<App />)

    expect(await screen.findByText('Persist task')).toBeInTheDocument()
  })

  it('shows a load error when storage data is unreadable', async () => {
    window.localStorage.setItem('curso-pswe-07.tasks', '{bad json')

    render(<App />)

    expect(await screen.findByText('Tasks could not be loaded.')).toBeInTheDocument()
    expect(window.localStorage.getItem('curso-pswe-07.tasks')).toBe('{bad json')
  })
})
