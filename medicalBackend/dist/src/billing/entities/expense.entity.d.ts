export declare enum ExpenseCategory {
    UTILITIES = "UTILITIES",
    SUPPLIES = "SUPPLIES",
    MEDICATIONS = "MEDICATIONS",
    EQUIPMENT = "EQUIPMENT",
    SALARIES = "SALARIES",
    RENT = "RENT",
    MAINTENANCE = "MAINTENANCE",
    INSURANCE = "INSURANCE",
    TAXES = "TAXES",
    MARKETING = "MARKETING",
    OTHER = "OTHER"
}
export declare enum ExpenseStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    CANCELLED = "CANCELLED"
}
export declare enum PaymentStatus {
    UNPAID = "UNPAID",
    PARTIALLY_PAID = "PARTIALLY_PAID",
    PAID = "PAID"
}
export declare class Expense {
    id: string;
    tenantId: string;
    reference: string;
    description: string;
    category: ExpenseCategory;
    amount: number;
    currency: string;
    supplierName: string;
    supplierContact: string;
    status: ExpenseStatus;
    paymentStatus: PaymentStatus;
    expenseDate: Date;
    dueDate: Date;
    paidDate: Date;
    paymentMethod: string;
    invoiceNumber: string;
    receiptUrl: string;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}
