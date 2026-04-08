/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'

// Mock TanStack Router for isolated testing of error components
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    Link: ({ children, to, className }: { children: React.ReactNode; to: string; className?: string }) => (
      <a href={to} className={className}>
        {children}
      </a>
    ),
  }
})

// Import after mock
import { NotFoundPage, ErrorPage } from './__root'

describe('NotFoundPage', () => {
  beforeEach(() => {
    cleanup()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders 404 heading', () => {
    render(<NotFoundPage />)
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('renders "Page not found" message', () => {
    render(<NotFoundPage />)
    expect(screen.getByText('Page not found')).toBeInTheDocument()
  })

  it('renders descriptive message about the missing page', () => {
    render(<NotFoundPage />)
    expect(screen.getByText(/doesn't exist/i)).toBeInTheDocument()
  })

  it('renders a link to go home', () => {
    render(<NotFoundPage />)
    const homeLink = screen.getByRole('link', { name: /go home/i })
    expect(homeLink).toBeInTheDocument()
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('does not show error stack traces', () => {
    const { container } = render(<NotFoundPage />)
    // Should not contain any elements that look like stack traces
    const textContent = container.textContent ?? ''
    expect(textContent).not.toMatch(/error/i)
    expect(textContent).not.toMatch(/stack/i)
    expect(textContent).not.toMatch(/at \w+/)
  })
})

describe('ErrorPage', () => {
  beforeEach(() => {
    cleanup()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders "Oops!" heading for generic errors', () => {
    const error = new Error('Something broke')
    render(<ErrorPage error={error} />)
    expect(screen.getByText('Oops!')).toBeInTheDocument()
  })

  it('renders "Something went wrong" message', () => {
    const error = new Error('Something broke')
    render(<ErrorPage error={error} />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders a link to go home', () => {
    const error = new Error('Something broke')
    render(<ErrorPage error={error} />)
    const homeLink = screen.getByRole('link', { name: /go home/i })
    expect(homeLink).toBeInTheDocument()
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('does not expose error message to the user', () => {
    const error = new Error('Secret internal error: database connection failed')
    const { container } = render(<ErrorPage error={error} />)
    const textContent = container.textContent ?? ''
    expect(textContent).not.toContain('Secret internal error')
    expect(textContent).not.toContain('database connection failed')
  })

  it('does not show stack traces', () => {
    const error = new Error('Test error')
    error.stack = 'Error: Test error\n    at Object.<anonymous> (test.ts:1:1)\n    at processTicksAndRejections (internal/process/task_queues.js:95:5)'
    const { container } = render(<ErrorPage error={error} />)
    const textContent = container.textContent ?? ''
    expect(textContent).not.toMatch(/at Object\.<anonymous>/)
    expect(textContent).not.toMatch(/at processTicksAndRejections/)
  })

  it('renders 404 page for NotFound errors', () => {
    const error = new Error('NotFound')
    render(<ErrorPage error={error} />)
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('Page not found')).toBeInTheDocument()
  })

  it('renders 404 page for errors containing "NotFound" in message', () => {
    const error = new Error('Invariant failed: NotFound route')
    render(<ErrorPage error={error} />)
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('has accessible structure with descriptive text', () => {
    const error = new Error('Test error')
    render(<ErrorPage error={error} />)
    // Should have headings and readable text
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
  })
})
