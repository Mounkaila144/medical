import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Invoice, Payment } from '../entities';
import { CreatePaymentDto } from '../dto';
export declare class PaymentsService {
    private paymentRepository;
    private invoiceRepository;
    private eventEmitter;
    constructor(paymentRepository: Repository<Payment>, invoiceRepository: Repository<Invoice>, eventEmitter: EventEmitter2);
    recordPayment(tenantId: string, createPaymentDto: CreatePaymentDto): Promise<Payment>;
}
