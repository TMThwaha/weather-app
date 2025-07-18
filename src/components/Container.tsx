import { cn } from '@/utils/cn'
import React from 'react'

export default function Container(props: React.HTMLProps<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        'bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl w-full flex p-6 shadow-xl transition-all duration-300 hover:bg-white/15',
        props.className
      )}>
    </div>
  )
}