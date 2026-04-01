// src/modules/search.js
const SERVER = 'https://bookshelves-server.onrender.com'

export async function searchBooks(query, ttbKey) {
  if (!query.trim()) return []
  try {
    const url = `${SERVER}/api/search?q=${encodeURIComponent(query)}&k=${encodeURIComponent(ttbKey || '')}`
    const res = await fetch(url)
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}
