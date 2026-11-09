#  Finanzas Personales — API REST

API REST para la gestión de finanzas personales: permite a cada usuario administrar sus
cuentas, registrar movimientos (ingresos/egresos), definir presupuestos por categoría,
fijar metas de ahorro, programar movimientos recurrentes automáticos y consultar
información financiera externa (cotizaciones, criptomonedas) y un análisis financiero
generado con IA.

---

##  Descripción general del sistema

Cada usuario se registra y opera de forma aislada sobre sus propios datos. El sistema cubre:

- **Cuentas**: efectivo, banco, billetera virtual, inversión (con saldos).
- **Movimientos**: ingresos y egresos asociados a una cuenta y una categoría.
- **Categorías**: de ingreso o egreso (se crean unas por defecto al registrarse).
- **Presupuestos**: límite de gasto por categoría y mes; se consumen automáticamente con cada egreso.
- **Metas de ahorro**: objetivos con depósitos/retiros que mueven saldo real.
- **Reglas recurrentes**: movimientos automáticos programados (ej. sueldo, alquiler) que un
  *scheduler* ejecuta periódicamente y notifica por email.
- **Integraciones externas**:
    - **Análisis financiero con IA** (Google Gemini).
    - **Cotizaciones** de dólar y divisas (DolarAPI).
    - **Criptomonedas** (CoinGecko).
    - **Notificaciones por email** (SMTP / Gmail).

---

##  Integrantes del grupo

- Gonzalo Navalesi
- Thomas Ledesma
- Guillermo Aletto
- Julián Ramos
- Rodrigo Quevedo

---

##  Tecnologías utilizadas

| Categoría | Tecnología |
|-----------|------------|
| Lenguaje | Java 17 |
| Framework | Spring Boot 4.0.6 |
| Seguridad | Spring Security + JWT (jjwt) |
| Persistencia | Spring Data JPA / Hibernate |
| Base de datos | MySQL (producción/local) · H2 (tests) |
| Documentación | springdoc-openapi (Swagger UI) |
| Cliente HTTP | Spring `RestClient` |
| Email | Spring Boot Starter Mail (SMTP) |
| IA | Google Gemini API |
| Utilidades | Lombok |
| Build | Maven |

---

## Instrucciones para ejecutar el proyecto

### Requisitos previos
- **JDK 17 o superior**
- **MySQL** corriendo en local (o una base accesible)
- **Maven** (se incluye el wrapper `./mvnw`, no hace falta instalarlo)

### Pasos

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/rodrigoquevedo2003-web/TP_3.git
   cd TP_3
   ```

2. Crear la base de datos en MySQL:
   ```sql
   CREATE DATABASE finanzas;
   ```

3. Configurar las **variables de entorno** (ver sección siguiente).

4. Ejecutar:
   ```bash
   ./mvnw spring-boot:run
   ```
   La API queda disponible en `http://localhost:8080`.

5. Abrir la documentación interactiva (Swagger):
   ```
   http://localhost:8080/swagger-ui/index.html
   ```

---

##  Configuración necesaria

Los datos sensibles **no están en el código**: se leen de variables de entorno.
En IntelliJ se cargan en *Run → Edit Configurations → Environment variables*.

| Variable | Descripción | Obligatoria |
|----------|-------------|-------------|
| `DB_URL` | URL JDBC de la base (default: `jdbc:mysql://localhost:3306/finanzas`) | No |
| `DB_USER` | Usuario de MySQL (default: `root`) | No |
| `DB_PASSWORD` | Contraseña de MySQL | **Sí** |
| `JWT_SECRET` | Clave para firmar los JWT (mínimo 32 caracteres) | **Sí** |
| `GEMINI_API_KEY` | API key de Google AI Studio (para `/analisis`) | Solo para análisis |
| `MAIL_USERNAME` | Cuenta Gmail remitente de notificaciones | Solo para emails |
| `MAIL_PASSWORD` | Contraseña de aplicación de Gmail (16 caracteres) | Solo para emails |

Ejemplo (formato IntelliJ, separado por `;`):
```
DB_PASSWORD=tu_password;JWT_SECRET=una-clave-secreta-de-al-menos-32-caracteres;GEMINI_API_KEY=AIza...;MAIL_USERNAME=tuapp@gmail.com;MAIL_PASSWORD=abcd efgh ijkl mnop
```

> La `GEMINI_API_KEY` se obtiene gratis en https://aistudio.google.com/apikey
> La `MAIL_PASSWORD` es una *contraseña de aplicación* de Gmail (requiere verificación en 2 pasos).

---

##  Estructura general del proyecto

```
src/main/java/com/finanzas/personales/
├── controller/     → Endpoints REST
├── service/        → Lógica de negocio
├── repository/     → Acceso a datos (Spring Data JPA)
├── model/          → Entidades JPA
├── dto/
│   ├── request/    → Objetos de entrada (con validaciones)
│   └── response/   → Objetos de salida (no exponen entidades)
├── enums/          → TipoCuenta, TipoMovimiento
├── security/       → JWT, filtro de autenticación, configuración de seguridad
└── Exception/      → Excepciones de negocio + handler global
```

