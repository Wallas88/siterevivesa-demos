/*
 * LanguageSwitch.tsx — the EN / AF pill: two buttons, the chosen one
 * pressed, each named in its own language. Used in the shop header and
 * the admin bar, so a phone in the admin view can switch too.
 */
import type { Language } from '../features/catalogue/products.ts'

interface LanguageSwitchProps {
  language: Language
  onChoose: (language: Language) => void
}

export function LanguageSwitch({ language, onChoose }: LanguageSwitchProps) {
  function chooseEnglish(): void {
    onChoose('en')
  }

  function chooseAfrikaans(): void {
    onChoose('af')
  }

  return (
    <div className="language-switch" role="group" aria-label="Language / Taal">
      <button type="button" className="language-option" lang="en" aria-label="English" aria-pressed={language === 'en'} onClick={chooseEnglish}>
        EN
      </button>
      <button type="button" className="language-option" lang="af" aria-label="Afrikaans" aria-pressed={language === 'af'} onClick={chooseAfrikaans}>
        AF
      </button>
    </div>
  )
}
