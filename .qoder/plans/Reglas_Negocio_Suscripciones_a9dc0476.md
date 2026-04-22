# Reglas de Negocio - Sistema de Suscripciones DaliaMed

---

## 1. ESTRUCTURA DE PLANES

### 1.1 Catalogo de Planes

| Concepto | Esencial | Profesional | Consultorio |
|---|---|---|---|
| **Publico objetivo** | Medico solo | Medico con asistente | Equipo medico |
| **Max usuarios** | 1 | 2 | 5 |
| **Max pacientes activos** | 50 | 100 | 1,000 |
| **Almacenamiento** | 2 GB | 10 GB | 50 GB |
| **Asistente** | No | Si | Si |
| **Adjuntos en consulta** | No | Si | Si |
| **Branding** | No | Basico | Completo |
| **Exportacion** | No | Individual | Masiva |
| **Agenda compartida** | No | No | Si |
| **Permisos por rol** | No | Basico | Avanzado |
| **Reportes avanzados** | No | No | Si |
| **Plantillas SOAP** | No | Si | Si |
| **Respaldo manual** | No | No | Si |

### 1.2 Precios por Periodo de Facturacion (USD)

| Periodo | Esencial | Profesional | Consultorio | Descuento aprox. |
|---|---|---|---|---|
| **Mensual** | $20 | $35 | $50 | -- |
| **Trimestral** (3 meses) | $45 | $80 | $110 | ~25% |
| **Semestral** (6 meses) | $60 | $100 | $150 | ~50% |
| **Anual** (12 meses) | $80 | $130 | $180 | ~67% |

**Regla**: El precio se cobra completo al inicio del periodo. No hay pagos fraccionados.

### 1.3 Equivalente en Bolivares (Bs)

- Todos los precios se expresan en **USD** como moneda base.
- Se muestra el **equivalente en Bs** usando la tasa oficial del BCV.
- La tasa la actualiza **manualmente el SuperAdmin** diariamente desde su panel.
- Se almacena un historico de tasas para referencia en pagos pasados.
- El cliente ve ambos precios (USD y Bs) al momento de elegir plan.

---

## 2. CICLO DE VIDA DE LA SUSCRIPCION

### 2.1 Estados

```
[registro] --> TRIAL (14 dias, plan Profesional)
    |
    +--> [paga antes de vencer] --> ACTIVE
    |
    +--> [no paga, vence trial] --> EXPIRED
    
[ACTIVE] --> [vence periodo]
    |
    +--> GRACE_PERIOD (7 dias)
    |       |
    |       +--> [paga] --> ACTIVE (renovado)
    |       |
    |       +--> [no paga, 7 dias] --> EXPIRED
    |
    +--> [SuperAdmin suspende] --> SUSPENDED
    |
    +--> [cliente cancela] --> CANCELLED

[EXPIRED] --> [paga] --> ACTIVE (reactivado)
[SUSPENDED] --> [SuperAdmin reactiva] --> ACTIVE
```

### 2.2 Que puede hacer el usuario segun estado

| Accion | TRIAL | ACTIVE | GRACE_PERIOD | EXPIRED | SUSPENDED | CANCELLED |
|---|---|---|---|---|---|---|
| Ver dashboard | Si | Si | Si | Si | Si | No |
| Ver pacientes/consultas | Si | Si | Si | Si (solo lectura) | Si (solo lectura) | No |
| Crear pacientes | Si | Si | Si | **NO** | **NO** | No |
| Crear consultas | Si | Si | Si | **NO** | **NO** | No |
| Crear citas | Si | Si | Si | **NO** | **NO** | No |
| Crear ordenes | Si | Si | Si | **NO** | **NO** | No |
| Editar registros | Si | Si | Si | **NO** | **NO** | No |
| Imprimir/Exportar | Si | Si | Si | **NO** | **NO** | No |
| Gestionar usuarios | Si | Si | Si | **NO** | **NO** | No |
| Ver Mi Suscripcion | Si | Si | Si | Si | Si | Si |
| Enviar pago | Si | Si | Si | Si | Si | No |
| Ver planes | Si | Si | Si | Si | Si | Si |

**Regla clave**: En EXPIRED y SUSPENDED, el sistema entra en **modo solo lectura**. No se puede crear, editar, eliminar, imprimir ni exportar nada. Solo ver informacion existente y gestionar la suscripcion/pago.

### 2.3 Trial

- Duracion: **14 dias**.
- Plan durante trial: **Profesional** (para que vean el valor de las features).
- Se crea automaticamente al registrarse un nuevo consultorio.
- El trial NO se puede extender (salvo manualmente por SuperAdmin).
- Durante el trial se muestra un **banner permanente** indicando dias restantes.
- Al vencer, el estado pasa a `expired` automaticamente.

