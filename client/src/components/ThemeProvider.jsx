import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const defaultThemes = {
  active: 'emerald',
  available: [
    {
      id: 'royal-gold', name: 'سلطنتی طلایی',
      colors: {
        primary: '#D4AF37', primaryDark: '#8B6914', primaryLight: '#F0D060',
        background: '#0A0A0F', surface: '#1a1a1a', surfaceLight: '#222',
        text: '#F5E6C8', textSecondary: '#A89880', border: 'rgba(212,175,55,0.2)',
        cardBg: 'rgba(255,255,255,0.03)', success: '#66BB6A', error: '#EF5350',
      },
    },
    {
      id: 'light', name: 'سفید سبز آجری',
      colors: {
        primary: '#4CAF50', primaryDark: '#388E3C', primaryLight: '#C85A17',
        background: '#FFFFFF', surface: '#F8F8F5', surfaceLight: '#F0F0EA',
        text: '#2D2D2D', textSecondary: '#6B6B6B', border: 'rgba(76,175,80,0.2)',
        cardBg: 'rgba(0,0,0,0.02)', success: '#66BB6A', error: '#F44336',
      },
    },
    {
      id: 'purple-gold', name: 'بنفش طلایی',
      colors: {
        primary: '#C9A84C', primaryDark: '#9B59B6', primaryLight: '#D4AF37',
        background: '#1A1A2E', surface: '#16213E', surfaceLight: '#0F3460',
        text: '#F5E6C8', textSecondary: '#B8A9C4', border: 'rgba(201,168,76,0.25)',
        cardBg: 'rgba(255,255,255,0.03)', success: '#66BB6A', error: '#EF5350',
      },
    },
    {
      id: 'emerald', name: 'سبز و آجری',
      colors: {
        primary: '#4CAF50', primaryDark: '#388E3C', primaryLight: '#C85A17',
        background: '#F5F0E8', surface: '#FFFFFF', surfaceLight: '#FCFAF5',
        text: '#2D2D2D', textSecondary: '#6B6B6B', border: 'rgba(0,0,0,0.08)',
        cardBg: 'rgba(0,0,0,0.02)', success: '#66BB6A', error: '#EF5350',
      },
    },
  ],
}

function applyTheme(theme) {
  if (!theme?.colors) return
  const root = document.documentElement
  const c = theme.colors
  root.style.setProperty('--theme-primary', c.primary)
  root.style.setProperty('--theme-primary-dark', c.primaryDark)
  root.style.setProperty('--theme-primary-light', c.primaryLight)
  root.style.setProperty('--theme-bg', c.background)
  root.style.setProperty('--theme-surface', c.surface)
  root.style.setProperty('--theme-surface-light', c.surfaceLight)
  root.style.setProperty('--theme-text', c.text)
  root.style.setProperty('--theme-text-secondary', c.textSecondary)
  root.style.setProperty('--theme-border', c.border)
  root.style.setProperty('--theme-card-bg', c.cardBg)
  root.style.setProperty('--theme-success', c.success)
  root.style.setProperty('--theme-error', c.error)
  // sync legacy color vars
  root.style.setProperty('--gold', c.primary)
  root.style.setProperty('--gold-dark', c.primaryDark)
  root.style.setProperty('--gold-light', c.primaryLight)
  root.style.setProperty('--gold-bright', c.primaryLight)
  root.style.setProperty('--gold-gradient', `linear-gradient(135deg, ${c.primaryDark}, ${c.primary}, ${c.primaryLight}, ${c.primary}, ${c.primaryDark})`)
  root.style.setProperty('--shadow-gold', `0 0 30px ${c.primary}4D`)
  root.style.setProperty('--shadow-gold-strong', `0 0 60px ${c.primary}66`)
  root.style.setProperty('--glass-border', `1px solid ${c.primary}26`)
  root.style.setProperty('--text-primary', c.text)
  root.style.setProperty('--text-secondary', c.textSecondary)
  root.style.setProperty('--text-muted', c.textSecondary + '99')
  root.style.setProperty('--black-matte', c.background)
  root.style.setProperty('--black-soft', c.surface)
  root.style.setProperty('--black-lighter', c.surfaceLight)
  root.style.setProperty('--cream', c.text)
  root.style.setProperty('--cream-light', c.text)
  root.style.setProperty('--cream-dark', c.textSecondary)
  root.style.setProperty('--white-soft', c.textSecondary)
  root.style.setProperty('--glass-bg', `${c.background}B3`)
  root.style.setProperty('--brown-dark', c.primaryDark)
  root.style.setProperty('--brown-medium', c.primaryDark)
  // set body bg
  document.body.style.backgroundColor = c.background
  // dynamic style override for page backgrounds
  let styleEl = document.getElementById('theme-dynamic-style')
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = 'theme-dynamic-style'
    document.head.appendChild(styleEl)
  }
  styleEl.textContent = `
    .section-padding { background: ${c.background} !important; }
    .page-bg { background: ${c.background} !important; }
    .section-title { color: ${c.text} !important; }
    .section-subtitle { color: ${c.textSecondary} !important; }
    body { background-color: ${c.background} !important; color: ${c.text} !important; }
    a { color: inherit; }
    ::-webkit-scrollbar-track { background: ${c.background} !important; }
    ::selection { background: ${c.primary}; color: ${c.background}; }
  `
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [themeData, setThemeData] = useState(defaultThemes)

  useEffect(() => {
    axios.get('/api/admin/settings').then(({ data }) => {
      if (data.themes) {
        const themes = data.themes
        const hasEmerald = (themes.available || []).some(t => t.id === 'emerald')
        if (!hasEmerald) {
          themes.available = [defaultThemes.available[3], ...(themes.available || [])]
        }
        if (!themes.active) themes.active = 'emerald'
        setThemeData(themes)
      }
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const active = themeData.available.find(t => t.id === themeData.active)
    if (active) applyTheme(active)
  }, [themeData.active, themeData.available])

  const activeTheme = themeData.available.find(t => t.id === themeData.active) || themeData.available.find(t => t.id === 'emerald') || themeData.available[0]
  const colors = activeTheme?.colors || defaultThemes.available[0].colors

  const setTheme = useCallback((themeId) => {
    setThemeData(prev => ({ ...prev, active: themeId }))
    const token = localStorage.getItem('adminToken')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    axios.get('/api/admin/settings').then(({ data }) => {
      axios.put('/api/admin/settings', { ...data, themes: { ...(data.themes || themeData), active: themeId } }, { headers }).catch(() => {})
    }).catch(() => {
      axios.put('/api/admin/settings', { themes: { ...themeData, active: themeId } }, { headers }).catch(() => {})
    })
  }, [themeData])

  const applyThemeById = useCallback((themeId, themeDataSource) => {
    const data = themeDataSource || themeData
    const t = data.available.find(tm => tm.id === themeId)
    if (t) applyTheme(t)
  }, [themeData])

  return (
    <ThemeContext.Provider value={{ colors, themeData, setTheme, activeTheme, applyThemeById }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) return { colors: defaultThemes.available[0].colors, themeData: defaultThemes, setTheme: () => {}, activeTheme: defaultThemes.available[0], applyThemeById: () => {} }
  return ctx
}

export default ThemeContext