import * as React from "react"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type FieldErrorObject = {
  message?: string
}

function Field({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="field" className={cn("grid gap-2", className)} {...props} />
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="field-group" className={cn("grid gap-5", className)} {...props} />
  )
}

function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn("data-[invalid=true]:text-destructive", className)}
      {...props}
    />
  )
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function FieldError({
  className,
  errors = [],
  children,
  ...props
}: React.ComponentProps<"p"> & {
  errors?: Array<FieldErrorObject | undefined>
}) {
  const message = children ?? errors.find((error) => Boolean(error?.message))?.message

  if (!message) return null

  return (
    <p
      data-slot="field-error"
      role="alert"
      className={cn("text-destructive text-sm font-medium", className)}
      {...props}
    >
      {message}
    </p>
  )
}

export { Field, FieldDescription, FieldError, FieldGroup, FieldLabel }
