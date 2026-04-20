import { ATI, Candle } from '../indicator/ATI';
import { CandleManager } from '../manager/CandleManager';
import { AngelOne } from '../broker/AngelOne';

export interface SymbolConfig {
    name: string;
    token: string;
    exchange: string;
    atrPeriod: number;
    multBull: number;
    multBear: number;
    target1Pct: number;
    target2Pct: number;
    slPct: number;
}

export class StrategyEngine {
    private candleManager: CandleManager;
    private symbolStates: Map<string, {
        inPosition: boolean;
        type: 'BUY' | 'SELL' | null;
        entryPrice: number;
        stopLoss: number;
        target1: number;
        target2: number;
    }> = new Map();

    constructor(
        private broker: AngelOne,
        private configs: Map<string, SymbolConfig>,
        timeframe: number = 1
    ) {
        this.candleManager = new CandleManager(timeframe);
    }

    public onTick(token: string, price: number, timestamp: number) {
        const config = this.configs.get(token);
        if (!config) return;

        // 1. Process Tick (Aggregate into candles)
        const completedCandle = this.candleManager.addTick(token, price, timestamp);

        if (completedCandle) {
            // 2. Candle Completed -> Run Strategy Logic
            this.processCandle(token, completedCandle, config);
        }

        // 3. Monitor live targets/SL if in position
        this.monitorPosition(token, price);
    }

    private processCandle(token: string, candle: Candle, config: SymbolConfig) {
        const buffer = this.candleManager.getBuffer(token);
        if (buffer.length < config.atrPeriod) return;

        const trail = ATI.calculate(buffer, config.atrPeriod, config.multBull, config.multBear);
        const lastTrail = trail[trail.length - 1];
        const state = this.symbolStates.get(token);

        // Signal Logic (Candle Completion)
        if (!state?.inPosition) {
            if (candle.close > lastTrail) {
                this.executeTrade(token, 'BUY', candle.close, config);
            } else if (candle.close < lastTrail) {
                this.executeTrade(token, 'SELL', candle.close, config);
            }
        }
    }

    private async executeTrade(token: string, type: 'BUY' | 'SELL', price: number, config: SymbolConfig) {
        console.log(`Executing ${type} for ${config.name} at ${price}`);
        
        try {
            // Place Order via Broker
            // await this.broker.placeOrder({ ... });

            // Set Targets/SL
            const direction = type === 'BUY' ? 1 : -1;
            this.symbolStates.set(token, {
                inPosition: true,
                type: type,
                entryPrice: price,
                stopLoss: price - (price * config.slPct * direction),
                target1: price + (price * config.target1Pct * direction),
                target2: price + (price * config.target2Pct * direction)
            });

            // Log to database (Supabase logic will go here)
        } catch (error) {
            console.error('Trade Execution Failed:', error);
        }
    }

    private monitorPosition(token: string, price: number) {
        const state = this.symbolStates.get(token);
        if (!state || !state.inPosition) return;

        let shouldExit = false;
        if (state.type === 'BUY') {
            if (price <= state.stopLoss || price >= state.target2) shouldExit = true;
        } else {
            if (price >= state.stopLoss || price <= state.target2) shouldExit = true;
        }

        if (shouldExit) {
            console.log(`Exiting Position for ${token} at ${price}`);
            state.inPosition = false;
            this.symbolStates.set(token, state);
            // executeExit(...)
        }
    }
}
