import { PaymentsService } from '../services/payments.service';
import { CreatePaymentDto } from '../dto';
import { Repository } from 'typeorm';
import { Payment, PaymentMethod } from '../entities/payment.entity';
export declare class PaymentsController {
    private readonly paymentsService;
    private paymentRepository;
    constructor(paymentsService: PaymentsService, paymentRepository: Repository<Payment>);
    recordPayment(createPaymentDto: CreatePaymentDto, req: any): Promise<Payment>;
    getPayments(req: any, invoiceId?: string, method?: PaymentMethod): Promise<Payment[]>;
    getPayment(id: string, req: any): Promise<Payment | null>;
    update(id: string, updatePaymentDto: Partial<CreatePaymentDto>, req: any): Promise<Payment | null>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
}
