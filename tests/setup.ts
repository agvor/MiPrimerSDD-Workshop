import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

beforeEach(() => {
  window.localStorage.clear()
  document.title = 'Curso-PSWE-07'
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
