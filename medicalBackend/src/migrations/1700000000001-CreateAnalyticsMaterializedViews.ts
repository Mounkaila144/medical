import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAnalyticsMaterializedViews1700000000001 implements MigrationInterface {
  name = 'CreateAnalyticsMaterializedViews1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Création de la vue matérialisée pour les revenus quotidiens
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW daily_revenue AS
      SELECT 
        tenant_id,
        DATE(created_at) AS date,
        SUM(total) AS total_revenue,
        COUNT(*) AS invoice_count
      FROM invoices
      WHERE status IN ('SENT', 'PAID')
      GROUP BY tenant_id, DATE(created_at)
      ORDER BY tenant_id, date;
      
      CREATE UNIQUE INDEX idx_daily_revenue ON daily_revenue (tenant_id, date);
    `);

    // Création de la vue matérialisée pour les KPIs des praticiens
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW practitioner_kpi AS
      SELECT 
        a.tenant_id,
        a.practitioner_id,
        u.first_name || ' ' || u.last_name AS practitioner_name,
        COUNT(a.id) AS appointment_count,
        AVG(EXTRACT(EPOCH FROM (a.end_time - a.start_time)) / 60) AS avg_appointment_duration_minutes,
        SUM(CASE WHEN i.id IS NOT NULL THEN i.total ELSE 0 END) AS total_revenue
      FROM appointments a
      JOIN users u ON a.practitioner_id = u.id
      LEFT JOIN invoices i ON a.id = i.appointment_id
      WHERE a.status = 'COMPLETED'
      GROUP BY a.tenant_id, a.practitioner_id, u.first_name, u.last_name;
      
      CREATE UNIQUE INDEX idx_practitioner_kpi ON practitioner_kpi (tenant_id, practitioner_id);
    `);

    // Création de la vue matérialisée pour le taux d'occupation
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW occupancy_rate AS
      SELECT 
        tenant_id,
        practitioner_id,
        DATE(start_time) AS date,
        SUM(EXTRACT(EPOCH FROM (end_time - start_time))) / (8 * 3600) AS daily_occupancy_rate
      FROM appointments
      WHERE status IN ('CONFIRMED', 'COMPLETED')
      GROUP BY tenant_id, practitioner_id, DATE(start_time);
      
      CREATE UNIQUE INDEX idx_occupancy_rate ON occupancy_rate (tenant_id, practitioner_id, date);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS occupancy_rate`);
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS practitioner_kpi`);
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS daily_revenue`);
  }
} 