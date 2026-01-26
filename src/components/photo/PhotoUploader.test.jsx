import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'

vi.mock('framer-motion', async () => {
  return await import('../../test/mocks/framer-motion.jsx')
})

import PhotoUploader from './PhotoUploader'

describe('PhotoUploader', () => {
  const onPhotoSelect = vi.fn()
  const onClear = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders upload interface when no photo selected', () => {
    render(
      <PhotoUploader onPhotoSelect={onPhotoSelect} selectedPhoto={null} onClear={onClear} />
    )

    expect(screen.getByText('Upload a Photo')).toBeInTheDocument()
    expect(screen.getByText('Choose Photo')).toBeInTheDocument()
    expect(screen.getByText(/Max 10MB/)).toBeInTheDocument()
  })

  it('shows preview when photo is selected', () => {
    const photo = {
      file: new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
      preview: 'data:image/jpeg;base64,abc123',
      base64Data: 'abc123',
      mimeType: 'image/jpeg',
    }

    render(
      <PhotoUploader onPhotoSelect={onPhotoSelect} selectedPhoto={photo} onClear={onClear} />
    )

    expect(screen.getByAltText('Photo uploaded for health analysis')).toBeInTheDocument()
    expect(screen.getByLabelText('Remove photo')).toBeInTheDocument()
  })

  it('calls onClear when remove button clicked', async () => {
    const photo = {
      file: new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
      preview: 'data:image/jpeg;base64,abc123',
      base64Data: 'abc123',
      mimeType: 'image/jpeg',
    }

    render(
      <PhotoUploader onPhotoSelect={onPhotoSelect} selectedPhoto={photo} onClear={onClear} />
    )

    fireEvent.click(screen.getByLabelText('Remove photo'))
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('rejects files over 10MB', async () => {
    render(
      <PhotoUploader onPhotoSelect={onPhotoSelect} selectedPhoto={null} onClear={onClear} />
    )

    const input = document.querySelector('input[type="file"]')
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })

    fireEvent.change(input, { target: { files: [largeFile] } })

    await waitFor(() => {
      expect(screen.getByText(/too large/i)).toBeInTheDocument()
    })

    expect(onPhotoSelect).not.toHaveBeenCalled()
  })

  it('processes valid file and calls onPhotoSelect', async () => {
    render(
      <PhotoUploader onPhotoSelect={onPhotoSelect} selectedPhoto={null} onClear={onClear} />
    )

    const input = document.querySelector('input[type="file"]')
    const file = new File(['test-image-data'], 'photo.jpg', { type: 'image/jpeg' })

    // Mock FileReader with a class-based approach
    const originalFileReader = window.FileReader
    const mockResult = 'data:image/jpeg;base64,dGVzdC1pbWFnZS1kYXRh'
    window.FileReader = class {
      readAsDataURL() {
        setTimeout(() => {
          this.onload({ target: { result: mockResult } })
        }, 0)
      }
    }

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(onPhotoSelect).toHaveBeenCalledWith({
        file,
        preview: mockResult,
        base64Data: 'dGVzdC1pbWFnZS1kYXRh',
        mimeType: 'image/jpeg',
      })
    })

    window.FileReader = originalFileReader
  })

  it('shows drag overlay on dragOver', () => {
    const { container } = render(
      <PhotoUploader onPhotoSelect={onPhotoSelect} selectedPhoto={null} onClear={onClear} />
    )

    // The outer motion.div (rendered as plain div) has onDragOver/onDragLeave/onDrop
    const dropZone = container.firstChild

    fireEvent.dragOver(dropZone)
    expect(screen.getByText('Drop photo here')).toBeInTheDocument()
  })

  it('hides drag overlay on dragLeave', () => {
    const { container } = render(
      <PhotoUploader onPhotoSelect={onPhotoSelect} selectedPhoto={null} onClear={onClear} />
    )

    const dropZone = container.firstChild

    // Enter drag state
    act(() => {
      fireEvent.dragOver(dropZone)
    })
    expect(screen.getByText('Drop photo here')).toBeInTheDocument()

    // Leave drag state
    act(() => {
      fireEvent.dragLeave(dropZone)
    })
    expect(screen.queryByText('Drop photo here')).not.toBeInTheDocument()
  })
})
