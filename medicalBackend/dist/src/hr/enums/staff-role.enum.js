"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffRole = void 0;
const graphql_1 = require("@nestjs/graphql");
var StaffRole;
(function (StaffRole) {
    StaffRole["ADMIN"] = "ADMIN";
    StaffRole["DOCTOR"] = "DOCTOR";
    StaffRole["NURSE"] = "NURSE";
    StaffRole["RECEPTIONIST"] = "RECEPTIONIST";
})(StaffRole || (exports.StaffRole = StaffRole = {}));
(0, graphql_1.registerEnumType)(StaffRole, {
    name: 'StaffRole',
});
//# sourceMappingURL=staff-role.enum.js.map