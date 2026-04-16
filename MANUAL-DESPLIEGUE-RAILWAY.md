# 🚀 Manual de Despliegue NexaMed en Railway

Este manual te guiará paso a paso para desplegar NexaMed (Backend + Frontend) en Railway para mostrarlo como demo a clientes.

---

## 📋 Requisitos Previos

1. **Cuenta en Railway**: https://railway.app (puedes usar GitHub para registrarte)
2. **Cuenta en GitHub**: Para subir el código
3. **Git instalado** en tu computadora
4. **Node.js** (para el build del frontend)

---

## 📁 Estructura del Proyecto

```
NexaMed/
├── NexaMed-Backend/     ← Backend PHP (API REST)
│   ├── api.php
│   ├── router.php       ← Router para Railway
│   ├── seed.php         ← Inicialización de BD
│   ├── Procfile
│   ├── runtime.txt
│   ├── composer.json
│   └── ...
├── NexaMed-Frontend/    ← Frontend React + Vite
│   ├── src/
│   ├── dist/           ← Build de producción
│   └── ...
└── MANUAL-DESPLIEGUE-RAILWAY.md  ← Este archivo
```

---

## 🛠️ PARTE 1: Preparar Backend para Railway

### Paso 1.1: Inicializar Git (si no lo has hecho)

```bash
cd c:\xampp\htdocs\NexaMed\NexaMed-Backend
git init
git add .
git commit -m "Initial commit - Backend listo para Railway"
```

### Paso 1.2: Crear Repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre del repositorio: `nexamed-backend`
3. Descripción: "Backend API REST para NexaMed"
4. Público o Privado (tu elección)
5. NO inicializar con README (ya lo tenemos)
6. Crear repositorio

### Paso 1.3: Subir Código a GitHub

```bash
git remote add origin https://github.com/TU_USUARIO/nexamed-backend.git
git branch -M main
git push -u origin main
```

---

## 🌐 PARTE 2: Desplegar Backend en Railway

### Paso 2.1: Crear Nuevo Proyecto en Railway

1. Ve a https://railway.app/dashboard
2. Haz clic en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Busca y selecciona `nexamed-backend`
5. Haz clic en **"Add Variables"** (lo configuraremos después)
6. Railway detectará automáticamente el Procfile y comenzará el deploy

### Paso 2.2: Agregar Base de Datos MySQL

1. En el proyecto de Railway, haz clic en **"New"**
2. Selecciona **"Database"** → **"Add MySQL"**
3. Espera a que el estado cambie a **"Online"** (toma 1-2 minutos)

### Paso 2.3: Configurar Variables de Entorno

Railway inyecta automáticamente las variables de MySQL. Verifica que existan:

- `MYSQLHOST`
- `MYSQLPORT`
- `MYSQLDATABASE`
- `MYSQLUSER`
- `MYSQLPASSWORD`

**No necesitas crearlas manualmente**, Railway las crea automáticamente al agregar MySQL.

### Paso 2.4: Obtener URL del Backend

1. En Railway, selecciona el servicio del backend
2. Ve a la pestaña **"Settings"**
3. En **"Environment"** → **"Domain"**, copia la URL
4. Será algo como: `https://nexamed-backend.up.railway.app`

**Guarda esta URL**, la necesitarás para el frontend.

### Paso 2.5: Inicializar Base de Datos

1. Abre tu navegador
2. Ve a: `https://TU-URL-BACKEND.railway.app/seed`
3. Deberías ver el mensaje de inicialización exitosa
4. Verifica que se hayan creado las tablas y datos de ejemplo

**Credenciales de acceso demo:**
- Email: `admin@nexamed.com`
- Contraseña: `admin123`

---

## 🎨 PARTE 3: Preparar Frontend para Producción

### Paso 3.1: Actualizar URL del Backend

Edita el archivo `NexaMed-Frontend/src/services/api.ts`:

```typescript
// Cambia esta línea:
const API_BASE_URL = 'http://localhost/NexaMed/NexaMed-Backend/api.php'

// Por la URL de Railway:
const API_BASE_URL = 'https://TU-URL-BACKEND.railway.app/api.php'
```

### Paso 3.2: Crear Build de Producción

```bash
cd c:\xampp\htdocs\NexaMed\NexaMed-Frontend
npm install          # Si no has instalado dependencias
npm run build
```

Esto creará una carpeta `dist/` con los archivos optimizados.

### Paso 3.3: Crear Repositorio para Frontend

```bash
cd c:\xampp\htdocs\NexaMed\NexaMed-Frontend
git init
git add .
git commit -m "Initial commit - Frontend production build"
```

