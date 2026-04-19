// state.js — central state module
export const state = {
  // 책 데이터 (샘플 기본값)
  title: 'The Little Prince',
  author: 'Antoine de Saint-Exupéry',
  date: new Date(),

  // 선택 요소
  quote: 'What is essential is invisible to the eye.',
  quoteEnabled: true,
  rating: 4,
  ratingEnabled: true,

  // 비주얼
  cardRatio: '9:16',     // 글래스 카드 비율
  cardOffsetX: 0,        // 카드 그룹 x 오프셋 (드래그)
  cardOffsetY: 0,        // 카드 그룹 y 오프셋 (드래그)
  cardScale: 1.0,        // 카드 그룹 스케일 (스크롤)
  textColorHex: '#2C2825',
  glassBlur: 14,
  font: 'modern',
  customFont: '',

  // 배경
  bgPreset: 'beige',
  bgColor: '#F0EBE3',

  // 책 정보
  publisher: '',
  pages: '',
  description: '',

  // 도서 표지 목록 { id, src, x, y, scale }
  books: [],
  nextBookId: 0,

  // 날짜 표시 여부
  dateEnabled: true,

  // 도서 그림자 강도
  bookShadow: 1,

  // 액센트 컬러
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
