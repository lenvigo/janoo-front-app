# JanooFrontApp

Aplicación de gestión de recursos humanos desarrollada con Angular 17.

## Características Principales

- **Autenticación y Autorización**

  - Login y registro de usuarios
  - Gestión de roles (ADMIN, MANAGER, USER)
  - Protección de rutas basada en roles

- **Gestión de Usuarios**

  - Perfil de usuario
  - Gestión de empleados (solo ADMIN)
  - Asignación de roles y departamentos

- **Gestión de Vacaciones**

  - Solicitud de vacaciones
  - Aprobación/Rechazo de solicitudes (MANAGER)
  - Historial de vacaciones
  - Balance de días disponibles

- **Gestión de Incidencias**

  - Reporte de incidencias
  - Seguimiento de estado
  - Resolución de incidencias (MANAGER)
  - Historial de incidencias

## Requisitos Previos

- Node.js (v18 o superior)
- npm (v9 o superior)
- Angular CLI (v17 o superior)

## Instalación

1. Clonar el repositorio:

```bash
git clone [https://github.com/lenvigo/janoo-front-app]
```

2. Instalar dependencias:

```bash
cd janoo-front-app
npm install
```

3. Configurar variables de entorno:
   - Copiar `src/environments/environment.example.ts` a `src/environments/environment.ts`
   - Ajustar las variables según el entorno

## Desarrollo

Para iniciar el servidor de desarrollo:

```bash
ng serve
```

La aplicación estará disponible en `http://localhost:4200/`.

## Estructura del Proyecto

```
src/
├── app/
│   ├── core/                 # Servicios, guards, interceptors
│   ├── shared/              # Componentes y módulos compartidos
│   ├── auth/                # Módulo de autenticación
│   ├── users/               # Módulo de gestión de usuarios
│   ├── vacations/           # Módulo de gestión de vacaciones
│   └── incidents/           # Módulo de gestión de incidencias
├── assets/                  # Recursos estáticos
└── environments/            # Configuración por entorno
```

## Módulos Principales

### Auth Module

- Login
- Registro
- Recuperación de contraseña

### Users Module

- Lista de usuarios
- Perfil de usuario
- Gestión de roles

### Vacations Module

- Solicitud de vacaciones
- Lista de solicitudes
- Aprobación/Rechazo

### Incidents Module

- Reporte de incidencias
- Lista de incidencias
- Resolución de incidencias

## Construcción

Para construir el proyecto:

```bash
ng build
```

Los archivos generados se almacenarán en el directorio `dist/`.

## Pruebas

Para ejecutar las pruebas unitarias:

```bash
ng test
```

Para ejecutar las pruebas e2e:

```bash
ng e2e
```

## Despliegue

1. Construir la aplicación:

```bash
ng build --configuration production
```

2. Los archivos generados en `dist/` están listos para ser desplegados en cualquier servidor web.

## Contribución

1. Fork el repositorio
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
