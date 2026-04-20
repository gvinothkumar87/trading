import { Candle } from '../indicator/ATI';

export class CandleManager {
    private buffers: Map<string, Candle[]> = new Map();
    private currentCandles: Map<string, Partial<Candle>> = new Map();
    private timeframeMs: number;

    constructor(timeframeMinutes: number = 1) {
        this.timeframeMs = timeframeMinutes * 60 * 1000;
    }

    /**
     * Process a new tick for a symbol
     */
    public addTick(symbol: string, price: number, timestamp: number): Candle | null {
        let current = this.currentCandles.get(symbol);
        const candleStart = Math.floor(timestamp / this.timeframeMs) * this.timeframeMs;

        if (!current || current.timestamp !== candleStart) {
            // New candle started
            let completedCandle: Candle | null = null;
            if (current) {
                completedCandle = {
                    open: current.open!,
                    high: current.high!,
                    low: current.low!,
                    close: current.close!,
                    timestamp: current.timestamp!
                };
                this.saveCandle(symbol, completedCandle);
            }

            // Initialize new buffer
            this.currentCandles.set(symbol, {
                open: price,
                high: price,
                low: price,
                close: price,
                timestamp: candleStart
            });

            return completedCandle;
        }

        // Update current candle
        current.high = Math.max(current.high!, price);
        current.low = Math.min(current.low!, price);
        current.close = price;
        this.currentCandles.set(symbol, current);

        return null;
    }

    private saveCandle(symbol: string, candle: Candle) {
        let buffer = this.buffers.get(symbol) || [];
        buffer.push(candle);
        // Keep only last 200 candles for performance
        if (buffer.length > 200) buffer.shift();
        this.buffers.set(symbol, buffer);
    }

    public getBuffer(symbol: string): Candle[] {
        return this.buffers.get(symbol) || [];
    }

    /**
     * Seed initial data (for starting the app with context)
     */
    public seedData(symbol: string, candles: Candle[]) {
        this.buffers.set(symbol, candles);
    }
}
