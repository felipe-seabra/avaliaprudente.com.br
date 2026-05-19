import React from 'react'
import { useFormContext } from 'react-hook-form'
import { Eye, EyeOff } from 'lucide-react'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string
  label?: string
  description?: string
}

export function InputField({
  name,
  label,
  description,
  type,
  ...props
}: InputFieldProps) {
  const { control } = useFormContext()
  const [showPassword, setShowPassword] = React.useState(false)

  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <div className="relative">
            <FormControl>
              <Input {...field} {...props} type={inputType} className={isPassword ? 'pr-10' : ''} />
            </FormControl>
            {isPassword && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="sr-only">
                  {showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                </span>
              </Button>
            )}
          </div>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
