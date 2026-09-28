/*
 * SignInPanel.tsx — the mock of the real admin sign-in: a fixed demo email,
 * "Send code", then the code shown in a labelled demo box and a field to
 * type it. Both steps share one space, sized by the taller, and cross-fade,
 * so "Send code" swapping for the code field moves nothing (Nothing hops).
 * Labelled as a demo; what the real site does differently sits below.
 */
import type { SignIn } from './use-sign-in.ts'
import type { SignInWords } from './sign-in-words.ts'
import { CodeStep } from './CodeStep.tsx'
import { RealSiteDifferences } from './RealSiteDifferences.tsx'

interface SignInPanelProps {
  signIn: SignIn
  words: SignInWords
}

export function SignInPanel({ signIn, words }: SignInPanelProps) {
  const onCodeStep = signIn.state.step === 'code'

  return (
    <div className="sign-in">
      <p className="sign-in-kicker">{words.kicker}</p>
      <h2 className="sign-in-title">{words.title}</h2>
      <label className="field">
        <span className="field-label">{words.emailLabel}</span>
        <input className="field-input" type="email" value={words.demoEmail} readOnly aria-describedby="sign-in-email-note" name="demo-email" />
      </label>
      <p className="sign-in-note" id="sign-in-email-note">
        {words.emailNote}
      </p>
      <div className="sign-in-steps">
        <div className="sign-in-step" data-shown={!onCodeStep} inert={onCodeStep}>
          <button type="button" className="button button-primary" onClick={signIn.sendCode}>
            {words.sendCode}
          </button>
        </div>
        <div className="sign-in-step sign-in-step-code" data-shown={onCodeStep} inert={!onCodeStep}>
          <CodeStep signIn={signIn} active={onCodeStep} words={words} />
        </div>
      </div>
      <p className="sign-in-note" role="status">
        {signIn.notice == null ? '' : words.errors[signIn.notice]}
      </p>
      <RealSiteDifferences title={words.differencesTitle} differences={words.differences} />
    </div>
  )
}
