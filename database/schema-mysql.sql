-- =====================================================
-- NexaMed - Esquema de Base de Datos MySQL
-- =====================================================

-- Crear base de datos (ejecutar esto primero en phpMyAdmin)
-- CREATE DATABASE IF NOT EXISTS nexamed CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE nexamed;

-- =====================================================
-- TABLA: consultorios
-- =====================================================
CREATE TABLE IF NOT EXISTS consultorios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    rif VARCHAR(50) UNIQUE,
    direccion TEXT,
    telefono VARCHAR(50),
    email VARCHAR(100),
    horario VARCHAR(200),
    logo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: usuarios
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    consultorio_id INT NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    role ENUM('admin', 'doctor', 'assistant') NOT NULL DEFAULT 'doctor',
    avatar_url VARCHAR(500),
    especialidad VARCHAR(100),
    registro_medico VARCHAR(50),
    biografia TEXT,
    telefono VARCHAR(50),
    activo BOOLEAN DEFAULT TRUE,
    ultimo_acceso TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (consultorio_id) REFERENCES consultorios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: pacientes
-- =====================================================
CREATE TABLE IF NOT EXISTS pacientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    consultorio_id INT NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    cedula VARCHAR(50) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    sexo ENUM('masculino', 'femenino', 'otro') NOT NULL,
    estado_civil ENUM('soltero', 'casado', 'divorciado', 'viudo'),
    ocupacion VARCHAR(100),
    telefono VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    direccion TEXT,
    ciudad VARCHAR(100),
    contacto_emergencia_nombre VARCHAR(100),
    contacto_emergencia_telefono VARCHAR(50),
    contacto_emergencia_relacion VARCHAR(50),
    alergias TEXT,
    antecedentes_medicos TEXT,
    medicamentos_actuales TEXT,
    tipo_sangre ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    ultima_visita DATE,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (consultorio_id) REFERENCES consultorios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cedula_consultorio (consultorio_id, cedula)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: consultas
