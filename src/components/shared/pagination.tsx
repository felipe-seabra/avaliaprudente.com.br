'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl?: string
  onPageChange?: (page: number) => void
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  onPageChange,
  className
}: PaginationProps) {
  if (totalPages <= 1) return null

  const getPageUrl = (page: number) => {
    if (!baseUrl) return '#'
    
    // In browser context, we want to preserve existing search params
    const currentParams = typeof window !== 'undefined' 
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams()
      
    currentParams.set('page', page.toString())
    
    // Handle baseUrl that might already have a path or even params
    const [path] = baseUrl.split('?')
    const queryString = currentParams.toString()
    
    return `${path}${queryString ? `?${queryString}` : ''}`
  }

  const renderPageButton = (page: number) => {
    const isActive = page === currentPage
    
    if (onPageChange) {
      return (
        <Button
          key={page}
          variant={isActive ? "default" : "outline"}
          size="icon"
          className={cn("h-9 w-9 rounded-xl font-bold", isActive && "shadow-lg shadow-primary/20")}
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      )
    }

    return (
      <Link
        key={page}
        href={getPageUrl(page)}
        className={cn(
          "inline-flex items-center justify-center h-9 w-9 rounded-xl text-sm font-bold transition-all border",
          isActive 
            ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
            : "bg-background text-foreground border-border hover:bg-muted"
        )}
      >
        {page}
      </Link>
    )
  }

  const renderEllipsis = (key: string) => (
    <div key={key} className="flex h-9 w-9 items-center justify-center">
      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
    </div>
  )

  const pages = []
  const maxVisiblePages = 3

  if (totalPages <= maxVisiblePages + 2) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(renderPageButton(i))
    }
  } else {
    pages.push(renderPageButton(1))
    
    if (currentPage > 2) {
      pages.push(renderEllipsis('start-ellipsis'))
    }

    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)

    for (let i = start; i <= end; i++) {
      if (i > 1 && i < totalPages) {
        pages.push(renderPageButton(i))
      }
    }

    if (currentPage < totalPages - 1) {
      pages.push(renderEllipsis('end-ellipsis'))
    }

    pages.push(renderPageButton(totalPages))
  }

  const prevPage = Math.max(1, currentPage - 1)
  const nextPage = Math.min(totalPages, currentPage + 1)

  const renderArrow = (direction: 'prev' | 'next', disabled: boolean) => {
    const isPrev = direction === 'prev'
    const Icon = isPrev ? ChevronLeft : ChevronRight
    const page = isPrev ? prevPage : nextPage

    if (onPageChange) {
      return (
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-xl"
          disabled={disabled}
          onClick={() => onPageChange(page)}
        >
          <Icon className="h-4 w-4" />
        </Button>
      )
    }

    return (
      <Link
        href={disabled ? '#' : getPageUrl(page)}
        className={cn(
          "inline-flex items-center justify-center h-9 w-9 rounded-xl border transition-all",
          disabled 
            ? "pointer-events-none opacity-50 bg-muted" 
            : "bg-background hover:bg-muted"
        )}
        aria-disabled={disabled}
      >
        <Icon className="h-4 w-4" />
      </Link>
    )
  }

  return (
    <nav 
      className={cn("flex items-center justify-center gap-2 py-8", className)}
      aria-label="Paginação"
    >
      {renderArrow('prev', currentPage === 1)}
      <div className="flex items-center gap-1">
        {pages}
      </div>
      {renderArrow('next', currentPage === totalPages)}
    </nav>
  )
}
