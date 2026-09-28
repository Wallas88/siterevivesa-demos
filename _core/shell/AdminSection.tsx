/*
 * AdminSection.tsx — one titled section of a phone admin, labelled by its
 * heading for screen readers.
 */
import type { ReactNode } from 'react'

interface AdminSectionProps {
  id: string
  title: string
  children: ReactNode
}

export function AdminSection({ id, title, children }: AdminSectionProps) {
  return (
    <section className="admin-section" id={id} aria-labelledby={`${id}-title`}>
      <h2 className="admin-section-title" id={`${id}-title`}>
        {title}
      </h2>
      {children}
    </section>
  )
}
