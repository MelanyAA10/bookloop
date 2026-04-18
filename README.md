# BookLoop

> Plataforma de préstamo de libros entre estudiantes universitarios — **Fase I**

BookLoop conecta estudiantes que quieren compartir libros académicos y de interés general dentro de su comunidad universitaria. Los usuarios pueden publicar libros disponibles, solicitar préstamos, confirmar la entrega con documentación fotográfica y participar en foros de discusión.

Esta entrega corresponde a la **Fase I** del proyecto: aplicación web completamente funcional conectada a Mock Services en Azure API Management, sin backend real.

---

## Tabla de Contenidos

- [Vista general](#vista-general)
- [Arquitectura de la solución](#arquitectura-de-la-solución)
- [Requerimientos cumplidos](#requerimientos-cumplidos)
- [Configuración del entorno](#configuración-del-entorno)
- [Instalación y despliegue local](#instalación-y-despliegue-local)
- [Despliegue en la nube (CI/CD)](#despliegue-en-la-nube-cicd)
- [Funcionalidades implementadas](#funcionalidades-implementadas)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Paleta de colores y tipografía](#paleta-de-colores-y-tipografía)
- [Créditos y herramientas](#créditos-y-herramientas)

---

## Vista general

| | |
|---|---|
| **Curso** | Diseño de Software |
| **Profesor** | Marcos Rodríguez |
| **Entrega** | Semana 8 — 17 de abril, 2026 |
| **Valor** | 25% |
| **Fase** | I — Mock Services |
| **Deploy** | Azure Static Web Apps (HTTPS) |
| **API** | Azure API Management (Consumption) |
| **CI/CD** | GitHub Actions |

---

## Arquitectura de la solución

```
┌─────────────────────────────────────────────────────────┐
│                     GitHub Repository                    │
│                                                          │
│   src/  ──push──▶  GitHub Actions  ──build──▶  Azure    │
│                          │                   Static Web  │
│                          │                      Apps     │
│                     (CI/CD Pipeline)          (HTTPS)    │
└─────────────────────────────────────────────────────────┘
                                │
                                │  fetch() + subscription-key
                                ▼
                  ┌─────────────────────────┐
                  │   Azure API Management   │
                  │     (Consumption tier)   │
                  │                          │
                  │  GET  /books             │
                  │  GET  /books/{id}        │
                  │  POST /books             │
                  │  GET  /books/{id}/reviews│
                  │  GET  /profile           │
                  │  GET  /profile/reviews   │
                  │  GET  /community/posts   │
                  │  POST /community/posts   │
                  │  GET  /community/stats   │
                  │  GET  /conversations     │
                  │  GET  /conversations/{id}/messages │
                  │  POST /conversations/{id}/messages │
                  │                          │
                  │  ← Mock Response Policy  │
                  └─────────────────────────┘
```

**Flujo de datos:** El frontend realiza peticiones `fetch` asíncronas a Azure API Management usando `VITE_API_URL` y un `subscription-key` como query parameter. Azure responde con datos definidos en políticas de Mock Response, sin involucrar ningún backend real en esta fase. Todos los secretos y URLs se gestionan exclusivamente mediante GitHub Actions Secrets — no existen en el repositorio.

---

## Requerimientos cumplidos

### Req. 3.f — Persistencia de tema (Light / Dark)
El modo claro/oscuro se guarda en `localStorage` bajo la clave `bookloop-theme` cada vez que el usuario lo cambia. Al recargar la página (`F5`), `App.jsx` lee esta clave antes de inicializar el estado de React, restaurando la preferencia sin parpadeo visible.

```
localStorage.getItem('bookloop-theme')  →  'dark' | 'light'
```

Las páginas de autenticación (Login, Signup) siempre se renderizan en modo claro por restricciones de diseño, pero sin sobrescribir la preferencia guardada del usuario.

### Req. 3.g.i — Sin datos permanentes en memoria del dispositivo
Ninguna página contiene objetos o arrays de datos quemados ("hardcoded") en el código fuente. Todos los datos de contenido provienen de peticiones asíncronas a la API:

| Dato migrado | Página origen | Endpoint en Azure |
|---|---|---|
| Objeto `USER` (nombre, carrera, stats) | `ProfilePage` | `GET /profile` |
| Reviews del perfil del usuario | `ProfilePage` | `GET /profile/reviews` |
| Reviews de cada libro | `BookDetailPage` | `GET /books/{id}/reviews` |
| Listado de libros | `DiscoveryPage`, `CommunityPage` | `GET /books` |
| Detalle de libro | `BookDetailPage`, `LoanConfirmPage` | `GET /books/{id}` |
| Posts del foro | `CommunityPage` | `GET /community/posts` |
| Estadísticas de comunidad | `CommunityPage` | `GET /community/stats` |
| Conversaciones y mensajes | `MessagesPage` | `GET /conversations`, `GET /conversations/{id}/messages` |

El fallback de libros estáticos que existía en `ProfilePage` fue eliminado completamente. Si el endpoint no responde, se muestra un estado vacío con opción de reintentar.

### Req. 7.a — Mock Services en Azure API Management
Todos los endpoints listados arriba están configurados con la política `<mock-response>` en Azure API Management (Consumption). El frontend consume estos endpoints de forma idéntica a como lo haría con un backend real, lo que garantiza que la migración a la Fase II requiera únicamente cambiar `VITE_API_URL` y las implementaciones internas de los endpoints.

---

## Configuración del entorno

### Variables de entorno (desarrollo local)

Crea un archivo `.env` en la raíz del proyecto. **Este archivo nunca debe commitearse** (está incluido en `.gitignore`).

```env
# URL base de tu instancia de Azure API Management
# Ejemplo: https://mi-instancia.azure-api.net
VITE_API_URL=https://<tu-instancia>.azure-api.net

# Subscription key de Azure API Management
# Se obtiene en: Azure Portal → API Management → APIs → Subscriptions
VITE_API_KEY=<tu-subscription-key>
```

Estas dos variables son consumidas por `src/config/api.js`, que es el **único punto de contacto** entre el frontend y la API:

```js
// src/config/api.js
const API_URL = import.meta.env.VITE_API_URL || '';
const API_KEY = import.meta.env.VITE_API_KEY || '';

export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}?subscription-key=${API_KEY}`;
  return fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
};
```

### Variables en GitHub Actions (producción)

Las mismas variables se configuran como **Secrets** en el repositorio:

```
GitHub → Settings → Secrets and variables → Actions → New repository secret
```

| Secret | Descripción |
|---|---|
| `VITE_API_URL` | URL base de Azure API Management |
| `VITE_API_KEY` | Subscription key de Azure API Management |

El workflow de GitHub Actions inyecta estos valores en tiempo de build mediante `env:` — nunca se escriben en archivos del repositorio.

---

## Instalación y despliegue local

### Prerrequisitos

- Node.js 18 o superior
- npm 9 o superior
- Acceso a una instancia de Azure API Management con los endpoints configurados

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/<org>/bookloop.git
cd bookloop

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores de VITE_API_URL y VITE_API_KEY

# 4. Iniciar servidor de desarrollo
npm run dev
# → http://localhost:5173

# 5. Build de producción (opcional, para verificar)
npm run build
npm run preview
```

---

## Despliegue en la nube (CI/CD)

El despliegue es completamente automatizado mediante **GitHub Actions** + **Azure Static Web Apps**.

### Flujo

```
git push → main
    │
    ▼
GitHub Actions: workflow .github/workflows/azure-static-web-apps.yml
    │
    ├── npm install
    ├── npm run build  (inyecta VITE_API_URL y VITE_API_KEY desde Secrets)
    │
    └── Deploy → Azure Static Web Apps (HTTPS automático)
```

### Configuración en Azure

1. Crear un recurso **Static Web App** en Azure Portal.
2. Conectarlo al repositorio de GitHub — Azure genera automáticamente el workflow de Actions.
3. En la configuración de la Static Web App, agregar las **Application Settings** `VITE_API_URL` y `VITE_API_KEY` (esto las hace disponibles en el entorno de build de Actions).
4. Cada push a `main` genera un nuevo despliegue. Pull Requests generan entornos de preview temporales automáticamente.

La URL de producción es HTTPS por defecto, provista por el certificado gestionado de Azure.

---

## Funcionalidades implementadas

### Páginas y flujos

| Pantalla | Ruta de estado | Descripción |
|---|---|---|
| Login | `login` | Autenticación con validación de email y contraseña |
| Signup | `signup` | Registro con validación de campos y confirmación de contraseña |
| Discovery | `discovery` | Catálogo de libros con búsqueda por texto, filtro por género y paginación |
| Book Detail | `bookdetail` | Detalle del libro, información del dueño, sinopsis y reviews |
| Loan Confirm | `loanconfirm` | Confirmación de préstamo con checklist de condición y fotos |
| Loan Return | `loanreturn` | Devolución de libro con checklist y calificación del prestador |
| Add Book | `addbook` | Formulario de alta de libro con validaciones de año y páginas |
| Community | `community` | Foro con posts, estadísticas de comunidad y libros en tendencia |
| Messages | `messages` | Chat de conversaciones entre usuarios |
| Profile | `profile` | Perfil público con stats, libros disponibles y reviews recibidas |

### Sistema de temas (Light / Dark)

- Toggle accesible en la Navbar (ícono sol/luna animado).
- La preferencia se guarda en `localStorage` (`bookloop-theme`) y se restaura en cada carga.
- Las variables CSS (`--bg-primary`, `--text-primary`, `--crimson`, etc.) se redefinen completamente entre `body.light` y `body.dark` en `globals.css`.
- Las páginas de Login y Signup se renderizan siempre en modo claro sin alterar la preferencia guardada.

### Estados de carga (Skeletons)

Todos los componentes que consumen datos remotos muestran esqueletos animados mientras esperan la respuesta de la API, en lugar de spinners genéricos. Los skeletons replican la estructura visual del contenido real para eliminar saltos de layout al cargar.

Componentes con skeleton implementado:
- `BookDetailPage` — portada, metadata y sección de reviews independiente
- `ProfilePage` — tarjeta de perfil, lista de libros y sección de feedback por separado

### Manejo de errores y estados vacíos

Cada sección con fetch propio tiene su estado de error independiente con botón **"Retry"**. Si una sección falla (ej. reviews), el resto de la página sigue funcionando. Los estados vacíos muestran mensajes claros y, cuando aplica, un CTA para crear contenido.

### Validaciones de formularios

| Formulario | Validaciones implementadas |
|---|---|
| Login | Formato de email con regex, longitud mínima de contraseña (6 caracteres), errores inline por campo |
| Signup | Todos los campos requeridos, confirmación de contraseña coincidente |
| Add Book | Año (1500 – año actual), número de páginas (entero positivo), título y autor requeridos; errores mostrados al perder foco (`onBlur`) |

### Diseño responsive

Todos los layouts usan `CSS Grid` y `Flexbox` con breakpoint en 768px. Los componentes detectan el ancho de ventana con `window.innerWidth` y un listener `resize` para adaptar grids, tamaños de portada y menú de navegación (hamburger en mobile).

---

## Estructura del repositorio

```
bookloop/
├── .github/
│   └── workflows/
│       └── azure-static-web-apps.yml   ← Pipeline CI/CD
├── public/
├── src/
│   ├── assets/                         ← Imágenes decorativas (Login)
│   │   ├── bookloop-illustration.png
│   │   ├── principito.png
│   │   └── ...
│   ├── components/
│   │   ├── Logo.jsx                    ← Logotipo SVG + wordmark
│   │   ├── Navbar.jsx                  ← Navegación con toggle de tema
│   │   └── UI.jsx                      ← Primitivas reutilizables
│   │                                     (Button, Input, Badge, Tag, Avatar,
│   │                                      Card, BookCover, Stars, Divider…)
│   ├── config/
│   │   └── api.js                      ← Eje central de comunicaciones:
│   │                                     apiFetch() + getBookImageUrl()
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── DiscoveryPage.jsx
│   │   ├── BookDetailPage.jsx
│   │   ├── LoanConfirmPage.jsx
│   │   ├── LoanReturnPage.jsx
│   │   ├── AddBookPage.jsx
│   │   ├── CommunityPage.jsx
│   │   ├── MessagesPage.jsx
│   │   └── ProfilePage.jsx
│   ├── styles/
│   │   └── globals.css                 ← Variables CSS, temas, reset, fuentes
│   ├── App.jsx                         ← Router de estado + gestión de tema
│   └── main.jsx                        ← Punto de entrada React
├── .env.example                        ← Plantilla de variables de entorno
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

### Nota sobre el router

La navegación se implementa mediante **router de estado** en `App.jsx` (`useState` + función `navigate`). Esto es intencional para la Fase I: simplifica el despliegue en Static Web Apps sin requerir configuración de redirecciones para SPA. La migración a React Router v6 está planificada para la Fase II junto con la integración del backend real.

---

## Paleta de colores y tipografía

### Variables CSS — Modo Claro

| Variable | Valor | Uso |
|---|---|---|
| `--bg-primary` | `#FAF7F2` | Fondo de páginas |
| `--bg-secondary` | `#FFFFFF` | Cards y paneles |
| `--bg-surface` | `#F3EDE3` | Superficies secundarias, skeletons |
| `--text-primary` | `#1A1009` | Texto principal |
| `--text-secondary` | `#5C4A35` | Texto de soporte |
| `--text-muted` | `#9E8B75` | Labels, metadata |
| `--border` | `#D9CFC0` | Bordes de inputs |
| `--crimson` | `#8B1C1C` | Color primario de marca |
| `--crimson-dark` | `#5A0E0E` | Navbar, headers de modales |
| `--crimson-light` | `#C94040` | Botones CTA, acentos |

En **modo oscuro** (`body.dark`), los fondos se invierten a tonos cálidos oscuros (`#1A1009`, `#2A1F14`) y los crimsons se iluminan ligeramente para mantener contraste accesible.

### Tipografía

| Familia | Uso |
|---|---|
| **Playfair Display** | Títulos, logo, nombres de libros, headings de sección |
| **DM Sans** | Cuerpo de texto, botones, inputs, labels, navegación |

Ambas fuentes se cargan desde Google Fonts en `src/styles/globals.css`.

---

## Capturas de pantalla

> Las capturas se agregan en esta sección tras el despliegue en producción. Incluir: Login, Discovery (light y dark), Book Detail, Add Book, Profile y Community.

---

## Créditos y herramientas

| Herramienta / Servicio | Uso en el proyecto |
|---|---|
| [React 18](https://react.dev/) | Framework de UI |
| [Vite 6](https://vitejs.dev/) | Bundler y servidor de desarrollo |
| [Azure Static Web Apps](https://azure.microsoft.com/products/app-service/static) | Hosting web con HTTPS automático |
| [Azure API Management](https://azure.microsoft.com/products/api-management) | Mock Services para todos los endpoints de la Fase I |
| [GitHub Actions](https://github.com/features/actions) | Pipeline de CI/CD (build + deploy) |
| [Google Fonts](https://fonts.google.com/) | Playfair Display + DM Sans |
| [Open Library Covers API](https://openlibrary.org/dev/docs/api#anchor_covers) | Portadas de libros por ISBN (fallback) |
| [Draw.io](https://draw.io/) | Diagrama de arquitectura de solución |
| [Figma](https://figma.com/) | Wireframes y mockups de diseño UI/UX |
| [Postman](https://www.postman.com/) | Pruebas de endpoints en Azure API Management |

---

*BookLoop — Diseño de Software, TEC San Carlos · Fase I · Abril 2026*
