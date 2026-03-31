import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: 'paid' | 'partial' | 'pending' | 'overdue' | 'active' | 'closed' | 'cancelled';
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' ; className: string }> = {
  paid: { label: 'Paid', variant: 'default', className: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
  partial: { label: 'Partial', variant: 'default', className: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100' },
  pending: { label: 'Pending', variant: 'default', className: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100' },
  overdue: { label: 'Overdue', variant: 'destructive', className: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100' },
  active: { label: 'Active', variant: 'default', className: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100' },
  closed: { label: 'Closed', variant: 'secondary', className: 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100' },
  cancelled: { label: 'Cancelled', variant: 'destructive', className: 'bg-red-50 text-red-500 border-red-200 hover:bg-red-50' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.pending;
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}
