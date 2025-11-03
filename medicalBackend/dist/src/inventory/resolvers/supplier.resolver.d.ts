import { User } from '../../auth/entities/user.entity';
import { SupplierService } from '../services/supplier.service';
import { Supplier } from '../entities/supplier.entity';
import { CreateSupplierInput } from '../dto/supplier.dto';
export declare class SupplierResolver {
    private supplierService;
    constructor(supplierService: SupplierService);
    suppliers(user: User): Promise<Supplier[]>;
    createSupplier(input: CreateSupplierInput, user: User): Promise<Supplier>;
}