### 2.4 Grace Period (Periodo de Gracia)

- Duracion: **7 dias** despues de que vence una suscripcion ACTIVE.
- Durante este periodo, el sistema sigue 100% funcional.
- Se muestra un **banner de urgencia** indicando que debe renovar.
- Si paga dentro de los 7 dias, se reactiva inmediatamente.
- Si no paga en 7 dias, pasa a `expired`.

### 2.5 Renovacion

- La renovacion es **manual con recordatorio**.
- El sistema envia notificaciones antes del vencimiento (7 dias antes, 3 dias antes, dia del vencimiento).
- El cliente envia su comprobante de pago.
- El SuperAdmin aprueba y el sistema renueva automaticamente.
- Al renovar, se puede cambiar de plan Y de periodo de facturacion.

### 2.6 Cambio de Plan

- Los cambios de plan (upgrade/downgrade) solo aplican **al momento de renovar**.
- NO hay cambio de plan a mitad de periodo.
- Al renovar, el cliente elige el nuevo plan y periodo que desee.
- Si hace downgrade y excede limites del nuevo plan (ej: tenia 80 pacientes y baja a Esencial con limite 50), los datos NO se eliminan, pero no podra crear nuevos hasta estar dentro del limite.

---

## 3. SISTEMA DE PAGOS

### 3.1 Flujo de Pago

```
1. Cliente elige plan + periodo en "Mi Suscripcion"
2. Ve precio en USD y equivalente en Bs (tasa BCV del dia)
3. Realiza pago por uno de los metodos aceptados
4. Envia comprobante desde la app (referencia + notas)
5. SuperAdmin recibe notificacion de pago pendiente
6. SuperAdmin revisa y APRUEBA o RECHAZA
7. Si aprueba: suscripcion se activa/renueva automaticamente
8. Si rechaza: se notifica al cliente con motivo
```

### 3.2 Metodos de Pago Aceptados

- Transferencia bancaria
- Zelle
- PayPal
- Pago movil
- Efectivo
- Otro

### 3.3 Datos del Comprobante

El cliente envia:
- Metodo de pago utilizado
- Numero de referencia/transaccion
- Fecha del pago
- Notas adicionales (opcional)

El SuperAdmin registra:
- Aprobacion o rechazo
- Notas administrativas
- Se guarda quien aprobo y cuando

### 3.4 Registro de Pagos

- Cada pago queda registrado con: monto en USD, tasa Bs del dia, equivalente en Bs.
- Historico completo de pagos por consultorio.
- El SuperAdmin puede ver todos los pagos (pendientes, aprobados, rechazados).

---

## 4. TASA DE CAMBIO (USD/Bs)

### 4.1 Gestion

- Nueva tabla `tasas_cambio` con: fecha, tasa_bs (Bs por 1 USD), registrada_por (superadmin_id), created_at.
- El SuperAdmin actualiza manualmente la tasa desde su panel.
- Se almacena historico (una tasa por dia).
- Si no hay tasa del dia, se usa la ultima registrada.

### 4.2 Uso en la App

- Pagina de planes: muestra precio USD + equivalente Bs con la tasa actual.
- Pagina Mi Suscripcion: muestra precio de renovacion en ambas monedas.
- Comprobante de pago: se registra la tasa vigente al momento del pago.

---

## 5. NOTIFICACIONES

### 5.1 Canales

- **Dentro de la app**: Banners en el header/dashboard.
- **Email**: Notificaciones por correo electronico.
- **WhatsApp**: Mensajes automatizados (implementacion futura, se deja estructura preparada).

### 5.2 Eventos que Generan Notificacion

| Evento | In-App | Email | WhatsApp |
|---|---|---|---|
| Trial iniciado | Banner | Bienvenida | -- |
| Trial por vencer (3 dias) | Banner urgente | Recordatorio | -- |
| Trial vencido | Banner bloqueante | Aviso | -- |
| Suscripcion por vencer (7 dias) | Banner | Recordatorio | Fase 2 |
| Suscripcion por vencer (3 dias) | Banner urgente | Recordatorio | Fase 2 |
| Suscripcion vencida (grace period) | Banner urgente | Aviso urgente | Fase 2 |
| Suscripcion expirada | Banner bloqueante | Aviso final | Fase 2 |
| Pago recibido (pendiente) | -- | Confirmacion | -- |
| Pago aprobado | Banner exito | Confirmacion | Fase 2 |
| Pago rechazado | Banner error | Aviso con motivo | Fase 2 |

**Nota**: WhatsApp se implementara en fase 2. Por ahora se deja la estructura de notificaciones preparada para agregarlo despues.

---

## 6. ONBOARDING (REGISTRO NUEVO CLIENTE)

### 6.1 Flujo de Auto-Registro

