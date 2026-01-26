import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ErrorBoundary from './ErrorBoundary'

// Controlled component that throws based on external flag
let shouldThrow = true
function ThrowingComponent() {
  if (shouldThrow) {
    throw new Error('Test render error')
  }
  return <div>Content rendered successfully</div>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    shouldThrow = true
    // Suppress console.error for intentional test errors
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Normal content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Normal content')).toBeInTheDocument()
  })

  it('catches render errors and shows fallback', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('shows Try Again button that resets error state', () => {
    shouldThrow = true
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    // Stop throwing before clicking Try Again
    shouldThrow = false

    // Click try again - now the child will render successfully
    fireEvent.click(screen.getByText('Try Again'))

    expect(screen.getByText('Content rendered successfully')).toBeInTheDocument()
  })

  it('calls onReset prop when Try Again clicked', () => {
    const onReset = vi.fn()

    render(
      <ErrorBoundary onReset={onReset}>
        <ThrowingComponent />
      </ErrorBoundary>
    )

    fireEvent.click(screen.getByText('Try Again'))
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('shows Reload Page button', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Reload Page')).toBeInTheDocument()
  })
})
