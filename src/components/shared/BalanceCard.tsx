import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface BalanceCardProps {
  title: string;
  amount: number;
  icon: LucideIcon;
  trend?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
}

export default function BalanceCard({ title, amount, icon: Icon, trend = 'neutral', subtitle }: BalanceCardProps) {
  const trendColors = {
    positive: 'text-emerald-600',
    negative: 'text-red-600',
    neutral: 'text-slate-700',
  };

  const iconBgs = {
    positive: 'bg-emerald-50 text-emerald-600',
    negative: 'bg-red-50 text-red-600',
    neutral: 'bg-blue-50 text-blue-600',
  };

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className={`text-2xl font-bold tracking-tight font-mono ${trendColors[trend]}`}>
              Rs. {amount.toLocaleString()}
            </p>
            {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-xl ${iconBgs[trend]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
