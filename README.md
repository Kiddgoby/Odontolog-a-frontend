# 🦷 Odontología Frontend

Aplicación frontend Angular para la gestión de una clínica odontológica. Incluye módulos de citas, pacientes y tratamientos.

---

## 🚀 Comandos principales

### Arrancar el servidor de desarrollo

```bash
npm start
```

> La app estará disponible en **http://localhost:4200**

### Instalar dependencias

```bash
npm install
```

### Compilar para producción

```bash
npm run build
```

### Ejecutar tests

```bash
npm test
```

---

## 🔧 Backend

El frontend se conecta a un servidor backend (API REST). Asegúrate de tenerlo arrancado antes de usar el frontend.

### Si usas Symfony

```bash
# Arrancar en el puerto por defecto (8000)
symfony serve

# Arrancar en un puerto específico
symfony serve --port=42000
```

### Si usas PHP directamente

```bash
php -S localhost:42000 -t public
```

> La URL de la API está configurada en `src/app/services/patient.service.ts`

---

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── services/
│   │   ├── appointment.service.ts   # Servicio de citas (datos locales)
│   │   ├── patient.service.ts       # Servicio de pacientes (conecta al backend)
│   │   └── treatment.service.ts     # Servicio de tratamientos (datos locales)
│   ├── appointment/                 # Módulo de citas
│   ├── tratamientos/                # Módulo de tratamientos
│   ├── app.config.ts                # Configuración principal de Angular
│   └── app.routes.ts                # Rutas de la aplicación
├── main.ts                          # Entry point del navegador
├── main.server.ts                   # Entry point del servidor (SSR)
└── server.ts                        # Servidor Express para SSR
```

---

## 🛠️ Cambios realizados para solucionar el error `NG0908`

El error **NG0908: Angular requires Zone.js** se producía porque el proyecto usa **SSR (Server Side Rendering)** y `zone.js` no estaba instalado ni importado.

### 1. Instalación de `zone.js`

```bash
npm install zone.js --save
```

`zone.js` es una dependencia necesaria cuando se usa `provideZoneChangeDetection()` en la configuración de Angular.

### 2. `angular.json` — Añadido polyfill para el navegador

```diff
"options": {
+  "polyfills": ["zone.js"],
   "browser": "src/main.ts",
```

Esto asegura que `zone.js` se cargue correctamente en el bundle del navegador.

### 3. `src/main.server.ts` — Importación para SSR

```diff
+import 'zone.js/node';
 import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
```

El bundle del servidor (Node.js/Vite) necesita esta importación explícita porque los polyfills de `angular.json` solo aplican al navegador.

---

## ⚙️ Tecnologías

| Tecnología | Versión |
|---|---|
| Angular | ^21.1.0 |
| Angular SSR | ^21.1.4 |
| Express | ^5.1.0 |
| TypeScript | ~5.9.2 |
| Zone.js | instalado |
| Node.js | ^20 |

---

## 📝 Notas

- El proyecto usa **SSR (Server Side Rendering)** con Express.
- Los servicios de **citas** y **tratamientos** usan datos locales (hardcodeados).
- El servicio de **pacientes** (`patient.service.ts`) se conecta al backend mediante HTTP.
  - URL configurada: `http://localhost:4200/api/patients` *(ajustar al puerto del backend)*
