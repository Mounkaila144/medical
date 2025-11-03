#!/bin/bash

# Script pour corriger les erreurs de compilation TypeScript
# À exécuter sur le serveur VPS

set -e

echo "🔍 Diagnostic des erreurs de compilation..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    log_error "Ce script doit être exécuté depuis la racine du projet medicalBackend"
    exit 1
fi

log_info "Vérification des fichiers manquants..."

# Liste des fichiers qui causent des erreurs
declare -a REQUIRED_FILES=(
    "src/common/services/minio.service.ts"
    "src/common/common.module.ts"
    "src/ehr/entities/prescription-item.entity.ts"
    "src/scheduling/dto/update-wait-queue-entry.dto.ts"
    "src/scheduling/controllers/wait-queue-test.controller.ts"
    "src/scheduling/controllers/test-simple.controller.ts"
)

# Vérifier l'existence des fichiers
MISSING_FILES=()
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
        log_error "Fichier manquant: $file"
    else
        log_success "Fichier trouvé: $file"
    fi
done

# Si des fichiers sont manquants, les créer
if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    log_warning "Création des fichiers manquants..."
    
    # Créer les répertoires nécessaires
    mkdir -p src/common/services
    mkdir -p src/common
    mkdir -p src/ehr/entities
    mkdir -p src/scheduling/dto
    mkdir -p src/scheduling/controllers
    
    # Créer minio.service.ts s'il manque
    if [[ " ${MISSING_FILES[@]} " =~ " src/common/services/minio.service.ts " ]]; then
        log_info "Création de minio.service.ts..."
        cat > src/common/services/minio.service.ts << 'EOF'
import { Injectable } from '@nestjs/common';
import * as Minio from 'minio';

@Injectable()
export class MinioService {
  private readonly minioClient: Minio.Client;

  constructor() {
    // Configuration du client MinIO
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    });
  }

  /**
   * Vérifie et crée un bucket s'il n'existe pas
   */
  async ensureBucketExists(bucketName: string): Promise<void> {
    const exists = await this.minioClient.bucketExists(bucketName);
    if (!exists) {
      await this.minioClient.makeBucket(bucketName, 'us-east-1');
    }
  }

  /**
   * Upload un buffer vers MinIO
   */
  async uploadBuffer(
    bucketName: string,
    objectName: string,
    buffer: Buffer,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<void> {
    await this.ensureBucketExists(bucketName);
    
    await this.minioClient.putObject(
      bucketName,
      objectName,
      buffer,
      buffer.length,
      {
        'Content-Type': contentType,
        ...metadata,
      }
    );
  }

  /**
   * Upload un fichier vers MinIO
   */
  async uploadFile(
    bucketName: string,
    objectName: string,
    filePath: string,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<void> {
    await this.ensureBucketExists(bucketName);
    
    await this.minioClient.fPutObject(
      bucketName,
      objectName,
      filePath,
      {
        'Content-Type': contentType,
        ...metadata,
      }
    );
  }

  /**
   * Génère une URL pré-signée pour télécharger un fichier
   */
  async getPresignedUrl(
    bucketName: string,
    objectName: string,
    expiry: number = 7 * 24 * 60 * 60 // 7 jours par défaut
  ): Promise<string> {
    return this.minioClient.presignedGetObject(bucketName, objectName, expiry);
  }

  /**
   * Récupère un objet en tant que stream
   */
  async getObject(bucketName: string, objectName: string): Promise<NodeJS.ReadableStream> {
    return this.minioClient.getObject(bucketName, objectName);
  }

  /**
   * Supprime un objet
   */
  async removeObject(bucketName: string, objectName: string): Promise<void> {
    await this.minioClient.removeObject(bucketName, objectName);
  }

  /**
   * Vérifie si un objet existe
   */
  async objectExists(bucketName: string, objectName: string): Promise<boolean> {
    try {
      await this.minioClient.statObject(bucketName, objectName);
      return true;
    } catch (error) {
      return false;
    }
  }
}
EOF
        log_success "minio.service.ts créé"
    fi
    
    # Créer common.module.ts s'il manque
    if [[ " ${MISSING_FILES[@]} " =~ " src/common/common.module.ts " ]]; then
        log_info "Création de common.module.ts..."
        cat > src/common/common.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { MinioService } from './services/minio.service';

@Module({
  providers: [MinioService],
  exports: [MinioService],
})
export class CommonModule {}
EOF
        log_success "common.module.ts créé"
    fi
    
    # Créer prescription-item.entity.ts s'il manque
    if [[ " ${MISSING_FILES[@]} " =~ " src/ehr/entities/prescription-item.entity.ts " ]]; then
        log_info "Création de prescription-item.entity.ts..."
        cat > src/ehr/entities/prescription-item.entity.ts << 'EOF'
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prescription } from './prescription.entity';

