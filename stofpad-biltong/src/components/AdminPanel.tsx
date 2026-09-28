/*
 * AdminPanel.tsx — Stofpad's phone admin in the shared admin frame (with
 * the language switch in its bar): add a product, the product list with
 * prices and stock, specials and events, opening hours, and who can sign
 * in (after the first setup, which makes the person signing in the owner). Everything
 * goes through the demo's actions; the frame says it is busy until the
 * visitor's store has opened.
 */
import { AdminFrame } from '../../../_core/shell/AdminFrame.tsx'
import { AdminSection } from '../../../_core/shell/AdminSection.tsx'
import { SpecialEditor } from '../../../_core/specials/SpecialEditor.tsx'
import { HoursEditor } from '../../../_core/hours/HoursEditor.tsx'
import { ERROR_MESSAGES } from '../../shared/error-codes.ts'
import type { Words } from '../content/words.ts'
import type { Language } from '../features/catalogue/products.ts'
import type { Demo } from '../features/demo/use-demo.ts'
import { TeamSetup } from '../../../_core/team/TeamSetup.tsx'
import { TeamEditor } from '../../../_core/team/TeamEditor.tsx'
import { DEMO_OWNER_EMAIL, TEAM_DOMAIN } from '../content/business.ts'
import { LanguageSwitch } from './LanguageSwitch.tsx'
import { ProductForm } from './ProductForm.tsx'
import { ProductList } from './ProductList.tsx'

interface AdminPanelProps {
  demo: Demo
  today: string
  language: Language
  words: Words
  onChooseLanguage: (language: Language) => void
  onShowNewProduct: () => void
  onSignOut: () => void
}

export function AdminPanel({ demo, today, language, words, onChooseLanguage, onShowNewProduct, onSignOut }: AdminPanelProps) {
  const notice = demo.notice == null ? null : ERROR_MESSAGES[language][demo.notice]
  const languageSwitch = <LanguageSwitch language={language} onChoose={onChooseLanguage} />
  const team = demo.data.team
  const setup = team == null ? <TeamSetup ownerEmail={DEMO_OWNER_EMAIL} words={words.team} onSetUp={demo.actions.setUpTeam} /> : null
  return (
    <AdminFrame words={words.frame} ready={demo.ready} notice={notice} onReset={demo.actions.resetDemo} onSignOut={onSignOut} barExtra={languageSwitch} setup={setup}>
      <AdminSection id="admin-add" title={words.admin.addTitle}>
        <ProductForm addProduct={demo.actions.addProduct} disabled={!demo.ready} language={language} words={words} onShowNew={onShowNewProduct} />
      </AdminSection>
      <AdminSection id="admin-products" title={words.admin.listTitle}>
        <ProductList key={demo.resetCount} products={demo.data.products} language={language} words={words} photoUrls={demo.photoUrls} actions={demo.actions} />
      </AdminSection>
      <AdminSection id="admin-specials" title={words.admin.specialsTitle}>
        <SpecialEditor specials={demo.data.specials} today={today} language={language} words={words.specials} actions={demo.actions} disabled={!demo.ready} />
      </AdminSection>
      <AdminSection id="admin-hours" title={words.admin.hoursTitle}>
        <HoursEditor key={`${demo.resetCount}-${language}`} hours={demo.data.hours} actions={demo.actions} words={words.hours} />
      </AdminSection>
      <AdminSection id="admin-team" title={words.admin.teamTitle}>
        <TeamEditor team={team ?? []} signedInEmail={DEMO_OWNER_EMAIL} domain={TEAM_DOMAIN} words={words.team} actions={demo.actions} />
      </AdminSection>
    </AdminFrame>
  )
}
