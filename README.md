# Control de Bolsillo

Aplicación web de gestión de finanzas personales. Cada usuario administra sus cuentas, registra ingresos y egresos, define presupuestos por categoría, fija metas de ahorro, programa movimientos recurrentes, consulta cotizaciones y criptomonedas y recibe un análisis financiero generado con IA.

Proyecto final de **Programación IV** y trabajo práctico final de **Gestión de Desarrollo de Software**. UTN FRMdP, Tecnicatura Universitaria en Programación.

## Integrantes

- Thomas Ledesma
- Guillermo Aletto

## Estructura del repositorio

| Carpeta | Contenido |
|---------|-----------|
| `backend/` | API REST en Spring Boot 4 / Java 21 (con su README propio: endpoints, ejemplos y configuración detallada). |
| `frontend/` | Aplicación Angular 22 (13 pantallas, guards de autenticación y de rol). |
| `docs/` | Documentación del proyecto. |

## Tecnologías

| Capa | Tecnología |
|------|------------|
| Frontend | Angular 22, TypeScript, Vitest |
| Backend | Java 21, Spring Boot 4.0.6, Spring Security + JWT, Spring Data JPA |
| Base de datos | MySQL (H2 en tests) |
| Documentación de la API | springdoc-openapi (Swagger UI) |
| Integraciones | Google Gemini (análisis IA), DolarAPI (cotizaciones), CoinGecko (cripto), SMTP Gmail (emails) |
| Gestión | Scrum, Jira, GitHub |

## Funcionalidades

- Registro, inicio de sesión y sesión con JWT; contraseñas con BCrypt.
- Cuentas (efectivo, banco, billetera virtual, inversión) y transferencias entre cuentas.
- Movimientos de ingreso y egreso con categorías propias de cada usuario.
- Presupuestos por categoría y mes, con control de consumo.
- Metas de ahorro con depósitos y retiros (solo Premium).
- Reglas recurrentes que un *scheduler* ejecuta cada día.
- Mercado: cotizaciones del dólar, otras divisas y criptomonedas.
- Análisis financiero con IA (solo Premium).
- Planes **Free** y **Premium** con control de acceso por rol.

### Planes

| | Free | Premium |
|---|:---:|:---:|
| Cuentas | hasta 4 (incluida Efectivo) | ilimitadas |
| Movimientos, categorías, presupuestos, reglas recurrentes, mercado | ✔ | ✔ |
| Metas de ahorro | ✘ | ✔ |
| Análisis con IA | ✘ | ✔ |

Todo usuario nuevo arranca en Free. Desde la pantalla **Planes** de la app se pasa a Premium.

## Cómo ejecutarlo en local

### Requisitos previos

- JDK 21
- Node.js 22.22 o superior (o 24.15+) y npm
- MySQL en local (puerto 3306)
- Angular CLI: opcional, se usa `npx ng` o `npm start`

### 1. Clonar

```bash
git clone https://github.com/thomyyledesma/ControlDeBolsillo-UTN.git
cd ControlDeBolsillo-UTN
```

### 2. Base de datos

```sql
CREATE DATABASE finanzas;
```

Las tablas se crean solas al arrancar el backend (`ddl-auto=update`).

### 3. Backend

Definir las variables de entorno y levantar la API:

| Variable | Descripción | Obligatoria |
|----------|-------------|-------------|
| `DB_PASSWORD` | Contraseña de MySQL | Sí |
| `JWT_SECRET` | Clave para firmar los JWT (mínimo 32 caracteres) | Sí |
| `DB_URL` | URL JDBC (por defecto `jdbc:mysql://localhost:3306/finanzas`) | No |
| `DB_USER` | Usuario de MySQL (por defecto `root`) | No |
| `GEMINI_API_KEY` | API key de Google AI Studio, necesaria para el análisis con IA | Solo para IA |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | Cuenta Gmail y contraseña de aplicación para las notificaciones | Solo para emails |
| `CORS_ALLOWED_ORIGINS` | Orígenes permitidos (por defecto `http://localhost:4200`, `5173` y `3000`) | No |
| `COINGECKO_API_KEY` | Opcional, para las criptomonedas | No |

Linux / macOS:

```bash
cd backend
export DB_PASSWORD=tu_password
export JWT_SECRET=una-clave-secreta-de-al-menos-32-caracteres
./mvnw spring-boot:run
```

Windows (PowerShell):

```powershell
cd backend
$env:DB_PASSWORD="tu_password"
$env:JWT_SECRET="una-clave-secreta-de-al-menos-32-caracteres"
.\mvnw.cmd spring-boot:run
```

La API queda en `http://localhost:8080` y la documentación interactiva en `http://localhost:8080/swagger-ui/index.html`.

> Sin `GEMINI_API_KEY` el análisis con IA no funciona y sin `MAIL_*` no se envían emails; el resto de la aplicación anda igual.

### 4. Frontend

En otra terminal:

```bash
cd frontend
npm install
npm start
```

La aplicación abre en `http://localhost:4200` y apunta al backend en `http://localhost:8080` (configurado en `frontend/src/environments/environment.development.ts`).

### 5. Probarla

1. Entrar a `http://localhost:4200/register` y crear un usuario (no hay usuarios precargados).
2. Al registrarse se crean una cuenta de Efectivo y las categorías por defecto.
3. Para probar metas de ahorro y análisis con IA, ir a **Planes** y pasar a Premium.

## Tests y build

```bash
# Backend
cd backend && ./mvnw test

# Frontend
cd frontend && npm test
cd frontend && npm run build
```

## Documentación

- API: Swagger UI en `/swagger-ui/index.html` con la aplicación corriendo, y el [README del backend](backend/README.md) con endpoints y ejemplos.
- Gestión del proyecto (Jira, Scrum, estimación, riesgos, C4): dossier del TP Final de Gestión de Desarrollo de Software, versión 1.0, 17/11/2026.
- Tablero de Jira: proyecto SCRUM.
