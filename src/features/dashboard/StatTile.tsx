import type { ReactNode } from 'react'
import { Card } from '@/components/ui'

interface StatTileProps {
  label: string
  value: string
  detail?: ReactNode
  icon: ReactNode
}

export function StatTile({ label, value, detail, icon }: StatTileProps) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted">{label}</p>
        <span className="rounded-lg bg-accent-soft p-2 text-accent" aria-hidden>
          {icon}
        </span>
      </div>
      <p className="tabular mt-2 text-3xl font-bold tracking-tight">{value}</p>
      {detail && <p className="mt-1 text-sm text-muted">{detail}</p>}
    </Card>
  )
}
