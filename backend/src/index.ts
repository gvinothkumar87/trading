import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { AngelOne } from './broker/AngelOne';
import { StrategyEngine } from './execution/StrategyEngine';
import { StreamManager } from './manager/StreamManager';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PORT = process.env.PORT || 3001;

async function startEngine() {
    console.log('Initializing Auto-Trade Engine...');

    // 1. Fetch Credentials and Config from Supabase
    const { data: creds } = await supabase.from('api_credentials').select('*').single();
    const { data: config } = await supabase.from('strategy_config').select('*').single();
    const { data: symbols } = await supabase.from('symbols').select('*').filter('is_active', 'eq', true);

    if (!creds || !config || !symbols) {
        console.error('Incomplete configuration in Supabase. Engine cannot start.');
        return;
    }

    // 2. Initialize Broker
    const broker = new AngelOne({
        apiKey: creds.api_key,
        clientCode: creds.client_code,
        password: creds.password,
        totpSecret: creds.totp_secret
    });

    const isLoggedIn = await broker.login();
    if (!isLoggedIn) return;

    // 3. Initialize Strategy Engine
    const symbolConfigs = new Map();
    symbols.forEach(s => {
        symbolConfigs.set(s.token, {
            name: s.symbol_name,
            token: s.token,
            exchange: s.exchange,
            atrPeriod: config.atr_period,
            multBull: config.mult_bull,
            multBear: config.mult_bear,
            target1Pct: config.target1_pct,
            target2Pct: config.target2_pct,
            slPct: config.stoploss_pct
        });
    });

    const engine = new StrategyEngine(broker, symbolConfigs, parseInt(config.timeframe) || 1);

    // 4. Start WebSocket Stream
    const stream = new StreamManager(
        {
            apiKey: creds.api_key,
            clientCode: creds.client_code,
            feedToken: broker.getSession().feedToken
        },
        (token, price, time) => engine.onTick(token, price, time)
    );

    const subscriptionList = symbols.map(s => ({
        exchangeType: s.exchange === 'NSE' ? 1 : 2, // Simplified mapping
        tokens: [s.token]
    }));

    stream.connect(broker.getSession().jwtToken, subscriptionList);

    console.log('Engine is running and monitoring', symbols.length, 'symbols.');
}

app.get('/status', (req, res) => {
    res.json({ status: 'running' });
});

app.listen(PORT, () => {
    console.log(`Backend Server listening on port ${PORT}`);
    startEngine();
});
