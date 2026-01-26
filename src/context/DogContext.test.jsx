import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider } from './AuthContext'
import { DogProvider, useDog } from './DogContext'
import { seedAuthState, TEST_USER } from '../test/test-utils'

function wrapper({ children }) {
  return (
    <AuthProvider>
      <DogProvider>{children}</DogProvider>
    </AuthProvider>
  )
}

describe('DogContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with empty dogs when no user', async () => {
    const { result } = renderHook(() => useDog(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.dogs).toEqual([])
    expect(result.current.activeDog).toBeNull()
  })

  it('addDog creates dog with UUID and timestamps', async () => {
    seedAuthState()
    const { result } = renderHook(() => useDog(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let newDog
    act(() => {
      newDog = result.current.addDog({
        name: 'Buddy',
        breed: 'Golden Retriever',
        age: '3 years',
      })
    })

    expect(newDog).toMatchObject({
      name: 'Buddy',
      breed: 'Golden Retriever',
    })
    expect(newDog.id).toBeDefined()
    expect(newDog.createdAt).toBeDefined()
    expect(newDog.updatedAt).toBeDefined()
    expect(newDog.userId).toBe(TEST_USER.id)

    expect(result.current.dogs).toHaveLength(1)
    expect(result.current.activeDogId).toBe(newDog.id)
  })

  it('addDog returns null when no user is logged in', async () => {
    const { result } = renderHook(() => useDog(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let newDog
    act(() => {
      newDog = result.current.addDog({ name: 'Buddy' })
    })

    expect(newDog).toBeNull()
  })

  it('updateDog merges updates', async () => {
    seedAuthState()
    const { result } = renderHook(() => useDog(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let dogId
    act(() => {
      const dog = result.current.addDog({ name: 'Buddy', breed: 'Lab' })
      dogId = dog.id
    })

    act(() => {
      result.current.updateDog(dogId, { breed: 'Golden Retriever', weight: '65' })
    })

    const updated = result.current.dogs.find(d => d.id === dogId)
    expect(updated.name).toBe('Buddy')
    expect(updated.breed).toBe('Golden Retriever')
    expect(updated.weight).toBe('65')
    expect(updated.updatedAt).toBeDefined()
  })

  it('deleteDog removes dog and resets activeDogId', async () => {
    seedAuthState()
    const { result } = renderHook(() => useDog(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let dog2Id
    act(() => {
      result.current.addDog({ name: 'Buddy' })
    })
    act(() => {
      const d2 = result.current.addDog({ name: 'Max' })
      dog2Id = d2.id
    })

    // Active should be the last added (dog2)
    expect(result.current.activeDogId).toBe(dog2Id)

    act(() => {
      result.current.deleteDog(dog2Id)
    })

    expect(result.current.dogs).toHaveLength(1)
    expect(result.current.activeDogId).toBeNull()
  })

  it('getActiveDog falls back to first dog', async () => {
    seedAuthState()
    const { result } = renderHook(() => useDog(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.addDog({ name: 'Buddy' })
    })
    act(() => {
      result.current.addDog({ name: 'Max' })
    })

    // Set activeDogId to null
    act(() => {
      result.current.setActiveDog(null)
    })

    // getActiveDog should fall back to first dog
    expect(result.current.activeDog.name).toBe('Buddy')
  })

  it('persists dogs to localStorage', async () => {
    seedAuthState()
    const { result } = renderHook(() => useDog(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.addDog({ name: 'Buddy' })
    })

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem(`pawsy_${TEST_USER.id}_dogs`))
      expect(stored).toHaveLength(1)
      expect(stored[0].name).toBe('Buddy')
    })
  })

  it('loads dogs from localStorage on mount', async () => {
    seedAuthState()
    const dogs = [
      { id: 'dog-1', name: 'Buddy', userId: TEST_USER.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ]
    localStorage.setItem(`pawsy_${TEST_USER.id}_dogs`, JSON.stringify(dogs))
    localStorage.setItem(`pawsy_${TEST_USER.id}_active_dog`, 'dog-1')

    const { result } = renderHook(() => useDog(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.dogs).toHaveLength(1)
    expect(result.current.dogs[0].name).toBe('Buddy')
    expect(result.current.activeDogId).toBe('dog-1')
  })
})
