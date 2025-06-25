"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"
import { ImageView } from "./image-view"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

interface AvatarImageProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> {
  viewable?: boolean
}

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  AvatarImageProps
>(({ className, src, alt, viewable = false, ...props }, ref) => {
  const [hasError, setHasError] = React.useState(false)

  const handleError = React.useCallback(() => {
    setHasError(true)
  }, [])

  // If the image failed to load, don't render anything
  if (hasError || !src) {
    return null
  }

  // Create a custom style that ensures the image covers the entire avatar
  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    position: 'absolute' as const,
    top: 0,
    left: 0,
    zIndex: 1, // Ensure image is above fallback
    ...props.style
  }

  // For regular non-viewable avatars, use the native AvatarImage component
  if (!viewable) {
    return (
      <AvatarPrimitive.Image
        ref={ref}
        src={src}
        alt={alt}
        onError={handleError}
        className={cn("aspect-square h-full w-full", className)}
        style={imageStyle}
        {...props}
      />
    )
  }

  // For viewable avatars, use the ImageView component with proper positioning
  return (
    <div className="absolute inset-0 z-[1] w-full h-full">
      <ImageView
        ref={ref}
        src={src}
        alt={alt}
        onError={handleError}
        viewable={true}
        className={cn("w-full h-full", className)}
        imgClassName="w-full h-full"
        style={imageStyle}
        wrapperClassName="w-full h-full"
        {...props}
      />
    </div>
  )
})
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
