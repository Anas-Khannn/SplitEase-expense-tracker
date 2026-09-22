# Architecture Documentation

Auto-generated from `dependency-cruiser` analysis.

## Diagrams

### 1. High-Level Layer Architecture
![Layer Diagram](./layer-diagram.mmd)

### 2. Backend Module Dependencies
![Backend Modules](./backend-modules.mmd)

### 3. Cross-Project Boundaries
![Cross Project](./cross-project.mmd)

### 4. Architecture Metrics
![Metrics](./metrics.mmd)

## Architecture Rules

Defined in `.dependency-cruiser.js`:

| Rule | Severity | Description |
|------|----------|-------------|
| no-frontend-importing-backend | error | Frontend must not import backend internals |
| no-backend-importing-frontend | error | Backend must not import frontend code |
| backend-layered-architecture | error | Controllers → Services → Models (Clean Architecture) |
| services-use-valid-deps | error | Services only depend on models, utils, constants, errors |
| models-are-leaves | error | Models don't depend on controllers/services/routes |
| utils-are-independent | error | Utils don't depend on business logic (except service-registry) |
| frontend-feature-modules | warn | Features should be self-contained |
| no-circular-dependencies-in-src | error | No circular dependencies in source code |

## Clean Architecture Layers

### Frontend (Next.js/React)
- **App Routes** → Pages and layouts
- **Components** → Reusable UI components
- **Services** → API clients, business logic
- **Hooks** → Custom React hooks
- **Lib** → Utilities, helpers
- **Types** → TypeScript types

### Backend (Express/Node.js)
- **Routes** → HTTP route definitions
- **Controllers** → Request/response handling
- **Services** → Business logic, use cases
- **Models** → Database models (Sequelize)
- **Middlewares** → Cross-cutting concerns
- **Validators** → Input validation (Joi)
- **Utils** → Shared utilities
- **Config** → Configuration
- **Constants** → Application constants

## API Boundary

The **only** allowed cross-project dependency is:
```
Frontend Services → HTTP/REST → Backend Routes
```

This enforces a clean separation where the frontend communicates with the backend
exclusively through the API layer.