---

##  Descripción de entidades principales

| Entidad | Descripción |
|---------|-------------|
| **Usuario** | Persona registrada. Tiene email único y contraseña encriptada (BCrypt). |
| **Cuenta** | Cuenta del usuario (efectivo, banco, etc.) con saldo. |
| **Categoria** | Clasificación de ingreso o egreso. Cada usuario tiene las suyas. |
| **Movimiento** | Ingreso o egreso sobre una cuenta, con monto, fecha y categoría. |
| **Presupuesto** | Límite de gasto por categoría y mes; acumula lo consumido. |
| **MetaAhorro** | Objetivo de ahorro con monto objetivo y monto actual. |
| **ReglaRecurrente** | Plantilla de movimiento automático que se ejecuta cada N días. |

---

## Listado de endpoints

> Todos los endpoints requieren autenticación (JWT) **excepto** los de `/auth` y la documentación Swagger.

### Autenticación — `/auth` *(público)*
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/register` | Registra un usuario y devuelve un token |
| POST | `/auth/login` | Inicia sesión y devuelve un token |

### Usuario — `/usuarios`
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/usuarios/actual` | Datos del usuario autenticado |
| PUT | `/usuarios/actual` | Actualiza el perfil |

### Cuentas — `/cuentas`
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/cuentas` | Crea una cuenta |
| GET | `/cuentas` | Lista las cuentas del usuario |
| GET | `/cuentas/{id}` | Obtiene una cuenta |
| PUT | `/cuentas/{id}` | Actualiza una cuenta |
| DELETE | `/cuentas/{id}` | Elimina una cuenta |
| POST | `/cuentas/transferir` | Transfiere dinero entre dos cuentas |

### Categorías — `/categorias`
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/categorias` | Crea una categoría |
| GET | `/categorias` | Lista categorías (filtro opcional `?tipo=INGRESO/EGRESO`) |
| GET | `/categorias/{id}` | Obtiene una categoría |
| PUT | `/categorias/{id}` | Actualiza una categoría |
| DELETE | `/categorias/{id}` | Elimina una categoría |

### Movimientos — `/movimientos`
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/movimientos` | Registra un movimiento |
| GET | `/movimientos` | Lista todos los movimientos del usuario |
| GET | `/movimientos/{id}` | Obtiene un movimiento |
| GET | `/movimientos/cuenta/{cuentaId}` | Movimientos de una cuenta |
| GET | `/movimientos/categoria/{categoriaId}` | Movimientos de una categoría |
| PUT | `/movimientos/{id}` | Edita un movimiento |
| DELETE | `/movimientos/{id}` | Elimina un movimiento |

### Presupuestos — `/presupuestos`
| Método | Ruta                 | Descripción |
|--------|----------------------|-------------|
| POST | `/presupuestos`      | Crea un presupuesto |
| GET | `/presupuestos`      | Lista los presupuestos |
| GET | `/presupuestos/{id}` | Obtiene un presupuesto |
| PUT | `/presupuestos/{id}` | Actualiza un presupuesto |
| DELETE | `/presupuestos/{id}` | Elimina un presupuesto |

### Metas de ahorro — `/metas-ahorro`
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/metas-ahorro` | Crea una meta |
| GET | `/metas-ahorro` | Lista metas (filtro opcional `?cumplida=true/false`) |
| GET | `/metas-ahorro/{id}` | Obtiene una meta |
| PUT | `/metas-ahorro/{id}` | Actualiza una meta |
| DELETE | `/metas-ahorro/{id}` | Elimina una meta |
| POST | `/metas-ahorro/{id}/depositar` | Deposita dinero en la meta |
| POST | `/metas-ahorro/{id}/retirar` | Retira dinero de la meta |

### Reglas recurrentes — `/reglas-recurrentes`
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/reglas-recurrentes` | Crea una regla de movimiento automático |
| GET | `/reglas-recurrentes` | Lista las reglas del usuario |
| DELETE | `/reglas-recurrentes/{id}` | Desactiva una regla |

### Integraciones externas
| Método | Ruta                    | Descripción |
|--------|-------------------------|-------------|
| GET | `/analisis`             | Análisis financiero del usuario generado con IA (Gemini) |
| GET | `/analisis/periodo`     | Análisis financiero de un período (params `desde` y `hasta`, formato `YYYY-MM-DD`) |
| GET | `/cotizaciones/dolares` | Cotizaciones del dólar (oficial, blue, MEP, etc.) |
| GET | `/cotizaciones/divisas` | Cotizaciones de otras divisas (euro, real, etc.) |
| GET | `/criptos`              | Precios de las principales criptomonedas |

---

##  Ejemplos de requests y responses

### Registro
**POST** `/auth/register`
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@test.com",
  "password": "123456"
}
```
**Response 200**
```json
{
  "token": "eyJhbGciOiJIUzM4NCJ9...",
  "email": "juan@test.com"
}
```

