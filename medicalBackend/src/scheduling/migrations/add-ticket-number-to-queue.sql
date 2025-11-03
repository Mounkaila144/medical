-- Migration: Ajouter le système de numérotation de tickets à la file d'attente
-- Date: 2025-11-01
-- Description: Ajout des colonnes ticket_number, status, et called_at à wait_queue_entries

-- Ajouter la colonne ticket_number
ALTER TABLE wait_queue_entries
ADD COLUMN IF NOT EXISTS ticket_number VARCHAR(10);

-- Créer l'enum QueueStatus s'il n'existe pas
DO $$ BEGIN
    CREATE TYPE queue_status AS ENUM ('WAITING', 'CALLED', 'SERVING', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ajouter la colonne status avec valeur par défaut WAITING
ALTER TABLE wait_queue_entries
ADD COLUMN IF NOT EXISTS status queue_status DEFAULT 'WAITING';

-- Ajouter la colonne called_at pour enregistrer quand le patient a été appelé
ALTER TABLE wait_queue_entries
ADD COLUMN IF NOT EXISTS called_at TIMESTAMP;

-- Mettre à jour les entrées existantes
-- Générer des ticket_numbers pour les entrées existantes qui n'en ont pas
WITH numbered_entries AS (
    SELECT
        id,
        ROW_NUMBER() OVER (ORDER BY created_at) as row_num
    FROM wait_queue_entries
    WHERE ticket_number IS NULL
)
UPDATE wait_queue_entries wq
SET ticket_number = CONCAT(
    CHR(65 + ((ne.row_num - 1) / 999)),  -- Lettre A-Z
    LPAD(((ne.row_num - 1) % 999 + 1)::TEXT, 3, '0')  -- Numéro 001-999
)
FROM numbered_entries ne
WHERE wq.id = ne.id;

-- Mettre à jour le statut des entrées existantes
-- Les entrées non servies sont en attente
UPDATE wait_queue_entries
SET status = 'WAITING'
WHERE served_at IS NULL AND status IS NULL;

-- Les entrées servies sont complétées
UPDATE wait_queue_entries
SET status = 'COMPLETED'
WHERE served_at IS NOT NULL AND status IS NULL;

-- Créer un index sur ticket_number pour des recherches rapides
CREATE INDEX IF NOT EXISTS idx_wait_queue_ticket_number ON wait_queue_entries(ticket_number);

-- Créer un index sur status pour filtrer efficacement
CREATE INDEX IF NOT EXISTS idx_wait_queue_status ON wait_queue_entries(status);

-- Créer un index composé pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_wait_queue_tenant_status ON wait_queue_entries(tenant_id, status);

-- Commentaires pour la documentation
COMMENT ON COLUMN wait_queue_entries.ticket_number IS 'Numéro de ticket unique (format: A001, A002, etc.)';
COMMENT ON COLUMN wait_queue_entries.status IS 'Statut du patient dans la file d''attente';
COMMENT ON COLUMN wait_queue_entries.called_at IS 'Horodatage de l''appel du patient';

-- Afficher un message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Migration terminée avec succès !';
    RAISE NOTICE 'Colonnes ajoutées : ticket_number, status, called_at';
    RAISE NOTICE 'Index créés pour améliorer les performances';
END $$;