-- =====================================================
CREATE TABLE IF NOT EXISTS consultas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paciente_id INT NOT NULL,
    medico_id INT,
    consultorio_id INT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Signos vitales
    presion_sistolica INT,
    presion_diastolica INT,
    frecuencia_cardiaca INT,
    frecuencia_respiratoria INT,
    temperatura DECIMAL(4,2),
    peso DECIMAL(5,2),
    talla DECIMAL(5,2),
    imc DECIMAL(4,2),
    saturacion_oxigeno INT,
    
    -- SOAP
    subjetivo TEXT,
    objetivo TEXT,
    analisis TEXT,
    plan TEXT,
    
    notas_adicionales TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
    FOREIGN KEY (medico_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (consultorio_id) REFERENCES consultorios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: diagnosticos_consulta
-- =====================================================
CREATE TABLE IF NOT EXISTS diagnosticos_consulta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    consulta_id INT NOT NULL,
    codigo_cie10 VARCHAR(10) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    tipo ENUM('principal', 'secundario') NOT NULL DEFAULT 'secundario',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (consulta_id) REFERENCES consultas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: receta_medicamentos
-- =====================================================
CREATE TABLE IF NOT EXISTS receta_medicamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    consulta_id INT NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    dosis VARCHAR(100),
    frecuencia VARCHAR(100),
    duracion VARCHAR(100),
    indicaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (consulta_id) REFERENCES consultas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: ordenes_medicas
-- =====================================================
CREATE TABLE IF NOT EXISTS ordenes_medicas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_orden VARCHAR(50) NOT NULL UNIQUE,
    paciente_id INT NOT NULL,
    consulta_id INT,
    medico_id INT,
    consultorio_id INT NOT NULL,
    tipo ENUM('laboratorio', 'imagenologia', 'interconsulta') NOT NULL,
    especialidad VARCHAR(100),
    notas TEXT,
    estado ENUM('pendiente', 'completada', 'cancelada') DEFAULT 'pendiente',
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
    FOREIGN KEY (consulta_id) REFERENCES consultas(id) ON DELETE SET NULL,
    FOREIGN KEY (medico_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (consultorio_id) REFERENCES consultorios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: examenes_orden
-- =====================================================
CREATE TABLE IF NOT EXISTS examenes_orden (
    id INT AUTO_INCREMENT PRIMARY KEY,
    orden_id INT NOT NULL,
    codigo VARCHAR(50) NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    categoria VARCHAR(100),
    resultado TEXT,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (orden_id) REFERENCES ordenes_medicas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: citas
-- =====================================================
CREATE TABLE IF NOT EXISTS citas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paciente_id INT NOT NULL,
    medico_id INT,
    consultorio_id INT NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    motivo VARCHAR(200) NOT NULL,
    estado ENUM('pendiente', 'confirmada', 'completada', 'cancelada') DEFAULT 'pendiente',
    notas TEXT,
    color VARCHAR(20) DEFAULT '#0d9488',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
    FOREIGN KEY (medico_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (consultorio_id) REFERENCES consultorios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX idx_pacientes_consultorio ON pacientes(consultorio_id);
CREATE INDEX idx_pacientes_cedula ON pacientes(cedula);
CREATE INDEX idx_pacientes_nombre ON pacientes(nombres, apellidos);
CREATE INDEX idx_consultas_paciente ON consultas(paciente_id);
CREATE INDEX idx_consultas_fecha ON consultas(fecha);
CREATE INDEX idx_ordenes_paciente ON ordenes_medicas(paciente_id);
CREATE INDEX idx_citas_fecha ON citas(fecha);
CREATE INDEX idx_citas_paciente ON citas(paciente_id);
CREATE INDEX idx_diagnosticos_consulta ON diagnosticos_consulta(consulta_id);
CREATE INDEX idx_receta_consulta ON receta_medicamentos(consulta_id);

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar consultorio de ejemplo
INSERT INTO consultorios (nombre, rif, direccion, telefono, email, horario) VALUES
('Centro Médico Las Américas', 'J-12345678-9', 'Av. Amazonas 1234, Quito', '+593 2-222-1234', 'contacto@centromedico.com', 'Lunes a Viernes: 8:00 AM - 5:00 PM');

-- Insertar usuarios de prueba (contraseña: admin123)
-- Password hash generado con: password_hash('admin123', PASSWORD_BCRYPT)
INSERT INTO usuarios (consultorio_id, email, password_hash, nombre, role, especialidad, registro_medico, telefono) VALUES
(1, 'dr.rodriguez@nexamed.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dr. Carlos Rodríguez', 'doctor', 'Medicina Interna', 'MN-12345', '+58 412-1234567'),
(1, 'asistente@nexamed.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'María González', 'assistant', NULL, NULL, '+58 412-9876543'),
(1, 'admin@nexamed.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', 'admin', NULL, NULL, '+58 412-5555555');

-- Insertar pacientes de ejemplo
INSERT INTO pacientes (consultorio_id, nombres, apellidos, cedula, fecha_nacimiento, sexo, estado_civil, ocupacion, telefono, email, direccion, ciudad, contacto_emergencia_nombre, contacto_emergencia_telefono, contacto_emergencia_relacion, alergias, antecedentes_medicos, medicamentos_actuales, tipo_sangre, ultima_visita) VALUES
(1, 'María Elena', 'González Pérez', 'V-12345678', '1979-03-15', 'femenino', 'casado', 'Contadora', '+58 412-1234567', 'maria.gonzalez@email.com', 'Av. Principal 123, Centro', 'Quito', 'Juan González', '+58 414-1111111', 'conyuge', 'Penicilina, Yodo', 'Hipertensión, Diabetes gestacional', 'Losartán 50mg cada 24h', 'O+', '2024-01-15'),
(1, 'Carlos Alberto', 'Ruiz Mendoza', 'V-15234567', '1962-08-22', 'masculino', 'soltero', 'Abogado', '+58 414-7654321', 'carlos.ruiz@email.com', 'Calle Secundaria 456', 'Quito', 'Ana Ruiz', '+58 416-2222222', 'hermano', 'Sulfas', 'Diabetes tipo 2, Dislipidemia', 'Metformina 850mg, Atorvastatina 20mg', 'A+', '2024-01-14'),
(1, 'Ana Patricia', 'Martínez Silva', 'V-18987654', '1996-11-30', 'femenino', 'soltero', 'Diseñadora', '+58 416-9876543', 'ana.martinez@email.com', 'Sector Norte 789', 'Quito', 'Patricia Silva', '+58 424-3333333', 'madre', '', 'Migraña', '', 'B+', '2024-01-14');

-- Insertar citas de ejemplo
INSERT INTO citas (paciente_id, medico_id, consultorio_id, fecha, hora_inicio, hora_fin, motivo, estado, notas, color) VALUES
(1, 1, 1, CURDATE(), '09:00', '09:30', 'Control de presión arterial', 'confirmada', 'Traer exámenes recientes', '#0d9488'),
(2, 1, 1, CURDATE(), '10:00', '10:30', 'Consulta general', 'pendiente', NULL, '#f59e0b'),
(3, 1, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '11:00', '11:30', 'Seguimiento diabetes', 'confirmada', NULL, '#0d9488');
