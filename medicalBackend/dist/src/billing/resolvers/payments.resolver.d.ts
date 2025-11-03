import { Repository } from 'typeorm';
import { Payment } from '../entities';
import { PaymentsService } from '../services';
import { CreatePaymentGqlDto } from '../dto';
export declare class PaymentsResolver {
    private paymentRepository;
    private paymentsService;
    constructor(paymentRepository: Repository<Payment>, paymentsService: PaymentsService);
    paymentsByInvoice(invoiceId: string, context: any): Promise<Payment[]>;
    createPayment(createPaymentDto: CreatePaymentGqlDto, context: any): Promise<Payment>;
}
