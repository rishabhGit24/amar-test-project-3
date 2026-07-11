/**
 * StatCards.tsx
 * Three-column responsive grid showing Today, Streak, and Total stats.
 * Values animate with a pop when updated after a session completes.
 */

import { useEffect, useRef, useState } from 'react'
import './StatCards.css'
import { type Stats } from '../engine/stats'

// ── Types ──────────────────────────────────────────────────────────────────

interface StatCardsProps {
  stats: Stats
}

interface CardDef {
  key:   keyof Stats
  label: string
  unit:  string
  value: number | string
}

// ── Hook: detect value change for pop animation ────────────────────────────

function usePopOnChange(value: number | string): boolean {
  const [popping, setPopping] = useState(false)
  const prevRef = useRef(value)

  useEffect(() => {
    if (prevRef.current !== value) {
      prevRef.current = value
      setPopping(true)
      const id = setTimeout(() => setPopping(false), 350)
      return () => clearTimeout(id)
    }
  }, [value])

  return popping
}

// ── Sub-component: single card ─────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: number | string
  unit:  string
}

function StatCard({ label, value, unit }: StatCardProps) {
  const isPopping = usePopOnChange(value)

  return (
    <div className="stat-card" aria-label={`${label}: ${value}${unit ? ' ' + unit : ''}`}>
      <span
        className={`stat-card__value${isPopping ? ' stat-card__value--updated' : ''}`}
      >
        {value}
        {unit && <span className="stat-card__unit">{unit}</span>}
      </span>
      <span className="stat-card__label">{label}</span>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export function StatCards({ stats }: StatCardsProps) {
  const cards: CardDef[] = [
    {
      key:   'todayCount',
      label: 'Today',
      unit:  stats.todayCount === 1 ? 'session' : 'sessions',
      value: stats.todayCount,
    },
    {
      key:   'streak',
      label: 'Streak',
      unit:  stats.streak === 1 ? 'day' : 'days',
      value: stats.streak,
    },
    {
      key:   'totalMinutes',
      label: 'Total',
      unit:  'min',
      value: stats.totalMinutes,
    },
  ]

  return (
    <div
      className="stat-cards"
      role="region"
      aria-label="Session statistics"
    >
      {cards.map(card => (
        <StatCard
          key={card.key}
          label={card.label}
          value={card.value}
          unit={card.unit}
        />
      ))}
    </div>
  )
}
