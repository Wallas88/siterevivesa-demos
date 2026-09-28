/*
 * use-demo-enquiry.ts — the website's enquiry form, which sends nothing
 * (demo rule: no demo contacts anyone). Submitting only says so; what was
 * typed is not stored or sent anywhere.
 */
import { useState } from 'react'
import type { FormEvent } from 'react'

export interface DemoEnquiry {
  answered: boolean
  submit: (event: FormEvent<HTMLFormElement>) => void
}

export function useDemoEnquiry(): DemoEnquiry {
  const [answered, setAnswered] = useState(false)
  return { answered, submit }

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    setAnswered(true)
  }
}
