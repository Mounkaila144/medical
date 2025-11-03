import { ScannedDocument } from '../entities/scanned-document.entity';
import { DocumentsService } from '../services/documents.service';
export declare class DocumentsResolver {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    patientDocuments(patientId: string, context: any): Promise<ScannedDocument[]>;
    deleteDocument(id: string, context: any): Promise<boolean>;
}
