import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glow?: "indigo" | "emerald" | "amber" | "none";
}

export function Card({
  className,
  hoverEffect = false,
  glow = "none",
  children,
  ...props
}: CardProps) {
  const glowStyles = {
    indigo: "hover:border-indigo-500/50 hover:shadow-indigo-500/10",
    emerald: "hover:border-emerald-500/50 hover:shadow-emerald-500/10",
    amber: "hover:border-amber-500/50 hover:shadow-amber-500/10",
    none: "",
  };

  return (
    <div
      className={cn(
        "rounded-2xl bg-slate-900/65 backdrop-blur-md border border-slate-800/80 shadow-xl transition-all duration-300",
        hoverEffect &&
          "hover:-translate-y-1 hover:border-slate-700 hover:shadow-2xl",
        glowStyles[glow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("p-6 pb-3 flex flex-col space-y-1.5", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-lg font-semibold tracking-tight text-white",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-slate-400 leading-relaxed", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 pt-3", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "p-6 pt-0 border-t border-slate-800/60 mt-4 flex items-center justify-between",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
