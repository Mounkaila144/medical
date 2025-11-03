"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaitQueueUpdatedEvent = void 0;
class WaitQueueUpdatedEvent {
    tenantId;
    entries;
    constructor(tenantId, entries) {
        this.tenantId = tenantId;
        this.entries = entries;
    }
}
exports.WaitQueueUpdatedEvent = WaitQueueUpdatedEvent;
//# sourceMappingURL=wait-queue-updated.event.js.map