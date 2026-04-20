import { useEffect, useRef } from 'react';
import { createChart, ColorType, ISeriesApi, CandlestickData, LineData } from 'lightweight-charts';

interface ChartProps {
  data: CandlestickData[];
  trailData: LineData[];
}

export const TradingChart = ({ data, trailData }: ChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'>>(null);
  const trailSeriesRef = useRef<ISeriesApi<'Line'>>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#a0a0a0',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#a3e635',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#a3e635',
      wickDownColor: '#ef4444',
    });

    const trailSeries = chart.addLineSeries({
      color: '#facc15',
      lineWidth: 2,
    });

    candleSeriesRef.current = candleSeries;
    trailSeriesRef.current = trailSeries;
    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (candleSeriesRef.current && data.length > 0) {
      candleSeriesRef.current.setData(data);
    }
    if (trailSeriesRef.current && trailData.length > 0) {
      trailSeriesRef.current.setData(trailData);
    }
  }, [data, trailData]);

  return (
    <div className="glass p-4" style={{ height: '432px' }}>
      <div ref={chartContainerRef} style={{ width: '100%', height: '400px' }} />
    </div>
  );
};
