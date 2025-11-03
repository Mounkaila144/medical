import { DocumentsService } from '../services/documents.service';
import { CreateDocumentDto } from '../dto/create-document.dto';
import { ScannedDocument } from '../entities/scanned-document.entity';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    upload(file: Express.Multer.File, createDocumentDto: CreateDocumentDto, req: any): Promise<ScannedDocument>;
    listByPatient(patientId: string, req: any): Promise<ScannedDocument[]>;
    remove(id: string, req: any): Promise<void>;
}
