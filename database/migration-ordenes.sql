-- Migración para agregar campos a ordenes_medicas
-- Ejecutar esto en phpMyAdmin

-- Agregar columna numero_orden
ALTER TABLE ordenes_medicas 
ADD COLUMN numero_orden VARCHAR(50) AFTER id,
ADD COLUMN consulta_id INT AFTER paciente_id;

-- Actualizar registros existentes con número de orden temporal
UPDATE ordenes_medicas 
SET numero_orden = CONCAT('ORD-2025-', LPAD(id, 4, '0'))
WHERE numero_orden IS NULL;

-- Hacer la columna NOT NULL y UNIQUE
ALTER TABLE ordenes_medicas 
MODIFY numero_orden VARCHAR(50) NOT NULL UNIQUE;

-- Agregar índice para consulta_id
CREATE INDEX idx_ordenes_consulta ON ordenes_medicas(consulta_id);

-- Agregar foreign key
ALTER TABLE ordenes_medicas 
ADD FOREIGN KEY (consulta_id) REFERENCES consultas(id) ON DELETE SET NULL;
