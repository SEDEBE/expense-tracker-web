// The product's mark: three bars of different length, the shape of the spending-by-category list.
export function Mark({ className = 'size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect width="24" height="24" rx="6" fill="var(--c-chart)" />
      <rect x="6" y="6.5" width="12" height="2.5" rx="1.25" fill="#fff" />
      <rect x="6" y="10.75" width="8.5" height="2.5" rx="1.25" fill="#fff" />
      <rect x="6" y="15" width="5" height="2.5" rx="1.25" fill="#fff" />
    </svg>
  )
}
