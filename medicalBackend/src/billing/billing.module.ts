import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Tariff, Invoice, InvoiceLine, Payment, Expense } from './entities';
import { InvoicingService, PaymentsService } from './services';
import { InvoicesController, PaymentsController, TariffsController, ExpensesController } from './controllers';
import { InvoicesResolver, PaymentsResolver, TariffsResolver } from './resolvers';
import { Tenant } from '../auth/entities/tenant.entity';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tariff, Invoice, InvoiceLine, Payment, Expense, Tenant]),
    EventEmitterModule.forRoot(),
    CommonModule,
  ],
  controllers: [InvoicesController, PaymentsController, TariffsController, ExpensesController],
  providers: [
    InvoicingService,
    PaymentsService,
    InvoicesResolver,
    PaymentsResolver,
    TariffsResolver,
  ],
  exports: [InvoicingService, PaymentsService],
})
export class BillingModule {} 