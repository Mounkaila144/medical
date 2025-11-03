import { DocumentType } from '../entities/scanned-document.entity';
export declare class CreateDocumentDto {
    patientId: string;
    docType: DocumentType;
    tags?: string[];
    uploadedBy: string;
}
