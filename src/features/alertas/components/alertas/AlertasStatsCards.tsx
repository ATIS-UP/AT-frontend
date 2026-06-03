import { Card } from '@/shared/components/ui/Card';

interface AlertasStatsCardsProps {
  stats: { critico: number; medio: number; bajo: number } | undefined;
}

export function AlertasStatsCards({ stats }: AlertasStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="text-center hover:border-red-300 transition-colors group">
        <h3 className="text-4xl font-bold text-red-600 mb-1 group-hover:scale-110 transition-transform">
          {stats?.critico ?? 0}
        </h3>
        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Riesgo Crítico</p>
      </Card>
      <Card className="text-center hover:border-amber-300 transition-colors group">
        <h3 className="text-4xl font-bold text-amber-500 mb-1 group-hover:scale-110 transition-transform">
          {stats?.medio ?? 0}
        </h3>
        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Riesgo Medio</p>
      </Card>
      <Card className="text-center hover:border-emerald-300 transition-colors group">
        <h3 className="text-4xl font-bold text-emerald-600 mb-1 group-hover:scale-110 transition-transform">
          {stats?.bajo ?? 0}
        </h3>
        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Normal</p>
      </Card>
    </div>
  );
}
