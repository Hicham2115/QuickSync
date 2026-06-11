"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          // base card
          toast: [
            "font-sans text-sm rounded-xl border shadow-md px-4 py-3",
            "flex items-start gap-3",
            "bg-ink-800 border-white/10 text-white",
          ].join(" "),

          // icon wrapper
          icon: "mt-0.5 shrink-0",

          // title
          title: "font-semibold leading-snug",

          // description
          description: "text-white/55 text-xs leading-relaxed mt-0.5",

          // close button
          closeButton: "text-white/30 hover:text-white transition-colors",

          // per-type accent colours via icon + title tint
          success: "![--toast-icon-color:#2e7d5b] ![--toast-title-color:#6fcf97]",
          error:   "![--toast-icon-color:#b4453a] ![--toast-title-color:#f87171]",
          warning: "![--toast-icon-color:#b4862f] ![--toast-title-color:#cba24a]",
          info:    "![--toast-icon-color:#3c6ea5] ![--toast-title-color:#60a5fa]",
          loading: "![--toast-icon-color:#767676] ![--toast-title-color:#c4c4c4]",
        },
        style: {
          "--normal-bg": "#131B2C",
          "--normal-border": "rgba(255,255,255,0.09)",
          "--normal-text": "#ffffff",
        } as React.CSSProperties,
      }}
      {...props}
    />
  )
}

export { Toaster }
