const { chromium } = require('playwright');
const fs = require('fs');

const contenidoHTML = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Análisis NexaMed Frontend - Documentación Backend</title>
    <style>
        @page { margin: 20mm; size: A4; }
        * { box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            font-size: 10pt; 
            line-height: 1.5; 
            color: #333;
            margin: 0;
            padding: 0;
        }
        .page-break { page-break-before: always; }
        h1 { 
            color: #0d9488; 
            font-size: 18pt; 
            border-bottom: 3px solid #0d9488; 
            padding-bottom: 10px;
            margin-top: 0;
        }
        h2 { 
            color: #0f766e; 
            font-size: 14pt; 
            margin-top: 20px;
            border-left: 4px solid #0d9488;
            padding-left: 10px;
        }
        h3 { 
            color: #115e59; 
            font-size: 12pt; 
            margin-top: 15px;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 10px 0;
            font-size: 9pt;
        }
        th, td { 
            border: 1px solid #ddd; 
            padding: 6px 8px; 
            text-align: left; 
        }
        th { 
            background: #0d9488; 
            color: white;
            font-weight: 600;
        }
        tr:nth-child(even) { background: #f8fafc; }
        .header { 
            background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
            color: white; 
            padding: 30px; 
            text-align: center;
            margin: -20mm -20mm 20px -20mm;
        }
        .header h1 { 
            color: white; 
            border: none; 
            font-size: 24pt;
            margin: 0;
        }
        .header p { 
            margin: 10px 0 0 0; 
            font-size: 12pt;
            opacity: 0.9;
        }
        code { 
            background: #f1f5f9; 
            padding: 2px 6px; 
            border-radius: 3px;
            font-family: 'Consolas', monospace;
            font-size: 9pt;
        }
        .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 8pt;
            font-weight: 600;
        }
        .badge-si { background: #dcfce7; color: #166534; }
        .badge-no { background: #fee2e2; color: #991b1b; }
        .endpoint { 
            background: #f8fafc; 
            border-left: 4px solid #3b82f6;
            padding: 10px;
            margin: 8px 0;
        }
        .method-get { color: #22c55e; font-weight: bold; }
        .method-post { color: #3b82f6; font-weight: bold; }
        .method-put { color: #f59e0b; font-weight: bold; }
        .method-delete { color: #ef4444; font-weight: bold; }
        .method-patch { color: #8b5cf6; font-weight: bold; }
        ul, ol { margin: 8px 0; padding-left: 20px; }
        li { margin: 4px 0; }
        .diagram {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 15px;
            font-family: 'Consolas', monospace;
            font-size: 8pt;
            white-space: pre;
            overflow-x: auto;
        }
        .info-box {
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 12px;
            margin: 10px 0;
        }
        .warning-box {
            background: #fffbeb;
            border-left: 4px solid #f59e0b;
            padding: 12px;
            margin: 10px 0;
        }
        .success-box {
            background: #f0fdf4;
            border-left: 4px solid #22c55e;
            padding: 12px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏥 NexaMed</h1>
        <p>Análisis Completo del Frontend para Desarrollo Backend</p>
        <p style="font-size: 10pt; margin-top: 15px;">Documentación Técnica v1.0 | Abril 2026</p>
    </div>

    <h1>🧠 1. Descripción General del Sistema</h1>
    
    <table>
        <tr><th>Aspecto</th><th>Descripción</th></tr>
        <tr><td><strong>Propósito</strong></td><td>Plataforma SaaS de gestión clínica médica para consultorios y clínicas</td></tr>
        <tr><td><strong>Tipo de sistema</strong></td><td>SaaS multiusuario con soporte multi-tenant (varios consultorios)</td></tr>
        <tr><td><strong>Problema que resuelve</strong></td><td>Digitalización de historias clínicas, gestión de pacientes, citas, consultas médicas SOAP, órdenes de laboratorio/imagenología y generación de reportes médicos</td></tr>
        <tr><td><strong>Usuarios objetivo</strong></td><td>Médicos, asistentes médicos, administradores de clínicas</td></tr>
        <tr><td><strong>Modelo de negocio</strong></td><td>SaaS - Suscripción por consultorio/clínica</td></tr>
    </table>

    <div class="page-break"></div>

    <h1>🖥️ 2. Pantallas / Vistas del Frontend</h1>

    <table>
        <tr>
            <th>#</th>
            <th>Pantalla</th>
            <th>Descripción</th>
            <th>Función Principal</th>
            <th>Acciones del Usuario</th>
        </tr>
        <tr><td>1</td><td><strong>Login</strong></td><td>Autenticación de usuarios</td><td>Ingreso seguro al sistema</td><td>Iniciar sesión con email/contraseña</td></tr>
        <tr><td>2</td><td><strong>Dashboard</strong></td><td>Panel principal con métricas</td><td>Vista general del consultorio</td><td>Ver estadísticas, citas del día, actividad reciente, órdenes pendientes</td></tr>
        <tr><td>3</td><td><strong>Pacientes</strong></td><td>Lista y gestión de pacientes</td><td>CRUD completo de pacientes</td><td>Crear, ver, editar, eliminar pacientes; buscar; filtrar; acceder a expediente</td></tr>
        <tr><td>4</td><td><strong>Expediente Clínico</strong></td><td>Historial médico del paciente</td><td>Timeline de eventos médicos</td><td>Ver historial, ver detalles de consultas/órdenes, crear nueva consulta/orden</td></tr>
        <tr><td>5</td><td><strong>Nueva Consulta</strong></td><td>Formulario SOAP médico</td><td>Registrar atención médica</td><td>Ingresar signos vitales, SOAP, diagnósticos CIE-10, receta médica</td></tr>
        <tr><td>6</td><td><strong>Nueva Orden</strong></td><td>Órdenes médicas</td><td>Generar órdenes de laboratorio/imagenología/interconsulta</td><td>Seleccionar exámenes, agregar notas, imprimir/generar PDF</td></tr>
        <tr><td>7</td><td><strong>Consultas</strong></td><td>Historial de consultas</td><td>Listado de atenciones médicas</td><td>Ver, buscar, filtrar consultas pasadas</td></tr>
        <tr><td>8</td><td><strong>Órdenes</strong></td><td>Gestión de órdenes médicas</td><td>Listado de órdenes generadas</td><td>Ver estado, descargar PDF, marcar como completada</td></tr>
        <tr><td>9</td><td><strong>Agenda</strong></td><td>Calendario de citas</td><td>Programación de citas</td><td>Vista mensual/semanal, crear/editar/eliminar citas, cambiar estado</td></tr>
        <tr><td>10</td><td><strong>Configuración</strong></td><td>Ajustes del sistema</td><td>Perfil, consultorio, preferencias</td><td>Editar perfil, configurar consultorio, notificaciones, tema, seguridad</td></tr>
    </table>

    <div class="page-break"></div>

    <h1>🔄 3. Flujos de Usuario</h1>

    <h2>Flujo 1: Autenticación y Acceso</h2>
    <ol>
        <li>Usuario accede a <code>/login</code></li>
        <li>Ingresa email y contraseña</li>
        <li>Sistema valida credenciales</li>
        <li>Redirige al Dashboard</li>
        <li>Sesión persistida en localStorage (<code>nexamed_user</code>)</li>
    </ol>

    <h2>Flujo 2: Registro de Nuevo Paciente</h2>
    <ol>
        <li>Usuario va a "Pacientes"</li>
        <li>Clic en "Nuevo Paciente"</li>
        <li>Completa formulario en 4 tabs:
            <ul>
                <li><strong>Datos Personales</strong> (obligatorios: nombres, apellidos, cédula, fecha nacimiento, sexo, teléfono)</li>
                <li><strong>Contacto</strong> (email, dirección, ciudad)</li>
                <li><strong>Emergencia</strong> (nombre, teléfono, relación)</li>
                <li><strong>Información Médica</strong> (alergias, antecedentes, medicamentos, tipo sangre)</li>
            </ul>
        </li>
        <li>Guarda paciente</li>
        <li>Redirige a lista de pacientes</li>
    </ol>

    <h2>Flujo 3: Nueva Consulta Médica (SOAP)</h2>
    <ol>
        <li>Desde Pacientes → "Nueva Consulta" O desde Expediente → "Nueva Consulta"</li>
        <li>Sistema carga datos del paciente</li>
        <li>Médico ingresa:
            <ul>
                <li>Signos Vitales (presión, FC, FR, temperatura, peso, talla, IMC, SpO2)</li>
                <li>SOAP: Subjetivo, Objetivo, Análisis, Plan</li>
                <li>Diagnósticos CIE-10 (principal y secundarios)</li>
                <li>Receta: medicamentos con dosis, frecuencia, duración, indicaciones</li>
            </ul>
        </li>
        <li>Guarda consulta</li>
        <li>Actualiza expediente del paciente</li>
    </ol>

    <h2>Flujo 4: Generar Orden Médica</h2>
    <ol>
        <li>Desde Expediente → "Nueva Orden"</li>
        <li>Selecciona tipo: Laboratorio / Imagenología / Interconsulta</li>
        <li>Selecciona exámenes/especialidad del catálogo</li>
        <li>Agrega notas/observaciones</li>
        <li>Genera vista previa del PDF</li>
        <li>Imprime o descarga PDF</li>
    </ol>

    <h2>Flujo 5: Programar Cita</h2>
    <ol>
        <li>Va a Agenda</li>
        <li>Selecciona fecha/hora en calendario</li>
        <li>Completa: paciente (búsqueda), motivo, duración, notas</li>
        <li>Guarda cita</li>
        <li>Sistema muestra cita en calendario con color según estado</li>
    </ol>

    <h2>Flujo 6: Ver Expediente Clínico</h2>
    <ol>
        <li>Desde Pacientes → "Ver Expediente"</li>
        <li>Sistema muestra timeline cronológico</li>
        <li>Eventos mostrados: consultas, órdenes, resultados</li>
        <li>Puede expandir detalles de cada evento</li>
        <li>Acciones rápidas: Nueva Consulta, Nueva Orden</li>
    </ol>

    <div class="page-break"></div>

    <h1>🧾 4. Formularios (CRÍTICO)</h1>

    <h2>Formulario: Paciente (Crear/Editar)</h2>

    <h3>Tab: Datos Personales</h3>
    <table>
        <tr><th>Campo</th><th>Tipo</th><th>Obligatorio</th><th>Validaciones</th></tr>
        <tr><td>nombres</td><td>string</td><td><span class="badge badge-si">SÍ</span></td><td>No vacío, máx 100 caracteres</td></tr>
        <tr><td>apellidos</td><td>string</td><td><span class="badge badge-si">SÍ</span></td><td>No vacío, máx 100 caracteres</td></tr>
        <tr><td>cedula</td><td>string</td><td><span class="badge badge-si">SÍ</span></td><td>Única, formato: V-XX.XXX.XXX o E-XX.XXX.XXX</td></tr>
        <tr><td>fechaNacimiento</td><td>date</td><td><span class="badge badge-si">SÍ</span></td><td>No futura, mayor de edad opcional</td></tr>
        <tr><td>sexo</td><td>enum</td><td><span class="badge badge-si">SÍ</span></td><td>'masculino', 'femenino', 'otro'</td></tr>
        <tr><td>estadoCivil</td><td>enum</td><td><span class="badge badge-no">NO</span></td><td>'soltero', 'casado', 'divorciado', 'viudo'</td></tr>
        <tr><td>ocupacion</td><td>string</td><td><span class="badge badge-no">NO</span></td><td>Máx 100 caracteres</td></tr>
    </table>

    <h3>Tab: Contacto</h3>
    <table>
        <tr><th>Campo</th><th>Tipo</th><th>Obligatorio</th><th>Validaciones</th></tr>
        <tr><td>telefono</td><td>string</td><td><span class="badge badge-si">SÍ</span></td><td>Formato: +XX XXX-XXXXXXX</td></tr>
        <tr><td>email</td><td>string</td><td><span class="badge badge-no">NO</span></td><td>Formato email válido</td></tr>
        <tr><td>direccion</td><td>text</td><td><span class="badge badge-no">NO</span></td><td>Máx 255 caracteres</td></tr>
        <tr><td>ciudad</td><td>string</td><td><span class="badge badge-no">NO</span></td><td>Máx 100 caracteres</td></tr>
    </table>

    <h3>Tab: Contacto de Emergencia</h3>
    <table>
        <tr><th>Campo</th><th>Tipo</th><th>Obligatorio</th><th>Validaciones</th></tr>
        <tr><td>contactoEmergenciaNombre</td><td>string</td><td><span class="badge badge-no">NO</span></td><td>Máx 100 caracteres</td></tr>
        <tr><td>contactoEmergenciaTelefono</td><td>string</td><td><span class="badge badge-no">NO</span></td><td>Formato teléfono</td></tr>
        <tr><td>contactoEmergenciaRelacion</td><td>enum</td><td><span class="badge badge-no">NO</span></td><td>'conyuge', 'padre', 'madre', 'hijo', 'hermano', 'otro'</td></tr>
    </table>

    <h3>Tab: Información Médica</h3>
    <table>
        <tr><th>Campo</th><th>Tipo</th><th>Obligatorio</th><th>Validaciones</th></tr>
        <tr><td>alergias</td><td>text</td><td><span class="badge badge-no">NO</span></td><td>Array separado por comas</td></tr>
        <tr><td>antecedentesMedicos</td><td>text</td><td><span class="badge badge-no">NO</span></td><td>Array separado por comas</td></tr>
        <tr><td>medicamentosActuales</td><td>text</td><td><span class="badge badge-no">NO</span></td><td>Texto libre</td></tr>
        <tr><td>tipoSangre</td><td>enum</td><td><span class="badge badge-no">NO</span></td><td>'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'</td></tr>
    </table>

    <div class="page-break"></div>

    <h2>Formulario: Consulta Médica (SOAP)</h2>

    <h3>Signos Vitales</h3>
    <table>
        <tr><th>Campo</th><th>Tipo</th><th>Obligatorio</th><th>Validaciones</th></tr>
        <tr><td>presionSistolica</td><td>number</td><td><span class="badge badge-no">NO</span></td><td>50-250 mmHg</td></tr>
        <tr><td>presionDiastolica</td><td>number</td><td><span class="badge badge-no">NO</span></td><td>30-150 mmHg</td></tr>
        <tr><td>frecuenciaCardiaca</td><td>number</td><td><span class="badge badge-no">NO</span></td><td>30-200 lpm</td></tr>
        <tr><td>frecuenciaRespiratoria</td><td>number</td><td><span class="badge badge-no">NO</span></td><td>8-60 rpm</td></tr>
        <tr><td>temperatura</td><td>number</td><td><span class="badge badge-no">NO</span></td><td>35-42 °C</td></tr>
        <tr><td>peso</td><td>number</td><td><span class="badge badge-no">NO</span></td><td>0.5-300 kg</td></tr>
        <tr><td>talla</td><td>number</td><td><span class="badge badge-no">NO</span></td><td>30-250 cm</td></tr>
        <tr><td>imc</td><td>number</td><td><span class="badge badge-no">NO</span></td><td>Calculado automático</td></tr>
        <tr><td>saturacionOxigeno</td><td>number</td><td><span class="badge badge-no">NO</span></td><td>50-100%</td></tr>
    </table>

    <h3>SOAP</h3>
    <table>
        <tr><th>Campo</th><th>Tipo</th><th>Descripción</th></tr>
        <tr><td>subjetivo</td><td>text</td><td>Síntomas que refiere el paciente</td></tr>
        <tr><td>objetivo</td><td>text</td><td>Hallazgos del examen físico</td></tr>
        <tr><td>analisis</td><td>text</td><td>Interpretación médica</td></tr>
        <tr><td>plan</td><td>text</td><td>Tratamiento, indicaciones, estudios</td></tr>
    </table>

    <h3>Diagnósticos (Array)</h3>
    <table>
        <tr><th>Campo</th><th>Tipo</th><th>Obligatorio</th></tr>
        <tr><td>codigo</td><td>string (CIE-10)</td><td><span class="badge badge-si">SÍ</span></td></tr>
        <tr><td>descripcion</td><td>string</td><td><span class="badge badge-si">SÍ</span></td></tr>
        <tr><td>tipo</td><td>enum</td><td><span class="badge badge-si">SÍ</span> ('principal', 'secundario')</td></tr>
    </table>

    <h3>Receta - Medicamentos (Array)</h3>
    <table>
        <tr><th>Campo</th><th>Tipo</th><th>Obligatorio</th></tr>
        <tr><td>nombre</td><td>string</td><td><span class="badge badge-si">SÍ</span></td></tr>
        <tr><td>dosis</td><td>string</td><td><span class="badge badge-no">NO</span> (ej: "1 tableta")</td></tr>
        <tr><td>frecuencia</td><td>string</td><td><span class="badge badge-no">NO</span> (ej: "cada 8 horas")</td></tr>
        <tr><td>duracion</td><td>string</td><td><span class="badge badge-no">NO</span> (ej: "7 días")</td></tr>
        <tr><td>indicaciones</td><td>text</td><td><span class="badge badge-no">NO</span></td></tr>
    </table>

    <h2>Formulario: Orden Médica</h2>
    <table>
        <tr><th>Campo</th><th>Tipo</th><th>Obligatorio</th><th>Descripción</th></tr>
        <tr><td>tipo</td><td>enum</td><td><span class="badge badge-si">SÍ</span></td><td>'laboratorio', 'imagenologia', 'interconsulta'</td></tr>
        <tr><td>pacienteId</td><td>string</td><td><span class="badge badge-si">SÍ</span></td><td>Referencia al paciente</td></tr>
        <tr><td>examenes</td><td>array</td><td>Condicional</td><td>IDs de exámenes (si tipo=laboratorio/imagenologia)</td></tr>
        <tr><td>especialidad</td><td>string</td><td>Condicional</td><td>Especialidad destino (si tipo=interconsulta)</td></tr>
        <tr><td>notas</td><td>text</td><td><span class="badge badge-no">NO</span></td><td>Indicaciones adicionales</td></tr>
        <tr><td>medicoId</td><td>string</td><td><span class="badge badge-si">SÍ</span></td><td>Médico que ordena</td></tr>
    </table>

    <h2>Formulario: Cita (Agenda)</h2>
    <table>
        <tr><th>Campo</th><th>Tipo</th><th>Obligatorio</th><th>Validaciones</th></tr>
        <tr><td>pacienteId</td><td>string</td><td><span class="badge badge-si">SÍ</span></td><td>Referencia a paciente existente</td></tr>
        <tr><td>fecha</td><td>date</td><td><span class="badge badge-si">SÍ</span></td><td>No pasada</td></tr>
        <tr><td>horaInicio</td><td>time</td><td><span class="badge badge-si">SÍ</span></td><td>Formato HH:MM</td></tr>
        <tr><td>horaFin</td><td>time</td><td><span class="badge badge-si">SÍ</span></td><td>Calculado por duración</td></tr>
        <tr><td>motivo</td><td>string</td><td><span class="badge badge-si">SÍ</span></td><td>Máx 200 caracteres</td></tr>
        <tr><td>estado</td><td>enum</td><td><span class="badge badge-si">SÍ</span></td><td>'pendiente', 'confirmada', 'completada', 'cancelada'</td></tr>
        <tr><td>notas</td><td>text</td><td><span class="badge badge-no">NO</span></td><td>Máx 500 caracteres</td></tr>
        <tr><td>color</td><td>string</td><td><span class="badge badge-no">NO</span></td><td>Hex color para UI</td></tr>
    </table>

    <div class="page-break"></div>

    <h1>🔗 5. Endpoints que el Frontend Espera</h1>

    <h2>Autenticación</h2>
    <div class="endpoint">
        <span class="method-post">POST</span> <code>/api/auth/login</code><br>
        <strong>Request:</strong> <code>{ email, password }</code><br>
        <strong>Response:</strong> <code>{ user: {id, email, name, role, avatar}, token }</code>
    </div>
    <div class="endpoint">
        <span class="method-post">POST</span> <code>/api/auth/logout</code><br>
        <strong>Response:</strong> <code>{ success: true }</code>
    </div>
    <div class="endpoint">
        <span class="method-get">GET</span> <code>/api/auth/me</code><br>
        <strong>Headers:</strong> Authorization<br>
        <strong>Response:</strong> <code>{ user }</code>
    </div>
    <div class="endpoint">
        <span class="method-post">POST</span> <code>/api/auth/refresh</code><br>
        <strong>Request:</strong> <code>{ refreshToken }</code><br>
        <strong>Response:</strong> <code>{ token, refreshToken }</code>
    </div>

    <h2>Pacientes</h2>
    <div class="endpoint">
        <span class="method-get">GET</span> <code>/api/pacientes</code><br>
        <strong>Query:</strong> page, limit, search, filters<br>
        <strong>Response:</strong> <code>{ data: [], meta: {total, page, limit} }</code>
    </div>
    <div class="endpoint">
        <span class="method-get">GET</span> <code>/api/pacientes/:id</code><br>
        <strong>Response:</strong> <code>{ paciente }</code>
    </div>
    <div class="endpoint">
        <span class="method-post">POST</span> <code>/api/pacientes</code><br>
        <strong>Request:</strong> <code>{ ...PacienteFormData }</code><br>
        <strong>Response:</strong> <code>{ paciente }</code>
    </div>
    <div class="endpoint">
        <span class="method-put">PUT</span> <code>/api/pacientes/:id</code><br>
        <strong>Request:</strong> <code>{ ...PacienteFormData }</code><br>
        <strong>Response:</strong> <code>{ paciente }</code>
    </div>
    <div class="endpoint">
        <span class="method-delete">DELETE</span> <code>/api/pacientes/:id</code><br>
        <strong>Response:</strong> <code>{ success: true }</code>
    </div>
    <div class="endpoint">
        <span class="method-get">GET</span> <code>/api/pacientes/:id/expediente</code><br>
        <strong>Response:</strong> <code>{ paciente, historial: [] }</code>
    </div>
    <div class="endpoint">
        <span class="method-get">GET</span> <code>/api/pacientes/search</code><br>
        <strong>Query:</strong> q<br>
        <strong>Response:</strong> <code>{ results: [] }</code>
    </div>

    <h2>Consultas</h2>
    <div class="endpoint">
        <span class="method-get">GET</span> <code>/api/consultas</code><br>
        <strong>Query:</strong> filters, pagination<br>
        <strong>Response:</strong> <code>{ data: [], meta }</code>
    </div>
    <div class="endpoint">
        <span class="method-post">POST</span> <code>/api/consultas</code><br>
        <strong>Request:</strong> <code>{ pacienteId, signosVitales, soap, diagnosticos, receta }</code><br>
        <strong>Response:</strong> <code>{ consulta }</code>
    </div>
    <div class="endpoint">
        <span class="method-get">GET</span> <code>/api/consultas/paciente/:pacienteId</code><br>
        <strong>Response:</strong> <code>{ consultas: [] }</code>
    </div>

    <h2>Órdenes Médicas</h2>
    <div class="endpoint">
        <span class="method-get">GET</span> <code>/api/ordenes</code><br>
        <strong>Query:</strong> filters<br>
        <strong>Response:</strong> <code>{ data: [], meta }</code>
    </div>
    <div class="endpoint">
        <span class="method-post">POST</span> <code>/api/ordenes</code><br>
        <strong>Request:</strong> <code>{ pacienteId, tipo, examenes, notas }</code><br>
        <strong>Response:</strong> <code>{ orden }</code>
    </div>
    <div class="endpoint">
        <span class="method-get">GET</span> <code>/api/ordenes/:id/pdf</code><br>
        <strong>Response:</strong> Stream PDF
    </div>

    <h2>Citas (Agenda)</h2>
    <div class="endpoint">
        <span class="method-get">GET</span> <code>/api/citas</code><br>
        <strong>Query:</strong> fecha_inicio, fecha_fin<br>
        <strong>Response:</strong> <code>{ citas: [] }</code>
    </div>
    <div class="endpoint">
        <span class="method-post">POST</span> <code>/api/citas</code><br>
        <strong>Request:</strong> <code>{ pacienteId, fecha, horaInicio, horaFin, motivo }</code><br>
        <strong>Response:</strong> <code>{ cita }</code>
    </div>
    <div class="endpoint">
        <span class="method-patch">PATCH</span> <code>/api/citas/:id/estado</code><br>
        <strong>Request:</strong> <code>{ estado }</code><br>
        <strong>Response:</strong> <code>{ cita }</code>
    </div>

    <h2>Dashboard / Estadísticas</h2>
    <div class="endpoint">
        <span class="method-get">GET</span> <code>/api/dashboard/stats</code><br>
        <strong>Response:</strong> <code>{ pacientesTotal, consultasHoy, citasHoy, ordenesPendientes }</code>
    </div>
    <div class="endpoint">
        <span class="method-get">GET</span> <code>/api/dashboard/actividad</code><br>
        <strong>Response:</strong> <code>{ mensual: [], reciente: [] }</code>
    </div>

    <div class="page-break"></div>

    <h1>🧠 6. Manejo de Estado en Frontend</h1>

    <table>
        <tr><th>Aspecto</th><th>Implementación</th></tr>
        <tr><td>Gestión de estado</td><td>React Context API (sin Redux/Zustand)</td></tr>
        <tr><td>Contextos</td><td><code>AuthContext</code> (usuario), <code>ThemeContext</code> (tema visual)</td></tr>
        <tr><td>Persistencia</td><td>localStorage para sesión (<code>nexamed_user</code>) y tema (<code>theme</code>)</td></tr>
        <tr><td>Datos globales</td><td>Usuario autenticado, tema actual, estado de carga</td></tr>
        <tr><td>Datos locales</td><td>Formularios, listados, filtros (useState por componente)</td></tr>
        <tr><td>Datos de ejemplo</td><td>Todos los datos son MOCK en el frontend actualmente</td></tr>
    </table>

    <h2>AuthContext</h2>
    <div class="diagram">interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email, password) => Promise&lt;{ success, error }&gt;
  logout: () => void
  hasRole: (roles: string[]) => boolean
}</div>

    <h2>ThemeContext</h2>
    <div class="diagram">interface ThemeContextType {
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme) => void
  resolvedTheme: 'light' | 'dark'
}</div>

    <div class="page-break"></div>

    <h1>🔐 7. Autenticación y Roles</h1>

    <h2>Sistema de Autenticación</h2>
    <table>
        <tr><th>Aspecto</th><th>Detalle</th></tr>
        <tr><td>Método</td><td>Email + Contraseña (JWT esperado)</td></tr>
        <tr><td>Persistencia</td><td>localStorage (token + datos usuario)</td></tr>
        <tr><td>Expiración</td><td>No implementado en frontend (requiere backend)</td></tr>
        <tr><td>2FA</td><td>Planificado pero no implementado (esperando backend)</td></tr>
    </table>

    <h2>Roles de Usuario</h2>
    <table>
        <tr><th>Rol</th><th>Permisos</th><th>Descripción</th></tr>
        <tr><td><strong>admin</strong></td><td>TODOS</td><td>Acceso completo al sistema</td></tr>
        <tr><td><strong>doctor</strong></td><td>TODOS excepto algunas configs</td><td>Puede crear consultas, ver todo</td></tr>
        <tr><td><strong>assistant</strong></td><td>Limitado</td><td>NO puede crear consultas SOAP, NO puede acceder a Configuración</td></tr>
    </table>

    <h2>Permisos por Ruta</h2>
    <table>
        <tr><th>Ruta</th><th>Roles Permitidos</th></tr>
        <tr><td>/pacientes</td><td>admin, doctor, assistant</td></tr>
        <tr><td>/pacientes/:id/expediente</td><td>admin, doctor, assistant</td></tr>
        <tr><td>/pacientes/:id/consulta</td><td>admin, doctor</td></tr>
        <tr><td>/pacientes/:id/orden</td><td>admin, doctor, assistant</td></tr>
        <tr><td>/consultas</td><td>admin, doctor</td></tr>
        <tr><td>/ordenes</td><td>admin, doctor, assistant</td></tr>
        <tr><td>/agenda</td><td>admin, doctor, assistant</td></tr>
        <tr><td>/configuracion</td><td>admin, doctor</td></tr>
    </table>

    <h2>Multi-tenancy</h2>
    <table>
        <tr><th>Aspecto</th><th>Detalle</th></tr>
        <tr><td>Implementado</td><td>Parcialmente (campo <code>consultorioId</code> en usuario)</td></tr>
        <tr><td>Aislamiento</td><td>Todos los datos deben filtrarse por <code>consultorioId</code></td></tr>
        <tr><td>Suscripción</td><td>No implementado aún</td></tr>
    </table>

    <div class="page-break"></div>

    <h1>📂 8. Manejo de Archivos e Imágenes</h1>

    <table>
        <tr><th>Tipo</th><th>Uso</th><th>Ubicación</th><th>Tamaño</th></tr>
        <tr><td>Logo del consultorio</td><td>Encabezado, PDFs</td><td>Configuración del consultorio</td><td>Máx 2MB</td></tr>
        <tr><td>Avatar del usuario</td><td>Perfil</td><td>Configuración de usuario</td><td>Máx 1MB</td></tr>
        <tr><td>Resultados de laboratorio</td><td>Adjuntos en expediente</td><td>Por orden médica</td><td>Máx 10MB por archivo</td></tr>
        <tr><td>Imágenes diagnósticas</td><td>Rayos X, ultrasonidos, etc.</td><td>Por orden médica</td><td>Máx 20MB por archivo</td></tr>
    </table>

    <h2>Almacenamiento Esperado</h2>
    <ul>
        <li><strong>Opción A</strong>: Sistema de archivos local con URL accesible</li>
        <li><strong>Opción B</strong>: Servicio cloud (AWS S3, Cloudinary, etc.)</li>
        <li><strong>Estructura sugerida</strong>: <code>/uploads/{consultorioId}/{tipo}/{id}/{archivo}</code></li>
    </ul>

    <div class="page-break"></div>

    <h1>📊 9. Reportes y Salidas</h1>

    <table>
        <tr><th>Reporte</th><th>Formato</th><th>Generación</th><th>Filtros</th></tr>
        <tr><td>Orden Médica</td><td>PDF</td><td>window.print() + CSS</td><td>Por orden específica</td></tr>
        <tr><td>Receta Médica</td><td>PDF (implícito en consulta)</td><td>window.print()</td><td>Por consulta</td></tr>
        <tr><td>Historial del paciente</td><td>PDF (pendiente)</td><td>Backend</td><td>Rango de fechas</td></tr>
        <tr><td>Estadísticas del consultorio</td><td>Gráficos en UI</td><td>Backend</td><td>Por mes/año</td></tr>
    </table>

    <h2>Formato PDF de Órdenes</h2>
    <ul>
        <li><strong>Tamaño</strong>: Media hoja carta (A5) para imprimir 2 por hoja</li>
        <li><strong>Contenido</strong>: Datos del paciente, médico, exámenes, fecha, firma</li>
        <li><strong>Estilo</strong>: Compacto, mínimo branding, prioriza información médica</li>
    </ul>

    <h1>🔍 10. Búsquedas y Filtros</h1>

    <h2>Búsqueda de Pacientes</h2>
    <table>
        <tr><th>Campo</th><th>Tipo de búsqueda</th></tr>
        <tr><td>nombre/apellido</td><td>LIKE %text%</td></tr>
        <tr><td>cédula</td><td>Exacto o parcial</td></tr>
        <tr><td>teléfono</td><td>Parcial</td></tr>
    </table>

    <h2>Filtros de Pacientes</h2>
    <ul>
        <li>Por última visita (rango de fechas)</li>
        <li>Por estado (activo/inactivo - no implementado aún)</li>
    </ul>

    <h2>Búsqueda en Consultas</h2>
    <ul>
        <li>Por paciente</li>
        <li>Por fecha</li>
        <li>Por diagnóstico (CIE-10)</li>
    </ul>

    <h2>Paginación</h2>
    <ul>
        <li><strong>Página por defecto</strong>: 1</li>
        <li><strong>Límite por defecto</strong>: 10, 20, 50 opciones</li>
        <li><strong>Formato esperado</strong>: <code>{ data: [], meta: { current_page, last_page, total, per_page } }</code></li>
    </ul>

    <div class="page-break"></div>

    <h1>🔔 11. Eventos y Acciones Importantes</h1>

    <table>
        <tr><th>Evento</th><th>Disparador</th><th>Acciones Backend</th></tr>
        <tr><td>Nuevo paciente</td><td>Formulario guardado</td><td>Crear registro, asignar ID, asociar a consultorio</td></tr>
        <tr><td>Nueva consulta</td><td>Formulario SOAP guardado</td><td>Crear consulta, actualizar última visita del paciente, agregar al timeline</td></tr>
        <tr><td>Nueva orden</td><td>Orden generada</td><td>Crear orden, asociar a paciente y médico</td></tr>
        <tr><td>Cita creada</td><td>Formulario de agenda</td><td>Crear cita, verificar disponibilidad de horario</td></tr>
        <tr><td>Cita completada</td><td>Cambio de estado</td><td>Actualizar estado, opcionalmente crear consulta</td></tr>
        <tr><td>Cambio de contraseña</td><td>Formulario de seguridad</td><td>Validar actual, hashear y guardar nueva</td></tr>
        <tr><td>Actualización de perfil</td><td>Guardar configuración</td><td>Actualizar datos del usuario</td></tr>
    </table>

    <h1>⚠️ 12. Validaciones y Reglas de Negocio Visibles</h1>

    <h2>Validaciones de Frontend (deben replicarse en backend)</h2>

    <h3>Pacientes</h3>
    <ul>
        <li>Cédula debe ser única por consultorio</li>
        <li>Email debe ser único (si se proporciona)</li>
        <li>Teléfono obligatorio</li>
        <li>Fecha de nacimiento no puede ser futura</li>
    </ul>

    <h3>Consultas</h3>
    <ul>
        <li>Solo médicos pueden crear consultas (no asistentes)</li>
        <li>Al menos un diagnóstico principal recomendado</li>
        <li>IMC calculado automáticamente si hay peso y talla</li>
    </ul>

    <h3>Citas</h3>
    <ul>
        <li>No permitir citas en horarios pasados</li>
        <li>Verificar disponibilidad de horario (no solapamiento)</li>
        <li>Duración mínima: 15 minutos</li>
    </ul>

    <h3>Órdenes</h3>
    <ul>
        <li>Debe especificarse al menos un examen o especialidad</li>
        <li>Paciente debe existir en el sistema</li>
    </ul>

    <h3>Seguridad</h3>
    <ul>
        <li>Contraseña mínima: 6 caracteres</li>
        <li>Confirmación de contraseña debe coincidir</li>
        <li>Sesión expira (implementar en backend)</li>
    </ul>

    <div class="page-break"></div>

    <h1>🌐 13. Configuración y Despliegue Esperado</h1>

    <h2>Arquitectura</h2>
    <div class="diagram">┌─────────────────┐      CORS      ┌─────────────────┐
│  Frontend       │ ◄────────────► │  Backend API    │
│  (React/Vite)   │   HTTPS/JSON   │  (PHP/Laravel)  │
│  Port: 5173     │                │  Port: 8000     │
└─────────────────┘                └─────────────────┘
                                          │
                                          ▼
                                    ┌─────────────────┐
                                    │  PostgreSQL     │
                                    │  Port: 5432     │
                                    └─────────────────┘</div>

    <h2>CORS</h2>
    <ul>
        <li><strong>Origen permitido</strong>: <code>http://localhost:5173</code> (desarrollo), dominio de producción</li>
        <li><strong>Métodos</strong>: GET, POST, PUT, PATCH, DELETE, OPTIONS</li>
        <li><strong>Headers</strong>: Authorization, Content-Type</li>
    </ul>

    <h2>Variables de Entorno Frontend (para referencia)</h2>
    <div class="diagram">VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=NexaMed</div>

    <div class="page-break"></div>

    <h1>📈 14. Escalabilidad Esperada</h1>

    <table>
        <tr><th>Aspecto</th><th>Expectativa</th></tr>
        <tr><td>Tipo de sistema</td><td>MVP funcional listo para producción</td></tr>
        <tr><td>Usuarios estimados</td><td>Inicial: 1-5 por consultorio, Escala: 50+ consultorios</td></tr>
        <tr><td>Pacientes por consultorio</td><td>100-10,000</td></tr>
        <tr><td>Consultas mensuales</td><td>100-5,000 por consultorio</td></tr>
        <tr><td>Imágenes/almacenamiento</td><td>Moderado (principalmente PDFs de órdenes)</td></tr>
        <tr><td>Crecimiento</td><td>Multi-tenant con suscripciones por consultorio</td></tr>
    </table>

    <h2>Recomendaciones de Escalabilidad</h2>
    <ul>
        <li>Índices en: cédula, email, fecha de consulta, paciente_id</li>
        <li>Particionamiento de tablas grandes (consultas, órdenes) por fecha</li>
        <li>CDN para archivos estáticos</li>
        <li>Caché para catálogos (CIE-10, medicamentos)</li>
    </ul>

    <h1>🧱 15. Entidades Principales (RESUMEN FINAL)</h1>

    <table>
        <tr><th>Entidad</th><th>Descripción</th><th>Relaciones Principales</th></tr>
        <tr><td><strong>usuarios</strong></td><td>Médicos, asistentes, admins</td><td>pertenece a consultorio</td></tr>
        <tr><td><strong>consultorios</strong></td><td>Clínicas/centros médicos</td><td>tiene muchos usuarios, pacientes</td></tr>
        <tr><td><strong>pacientes</strong></td><td>Personas atendidas</td><td>pertenece a consultorio, tiene muchas consultas, órdenes, citas</td></tr>
        <tr><td><strong>consultas</strong></td><td>Atenciones médicas SOAP</td><td>pertenece a paciente, médico</td></tr>
        <tr><td><strong>diagnosticos</strong></td><td>CIE-10 asociados a consulta</td><td>pertenece a consulta</td></tr>
        <tr><td><strong>recetas</strong></td><td>Medicamentos recetados</td><td>pertenece a consulta</td></tr>
        <tr><td><strong>ordenes</strong></td><td>Órdenes médicas</td><td>pertenece a paciente, médico</td></tr>
        <tr><td><strong>examenes_orden</strong></td><td>Exámenes específicos de una orden</td><td>pertenece a orden</td></tr>
        <tr><td><strong>citas</strong></td><td>Agenda de citas</td><td>pertenece a paciente, médico</td></tr>
        <tr><td><strong>configuraciones</strong></td><td>Preferencias del sistema</td><td>pertenece a usuario/consultorio</td></tr>
    </table>

    <h2>Diagrama de Entidades Simplificado</h2>
    <div class="diagram">┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ consultorios│◄────┤   usuarios  │────►│  pacientes  │
│             │     │  (médicos)  │     │             │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
         ┌────────────┬────────────┬───────────┘
         ▼            ▼            ▼
    ┌─────────┐  ┌─────────┐  ┌─────────┐
    │consultas│  │ ordenes │  │  citas  │
    │  (SOAP) │  │         │  │         │
    └────┬────┘  └─────────┘  └─────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐
│diagnos-│ │recetas │
│ticos   │ │        │
└────────┘ └────────┘</div>

    <div style="margin-top: 40px; padding: 20px; background: #f8fafc; border-radius: 8px; text-align: center;">
        <p style="color: #64748b; font-size: 9pt;">
            Documento generado automáticamente desde el análisis del frontend NexaMed<br>
            Para desarrollo del Backend API en PHP + PostgreSQL
        </p>
    </div>

</body>
</html>`;

async function generarPDF() {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    await page.setContent(contenidoHTML, { waitUntil: 'networkidle' });
    
    await page.pdf({
        path: 'Analisis-NexaMed-Frontend-Backend.pdf',
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
    });
    
    await browser.close();
    console.log('PDF generado exitosamente: Analisis-NexaMed-Frontend-Backend.pdf');
}

generarPDF().catch(console.error);
