import { StockLowEvent } from './stock-low.event';
export declare class StockLowListener {
    private readonly logger;
    handleStockLowEvent(event: StockLowEvent): void;
}
