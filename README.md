# Food Truck App

Sistema universitario para gestionar food trucks, ubicaciones activas, menu diario, pedidos y ranking de ventas.

## Estructura

- `client/`: frontend Vue 3 + Vite + Pinia.
- `server/`: API Node.js + Express + Sequelize + PostgreSQL.
- `Food-truck api.postman_collection.json`: coleccion Postman para probar la API.

## Variables de entorno

Backend: crear `server/.env` usando `server/.env.example`.

```env
DATABASE_URL=postgres://usuario:password@localhost:5432/food_truck_db
PORT=3000
NODE_ENV=development
JWT_SECRET=tu_clave_segura
CORS_ORIGIN=http://localhost:5173
APP_TIMEZONE=America/Santiago
```

Frontend: crear `client/.env` usando `client/.env.example`.

```env
VITE_API_URL=http://localhost:3000/api/v1
```

## Instalacion local

```bash
cd server
npm install
npm.cmd run migrate
npm.cmd run dev
```

En otra terminal:

```bash
cd client
npm install
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```

En PowerShell usa `npm.cmd` si `npm` aparece bloqueado por la politica de ejecucion de Windows.

## Verificacion rapida

```bash
cd server
npm.cmd run migrate:status
node --check app.js
```

```bash
cd client
npm.cmd run build
```

Flujo manual recomendado:

1. Registrar usuario e iniciar sesion.
2. Crear un Food Truck desde `/dashboard`.
3. Crear una ubicacion para el dia actual con horario vigente.
4. Crear platos con descripcion.
5. Publicar stock del dia para cada plato.
6. Entrar al catalogo, abrir el menu y agregar platos al carrito.
7. Confirmar pedido desde checkout.
8. Gestionar pedidos desde el panel del truck.

## Reglas implementadas

- Registro con email unico y contrasena hasheada.
- Login con JWT.
- Rutas protegidas con middleware de autenticacion.
- Validaciones Joi antes de Sequelize.
- Migraciones versionadas; la app no usa `sequelize.sync`.
- Ubicacion activa por dia y horario.
- Menu diario por food truck.
- Stock diario por plato.
- Pedido transaccional con descuento de stock.
- Historial de compras y gestion de estado de pedidos.
- Ranking de ventas por food truck.
- Restablecimiento de contrasena por token temporal.
- Fecha y hora de operacion basadas en `APP_TIMEZONE` para evitar diferencias entre local y deploy.

## Deploy

API sugerida en Railway:

1. Crear PostgreSQL en Railway.
2. Configurar `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`, `CORS_ORIGIN`.
3. Ejecutar migraciones en el entorno de deploy.
4. Exponer el puerto inyectado por Railway con `PORT`.

Frontend sugerido en Vercel o Railway:

1. Configurar `VITE_API_URL` con la URL publica de la API.
2. Build command: `npm run build`.
3. Output directory: `dist`.

## Notas de seguridad

- No subir archivos `.env`.
- En produccion, el flujo de recuperacion de contrasena debe enviar el token por correo. En desarrollo, la API devuelve el token para poder probarlo en clase.
