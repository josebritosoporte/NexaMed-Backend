-- =====================================================
-- DaliaMed - Migración: Sistema de Suscripciones v1.1.0
-- =====================================================

-- =====================================================
-- TABLA: planes
-- Catálogo de planes de suscripción
-- =====================================================
DROP TABLE IF EXISTS pagos;
DROP TABLE IF EXISTS suscripciones;
DROP TABLE IF EXISTS plan_precios;
DROP TABLE IF EXISTS tasas_cambio;
DROP TABLE IF EXISTS superadmins;
DROP TABLE IF EXISTS planes;

CREATE TABLE IF NOT EXISTS planes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    max_usuarios INT NOT NULL DEFAULT 1,
    max_pacientes INT NOT NULL DEFAULT 50,
    max_storage_gb DECIMAL(5,2) NOT NULL DEFAULT 2.00,
    permite_asistente BOOLEAN DEFAULT FALSE,
    permite_adjuntos BOOLEAN DEFAULT FALSE,
    permite_branding ENUM('no', 'basico', 'completo') DEFAULT 'no',
    permite_exportacion ENUM('no', 'individual', 'masiva') DEFAULT 'no',
    permite_agenda_compartida BOOLEAN DEFAULT FALSE,
    permite_permisos_rol ENUM('no', 'basico', 'avanzado') DEFAULT 'no',
    permite_reportes_avanzados BOOLEAN DEFAULT FALSE,
    permite_plantillas BOOLEAN DEFAULT FALSE,
    permite_respaldo BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    orden INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: plan_precios
