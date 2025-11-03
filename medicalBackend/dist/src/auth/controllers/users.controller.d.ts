import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto, currentUser: any): Promise<import("../entities/user.entity").User>;
    findAll(currentUser: any): Promise<import("../entities/user.entity").User[]>;
    findOne(id: string): Promise<import("../entities/user.entity").User>;
    update(id: string, updateUserDto: UpdateUserDto, currentUser: any): Promise<import("../entities/user.entity").User>;
    remove(id: string): Promise<import("../entities/user.entity").User>;
}
