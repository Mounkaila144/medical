"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAnalyticsMaterializedViews1700000000001 = void 0;
class CreateAnalyticsMaterializedViews1700000000001 {
    name = 'CreateAnalyticsMaterializedViews1700000000001';
    async up(queryRunner) {
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
    async down(queryRunner) {
        await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS occupancy_rate`);
        await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS practitioner_kpi`);
        await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS daily_revenue`);
    }
}
exports.CreateAnalyticsMaterializedViews1700000000001 = CreateAnalyticsMaterializedViews1700000000001;
//# sourceMappingURL=1700000000001-CreateAnalyticsMaterializedViews.js.map