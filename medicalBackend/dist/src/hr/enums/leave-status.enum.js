"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveStatus = void 0;
const graphql_1 = require("@nestjs/graphql");
var LeaveStatus;
(function (LeaveStatus) {
    LeaveStatus["PENDING"] = "PENDING";
    LeaveStatus["APPROVED"] = "APPROVED";
    LeaveStatus["REJECTED"] = "REJECTED";
})(LeaveStatus || (exports.LeaveStatus = LeaveStatus = {}));
(0, graphql_1.registerEnumType)(LeaveStatus, {
    name: 'LeaveStatus',
});
//# sourceMappingURL=leave-status.enum.js.map