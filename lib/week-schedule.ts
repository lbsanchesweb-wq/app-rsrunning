import type { Workout } from '@/lib/supabase'

export const WEEKDAY_LABELS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'] as const

function localDate(isoDate: string) {
  return new Date(`${isoDate}T12:00:00`)
}

export function isoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function weekDates(dateStart: string) {
  const start = localDate(dateStart)
  return WEEKDAY_LABELS.map((label, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return { date: isoDate(date), label, shortLabel: label.slice(0, 3), day: date.getDate(), month: date.getMonth() + 1 }
  })
}

export function dateForSuggestedDay(dateStart: string, suggestedDay?: string | null) {
  if (!suggestedDay) return null
  const normalized = suggestedDay.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const index = WEEKDAY_LABELS.findIndex((label) => normalized.startsWith(label.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().slice(0, 3)))
  return index >= 0 ? weekDates(dateStart)[index].date : null
}

export function scheduleWorkoutSort(a: Workout, b: Workout) {
  if (a.scheduled_date && b.scheduled_date && a.scheduled_date !== b.scheduled_date) return a.scheduled_date.localeCompare(b.scheduled_date)
  if (a.scheduled_date && !b.scheduled_date) return -1
  if (!a.scheduled_date && b.scheduled_date) return 1
  return (a.scheduled_order || a.order_num) - (b.scheduled_order || b.order_num)
}
