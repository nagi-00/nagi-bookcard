// src/modules/search.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchBooks } from './search.js'

const SERVER = 'https://bookshelves-server.onrender.com'

describe('searchBooks', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('calls correct endpoint and returns books', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { title: '채식주의자', author: '한강', cover: 'http://img.url', publisher: '창비', genre: '소설' }
      ]
    })

    const results = await searchBooks('채식주의자')
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(`${SERVER}/api/search`)
    )
    expect(results).toHaveLength(1)
    expect(results[0].title).toBe('채식주의자')
  })

  it('returns empty array on fetch error', async () => {
    fetch.mockRejectedValueOnce(new Error('network error'))
    const results = await searchBooks('test')
    expect(results).toEqual([])
  })

  it('returns empty array on non-ok response', async () => {
    fetch.mockResolvedValueOnce({ ok: false })
    const results = await searchBooks('test')
    expect(results).toEqual([])
  })
})
