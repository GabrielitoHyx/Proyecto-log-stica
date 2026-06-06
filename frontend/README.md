# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

Cambios base de datos

1. Autenticación y Sesiones
   El código actual no tiene cómo manejar los "inicios de sesión". Necesitamos una tabla central de Usuarios que guarde los correos, contraseñas (hasheadas) y el Rol (Administrador, Chofer, Cliente). Luego, enlazamos esta tabla con las de Chofer y Cliente.
2. Tipos de Datos Peligrosos
   • NSS y Licencia: Los declaramos como int. El Número de Seguro Social tiene 11 dígitos, lo cual supera el límite máximo de un int estándar en SQL Server (que llega hasta 2,147,483,647). Además, las licencias suelen tener letras. Solución: Usar varchar.
3. Normalización (Evitando duplicidad de datos)
   • Tabla Cliente: Tienemos Origen, Destino y Mercancia atados al cliente. ¿Qué pasa si el mismo cliente pide un viaje de CDMX a Monterrey con zapatos, y mañana pide otro de Guadalajara a Puebla con ropa? Tendríamos que crear un "nuevo cliente" para el mismo cliente. Solución: Esos datos pertenecen al Viaje, no al Cliente.
   Nivel 1: El Núcleo (Autenticación)

Todo empieza con los usuarios que entran al sistema.
• Usuario (1) ------ (1) Chofer: Un registro de la tabla Usuario se conecta con un registro en Chofer a través del ID_Usuario.
• Usuario (1) ------- (1) Cliente: Un registro de la tabla Usuario se conecta con un registro en Cliente a través del ID_Usuario.
(Nota: El Administrador no necesita una tabla extra, su cuenta solo vivirá en la tabla Usuario con el Rol 'Admin').
Nivel 2: Los Activos Físicos y Clientes
Aquí tenemos las entidades independientes que se usarán para armar la logística.
• Camion: No depende de nadie para existir.
• Chofer: Depende de tener un Usuario.
• Cliente: Depende de tener un Usuario.
Nivel 3: Las Transacciones (Donde todo se une)
Esta es la parte más importante del negocio. La tabla Viaje es el centro de su diagrama.
• Cliente (1) ----------(Muchos) Viajes: Un cliente puede pedir muchos viajes. Se unen por ID_cli.
• Camion (1) --------- (Muchos) Viajes: Un camión va a realizar muchos viajes en su vida útil. Se unen por ID_ca.
• Chofer (1) ---------- (Muchos) Viajes: Un chofer va a manejar en muchos viajes. Se unen por ID_cho.
Nivel 4: Los Gastos (El control financiero)
Los gastos se "cuelgan" de los activos o de los viajes.
• Camion (1) ------ (Muchos) Gastos_Camion: Un camión tendrá muchas reparaciones y pagos de seguro a lo largo del tiempo. Se unen por ID_ca.
• Viaje (1) -------(Muchos) Gastos_Viaje: Un viaje generará múltiples tickets (gasolina, casetas, viáticos). Se unen por ID_Viaje.

Arquitectura de Roles (Sesiones del Sistema)
• Administrador: Tiene el control total. Ve el dashboard financiero (cuánto dinero genera cada camión, gastos globales, utilidades), gestiona el alta/baja de camiones, choferes y usuarios, y aprueba presupuestos.
• Trabajadores (Choferes / Despachadores): Tienen una vista optimizada (idealmente móvil) donde ven sus viajes asignados, la ruta, la fecha de partida y un formulario para registrar los gastos del camión en tiempo real (subir costo de gasolina, casetas, etc.).
• Clientes: Inician sesión para solicitar nuevos presupuestos, ver el historial de sus servicios contratados y revisar el estado actual de sus viajes en curso mediante el folio de la ruta.

Categorizar los Gastos
necesitamos clasificar esos gastos. Hay dos tipos:
• Fijos / Por Calendario: Verificación, Tenencia, Seguro. (Sabes exactamente cuándo van a ocurrir).
• Variables / Mantenimiento: Mecánico, Llantas, Batería, Aceite. (Ocurren por desgaste o accidentes).
La Lógica de Negocio (Permisos y JWT)
A diferencia de los gastos de viaje (que los registra el Chofer en su celular mientras va en ruta), los gastos del camión los registra el Administrador.
Cuando programemos la API, la ruta para guardar un gasto de camión (ej. POST /api/gastos-camion) debe verificar el token JWT. Si el usuario que intenta guardar el gasto tiene el Rol de 'Chofer', la API debe rechazar la petición con un error 403 Forbidden. Solo el 'Admin' puede autorizar la compra de llantas o el pago del seguro.
El Frontend (Lo que hará React)
Para este módulo, crearemos dos vistas principales en el Dashboard del Administrador:
A. El Formulario de Registro de Gastos
Una pantalla donde el administrador selecciona de un menú desplegable el Camión (por sus placas), selecciona la Categoría (Fijo o Mantenimiento), ingresa el costo, sube una foto de la factura (opcional, pero recomendado) y guarda.
B. El Panel de Alertas Mantenimiento (El valor agregado)
Una vista en React que lea la columna Proximo_Aviso y le diga al administrador:
URGENTE: El camión Placas AB-123 vence su seguro en 5 días.
ADVERTENCIA: El camión Placas XYZ-99 ya recorrió 15,000 km desde su último cambio de aceite.
Persona 1 (Frontend): Diseñar las pantallas en React (Login, Dashboard, Formularios de Viajes).
Persona 2 (Frontend): Diseñar la vista móvil para que los Choferes puedan ver sus viajes y subir gastos.
Persona 3 (Backend/BD): Crear la base de datos, configurar la conexión y hacer la lógica de Autenticación con JWT.
Persona 4 (Backend/BD): Programar todo el CRUD (Crear, Leer, Actualizar, Borrar) de Viajes, Camiones y Cálculos de Utilidad.

Aquí vive nuestra pagina web:
http://localhost:5173/
