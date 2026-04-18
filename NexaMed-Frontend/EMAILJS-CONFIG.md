# Configuración de EmailJS para Formulario de Demo

## Resumen
El formulario de "Solicitar Demo" utiliza **EmailJS** para enviar correos electrónicos directamente desde el frontend sin necesidad de backend.

## Pasos para Configurar EmailJS

### 1. Crear Cuenta en EmailJS
1. Ve a https://www.emailjs.com/
2. Regístrate con tu correo: `jose.brito.soporte@gmail.com`
3. Verifica tu cuenta

### 2. Crear un Servicio de Email
1. En el dashboard, ve a "Email Services"
2. Haz clic en "Add New Service"
3. Selecciona tu proveedor de correo (Gmail, Outlook, etc.)
4. Sigue las instrucciones para conectar tu cuenta
5. **Guarda el Service ID** (ej: `service_nexamed`)

### 3. Crear una Plantilla de Email
1. Ve a "Email Templates"
2. Haz clic en "Create New Template"
3. Diseña tu plantilla con las siguientes variables:
   - `{{to_email}}` - Tu correo destino
   - `{{nombre}}` - Nombre del solicitante
   - `{{email}}` - Email del solicitante
   - `{{telefono}}` - Teléfono del solicitante
   - `{{centro}}` - Nombre del centro médico
   - `{{mensaje}}` - Mensaje del solicitante

4. **Guarda el Template ID** (ej: `template_demo_request`)

### 4. Obtener la Public Key
1. Ve a "Account" > "General"
2. Copia tu **Public Key**

### 5. Configurar en el Código
Edita el archivo `src/pages/LandingPage.tsx` y actualiza las constantes:

```typescript
const EMAILJS_CONFIG = {
  SERVICE_ID: 'tu_service_id_aqui',      // Ej: service_nexamed
  TEMPLATE_ID: 'tu_template_id_aqui',    // Ej: template_demo_request
  PUBLIC_KEY: 'tu_public_key_aqui',      // Ej: user_xxxxxxxxxxxx
};
```

## Plantilla de Email Sugerida

```
Asunto: Nueva Solicitud de Demo - NexaMed

Hola,

Has recibido una nueva solicitud de demo:

Nombre: {{nombre}}
Email: {{email}}
Teléfono: {{telefono}}
Centro Médico: {{centro}}

Mensaje:
{{mensaje}}

---
Enviado desde el formulario de NexaMed
```

## Modo de Desarrollo

Si no configuras EmailJS inmediatamente, el formulario funcionará en **modo simulación**:
- Mostrará "¡Solicitud Enviada!" 
- Los datos se mostrarán en la consola del navegador
- No se enviará ningún email real

## Seguridad

- La Public Key de EmailJS es segura para exponer en el frontend
- No expongas tu Private Key
- Configura los dominios permitidos en EmailJS para producción

## Soporte

Para más información:
- Documentación: https://www.emailjs.com/docs/
- GitHub: https://github.com/emailjs-com/emailjs-sdk
