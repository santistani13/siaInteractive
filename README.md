# SIA Interactive — Sistema de Pedidos

Monorepo con frontend Angular 21 y backend .NET 9.

## Estructura

```
siaInteractive/
├── front/          # Angular 21
└── back/           # .NET 9 Web API
    └── Data/
        └── products.json  # Mock data (30 productos)
```

---

## Frontend (Angular 21)

### Requisitos
- Node.js 18+
- Angular CLI 21: `npm install -g @angular/cli`

### Instalación y ejecución

```bash
cd front
npm install
ng serve
```

Abre `http://localhost:4200`

### Funcionalidades
- **Productos** (`/products`): lista con filtros por categoría, precio y búsqueda en tiempo real
- **Detalle** (`/products/:id`): vista individual con control de cantidad
- **Carrito** (`/cart`): gestión de items, cantidades y total
- **Pedido** (`/order`): formulario reactivo, envío a API, confirmación o error

### Decisiones técnicas — Frontend
| Decisión | Motivo |
|---|---|
| Angular 21 standalone | Arquitectura moderna, sin NgModules innecesarios |
| Signals (`signal`, `computed`) | Estado reactivo sin boilerplate de RxJS para el estado del carrito |
| Lazy loading en todas las rutas | Mejora el tiempo de carga inicial |
| Fallback local en `ProductService` | La app funciona aunque el backend no esté corriendo |
| SCSS con BEM | CSS organizado, sin dependencias de UI externa |
| `@if` / `@for` control flow | Sintaxis moderna de Angular (v17+), mejor performance que `*ngIf` |
| Formularios reactivos | Validación centralizada y testeable |

### Tests

```bash
cd front
ng test
```

---

## Backend (.NET 9)

### Requisitos
- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)

### Instalación y ejecución

```bash
cd back
dotnet restore
dotnet run
```

API disponible en `http://localhost:5000`  
Swagger en `http://localhost:5000/swagger`

### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/products` | Lista todos los productos |
| GET | `/api/products?query=arroz&tipo=almacen&minPrice=500&maxPrice=2000` | Filtrar productos |
| GET | `/api/products/{id}` | Detalle de un producto |
| GET | `/api/products/tipos` | Lista de categorías |
| POST | `/api/orders` | Crear un pedido |

### Body de POST /api/orders

```json
{
  "customerName": "Juan García",
  "customerEmail": "juan@email.com",
  "items": [
    { "productId": 1, "quantity": 2, "unitPrice": 1850 }
  ]
}
```

### Categorías de productos (`tipo`)
- `almacen` — Secos y enlatados
- `congelados` — Productos fríos y congelados
- `kiosco` — Snacks y golosinas
- `limpieza` — Productos de limpieza
- `bebidas` — Jugos, aguas, gaseosas

### Decisiones técnicas — Backend
| Decisión | Motivo |
|---|---|
| JSON como mock de BD | Carga simple, sin infraestructura adicional |
| Singleton `ProductService` | Los datos son estáticos en memoria, una sola carga al iniciar |
| CORS configurado para `localhost:4200` | Permite que el frontend Angular consuma la API localmente |
| Swagger habilitado en desarrollo | Facilita pruebas manuales de la API |
| Minimal API + Controllers | Estructura clara y familiar para WebAPI tradicional |

---

## Ejecutar ambos simultáneamente

```bash
# Terminal 1
cd back && dotnet run

# Terminal 2
cd front && ng serve
```
