# SIA Interactive Market

Monorepo con frontend Angular 21 y backend .NET 9 para un sistema de compras en línea con carrito de compras, filtros de productos y gestión de pedidos.

## Estructura

```
siaInteractive/
├── package.json        # Scripts de raíz: install y dev unificados
├── front/              # Angular 21 (puerto 4200)
└── back/               # .NET 9 Web API (puerto 5001)
    └── Data/
        └── products.json   # Mock data — 30 productos en 5 categorías
```

---

## Instalación y ejecución

### Requisitos

| Herramienta | Versión mínima |
|---|---|
| Node.js | 18+ |
| npm | 9+ |
| .NET SDK | 9.0 |

### Un solo comando para instalar todo

```bash
npm install
```

El hook `postinstall` ejecuta automáticamente `npm install --prefix front` y `dotnet restore` para el backend. No hace falta entrar a ninguna subcarpeta.

### Un solo comando para levantar front y back

```bash
npm run dev
```

Esto lanza en paralelo:
- **Frontend** en `http://localhost:4200`
- **Backend** en `http://localhost:5001`
- **Swagger** en `http://localhost:5001/swagger`

El script `predev` mata automáticamente cualquier proceso previo en esos puertos antes de arrancar, evitando errores de "port already in use".

### Para detener todo

```bash
npm run stop
```

### Scripts individuales

```bash
npm run dev:front     # Solo Angular
npm run dev:back      # Solo .NET
```

### Ejecutar tests

```bash
cd front
ng test               # Modo watch (interactivo)
ng test --watch=false # Una sola pasada (CI)
```

---

## Funcionalidades

### Home (`/`)
- Hero de bienvenida con call to action
- Sliders por categoría con scroll infinito automático (se pausa al hacer hover)
- Chips de filtro rápido que redirigen a `/products?tipo=...`

### Productos (`/products`)
- Listado con skeleton loaders mientras carga
- Filtros por categoría (chips), texto libre y rango de precio
- Los filtros se reflejan en query params de la URL
- Fallback local de 30 productos si el backend no está disponible

### Detalle (`/products/:id`)
- Información del producto con control de cantidad
- Botón para agregar/quitar del carrito
- Skeleton loader en la carga inicial

### Carrito (`/cart`)
- Gestión de cantidades por ítem
- Total calculado reactivamente
- Persiste en `localStorage` (sobrevive recargas de página)

### Pedido (`/order`)
- Formulario reactivo con validaciones
- Envío a API con feedback de éxito/error
- Pantalla de confirmación de pedido

---

## Backend — API REST

### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/products` | Lista todos los productos |
| `GET` | `/api/products?query=arroz&tipo=almacen&minPrice=500&maxPrice=2000` | Filtros combinables |
| `GET` | `/api/products/{id}` | Detalle de un producto |
| `GET` | `/api/products/tipos` | Lista de categorías |
| `POST` | `/api/orders` | Crear un pedido |

### Body de `POST /api/orders`

```json
{
  "customerName": "Juan García",
  "customerEmail": "juan@email.com",
  "items": [
    { "productId": 1, "quantity": 2, "unitPrice": 1850 }
  ]
}
```

### Categorías (`tipo`)
- `almacen` — Secos y enlatados
- `congelados` — Productos fríos y congelados
- `kiosco` — Snacks y golosinas
- `limpieza` — Productos de limpieza
- `bebidas` — Jugos, aguas y gaseosas

---

## Decisiones técnicas

### Frontend

| Decisión | Motivo |
|---|---|
| **Angular 21 standalone** | Arquitectura moderna sin NgModules; cada componente declara sus propias dependencias |
| **Signals (`signal`, `computed`)** | Estado reactivo sin boilerplate de RxJS para datos síncronos como el carrito y los filtros |
| **`effect()` reemplazado por `save()` explícito en CartService** | `effect()` es asíncrono en el entorno de tests (jsdom/Vitest), lo que provocaba que `localStorage` no estuviera escrito al momento de los `expect()`. Un método `save()` invocado explícitamente al final de cada mutación es determinista y testeable |
| **Lazy loading en todas las rutas** | Reduce el bundle inicial; cada feature se carga solo cuando se navega a ella |
| **Fallback local en `ProductService`** | La app funciona aunque el backend no esté corriendo, cargando los 30 productos desde el propio código |
| **Timer mínimo de 700 ms en carga de productos** | Simula latencia de red y garantiza que los skeleton loaders sean visibles, mejorando la percepción de carga |
| **Dark mode con CSS custom properties** | Un solo cambio en `:root` afecta a toda la app; sin dependencias de tema externas |
| **Slider infinito con duplicación de items + CSS animation** | Se duplica el array de productos en el template y se anima `translateX(0 → -50%)`. Al llegar al 50% el loop vuelve a 0 de forma invisible, logrando infinitud sin JavaScript |
| **`@if` / `@for` control flow** | Sintaxis moderna de Angular (v17+), mejor performance de change detection que `*ngIf`/`*ngFor` |
| **SCSS con BEM** | CSS organizado y predecible, sin dependencias de librerías UI externas |
| **Vitest como test runner** | Angular 21 usa Vitest en lugar de Karma/Jasmine; es más rápido y compatible con el ecosistema moderno |

### Backend

| Decisión | Motivo |
|---|---|
| **`products.json` como mock de BD** | Sin infraestructura adicional (sin SQL Server, SQLite ni Docker); los datos persisten en archivo |
| **Singleton `ProductService`** | Los productos son datos estáticos; una sola lectura del JSON al arrancar la app, sin carga repetida |
| **Puerto 5001** | Puerto 5000 está ocupado por el receptor de AirPlay en macOS; 5001 evita el conflicto |
| **CORS para `localhost:4200`** | Permite que el frontend Angular consuma la API localmente sin errores de origen cruzado |
| **Swagger habilitado en desarrollo** | Facilita pruebas manuales de todos los endpoints sin cliente externo |

### Monorepo

| Decisión | Motivo |
|---|---|
| **`postinstall` en `package.json` raíz** | Un solo `npm install` instala dependencias de Node y restaura paquetes de .NET |
| **`concurrently` con `--kill-others-on-fail`** | Si cualquiera de los procesos falla, el otro se detiene también, evitando procesos huérfanos |
| **`predev` mata puertos antes de arrancar** | Previene errores de "port already in use" causados por instancias previas que no se cerraron limpiamente con Ctrl+C |

---

## Tests

Suite de 39 tests unitarios distribuidos en 3 archivos:

| Archivo | Tests | Cubre |
|---|---|---|
| `app.spec.ts` | 3 | Creación del componente raíz, header, router-outlet |
| `cart.service.spec.ts` | 22 | add, remove, decrease, updateQuantity, clear, isInCart, getQuantity, total, totalItems, localStorage persist/restore, JSON inválido |
| `product.service.spec.ts` | 14 | Estado inicial, loading, éxito, error+fallback, query params, tipos computados, getById con y sin caché |

```bash
cd front && ng test --watch=false
# → 39 passed
```
