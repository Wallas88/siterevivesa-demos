/*
 * Toast.tsx — the short message after Add to order, fixed at the bottom
 * of the screen, never taking taps. Outside the shop's size container, so
 * "bottom of the screen" means the screen.
 */

interface ToastProps {
  message: string
}

export function Toast({ message }: ToastProps) {
  return (
    <div className="toast" role="status">
      {message}
    </div>
  )
}
