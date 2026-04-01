// main.js — entry point
import './styles/main.css'
import './styles/card.css'
import { renderCard } from './modules/card.js'
import { setState } from './state.js'
setState({ title: '채식주의자', author: '한강', ratio: '9:16' })
const preview = document.getElementById('preview')
renderCard(preview)
