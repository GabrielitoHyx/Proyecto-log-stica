# Base de datos

La aplicación usa **PostgreSQL** mediante `frontend/src/config/postgres.js` y el paquete `pg`.

El script `ingewebproyecto.sql` que venía en la versión original era un script de SQL Server y no forma parte de esta versión para evitar mezclar motores.

Configura la conexión PostgreSQL en `frontend/.env` con `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER` y `PGPASSWORD`.
