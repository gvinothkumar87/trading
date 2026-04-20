/**
 * ATI Indicator Implementation
 * Ported from AFL logic
 */

export interface Candle {
    open: number;
    high: number;
    low: number;
    close: number;
    timestamp: number;
}

export class ATI {
    /**
     * Calculates True Range for a set of candles
     */
    private static calculateTrueRange(candles: Candle[]): number[] {
        const tr: number[] = [];
        for (let i = 0; i < candles.length; i++) {
            if (i === 0) {
                tr.push(candles[i].high - candles[i].low);
            } else {
                const tr1 = candles[i].high - candles[i].low;
                const tr2 = Math.abs(candles[i].high - candles[i - 1].close);
                const tr3 = Math.abs(candles[i].low - candles[i - 1].close);
                tr.push(Math.max(tr1, tr2, tr3));
            }
        }
        return tr;
    }

    /**
     * Wilder's Smoothing for ATR (Match Amibroker ATR)
     */
    public static calculateATR(candles: Candle[], period: number): number[] {
        const tr = this.calculateTrueRange(candles);
        const atr: number[] = [];
        let currentWilder = 0;

        for (let i = 0; i < tr.length; i++) {
            if (i < period - 1) {
                atr.push(0);
                currentWilder += tr[i];
            } else if (i === period - 1) {
                currentWilder = (currentWilder + tr[i]) / period;
                atr.push(currentWilder);
            } else {
                currentWilder = (atr[i - 1] * (period - 1) + tr[i]) / period;
                atr.push(currentWilder);
            }
        }
        return atr;
    }

    /**
     * Main ATI Calculation logic
     */
    public static calculate(
        candles: Candle[],
        period: number,
        multBull: number,
        multBear: number
    ): number[] {
        if (candles.length === 0) return [];

        const atr = this.calculateATR(candles, period);
        const trail: number[] = new Array(candles.length).fill(0);

        // Initialize first bar
        trail[0] = candles[0].close;

        for (let i = 1; i < candles.length; i++) {
            const prev = trail[i - 1];
            const C = candles[i].close;
            const C_prev = candles[i - 1].close;
            const ATI1 = multBull * atr[i];
            const ATI2 = multBear * atr[i];

            if (C > prev && C_prev > prev) {
                trail[i] = Math.max(prev, C - ATI1);
            } else if (C < prev && C_prev < prev) {
                trail[i] = Math.min(prev, C + ATI2);
            } else if (C > prev) {
                trail[i] = C - ATI1;
            } else {
                trail[i] = C + ATI2;
            }
        }

        return trail;
    }
}
