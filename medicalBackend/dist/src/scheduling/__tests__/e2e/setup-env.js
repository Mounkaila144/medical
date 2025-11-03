"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupTestEnv = setupTestEnv;
process.env.JWT_ACCESS_SECRET = 'test-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
process.env.DATABASE_TYPE = 'sqlite';
process.env.DATABASE_MEMORY = 'true';
function setupTestEnv() {
    return true;
}
//# sourceMappingURL=setup-env.js.map