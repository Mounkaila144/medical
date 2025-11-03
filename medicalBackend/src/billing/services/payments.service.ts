import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Invoice, InvoiceStatus, Payment } from '../entities';
import { CreatePaymentDto } from '../dto';
import { InvoicePaidEvent } from '../events';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    private eventEmitter: EventEmitter2,
  ) {}

  async recordPayment(tenantId: string, createPaymentDto: CreatePaymentDto): Promise<Payment> {
    // Vérifier que la facture existe et appartient au tenant
    const invoice = await this.invoiceRepository.findOne({
      where: { id: createPaymentDto.invoiceId, tenantId },
      relations: ['payments'],
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${createPaymentDto.invoiceId} not found`);
    }

    // Vérifier que la facture n'est pas déjà payée
    if (invoice.status === InvoiceStatus.PAID) {
      throw new Error('Invoice is already paid');
    }

    // Calculer le montant total payé jusqu'à présent
    let totalPaid = 0;
    if (invoice.payments && invoice.payments.length > 0) {
      totalPaid = invoice.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    }

    // Créer le nouveau paiement
    const payment = this.paymentRepository.create({
      invoiceId: invoice.id,
      amount: createPaymentDto.amount,
      method: createPaymentDto.method,
      paidAt: new Date(),
      reference: createPaymentDto.reference,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Vérifier si la facture est entièrement payée
    const newTotalPaid = totalPaid + Number(createPaymentDto.amount);
    if (newTotalPaid >= Number(invoice.total)) {
      invoice.status = InvoiceStatus.PAID;
      await this.invoiceRepository.save(invoice);
      
      // Émettre l'événement de facture payée
      this.eventEmitter.emit('invoice.paid', new InvoicePaidEvent(invoice, savedPayment));
    }

    return savedPayment;
  }
} 