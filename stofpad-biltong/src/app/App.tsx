/*
 * App.tsx — Stofpad's demo: the shop and its phone admin in the shared
 * shell, fed by one useDemo() so an admin change shows in the shop and in
 * the WhatsApp message at once. The admin sits behind the mock sign-in;
 * the shop stays public. One language choice covers both.
 */
import { useView } from '../../../_core/view/use-view.ts'
import { useSignIn } from '../../../_core/sign-in/use-sign-in.ts'
import { useToday } from '../../../_core/specials/use-today.ts'
import { DemoShell } from '../../../_core/shell/DemoShell.tsx'
import { SignInPanel } from '../../../_core/sign-in/SignInPanel.tsx'
import { SHOP_WORDS } from '../content/i18n.ts'
import { WORDS } from '../content/words.ts'
import { SIGNED_IN_KEY } from '../content/business.ts'
import { useDemo } from '../features/demo/use-demo.ts'
import { useLanguage } from '../features/language/use-language.ts'
import { useShop } from '../features/shop/use-shop.ts'
import { ShopView } from '../components/ShopView.tsx'
import { Toast } from '../components/Toast.tsx'
import { AdminPanel } from '../components/AdminPanel.tsx'

const PRODUCTS_SECTION_ID = 'products'

export function App() {
  const today = useToday()
  const demo = useDemo(today)
  const view = useView()
  const signIn = useSignIn(SIGNED_IN_KEY)
  const language = useLanguage()
  const shop = useShop(demo.data.products, language)
  const words = WORDS[language.language]

  function showNewProduct(): void {
    view.showOnSite(PRODUCTS_SECTION_ID)
  }

  const shopProps = { data: demo.data, photoUrls: demo.photoUrls, today, language: language.language, t: SHOP_WORDS[language.language], words, order: shop.order, selections: shop.selections }
  const site = (
    <>
      <ShopView {...shopProps} onChooseLanguage={shop.chooseLanguage} onAdd={shop.addToOrder} />
      <Toast message={shop.toastMessage} />
    </>
  )
  const admin = signIn.signedIn ? (
    <AdminPanel demo={demo} today={today} language={language.language} words={words} onChooseLanguage={shop.chooseLanguage} onShowNewProduct={showNewProduct} onSignOut={signIn.signOut} />
  ) : (
    <SignInPanel signIn={signIn} words={words.signIn} />
  )
  return <DemoShell view={view.current} onChooseView={view.choose} viewWords={words.view} site={site} admin={admin} />
}
