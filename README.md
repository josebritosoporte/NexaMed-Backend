# NexaMed Backend API

Backend REST API para la plataforma de gestión clínica NexaMed.

## Tecnologías

- **PHP 8+** - Lenguaje de programación
- **PostgreSQL** - Base de datos
- **PDO** - Conexión a base de datos
- **JWT** - Autenticación con tokens

## Estructura de Directorios

```
NexaMed-Backend/
├── api/                    # Endpoints de la API
│   ├── auth.php           # Autenticación
│   ├── pacientes.php      # CRUD de pacientes
│   ├── consultas.php      # Consultas médicas SOAP
│   ├── ordenes.php        # Órdenes médicas
│   ├── citas.php          # Agenda de citas
│   └── dashboard.php      # Estadísticas
├── config/
│   └── database.php       # Configuración PostgreSQL
├── middleware/
│   ├── cors.php          # Middleware CORS
│   └── auth.php          # Middleware de autenticación
├── models/
│   ├── Paciente.php      # Modelo de pacientes
│   └── Usuario.php       # Modelo de usuarios
├── utils/
│   ├── jwt.php           # Utilidad JWT
│   └── response.php      # Respuestas JSON
├── database/
│   └── schema.sql        # Esquema de base de datos
├── index.php             # Router principal
└── .htaccess            # Configuración Apache
```

## Instalación

### 1. Configurar Base de Datos PostgreSQL

```bash
# Crear base de datos
createdb nexamed

# Ejecutar script de esquema
psql -U postgres -d nexamed -f database/schema.sql
```

### 2. Configurar Variables de Entorno

Editar `config/database.php` o establecer variables de entorno:

```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=nexamed
export DB_USER=postgres
export DB_PASS=tu_password
export JWT_SECRET=tu_secreto_jwt
```

### 3. Configurar Apache

Asegurarse de que el módulo `mod_rewrite` esté habilitado:

```bash
# En XAMPP, verificar que esté descomentado en httpd.conf:
LoadModule rewrite_module modules/mod_rewrite.so
```

### 4. Acceder a la API

```
http://localhost/NexaMed-Backend/
```

## Endpoints

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Obtener usuario actual |

### Pacientes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/pacientes` | Listar pacientes |
| POST | `/api/pacientes` | Crear paciente |
| GET | `/api/pacientes/{id}` | Obtener paciente |
| PUT | `/api/pacientes/{id}` | Actualizar paciente |
| DELETE | `/api/pacientes/{id}` | Eliminar paciente |

## Usuarios de Prueba

| Email | Rol | Contraseña |
|-------|-----|------------|
| dr.rodriguez@nexamed.com | doctor | admin123 |
| asistente@nexamed.com | assistant | admin123 |
| admin@nexamed.com | admin | admin123 |

## Respuesta JSON Estándar

```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { ... },
  "timestamp": "2026-04-15 10:30:00"
}
```

## Autenticación

Todas las peticiones (excepto login) deben incluir el header:

```
Authorization: Bearer {token_jwt}
```

## Licencia

Proyecto privado - NexaMed
