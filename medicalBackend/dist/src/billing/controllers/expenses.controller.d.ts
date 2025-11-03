import { Repository } from 'typeorm';
import { Expense, ExpenseCategory, ExpenseStatus, PaymentStatus } from '../entities/expense.entity';
import { CreateExpenseDto } from '../dto';
export declare class ExpensesController {
    private expenseRepository;
    constructor(expenseRepository: Repository<Expense>);
    create(createExpenseDto: CreateExpenseDto, req: any): Promise<Expense>;
    findAll(req: any, category?: ExpenseCategory, status?: ExpenseStatus, paymentStatus?: PaymentStatus, startDate?: string, endDate?: string): Promise<Expense[]>;
    getStats(req: any): Promise<{
        totalExpenses: number;
        paidExpenses: number;
        pendingExpenses: number;
        byCategory: any[];
    }>;
    findOne(id: string, req: any): Promise<Expense | null>;
    update(id: string, updateExpenseDto: Partial<CreateExpenseDto>, req: any): Promise<Expense | null>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
}
