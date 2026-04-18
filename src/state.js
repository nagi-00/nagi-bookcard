// state.js — central state module
export const state = {
  // 책 데이터
  title: '',
  author: '',
  date: new Date(),

  // 선택 요소
  quote: '',
  quoteEnabled: true,
  rating: 0,
  ratingEnabled: true,

  // 비주얼
  ratio: '9:16',      // '9:16' | '3:4' | '1:1' | '4:3' | '16:9'
  theme: 'light',     // 'light' | 'dark'
  font: 'modern',     // 'modern' | 'literary' | 'soft' | 'custom'
  customFont: '',     // 사용자 로컬 폰트 이름

  // 배경
  bgPreset: 'beige',  // 'white' | 'beige' | 'gray' | 'black' | 'custom' | 'image'
  bgColor: '#F0EBE3',
  bgImage: null,      // base64 | null

  // 책 정보 추가
  publisher: '',
  pages: '',
  description: '',  // TTB 줄거리 (synopsis 버튼용)

  // 도서 표지 목록 { id, src, x, y, scale }
  books: [],
  nextBookId: 0,

  // 액센트 컬러 (스포이드/picker로 선택한 값)
  accentColor: '#8FAF8E',

  // 파생 컬러 (colorSystem이 채움)
  colors: {
    bg: '#F0EBE3',
    glass: 'rgba(245,241,235,0.60)',
    text: '#2C2825',
    textSub: '#8C8680',
    accent: '#8FAF8E',
    sub: '#CCDBC5',
  },
}

const listeners = new Set()

export function setState(partial) {
  Object.assign(state, partial)
  listeners.forEach(fn => fn(state))
}

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
