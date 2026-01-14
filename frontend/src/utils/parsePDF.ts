/**
 * PDF parsing utilities - calls backend API
 */

import type { ParsedBill } from '@/types/bill.types'

const API_URL = 'http://localhost:3001'

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
  console.log('📤 Uploading PDF to backend...', {
    fileName: file.name,
    fileSize: `${(file.size / 1024).toFixed(2)} KB`,
    fileType: file.type,
  })

  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await fetch(`${API_URL}/api/extract`, {
      method: 'POST',
      body: formData,
    })

    console.log('📥 Backend response status:', response.status, response.statusText)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error('❌ Backend error:', errorData)
      throw new Error(errorData.error || `Server error: ${response.status}`)
    }

    const data: BackendResponse = await response.json()
    console.log('✅ Backend response data:', data)

    // Transform backend response to frontend format
    const parsedBill: ParsedBill = {
      lines: data.lines.map(line => ({
        lineNumber: line.phone_number,
        total: line.amount_owed,
      })),
      totalAmount: data.total_amount,
    }

    console.log('📊 Parsed bill:', {
      totalLines: parsedBill.lines.length,
      totalAmount: `$${parsedBill.totalAmount.toFixed(2)}`,
    })

    return parsedBill
  } catch (error) {
    console.error('❌ Error calling backend:', error)
    throw error
  }
}
