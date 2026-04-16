-- =====================================================
-- NexaMed - Esquema de Base de Datos PostgreSQL
-- =====================================================

-- Eliminar tablas si existen (para recreación)
DROP TABLE IF EXISTS receta_medicamentos CASCADE;
DROP TABLE IF EXISTS diagnosticos_consulta CASCADE;
DROP TABLE IF EXISTS consultas CASCADE;
DROP TABLE IF EXISTS examenes_orden CASCADE;
DROP TABLE IF EXISTS ordenes_medicas CASCADE;
DROP TABLE IF EXISTS citas CASCADE;
DROP TABLE IF EXISTS pacientes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS consultorios CASCADE;

-- =====================================================
-- TABLA: consultorios
-- =====================================================
CREATE TABLE consultorios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    rif VARCHAR(50) UNIQUE,
    direccion TEXT,
    telefono VARCHAR(50),
    email VARCHAR(100),
    horario VARCHAR(200),
    logo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: usuarios
-- =====================================================
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    consultorio_id INTEGER REFERENCES consultorios(id) ON DELETE CASCADE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'doctor', 'assistant')),
    avatar_url VARCHAR(500),
    especialidad VARCHAR(100),
    registro_medico VARCHAR(50),
    biografia TEXT,
    telefono VARCHAR(50),
    activo BOOLEAN DEFAULT TRUE,
    ultimo_acceso TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: pacientes
-- =====================================================
CREATE TABLE pacientes (
    id SERIAL PRIMARY KEY,
    consultorio_id INTEGER REFERENCES consultorios(id) ON DELETE CASCADE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    cedula VARCHAR(50) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    sexo VARCHAR(20) NOT NULL CHECK (sexo IN ('masculino', 'femenino', 'otro')),
    estado_civil VARCHAR(20) CHECK (estado_civil IN ('soltero', 'casado', 'divorciado', 'viudo')),
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
    tipo_sangre VARCHAR(5) CHECK (tipo_sangre IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    ultima_visita DATE,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(consultorio_id, cedula)
);

-- =====================================================
-- TABLA: consultas
-- =====================================================
CREATE TABLE consultas (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER REFERENCES pacientes(id) ON DELETE CASCADE,
    medico_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    consultorio_id INTEGER REFERENCES consultorios(id) ON DELETE CASCADE,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Signos vitales
    presion_sistolica INTEGER,
    presion_diastolica INTEGER,
    frecuencia_cardiaca INTEGER,
    frecuencia_respiratoria INTEGER,
    temperatura DECIMAL(4,2),
    peso DECIMAL(5,2),
    talla DECIMAL(5,2),
    imc DECIMAL(4,2),
    saturacion_oxigeno INTEGER,
    
    -- SOAP
    subjetivo TEXT,
    objetivo TEXT,
    analisis TEXT,
    plan TEXT,
    
    notas_adicionales TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: diagnosticos_consulta
-- =====================================================
CREATE TABLE diagnosticos_consulta (
    id SERIAL PRIMARY KEY,
    consulta_id INTEGER REFERENCES consultas(id) ON DELETE CASCADE,
    codigo_cie10 VARCHAR(10) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('principal', 'secundario')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: receta_medicamentos
-- =====================================================
CREATE TABLE receta_medicamentos (
    id SERIAL PRIMARY KEY,
    consulta_id INTEGER REFERENCES consultas(id) ON DELETE CASCADE,
    nombre VARCHAR(200) NOT NULL,
    dosis VARCHAR(100),
    frecuencia VARCHAR(100),
    duracion VARCHAR(100),
    indicaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: ordenes_medicas
-- =====================================================
CREATE TABLE ordenes_medicas (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER REFERENCES pacientes(id) ON DELETE CASCADE,
    medico_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    consultorio_id INTEGER REFERENCES consultorios(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('laboratorio', 'imagenologia', 'interconsulta')),
    especialidad VARCHAR(100),
    notas TEXT,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completada', 'cancelada')),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: examenes_orden
-- =====================================================
CREATE TABLE examenes_orden (
    id SERIAL PRIMARY KEY,
    orden_id INTEGER REFERENCES ordenes_medicas(id) ON DELETE CASCADE,
    codigo VARCHAR(50) NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    categoria VARCHAR(100),
    resultado TEXT,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: citas
-- =====================================================
CREATE TABLE citas (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER REFERENCES pacientes(id) ON DELETE CASCADE,
    medico_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    consultorio_id INTEGER REFERENCES consultorios(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    motivo VARCHAR(200) NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'completada', 'cancelada')),
    notas TEXT,
    color VARCHAR(20) DEFAULT '#0d9488',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
(1, 1, 1, CURRENT_DATE, '09:00', '09:30', 'Control de presión arterial', 'confirmada', 'Traer exámenes recientes', '#0d9488'),
(2, 1, 1, CURRENT_DATE, '10:00', '10:30', 'Consulta general', 'pendiente', NULL, '#f59e0b'),
(3, 1, 1, CURRENT_DATE + 1, '11:00', '11:30', 'Seguimiento diabetes', 'confirmada', NULL, '#0d9488');

-- =====================================================
-- FUNCIÓN PARA ACTUALIZAR updated_at AUTOMÁTICAMENTE
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear triggers para actualizar updated_at
CREATE TRIGGER update_consultorios_updated_at BEFORE UPDATE ON consultorios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pacientes_updated_at BEFORE UPDATE ON pacientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consultas_updated_at BEFORE UPDATE ON consultas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ordenes_updated_at BEFORE UPDATE ON ordenes_medicas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_citas_updated_at BEFORE UPDATE ON citas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
