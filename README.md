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

El proyecto esta preparado para Railway usando dos servicios desde el mismo repositorio:

- `server/`: API Express.
- `client/`: frontend Vue servido como sitio estatico con Caddy.
- PostgreSQL: base de datos administrada por Railway.

### Backend en Railway

1. Crear un proyecto en Railway desde el repositorio GitHub.
2. Crear un servicio para el backend con `Root Directory` en `/server`.
3. Configurar:
   - Build command: automatico.
   - Start command: `npm start`.
   - Pre-deploy command: `npm run migrate`.
4. Agregar una base de datos `PostgreSQL` al mismo proyecto.
5. Configurar variables del servicio backend:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production
JWT_SECRET=generar_una_clave_larga_y_segura
CORS_ORIGIN=https://URL_PUBLICA_DEL_FRONTEND
APP_TIMEZONE=America/Santiago
```

6. En `Settings > Networking`, generar un dominio publico para la API.
7. Verificar que `https://URL_PUBLICA_API/` responda correctamente.

### Frontend en Railway

1. Crear otro servicio desde el mismo repositorio.
2. Configurar `Root Directory` en `/client`.
3. Railway detectara `client/Dockerfile` y servira el build de Vue con Caddy.
4. Configurar variable:

```env
VITE_API_URL=https://URL_PUBLICA_API/api/v1
```

5. Redeployar el frontend despues de cambiar `VITE_API_URL`, porque Vite la inserta durante el build.
6. Generar dominio publico en `Settings > Networking`.
7. Volver al backend y actualizar `CORS_ORIGIN` con la URL publica final del frontend.
8. Redeployar backend.

### Verificacion en produccion

1. Abrir el frontend publico.
2. Registrar un usuario vendedor y crear un Food Truck.
3. Crear una ubicacion activa para el dia y horario actual.
4. Crear platos y publicar stock del dia.
5. Registrar o iniciar sesion como cliente.
6. Hacer un pedido.
7. Revisar gestion de pedidos en vivo desde el panel del vendedor.
8. Marcar el pedido como listo y entregado.
9. Confirmar que el ranking de ventas se actualiza con pedidos entregados.

## Notas de seguridad

- No subir archivos `.env`.
- En produccion, el flujo de recuperacion de contrasena debe enviar el token por correo. En desarrollo, la API devuelve el token para poder probarlo en clase.
