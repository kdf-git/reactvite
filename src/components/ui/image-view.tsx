"use client"

import * as React from "react"
import { PhotoProvider, PhotoView } from 'react-photo-view'
import 'react-photo-view/dist/react-photo-view.css'

import { cn } from "@/lib/utils"

export interface ImageViewProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    viewable?: boolean
    className?: string
    imgClassName?: string
    wrapperClassName?: string
}

const ImageView = React.forwardRef<HTMLImageElement, ImageViewProps>(
    ({ src, alt, className, imgClassName, wrapperClassName, viewable = true, ...props }, ref) => {
        if (!viewable || !src) {
            return (
                <img
                    ref={ref}
                    src={src}
                    alt={alt}
                    className={cn(className)}
                    {...props}
                />
            )
        }

        return (
            <PhotoProvider
                maskOpacity={0.8}
                maskClassName="backdrop-blur-sm"
                overlayRender={({ overlay }) => overlay}
                loadingElement={<div className="flex items-center justify-center w-full h-full">Loading...</div>}
            >
                <div className={cn("relative w-full h-full", wrapperClassName)}>
                    <PhotoView src={src}>
                        <img
                            ref={ref}
                            src={src}
                            alt={alt}
                            className={cn("cursor-pointer w-full h-full", imgClassName, className)}
                            {...props}
                        />
                    </PhotoView>
                </div>
            </PhotoProvider>
        )
    }
)

ImageView.displayName = "ImageView"

export { ImageView } 