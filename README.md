# BookLoop — React Web App

Plataforma de préstamo de libros entre estudiantes universitarios.
Diseñada con la paleta crimson/warm-bg del mockup original.

---

## Estructura del Proyecto

```
bookloop/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx                  ← Punto de entrada
    ├── App.jsx                   ← Router de estado (reemplazar con React Router v6)
    ├── styles/
    │   └── globals.css           ← Variables CSS, reset, fuentes
    ├── components/
    │   ├── Logo.jsx              ← Logotipo SVG + wordmark (variantes: light/dark/color)
    │   ├── Navbar.jsx            ← Barra de navegación superior
    │   └── UI.jsx                ← Primitivas: Button, Input, Textarea, Badge, Tag,
    │                                Avatar, Card, SectionLabel, Divider, Stars, BookCover
    └── pages/
        ├── LoginPage.jsx         ← Pantalla 1: Login
        ├── SignupPage.jsx        ← Pantalla 2: Registro
        ├── DiscoveryPage.jsx     ← Pantalla 3: Descubrimiento / Browse
        ├── BookDetailPage.jsx    ← Pantalla 4: Detalle de libro
        ├── LoanConfirmPage.jsx   ← Pantalla 5: Confirmación de préstamo
        ├── LoanReturnPage.jsx    ← Pantalla 6: Devolución de libro
        ├── AddBookPage.jsx       ← Pantalla 7: Agregar libro
        ├── CommunityPage.jsx     ← Pantalla 8: Comunidad / Foro
        ├── MessagesPage.jsx      ← Pantalla 9: Mensajería / Chat
        └── ProfilePage.jsx       ← Pantalla 10: Perfil público
```

---

## Instalación y uso

```bash
# 1. Instalar dependencias
npm install

# 2. Modo desarrollo
npm run dev

# 3. Build de producción
npm run build
```

---

## Integrar con React Router v6

Reemplaza el router de estado en `App.jsx` por rutas reales:

```bash
npm install react-router-dom
```

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage       from './pages/LoginPage';
import SignupPage      from './pages/SignupPage';
import DiscoveryPage   from './pages/DiscoveryPage';
import BookDetailPage  from './pages/BookDetailPage';
import LoanConfirmPage from './pages/LoanConfirmPage';
import LoanReturnPage  from './pages/LoanReturnPage';
import AddBookPage     from './pages/AddBookPage';
import CommunityPage   from './pages/CommunityPage';
import MessagesPage    from './pages/MessagesPage';
import ProfilePage     from './pages/ProfilePage';
import './styles/globals.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"              element={<Navigate to="/login" />} />
        <Route path="/login"         element={<LoginPage />} />
        <Route path="/signup"        element={<SignupPage />} />
        <Route path="/discovery"     element={<DiscoveryPage />} />
        <Route path="/books/:id"     element={<BookDetailPage />} />
        <Route path="/loans/confirm" element={<LoanConfirmPage />} />
        <Route path="/loans/return"  element={<LoanReturnPage />} />
        <Route path="/books/add"     element={<AddBookPage />} />
        <Route path="/community"     element={<CommunityPage />} />
        <Route path="/messages"      element={<MessagesPage />} />
        <Route path="/user/:handle"  element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## Paleta de colores (CSS Variables)

| Variable            | Valor      | Uso                        |
|---------------------|------------|----------------------------|
| `--crimson`         | `#8B1C1C`  | Color primario             |
| `--crimson-dark`    | `#5A0E0E`  | Navbar, headers            |
| `--crimson-light`   | `#C94040`  | Botones CTA, acentos       |
| `--warm-bg`         | `#FAF7F2`  | Fondo de páginas           |
| `--card-bg`         | `#FFFFFF`  | Cards                      |
| `--surface`         | `#F3EDE3`  | Superficies secundarias    |
| `--border`          | `#D9CFC0`  | Bordes de inputs           |
| `--text-primary`    | `#1A1009`  | Texto principal            |
| `--text-secondary`  | `#5C4A35`  | Texto secundario           |
| `--text-muted`      | `#9E8B75`  | Texto muted / labels       |

---

## Tipografía

- **Display**: `Playfair Display` — títulos, logo, nombres de libros
- **Body**: `DM Sans` — todo el texto de UI, botones, inputs

Cargadas desde Google Fonts en `globals.css`.

---

## Componente Logo

```jsx
import Logo from './components/Logo';

// En navbar (fondo oscuro)
<Logo size={32} variant="light" />

// En página clara
<Logo size={28} variant="dark" />

// Solo texto crimson
<Logo size={24} variant="color" showMark={false} />
```

---

## Notas de desarrollo

- Los `onNavigate(page)` de cada página deben reemplazarse por `useNavigate()` de React Router.
- Los datos de ejemplo en cada página son estáticos; conectar a API REST o Supabase.
- Las fotos de condición de libros (`LoanConfirmPage`, `LoanReturnPage`, `AddBookPage`) usan slots placeholder — integrar con un input de tipo `file` y upload a storage.
- El componente `BookCover` genera portadas con degradado de color. Para portadas reales, reemplazar con `<img>`.