### Paso 3.4: Subir a GitHub

1. Crea nuevo repositorio en GitHub: `nexamed-frontend`
2. Sube el código:

```bash
git remote add origin https://github.com/TU_USUARIO/nexamed-frontend.git
git branch -M main
git push -u origin main
```

---

## 🌐 PARTE 4: Desplegar Frontend en Railway

### Opción A: Usando Railway Static Sites (Recomendado)

1. En Railway, crea **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Selecciona `nexamed-frontend`
4. Railway detectará automáticamente que es un proyecto estático
5. Configura el directorio raíz como `dist/`

### Opción B: Usando Vercel (Alternativa gratuita)

1. Ve a https://vercel.com
2. Importa desde GitHub: `nexamed-frontend`
3. Framework Preset: **"Vite"**
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Deploy

---

## 🔧 PARTE 5: Configurar CORS en Backend

El backend ya tiene configurado CORS para permitir cualquier origen en desarrollo. Para producción, actualiza `middleware/cors.php` si es necesario:

```php
// Permitir origen del frontend en producción
$allowedOrigins = [
    'http://localhost:5173',  // Desarrollo
    'https://tu-frontend.railway.app',  // Producción
    'https://tu-frontend.vercel.app'    // Alternativa Vercel
];
```

---

## ✅ PARTE 6: Verificación Final

### Checklist de Verificación

- [ ] Backend desplegado y funcionando (`/health` responde OK)
- [ ] Base de datos inicializada (`/seed` ejecutado)
- [ ] Frontend desplegado y accesible
- [ ] Login funciona con credenciales demo
- [ ] Módulos cargan datos correctamente
- [ ] Crear paciente funciona
- [ ] Crear cita funciona

### URLs de Verificación

| Servicio | URL a Verificar |
|----------|----------------|
| Backend Health | `https://TU-BACKEND.railway.app/health` |
| Backend API | `https://TU-BACKEND.railway.app/` |
| Seed/Inicialización | `https://TU-BACKEND.railway.app/seed` |
| Frontend | `https://TU-FRONTEND.railway.app` o Vercel |

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to database"

**Causa**: Las variables de entorno de MySQL no están disponibles
**Solución**: 
1. Verifica que MySQL esté "Online" en Railway
2. Reinicia el servicio del backend (Deploy → Redeploy)

### Error: "CORS policy" en navegador

**Causa**: El backend no acepta peticiones del dominio del frontend
**Solución**: Agrega el dominio del frontend a `$allowedOrigins` en `middleware/cors.php`

### Error: "404 Not Found" en API

**Causa**: El router no está funcionando correctamente
**Solución**: Verifica que `router.php` esté en la raíz y el Procfile apunte correctamente

### Error: "Failed to fetch"

**Causa**: URL del backend incorrecta en el frontend
**Solución**: Verifica `API_BASE_URL` en `src/services/api.ts`

---

## 📝 Comandos Útiles

### Ver Logs en Railway

```bash
# En el dashboard de Railway, selecciona el servicio
# Ve a la pestaña "Deployments" → "View Logs"
```

### Reiniciar Servicio

```bash
# En Railway: Deployments → Redeploy
```

### Actualizar Código

```bash
# Hacer cambios locales
git add .
git commit -m "Descripción del cambio"
git push origin main

# Railway se actualizará automáticamente
```

---

## 🎯 Resumen de URLs para Demo

Una vez completado el despliegue, tendrás:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | `https://nexamed-demo.railway.app` | Aplicación web para el cliente |
| **Backend API** | `https://nexamed-api.railway.app` | API REST (no visible para usuarios) |
| **Admin** | `https://nexamed-demo.railway.app` | Usar credenciales admin@nexamed.com |

---

## 💡 Tips para la Demo

1. **Antes de mostrar al cliente**:
   - Prueba el login con `admin@nexamed.com` / `admin123`
   - Crea un paciente de prueba
   - Crea una cita para hoy

2. **Durante la demo**:
   - Muestra el Dashboard con datos reales
   - Navega por los módulos principales
   - Destaca la funcionalidad de impresión de órdenes

3. **Datos de prueba incluidos**:
   - 1 consultorio
   - 3 usuarios (admin, doctor, asistente)
   - 3 pacientes con historial
   - 3 citas programadas

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs en Railway (Deployments → View Logs)
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que el seed se ejecutó correctamente
4. Comprueba que el frontend apunte a la URL correcta del backend

---

**¡Listo! Tu demo de NexaMed estará disponible 24/7 en Railway.** 🎉
