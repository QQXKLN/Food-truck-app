# Food-truck-app
## Variables de Entorno

Para que el proyecto funcione correctamente, es necesario configurar variables de entorno tanto en el entorno local (desarrollo) como en producción (despliegue).

### Local vs Producción

* **Entorno Local (Desarrollo):** En tu computadora, las variables del backend se configuran en un archivo llamado `.env` dentro de la carpeta `server/`, y las del frontend en otro `.env` dentro de `client/`. **Estos archivos `.env` no se suben al repositorio** (están en el `.gitignore`) por seguridad. En el repositorio solo se expone el archivo `.env.example` como plantilla.
* **Entorno de Producción:** Al desplegar la aplicación (ej. en Railway, Vercel o Netlify), las variables no se suben mediante archivos. Se deben ingresar manualmente en la sección de "Environment Variables" o "Variables" del panel de control de cada plataforma de hosting.

### Tabla de Variables del Sistema

| Variable | Servicio | Descripción |
| :--- | :--- | :--- |
| `DATABASE_URL` | API (Backend) | Connection string para la base de datos PostgreSQL (incluye credenciales y host). |
| `PORT` | API (Backend) | Puerto donde escucha el servidor Express (ej. 3000). En Railway se inyecta automáticamente. |
| `NODE_ENV` | API (Backend) | Define el entorno actual (`development` en local, `production` en el servidor). |
| `JWT_SECRET` | API (Backend) | Clave secreta y segura utilizada para firmar y verificar los tokens de sesión. |
| `CORS_ORIGIN` | API (Backend) | URL exacta del frontend permitida para consumir la API (ej. http://localhost:5173 o URL de Vercel). |
| `VITE_API_URL` | Frontend | URL base de la API a la que el frontend enviará las peticiones HTTP. |

### Ejemplo de archivo `.env.example` (Backend)

```env
# URL de conexión a la base de datos (PostgreSQL)
# Formato: postgres://usuario:password@localhost:5432/nombre_bd
DATABASE_URL=postgres://postgres:password_ejemplo@localhost:5432/food_truck_db

# Puerto del servidor backend
PORT=3000

# Entorno de ejecución
NODE_ENV=development

# Clave secreta para firmar los tokens JWT
JWT_SECRET=super_secreto_aleatorio_ejemplo

# URL del frontend para permitir peticiones (CORS)
CORS_ORIGIN=http://localhost:5173