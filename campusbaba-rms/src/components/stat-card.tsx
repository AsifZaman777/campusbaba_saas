"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useAnimatedCounter } from "@/lib/hooks";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  accentColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  className?: string;
  formatValue?: (val: number) => string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = "text-primary",
  gradientFrom = "from-indigo-500/10",
  gradientTo = "to-purple-500/10",
  className = "",
  formatValue,
}: StatCardProps) {
  const animatedValue = useAnimatedCounter(value);

  return (
    <Card
      className={`relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group ${className}`}
    >
      {/* Gradient accent bar */}
      <div
        className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${gradientFrom} ${gradientTo} opacity-60 group-hover:opacity-100 transition-opacity`}
      />

      {/* Background gradient glow */}
      <div
        className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight animate-count-up">
                {formatValue ? formatValue(animatedValue) : animatedValue.toLocaleString()}
              </span>
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className={`text-xs font-semibold ${
                    trend.positive ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {trend.label}
                </span>
              </div>
            )}
          </div>
          <div
            className={`p-3 rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientTo} ${accentColor}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