@ObjectType()
@Entity('prescription_items')
export class PrescriptionItem {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @ManyToOne(() => Prescription, (prescription) => prescription.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'prescription_id' })
  prescription: Prescription;

  @Column({ name: 'prescription_id' })
  prescriptionId: string;

  @Column()
  @Field()
  medication: string;

  @Column()
  @Field()
  dosage: string;

  @Column()
  @Field()
  frequency: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  duration?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  instructions?: string;
}
EOF
        log_success "prescription-item.entity.ts créé"
    fi
    
    # Créer update-wait-queue-entry.dto.ts s'il manque
    if [[ " ${MISSING_FILES[@]} " =~ " src/scheduling/dto/update-wait-queue-entry.dto.ts " ]]; then
        log_info "Création de update-wait-queue-entry.dto.ts..."
        cat > src/scheduling/dto/update-wait-queue-entry.dto.ts << 'EOF'
import { Field, InputType } from '@nestjs/graphql';
import { IsUUID, IsOptional, IsString, IsEnum } from 'class-validator';

export enum Priority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

@InputType()
export class UpdateWaitQueueEntryDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  practitionerId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reason?: string;
}
EOF
        log_success "update-wait-queue-entry.dto.ts créé"
    fi
    
    # Créer wait-queue-test.controller.ts s'il manque
    if [[ " ${MISSING_FILES[@]} " =~ " src/scheduling/controllers/wait-queue-test.controller.ts " ]]; then
        log_info "Création de wait-queue-test.controller.ts..."
        cat > src/scheduling/controllers/wait-queue-test.controller.ts << 'EOF'
import { Controller, Get, Patch, Delete, Param, Body, ParseUUIDPipe } from '@nestjs/common';
import { WaitQueueService } from '../services/wait-queue.service';
import { UpdateWaitQueueEntryDto } from '../dto/update-wait-queue-entry.dto';

@Controller('wait-queue-test')
export class WaitQueueTestController {
  constructor(private readonly waitQueueService: WaitQueueService) {}

  @Get()
  test() {
    return { message: 'Wait queue test endpoint works!' };
  }

  @Patch(':id')
  async testUpdate(
    @Param('id', ParseUUIDPipe) entryId: string,
    @Body() updateData: UpdateWaitQueueEntryDto,
  ) {
    // Utiliser un tenantId de test
    const testTenantId = '00000000-0000-0000-0000-000000000000';
    try {
      const result = await this.waitQueueService.updateEntry(testTenantId, entryId, updateData);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message, type: error.constructor.name };
    }
  }

  @Delete(':id')
  async testDelete(
    @Param('id', ParseUUIDPipe) entryId: string,
  ) {
    // Utiliser un tenantId de test
    const testTenantId = '00000000-0000-0000-0000-000000000000';
    try {
      await this.waitQueueService.removeEntry(testTenantId, entryId);
      return { success: true, message: 'Entry deleted successfully' };
    } catch (error) {
      return { success: false, error: error.message, type: error.constructor.name };
    }
  }
}
EOF
        log_success "wait-queue-test.controller.ts créé"
    fi
    
    # Créer test-simple.controller.ts s'il manque
    if [[ " ${MISSING_FILES[@]} " =~ " src/scheduling/controllers/test-simple.controller.ts " ]]; then
        log_info "Création de test-simple.controller.ts..."
        cat > src/scheduling/controllers/test-simple.controller.ts << 'EOF'
import { Controller, Get } from '@nestjs/common';

@Controller('test-simple')
export class TestSimpleController {
  @Get()
  test() {
    return { message: 'Simple test works!' };
  }
}
EOF
        log_success "test-simple.controller.ts créé"
    fi
    
else
    log_success "Tous les fichiers requis sont présents"
fi

# Vérifier les dépendances npm
log_info "Vérification des dépendances..."
if [ ! -d "node_modules" ]; then
    log_warning "node_modules manquant, installation des dépendances..."
    pnpm install
else
    log_success "node_modules présent"
fi

# Nettoyer le cache TypeScript
log_info "Nettoyage du cache TypeScript..."
rm -rf dist/
rm -f tsconfig.build.tsbuildinfo

# Tentative de compilation
log_info "Tentative de compilation..."
if pnpm run build; then
    log_success "Compilation réussie !"
else
    log_error "La compilation a échoué. Vérifiez les erreurs ci-dessus."
    
    # Afficher les erreurs détaillées
    log_info "Analyse des erreurs restantes..."
    pnpm run build 2>&1 | grep -E "error TS[0-9]+:" | head -10
    
    exit 1
fi

log_success "Script de correction terminé avec succès !"
echo ""
echo "🎉 Vous pouvez maintenant démarrer l'application avec:"
echo "   sudo systemctl restart medical-backend"
echo "   sudo systemctl status medical-backend"
