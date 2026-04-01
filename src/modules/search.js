// src/modules/search.js
const SERVER = 'https://bookshelves-server.onrender.com'

export async function searchBooks(query) {
  if (!query.trim()) return []
  try {
    const res = await fetch(`${SERVER}/api/search?q=${encodeURIComponent(query)}`)
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}
