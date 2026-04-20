const { SmartAPI, WebSocketV2 } = require('smartapi-javascript');
import { authenticator } from 'otplib';

export interface AngelCredentials {
    apiKey: string;
    clientCode: string;
    password: string;
    totpSecret: string;
}

export class AngelOne {
    private smartApi: any;
    private sessionData: any = null;

    constructor(private credentials: AngelCredentials) {
        this.smartApi = new SmartAPI({
            api_key: this.credentials.apiKey
        });
    }

    /**
     * Authenticate with Angel One
     */
    public async login(): Promise<boolean> {
        try {
            const totp = authenticator.generate(this.credentials.totpSecret);
            const response = await this.smartApi.generateSession(
                this.credentials.clientCode,
                this.credentials.password,
                totp
            );

            if (response.status) {
                this.sessionData = response.data;
                return true;
            } else {
                console.error('Angel One Login Failed:', response.message);
                return false;
            }
        } catch (error) {
            console.error('Angel One Login Error:', error);
            return false;
        }
    }

    /**
     * Place an order
     */
    public async placeOrder(params: {
        symbol: string;
        token: string;
        exchange: string;
        transactionType: 'BUY' | 'SELL';
        quantity: number;
        price?: number;
    }) {
        try {
            const response = await this.smartApi.placeOrder({
                variety: 'NORMAL',
                tradingsymbol: params.symbol,
                symboltoken: params.token,
                transactiontype: params.transactionType,
                exchange: params.exchange,
                ordertype: params.price ? 'LIMIT' : 'MARKET',
                producttype: 'INTRADAY',
                duration: 'DAY',
                price: params.price ? params.price.toString() : '0',
                squareoff: '0',
                stoploss: '0',
                quantity: params.quantity.toString()
            });

            return response;
        } catch (error) {
            console.error('Order Placement Error:', error);
            throw error;
        }
    }

    public getSession() {
        return this.sessionData;
    }
}