### Crear cuenta
**POST** `/cuentas` — Header: `Authorization: Bearer <token>`
```json
{
  "nombre": "Banco Nación",
  "saldo": 50000,
  "tipoCuenta": "BANCO"
}
```
**Response 200**
```json
{
  "id": 2,
  "nombre": "Banco Nación",
  "saldo": 50000,
  "tipoCuenta": "BANCO",
  "activa": true
}
```

### Registrar un movimiento
**POST** `/movimientos`
```json
{
  "cuentaId": 1,
  "categoriaId": 7,
  "tipo": "EGRESO",
  "descripcion": "Supermercado",
  "monto": 12000
}
```

### Transferencia
**POST** `/cuentas/transferir`
```json
{
  "cuentaOrigenId": 2,
  "cuentaDestinoId": 1,
  "monto": 5000
}
```

### Análisis financiero (IA)
**GET** `/analisis`
**Response 200**
```json
{
  "analisis": "Tu situación financiera muestra una liquidez limitada... 1) Registrá tus gastos. 2) Creá un presupuesto. 3) Construí un fondo de emergencia."
}
```
### Análisis financiero por período (IA)
**GET** `/analisis/periodo?desde=2026-01-01&hasta=2026-03-31`
**Response 200**
```json
{
  "analisis": "En el período analizado tuviste ingresos por $X y egresos por $Y, con un balance de $Z. Tu mayor gasto fue en... Recomendaciones: 1)... 2)... 3)..."
}
```
---

##  Usuarios de prueba

El sistema no trae usuarios precargados: se crea uno con `POST /auth/register`.
Ejemplo de credenciales para probar:

```
email: test@test.com
password: 123456
```

Al registrarse, el usuario obtiene automáticamente una **cuenta de efectivo** y un set de
**categorías por defecto** (Sueldo, Supermercado, Transporte, etc.).

---

##  Autenticación / Autorización

- **Autenticación por JWT (Bearer token).**
    1. El usuario se registra o inicia sesión en `/auth/**` y recibe un **token JWT**.
    2. En cada request protegido debe enviar el header:
       ```
       Authorization: Bearer <token>
       ```
    3. Un filtro (`JwtAuthFilter`) valida el token y carga el usuario autenticado.
- Las contraseñas se almacenan **encriptadas con BCrypt** (nunca en texto plano).
- El token expira a las **24 horas**.
- **Autorización por propiedad**: cada usuario solo puede ver y modificar **sus propios**
  recursos (cuentas, movimientos, metas, etc.). Los servicios filtran por el ID del usuario
  autenticado, por lo que no es posible acceder a datos de terceros.
- Un request sin token (o con token vencido) devuelve **401** con un mensaje JSON claro.

### Cómo autenticarse en Swagger
1. Ejecutar `POST /auth/register` o `/auth/login` y copiar el `token`.
2. Click en **Authorize**  (arriba a la derecha) y pegar el token.
3. Ya se pueden probar los endpoints protegidos.

---

##  Documentación técnica navegable (Swagger / OpenAPI)

Con la aplicación corriendo:

- **Swagger UI:** http://localhost:8080/swagger-ui/index.html
- **OpenAPI JSON:** http://localhost:8080/v3/api-docs

Permite explorar todos los endpoints, ver esquemas de request/response y probarlos
directamente desde el navegador.

---

##  Enlace al despliegue

>**API (backend):** https://tp3-production.up.railway.app
>**Probar la API (Swagger):** https://tp3-production.up.railway.app/swagger-ui/index.html
>**API (frontend):** https://finanzas-front-two.vercel.app

> La raíz `/` responde 401 porque es una API protegida con JWT (no tiene página de inicio).
> Para probarla, usar Swagger: registrarse en `/auth/register`, copiar el token y autorizarse.
---

##  Aclaraciones importantes para la corrección

- **Variables de entorno obligatorias:** la app **no arranca** sin `DB_PASSWORD` y
  `JWT_SECRET`. Las funciones de IA y email requieren además `GEMINI_API_KEY` y
  `MAIL_USERNAME`/`MAIL_PASSWORD` respectivamente; el resto de la API funciona sin ellas.
- **Base de datos:** usar `ddl-auto=update`, Hibernate crea las tablas solo al arrancar.
  Solo hace falta tener creada la base `finanzas`.
- **Reglas recurrentes:** el *scheduler* corre todos los días a las 06:00 (`cron`). Para
  probarlo en el momento, crear una regla con `proximaEjecucion` igual a hoy y, si se desea,
  ajustar temporalmente la expresión cron a cada minuto.
- **APIs externas:** cotizaciones (DolarAPI) y cripto (CoinGecko) son públicas y no
  requieren API key. El análisis con IA sí requiere `GEMINI_API_KEY`.
