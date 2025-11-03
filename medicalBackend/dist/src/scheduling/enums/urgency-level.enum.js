"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrgencyLevel = void 0;
const graphql_1 = require("@nestjs/graphql");
var UrgencyLevel;
(function (UrgencyLevel) {
    UrgencyLevel["ROUTINE"] = "ROUTINE";
    UrgencyLevel["URGENT"] = "URGENT";
})(UrgencyLevel || (exports.UrgencyLevel = UrgencyLevel = {}));
(0, graphql_1.registerEnumType)(UrgencyLevel, {
    name: 'UrgencyLevel',
});
//# sourceMappingURL=urgency-level.enum.js.map