export const TITLE_REQUIRED_MESSAGE = 'Title is required.'

export function validateTaskTitle(title: string): string | null {
  if (typeof title !== 'string' || title.trim().length === 0) {
    return TITLE_REQUIRED_MESSAGE
  }

  return null
}

export function sanitizeTaskDescription(description: string | null | undefined): string {
  return typeof description === 'string' ? description : ''
}
