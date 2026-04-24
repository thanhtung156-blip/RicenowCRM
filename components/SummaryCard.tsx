import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    isUp: boolean;
  };
  color?: "indigo" | "rose" | "emerald" | "blue" | "amber";
}

const colorMap = {
  indigo: "bg-[#0072bc]",
  rose: "bg-rose-500",
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  amber: "bg-amber-500",
};

const textColorMap = {
  indigo: "text-[#0072bc]",
  rose: "text-rose-500",
  emerald: "text-emerald-500",
  blue: "text-blue-500",
  amber: "text-amber-500",
};

const bgColorMap = {
  indigo: "bg-blue-50",
  rose: "bg-rose-50",
  emerald: "bg-emerald-50",
  blue: "bg-blue-50",
  amber: "bg-amber-50",
};

export default function SummaryCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend,
  color = "indigo" 
}: SummaryCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
          
          {trend && (
            <div className="flex items-center mt-2">
              <span className={cn(
                "text-xs font-bold",
                trend.isUp ? "text-emerald-600" : "text-rose-600"
              )}>
                {trend.isUp ? "↑" : "↓"} {trend.value}
              </span>
              <span className="text-xs text-slate-400 ml-1.5 font-medium">so với kỳ trước</span>
            </div>
          )}
          
          {description && !trend && (
            <p className="text-xs text-slate-400 mt-2 font-medium">{description}</p>
          )}
        </div>
        
        <div className={cn(
          "p-2.5 rounded-lg transition-transform group-hover:scale-110 duration-200",
          bgColorMap[color],
          textColorMap[color]
        )}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
