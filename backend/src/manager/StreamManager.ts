const { WebSocketV2 } = require('smartapi-javascript');

export class StreamManager {
    private ws: any;
    private onTickCallback: (symbol: string, price: number, timestamp: number) => void;

    constructor(
        private credentials: { apiKey: string, clientCode: string, feedToken: string },
        onTick: (symbol: string, price: number, timestamp: number) => void
    ) {
        this.onTickCallback = onTick;
        this.ws = new WebSocketV2({
            api_key: this.credentials.apiKey,
            client_code: this.credentials.clientCode,
            feed_token: this.credentials.feedToken,
            jwt_token: '' // Will be updated on connect
        });
    }

    public connect(jwtToken: string, tokens: { exchangeType: number, tokens: string[] }[]) {
        this.ws.jwt_token = jwtToken;

        this.ws.connect().then(() => {
            console.log('SmartStream Connected');
            
            // Subscribe to tokens
            this.ws.subscribe('subscribe', [
                {
                    mode: 1, // LTP
                    tokenList: tokens
                }
            ]);
        });

        this.ws.on('tick', (data: any) => {
            if (data && data.last_traded_price) {
                // The SDK tick format varies, adjusting based on SmartStream specs
                const price = data.last_traded_price / 100; // Typically in paisa
                const symbolToken = data.token;
                const timestamp = Date.now(); // Or use exchange timestamp if available in data
                this.onTickCallback(symbolToken, price, timestamp);
            }
        });

        this.ws.on('error', (err: any) => {
            console.error('SmartStream Error:', err);
        });
    }

    public stop() {
        this.ws.close();
    }
}