-- Precios por periodo de facturación
-- =====================================================
CREATE TABLE IF NOT EXISTS plan_precios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id INT NOT NULL,
    periodo ENUM('mensual', 'trimestral', 'semestral', 'anual') NOT NULL,
    dias INT NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    moneda VARCHAR(10) NOT NULL DEFAULT 'USD',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (plan_id) REFERENCES planes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_plan_periodo (plan_id, periodo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: tasas_cambio
-- Historial de tasa USD/Bs (BCV)
-- =====================================================
CREATE TABLE IF NOT EXISTS tasas_cambio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL UNIQUE,
    tasa_bs DECIMAL(12,4) NOT NULL,
    registrada_por INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: suscripciones
-- Suscripción activa por consultorio
-- =====================================================
CREATE TABLE IF NOT EXISTS suscripciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    consultorio_id INT NOT NULL,
    plan_id INT NOT NULL,
    periodo ENUM('mensual', 'trimestral', 'semestral', 'anual') NOT NULL DEFAULT 'mensual',
    estado ENUM('trial', 'active', 'grace_period', 'expired', 'suspended', 'cancelled') NOT NULL DEFAULT 'trial',
    fecha_inicio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_fin DATETIME NOT NULL,
    trial_ends_at DATETIME NULL,
    motivo_suspension TEXT,
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (consultorio_id) REFERENCES consultorios(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES planes(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: pagos
-- Historial de pagos y comprobantes
-- =====================================================
CREATE TABLE IF NOT EXISTS pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    suscripcion_id INT NOT NULL,
    consultorio_id INT NOT NULL,
    plan_id INT NOT NULL,
    plan_precio_id INT NULL,
    monto DECIMAL(10,2) NOT NULL,
    moneda VARCHAR(10) NOT NULL DEFAULT 'USD',
    tasa_bs_momento DECIMAL(12,4) NULL,
    monto_bs DECIMAL(14,2) NULL,
    metodo_pago ENUM('transferencia', 'paypal', 'pago_movil', 'efectivo', 'otro') NOT NULL,
    referencia VARCHAR(200),
    comprobante_nota TEXT,
    comprobante_url VARCHAR(500) NULL,
    estado ENUM('pendiente', 'aprobado', 'rechazado') NOT NULL DEFAULT 'pendiente',
    notas_admin TEXT,
    fecha_pago DATE NOT NULL,
    aprobado_por INT NULL,
    aprobado_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (suscripcion_id) REFERENCES suscripciones(id) ON DELETE CASCADE,
    FOREIGN KEY (consultorio_id) REFERENCES consultorios(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES planes(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: superadmins
-- Administradores globales de DaliaMed
-- =====================================================
CREATE TABLE IF NOT EXISTS superadmins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    ultimo_acceso TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX idx_suscripciones_consultorio ON suscripciones(consultorio_id);
CREATE INDEX idx_suscripciones_estado ON suscripciones(estado);
CREATE INDEX idx_suscripciones_fecha_fin ON suscripciones(fecha_fin);
CREATE INDEX idx_pagos_suscripcion ON pagos(suscripcion_id);
CREATE INDEX idx_pagos_estado ON pagos(estado);
CREATE INDEX idx_pagos_consultorio ON pagos(consultorio_id);
CREATE INDEX idx_tasas_fecha ON tasas_cambio(fecha);

-- =====================================================
-- DATOS INICIALES: Planes
-- =====================================================
INSERT INTO planes (nombre, slug, descripcion, max_usuarios, max_pacientes, max_storage_gb, permite_asistente, permite_adjuntos, permite_branding, permite_exportacion, permite_agenda_compartida, permite_permisos_rol, permite_reportes_avanzados, permite_plantillas, permite_respaldo, orden) VALUES
(
    'Esencial',
    'esencial',
    'Ideal para el médico independiente que empieza. Incluye gestión de pacientes, expediente clínico, notas SOAP, órdenes médicas, agenda y dashboard.',
    1, 50, 2.00,
    FALSE, FALSE, 'no', 'no', FALSE, 'no', FALSE, FALSE, FALSE,
    1
),
(
    'Profesional',
    'profesional',
    'Para el médico privado con volumen constante. Todo lo del plan Esencial más adjuntos, branding básico, exportación individual, 1 asistente y plantillas SOAP.',
    2, 100, 10.00,
    TRUE, TRUE, 'basico', 'individual', FALSE, 'basico', FALSE, TRUE, FALSE,
    2
),
(
    'Consultorio',
    'consultorio',
    'Para médicos con equipo. Todo lo del plan Profesional más agenda compartida, permisos por rol, reportes avanzados, exportación masiva y respaldo manual.',
    5, 1000, 50.00,
    TRUE, TRUE, 'completo', 'masiva', TRUE, 'avanzado', TRUE, TRUE, TRUE,
    3
);

-- =====================================================
-- DATOS INICIALES: Precios por periodo
-- =====================================================
INSERT INTO plan_precios (plan_id, periodo, dias, precio) VALUES
-- Esencial
(1, 'mensual', 30, 20.00),
(1, 'trimestral', 90, 45.00),
(1, 'semestral', 180, 60.00),
(1, 'anual', 365, 80.00),
-- Profesional
(2, 'mensual', 30, 35.00),
(2, 'trimestral', 90, 80.00),
(2, 'semestral', 180, 100.00),
(2, 'anual', 365, 130.00),
-- Consultorio
(3, 'mensual', 30, 50.00),
(3, 'trimestral', 90, 110.00),
(3, 'semestral', 180, 150.00),
(3, 'anual', 365, 180.00);

-- =====================================================
-- DATO INICIAL: SuperAdmin (contraseña: superadmin2026)
-- =====================================================
INSERT INTO superadmins (email, password_hash, nombre) VALUES
('superadmin@daliamed.com', '$2y$10$OEQxmhzdyiBfeT8p83Vu5e.2k3m9Ua24nrVpvx/Xj3jr9hB93NWtu', 'Super Administrador DaliaMed');

-- =====================================================
-- Crear suscripción trial para el consultorio de demo
-- (14 días, plan Profesional)
-- =====================================================
INSERT INTO suscripciones (consultorio_id, plan_id, periodo, estado, fecha_inicio, fecha_fin, trial_ends_at) VALUES
(1, 2, 'mensual', 'trial', NOW(), DATE_ADD(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 14 DAY));

-- =====================================================
-- Tasa de cambio inicial de referencia
-- =====================================================
INSERT INTO tasas_cambio (fecha, tasa_bs, registrada_por) VALUES
(CURDATE(), 86.8200, 1);
