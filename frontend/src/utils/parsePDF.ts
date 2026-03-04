/**
 * PDF parsing utilities - calls backend API
 */

import type { ParsedBill } from '@/types/bill.types'

// Use empty string (relative URL) in production, localhost in development
// In production, '' means same domain (e.g., /api/extract on https://split-bill-vmet8g.fly.dev)
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '')

interface BackendResponse {
  total_amount: number
  line_count: number
  lines: {
    phone_number: string
    line_name: string
    amount_owed: number
  }[]
}

export async function parsePDF(file: File): Promise<ParsedBill> {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await fetch(`${API_URL}/api/extract`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `Server error: ${response.status}`)
    }

    const data: BackendResponse = await response.json()

    // Transform backend response to frontend format
    const parsedBill: ParsedBill = {
      lines: data.lines.map(line => ({
        lineNumber: line.phone_number,
        lineName: line.line_name,
        total: line.amount_owed,
      })),
      totalAmount: data.total_amount,
    }

    return parsedBill
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Could not reach the server. It may be starting up — please wait a moment and try again.')
    }
    throw error
  }
}
