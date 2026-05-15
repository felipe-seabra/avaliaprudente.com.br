'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Building2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useBusiness } from '@/providers/business-provider'
import { CreateBusinessDialog } from './create-business-dialog'

export function BusinessSwitcher() {
  const { businesses, currentBusiness, setCurrentBusiness, isLoading } = useBusiness()
  const [open, setOpen] = React.useState(false)

  if (isLoading) {
    return <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
  }

  return (
    <div className="w-full">
      <CreateBusinessDialog />
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              aria-label="Selecionar empresa"
              className="w-full justify-between mt-2"
            >
              <div className="flex items-center gap-2 truncate">
                <Building2 className="h-4 w-4 shrink-0 opacity-50" />
                <span className="truncate">
                  {currentBusiness?.name || 'Selecionar empresa'}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
            </Button>
          }
        />
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandInput placeholder="Procurar empresa..." />
              <CommandEmpty>Nenhuma empresa encontrada.</CommandEmpty>
              <CommandGroup heading="Empresas">
                {businesses.map((business) => (
                  <CommandItem
                    key={business.id}
                    onSelect={() => {
                      setCurrentBusiness(business)
                      setOpen(false)
                    }}
                    className="text-sm"
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    <span className="truncate">{business.name}</span>
                    <Check
                      className={cn(
                        'ml-auto h-4 w-4',
                        currentBusiness?.id === business.id
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
