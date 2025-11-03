"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentCancelledEvent = void 0;
class AppointmentCancelledEvent {
    appointment;
    notifyPatient;
    constructor(appointment, notifyPatient = true) {
        this.appointment = appointment;
        this.notifyPatient = notifyPatient;
    }
}
exports.AppointmentCancelledEvent = AppointmentCancelledEvent;
//# sourceMappingURL=appointment-cancelled.event.js.map