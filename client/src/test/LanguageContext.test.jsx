import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, act } from '@testing-library/react'

vi.mock('axios', () => ({
  default: { get: vi.fn(() => Promise.resolve({ data: {} })), put: vi.fn(() => Promise.resolve({ data: {} })) }
}))

import { LanguageProvider, useLanguage } from '../context/LanguageContext'

function TestConsumer() {
  const ctx = useLanguage()
  return (
    <div>
      <span data-testid="lang">{ctx.lang}</span>
      <span data-testid="dir">{ctx.dir}</span>
      <span data-testid="getText">{ctx.getText({ fa: 'فارسی', en: 'English' })}</span>
      <span data-testid="getTextString">{ctx.getText('simple string')}</span>
      <span data-testid="getTextNull">{ctx.getText(null)}</span>
      <span data-testid="getTextUndef">{ctx.getText(undefined)}</span>
      <span data-testid="getTextNum">{ctx.getText(123)}</span>
      <span data-testid="t">{ctx.t('home')}</span>
      <span data-testid="tFallback">{ctx.t('nonexistent')}</span>
    </div>
  )
}

describe('LanguageProvider', () => {
  beforeEach(() => {
    document.documentElement.dir = 'ltr'
    document.documentElement.lang = ''
    try { localStorage.removeItem('lang') } catch {}
  })

  it('renders children', () => {
    render(
      <LanguageProvider>
        <div>child</div>
      </LanguageProvider>
    )
    expect(screen.getByText('child')).toBeDefined()
  })

  it('defaults to fa language', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    )
    expect(screen.getByTestId('lang').textContent).toBe('fa')
  })

  it('sets dir to rtl for fa', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    )
    expect(screen.getByTestId('dir').textContent).toBe('rtl')
  })

  it('getText returns object value for current language', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    )
    expect(screen.getByTestId('getText').textContent).toBe('فارسی')
  })

  it('getText returns string as-is', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    )
    expect(screen.getByTestId('getTextString').textContent).toBe('simple string')
  })

  it('getText returns empty for null', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    )
    expect(screen.getByTestId('getTextNull').textContent).toBe('')
  })

  it('getText returns empty for undefined', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    )
    expect(screen.getByTestId('getTextUndef').textContent).toBe('')
  })

  it('getText returns empty for non-string/non-object', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    )
    expect(screen.getByTestId('getTextNum').textContent).toBe('')
  })

  it('t() returns translation for current language', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    )
    expect(screen.getByTestId('t').textContent).toBe('خانه')
  })

  it('t() returns key itself for nonexistent key', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    )
    expect(screen.getByTestId('tFallback').textContent).toBe('nonexistent')
  })

  it('setLang changes language', () => {
    let langValue
    function LangChanger() {
      const { lang, setLang } = useLanguage()
      langValue = lang
      return <button onClick={() => setLang('en')}>switch</button>
    }
    render(
      <LanguageProvider>
        <LangChanger />
      </LanguageProvider>
    )
    expect(langValue).toBe('fa')
    act(() => {
      screen.getByText('switch').click()
    })
    expect(langValue).toBe('en')
  })

  it('setLang sets document.dir to ltr for en', () => {
    let setLangFn
    function LangChanger() {
      const { setLang } = useLanguage()
      setLangFn = setLang
      return null
    }
    render(
      <LanguageProvider>
        <LangChanger />
      </LanguageProvider>
    )
    setLangFn('en')
    expect(document.documentElement.dir).toBe('ltr')
  })

  it('setLang sets document.dir to rtl for ar', () => {
    let setLangFn
    function LangChanger() {
      const { setLang } = useLanguage()
      setLangFn = setLang
      return null
    }
    render(
      <LanguageProvider>
        <LangChanger />
      </LanguageProvider>
    )
    setLangFn('ar')
    expect(document.documentElement.dir).toBe('rtl')
  })

  it('getText falls back to fa when key missing for current lang', () => {
    function Fallback() {
      const { getText } = useLanguage()
      return <span data-testid="fb">{getText({ en: 'hello' })}</span>
    }
    render(
      <LanguageProvider>
        <Fallback />
      </LanguageProvider>
    )
    expect(screen.getByTestId('fb').textContent).toBe('')
  })

  it('langMap contains fa, en, ar', () => {
    let langMap
    function Collector() {
      const ctx = useLanguage()
      langMap = ctx.langMap
      return null
    }
    render(
      <LanguageProvider>
        <Collector />
      </LanguageProvider>
    )
    expect(langMap.fa).toBe('fa')
    expect(langMap.en).toBe('en')
    expect(langMap.ar).toBe('ar')
  })
})

describe('useLanguage outside provider', () => {
  it('throws error', () => {
    function Bad() {
      useLanguage()
      return null
    }
    expect(() => render(<Bad />)).toThrow('useLanguage must be inside LanguageProvider')
  })
})

describe('normalizeSettings', () => {
  it('converts string field to multi-lang object', () => {
    let result
    function Collector() {
      const { normalizeSettings } = useLanguage()
      result = normalizeSettings({ siteName: 'Deh Neshin', languages: [{ key: 'fa', enabled: true }, { key: 'en', enabled: true }] })
      return null
    }
    render(
      <LanguageProvider>
        <Collector />
      </LanguageProvider>
    )
    expect(result.siteName).toEqual({ fa: 'Deh Neshin', en: '' })
  })

  it('normalizes processes from processSteps', () => {
    let result
    function Collector() {
      const { normalizeSettings } = useLanguage()
      result = normalizeSettings({
        processSteps: [{ number: '1', title: 'Step 1', desc: 'Desc 1', icon: '🔧' }],
        languages: [{ key: 'fa', enabled: true }],
      })
      return null
    }
    render(
      <LanguageProvider>
        <Collector />
      </LanguageProvider>
    )
    expect(result.processes).toHaveLength(1)
    expect(result.processes[0].steps).toHaveLength(1)
    expect(result.processes[0].steps[0].title).toHaveProperty('fa')
  })

  it('normalizes banners array fields', () => {
    let result
    function Collector() {
      const { normalizeSettings } = useLanguage()
      result = normalizeSettings({
        banners: [{ title: 'Banner 1', subtitle: 'Sub 1' }],
        languages: [{ key: 'fa', enabled: true }],
      })
      return null
    }
    render(
      <LanguageProvider>
        <Collector />
      </LanguageProvider>
    )
    expect(result.banners[0].title).toHaveProperty('fa')
    expect(result.banners[0].subtitle).toHaveProperty('fa')
  })

  it('returns null input as null', () => {
    let result
    function Collector() {
      const { normalizeSettings } = useLanguage()
      result = normalizeSettings(null)
      return null
    }
    render(
      <LanguageProvider>
        <Collector />
      </LanguageProvider>
    )
    expect(result).toBeNull()
  })
})