```
1. Medico llega a la landing page de DaliaMed
2. Hace clic en "Comenzar prueba gratis"
3. Llena formulario: nombre consultorio, RIF, datos personales, email, contrasena
4. Se crea: consultorio + usuario admin + suscripcion trial (14 dias, plan Profesional)
5. Redirige al dashboard con banner de bienvenida trial
6. Recibe email de bienvenida
```

### 6.2 Registro por SuperAdmin

- El SuperAdmin puede crear consultorios directamente desde su panel.
- Puede asignar cualquier plan y periodo.
- Puede omitir el trial (asignar directamente como `active`).

---

## 7. PANEL SUPERADMIN

### 7.1 Acceso

- Ruta separada: `/superadmin`
- Login independiente con credenciales de la tabla `superadmins`
- JWT separado del sistema principal

### 7.2 Funcionalidades

1. **Dashboard**: Metricas globales (suscripciones activas, trials, vencidas, ingresos del mes, ingresos totales).
2. **Suscripciones**: Lista de todas las suscripciones con filtros por estado, busqueda, acciones (suspender, reactivar, cambiar plan).
3. **Pagos pendientes**: Cola de comprobantes por aprobar/rechazar.
4. **Historial de pagos**: Todos los pagos con filtros.
5. **Tasa de cambio**: Formulario para actualizar tasa USD/Bs del dia, con historico.
6. **Consultorios**: Lista de todos los consultorios registrados con su estado de suscripcion.
7. **Crear consultorio**: Formulario para crear consultorio + usuario admin + suscripcion directamente.

---

## 8. CAMBIOS NECESARIOS AL MODELO ACTUAL

### 8.1 Base de Datos

- **Tabla `planes`**: Agregar columna `precios` como JSON o crear tabla `plan_precios` con (plan_id, periodo, precio). Recomendacion: tabla separada para normalizar.
- **Nueva tabla `plan_precios`**: plan_id, periodo (mensual/trimestral/semestral/anual), dias (30/90/180/365), precio USD.
- **Nueva tabla `tasas_cambio`**: id, fecha (UNIQUE), tasa_bs, superadmin_id, created_at.
- **Tabla `pagos`**: Agregar columnas tasa_bs_momento, monto_bs (para registrar la conversion al momento del pago). Agregar 'pago_movil' a ENUM de metodo_pago.
- **Tabla `suscripciones`**: Agregar columna `periodo` (mensual/trimestral/semestral/anual) para saber que periodo contrato.
- **Grace period**: Cambiar de 3 a 7 dias en la logica de `checkExpired()`.

### 8.2 Archivos a Crear/Modificar

**Backend (PHP):**
- Modificar: `database/migration-suscripciones.sql` - nuevas tablas y columnas
- Crear: `models/TasaCambio.php` - modelo para tasas
- Crear: `models/PlanPrecio.php` - o integrar en Plan.php
- Modificar: `models/Suscripcion.php` - grace period 7 dias, periodo
- Modificar: `models/Pago.php` - campos tasa/monto Bs
- Crear: `api/planes.php` - listar planes con precios (publico)
- Crear: `api/suscripciones.php` - mi suscripcion, enviar pago
- Crear: `api/superadmin.php` - panel completo
- Modificar: `api.php` - registrar nuevas rutas
- Modificar: APIs existentes (`pacientes.php`, `consultas.php`, etc.) - integrar middleware

**Frontend (React):**
- Crear: pagina Planes/Pricing (publica)
- Crear: pagina Mi Suscripcion
- Crear: componente Banner de suscripcion
- Crear: modal Enviar Pago
- Crear: flujo de auto-registro
- Crear: seccion completa SuperAdmin (login + dashboard + gestion)
- Modificar: `AuthContext.tsx` - manejar estado de suscripcion
- Modificar: `api.ts` - nuevos endpoints

---

## 9. ORDEN DE IMPLEMENTACION SUGERIDO

1. **Task 1**: Actualizar modelo de datos (migracion SQL con tablas plan_precios, tasas_cambio, columnas nuevas)
2. **Task 2**: Modelos PHP actualizados (Plan con precios, TasaCambio, Suscripcion con periodo, Pago con tasa Bs)
3. **Task 3**: Middleware de suscripcion ajustado (grace period 7 dias, modo solo lectura)
4. **Task 4**: APIs backend (planes, suscripciones, superadmin, tasa cambio)
5. **Task 5**: Integrar middleware en TODAS las APIs existentes
6. **Task 6**: Frontend - Servicios API + Contexto de suscripcion
7. **Task 7**: Frontend - Banner + Mi Suscripcion + Enviar Pago
8. **Task 8**: Frontend - Panel SuperAdmin completo
9. **Task 9**: Frontend - Auto-registro con trial
10. **Task 10**: Notificaciones (in-app primero, email despues)
11. **Task 11**: Build, pruebas, despliegue
