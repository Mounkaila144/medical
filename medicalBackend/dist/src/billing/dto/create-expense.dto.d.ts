import { ExpenseCategory, ExpenseStatus, PaymentStatus } from '../entities/expense.entity';
export declare class CreateExpenseDto {
    reference: string;
    description: string;
    category: ExpenseCategory;
    amount: number;
    currency?: string;
    supplierName?: string;
    supplierContact?: string;
    status?: ExpenseStatus;
    paymentStatus?: PaymentStatus;
    expenseDate: string;
    dueDate?: string;
    paidDate?: string;
    paymentMethod?: string;
    invoiceNumber?: string;
    receiptUrl?: string;
    notes?: string;
}
export declare class CreateExpenseGqlDto {
    reference: string;
    description: string;
    category: ExpenseCategory;
    amount: number;
    currency?: string;
    supplierName?: string;
    supplierContact?: string;
    status?: ExpenseStatus;
    paymentStatus?: PaymentStatus;
    expenseDate: string;
    dueDate?: string;
    paidDate?: string;
    paymentMethod?: string;
    invoiceNumber?: string;
    receiptUrl?: string;
    notes?: string;
}
