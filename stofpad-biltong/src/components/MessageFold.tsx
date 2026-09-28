/*
 * MessageFold.tsx — "Review WhatsApp message": a row that opens to show
 * the exact message, easing its height open and closed (grid-template-rows
 * 0fr ↔ 1fr) and pushing only what is below it.
 */
import { useState } from 'react'

interface MessageFoldProps {
  label: string
  message: string
}

export function MessageFold({ label, message }: MessageFoldProps) {
  const [open, setOpen] = useState(false)

  function toggle(): void {
    setOpen(!open)
  }

  return (
    <div className="message-fold" data-open={open}>
      <button type="button" className="message-toggle" aria-expanded={open} aria-controls="order-message" onClick={toggle}>
        {label}
      </button>
      <div className="fold-body">
        <div className="fold-inner" inert={!open}>
          <pre className="order-message" id="order-message">
            {message}
          </pre>
        </div>
      </div>
    </div>
  )
}
