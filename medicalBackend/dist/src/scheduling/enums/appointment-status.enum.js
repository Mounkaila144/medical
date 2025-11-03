"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentStatus = void 0;
const graphql_1 = require("@nestjs/graphql");
var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["BOOKED"] = "BOOKED";
    AppointmentStatus["CANCELLED"] = "CANCELLED";
    AppointmentStatus["DONE"] = "DONE";
    AppointmentStatus["NO_SHOW"] = "NO_SHOW";
})(AppointmentStatus || (exports.AppointmentStatus = AppointmentStatus = {}));
(0, graphql_1.registerEnumType)(AppointmentStatus, {
    name: 'AppointmentStatus',
});
//# sourceMappingURL=appointment-status.enum.js.map