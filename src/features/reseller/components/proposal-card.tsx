import { Check } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface ProposalCardProps {
  icon: React.ReactNode
  title: string
  description: string
  items: string[]
  featured?: boolean
}

export function ProposalCard({
  icon,
  title,
  description,
  items,
  featured = false,
}: ProposalCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border p-6',
        featured
          ? 'border-accent bg-accent-muted'
          : 'border-border bg-surface'
      )}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <ul className="mt-4 space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
