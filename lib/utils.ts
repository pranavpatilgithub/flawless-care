import { format, formatDistance, differenceInYears } from 'date-fns'

export function formatDate(date: string | Date, formatStr: string = 'PPP'): string {
  return format(new Date(date), formatStr)
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'PPP p')
}

export function getTimeAgo(date: string | Date): string {
  return formatDistance(new Date(date), new Date(), { addSuffix: true })
}

export function calculateAge(dateOfBirth: string): number {
  return differenceInYears(new Date(), new Date(dateOfBirth))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getPatientNumber(): string {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `PAT${timestamp}${random}`
}

export function getNextTokenNumber(existingTokens: number[]): number {
  if (existingTokens.length === 0) return 1
  return Math.max(...existingTokens) + 1
}

export function calculateWaitTime(checkInTime: string): number {
  const diff = new Date().getTime() - new Date(checkInTime).getTime()
  return Math.floor(diff / (1000 * 60)) // minutes
}

export function getBedOccupancyRate(occupied: number, total: number): number {
  if (total === 0) return 0
  return Math.round((occupied / total) * 100)
}

export function getStockStatus(current: number, minimum: number): 'healthy' | 'low' | 'critical' {
  if (current >= minimum * 2) return 'healthy'
  if (current >= minimum) return 'low'
  return 'critical'
}

export function isExpiringSoon(expiryDate: string, alertDays: number = 30): boolean {
  const diff = new Date(expiryDate).getTime() - new Date().getTime()
  const daysUntilExpiry = Math.floor(diff / (1000 * 60 * 60 * 24))
  return daysUntilExpiry <= alertDays && daysUntilExpiry >= 0
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
