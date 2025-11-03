-- Migration MySQL: Ajouter le système de numérotation de tickets à la file d'attente
-- Date: 2025-11-01
-- Description: Ajout des colonnes ticket_number, status, et called_at à wait_queue_entries

-- Ajouter la colonne ticket_number
ALTER TABLE `wait_queue_entries`
ADD COLUMN `ticket_number` VARCHAR(10) NULL AFTER `rank`;

-- Ajouter la colonne status avec enum et valeur par défaut WAITING
ALTER TABLE `wait_queue_entries`
ADD COLUMN `status` ENUM('WAITING', 'CALLED', 'SERVING', 'COMPLETED', 'CANCELLED')
DEFAULT 'WAITING' AFTER `ticket_number`;

-- Ajouter la colonne called_at pour enregistrer quand le patient a été appelé
ALTER TABLE `wait_queue_entries`
ADD COLUMN `called_at` TIMESTAMP NULL AFTER `status`;

-- Mettre à jour les entrées existantes
-- Générer des ticket_numbers pour les entrées existantes qui n'en ont pas
SET @row_number = 0;

UPDATE `wait_queue_entries`
SET `ticket_number` = CONCAT(
    CHAR(65 + FLOOR(@row_number / 999)),  -- Lettre A-Z
    LPAD(((@row_number := @row_number + 1) % 999 + 1), 3, '0')  -- Numéro 001-999
)
WHERE `ticket_number` IS NULL
ORDER BY `created_at`;

-- Mettre à jour le statut des entrées existantes
-- Les entrées non servies sont en attente
UPDATE `wait_queue_entries`
SET `status` = 'WAITING'
WHERE `served_at` IS NULL AND `status` IS NULL;

-- Les entrées servies sont complétées
UPDATE `wait_queue_entries`
SET `status` = 'COMPLETED'
WHERE `served_at` IS NOT NULL AND `status` IS NULL;

-- Créer des index pour améliorer les performances
-- Index sur ticket_number pour des recherches rapides
CREATE INDEX `idx_wait_queue_ticket_number` ON `wait_queue_entries`(`ticket_number`);

-- Index sur status pour filtrer efficacement
CREATE INDEX `idx_wait_queue_status` ON `wait_queue_entries`(`status`);

-- Index composé pour les requêtes fréquentes (tenant_id + status)
CREATE INDEX `idx_wait_queue_tenant_status` ON `wait_queue_entries`(`tenant_id`, `status`);

-- Afficher un message de confirmation
SELECT 'Migration terminée avec succès !' AS Message;
SELECT 'Colonnes ajoutées : ticket_number, status, called_at' AS Info;
SELECT 'Index créés pour améliorer les performances' AS Info2;