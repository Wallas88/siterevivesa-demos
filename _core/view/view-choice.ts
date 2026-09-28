/*
 * view-choice.ts — which view a phone shows first: the website, or the
 * admin when the link says ?view=admin (handy to send a lead straight to
 * the panel). Pure; tested in tests/view-choice.test.ts.
 */

export type DemoView = 'site' | 'admin'

const VIEW_PARAM = 'view'
const ADMIN_VALUE = 'admin'

export function viewFromSearch(search: string): DemoView {
  return new URLSearchParams(search).get(VIEW_PARAM) === ADMIN_VALUE ? 'admin' : 'site'
}

// The query string for a view, keeping any other parameters; the website is the default and needs none.
export function searchForView(search: string, view: DemoView): string {
  const params = new URLSearchParams(search)
  if (view === 'admin') params.set(VIEW_PARAM, ADMIN_VALUE)
  else params.delete(VIEW_PARAM)
  const text = params.toString()
  return text === '' ? '' : `?${text}`
}
