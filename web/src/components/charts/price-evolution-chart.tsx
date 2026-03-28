'use client';

import { useMemo } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

interface SeriesData {
  name: string;
  data: { date: string; value: number }[];
  color?: string;
}

interface PriceEvolutionChartProps {
  series: SeriesData[];
  height?: number;
}

export function PriceEvolutionChart({ series, height = 350 }: PriceEvolutionChartProps) {
  const option = useMemo(() => {
    const dates = series[0]?.data.map((d) => d.date) ?? [];

    return {
      tooltip: {
        trigger: 'axis' as const,
        valueFormatter: (val: number) => `${val.toFixed(4)} EUR/L`,
      },
      legend: {
        show: series.length > 1,
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: series.length > 1 ? '12%' : '3%',
        top: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category' as const,
        data: dates,
        axisLabel: {
          formatter: (val: string) => {
            const d = new Date(val);
            return `${d.getDate()} ${d.toLocaleString('es', { month: 'short' })}`;
          },
        },
      },
      yAxis: {
        type: 'value' as const,
        axisLabel: {
          formatter: (val: number) => val.toFixed(3),
        },
        scale: true,
      },
      series: series.map((s) => ({
        name: s.name,
        type: 'line' as const,
        data: s.data.map((d) => d.value),
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2 },
        itemStyle: s.color ? { color: s.color } : undefined,
      })),
    };
  }, [series]);

  if (!series.length || !series[0]?.data.length) {
    return (
      <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground">
        Sin datos disponibles
      </div>
    );
  }

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      style={{ height, width: '100%' }}
      notMerge
    />
  );
}
