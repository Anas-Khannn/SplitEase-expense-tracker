#!/usr/bin/env node
/**
 * Generate architecture documentation from dependency-cruiser output
 * Creates Mermaid diagrams for:
 * - High-level layer diagram
 * - Backend module dependencies
 * - Frontend feature dependencies
 * - Cross-project boundaries
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT, 'docs', 'architecture');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadCruiseResult() {
  console.log('Loading dependency graph from JSON...');
  const jsonPath = path.join(DOCS_DIR, 'dependency-report.json');
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Dependency report not found at ${jsonPath}. Run 'npm run arch:cruise' first.`);
  }
  const content = fs.readFileSync(jsonPath, 'utf-8');
  return JSON.parse(content);
}

function groupByLayer(modules) {
  const layers = {
    'frontend:app': [],
    'frontend:components': [],
    'frontend:lib': [],
    'frontend:hooks': [],
    'frontend:services': [],
    'frontend:types': [],
    'backend:controllers': [],
    'backend:services': [],
    'backend:models': [],
    'backend:routes': [],
    'backend:middlewares': [],
    'backend:validators': [],
    'backend:utils': [],
    'backend:config': [],
    'backend:constants': [],
    'backend:database': [],
  };

  modules.forEach(m => {
    const source = m.source;
    if (source.startsWith('frontend/app/(app)')) layers['frontend:app'].push(m);
    else if (source.startsWith('frontend/components')) layers['frontend:components'].push(m);
    else if (source.startsWith('frontend/lib')) layers['frontend:lib'].push(m);
    else if (source.startsWith('frontend/hooks')) layers['frontend:hooks'].push(m);
    else if (source.startsWith('frontend/services')) layers['frontend:services'].push(m);
    else if (source.startsWith('frontend/types')) layers['frontend:types'].push(m);
    else if (source.startsWith('backend/src/controllers')) layers['backend:controllers'].push(m);
    else if (source.startsWith('backend/src/services')) layers['backend:services'].push(m);
    else if (source.startsWith('backend/src/database/models')) layers['backend:models'].push(m);
    else if (source.startsWith('backend/src/routes')) layers['backend:routes'].push(m);
    else if (source.startsWith('backend/src/middlewares')) layers['backend:middlewares'].push(m);
    else if (source.startsWith('backend/src/validators')) layers['backend:validators'].push(m);
    else if (source.startsWith('backend/src/utils')) layers['backend:utils'].push(m);
    else if (source.startsWith('backend/src/config')) layers['backend:config'].push(m);
    else if (source.startsWith('backend/src/constants')) layers['backend:constants'].push(m);
    else if (source.startsWith('backend/src/database')) layers['backend:database'].push(m);
  });

  return layers;
}

function generateLayerDiagram(cruiseResult) {
  const modules = cruiseResult.modules || [];
  const layers = groupByLayer(modules);

  let mermaid = `%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#1f2937', 'edgeLabelBackground': '#f3f4f6'}}}%%
graph TD
    subgraph Frontend["Frontend (Next.js/React)"]
        direction TB
        FE_APP["📱 App Routes\n(frontend/app/(app))"]
        FE_COMP["🧩 Components\n(frontend/components)"]
        FE_LIB["📚 Lib/Utils\n(frontend/lib)"]
        FE_HOOKS["🎣 Hooks\n(frontend/hooks)"]
        FE_SVC["⚙️ Services\n(frontend/services)"]
        FE_TYPES["📝 Types\n(frontend/types)"]
    end

    subgraph Backend["Backend (Express/Node.js)"]
        direction TB
        BE_CTRL["🎮 Controllers\n(backend/src/controllers)"]
        BE_SVC["🔧 Services\n(backend/src/services)"]
        BE_MODELS["🗄️ Models\n(backend/src/database/models)"]
        BE_ROUTES["🛣️ Routes\n(backend/src/routes)"]
        BE_MW["🛡️ Middlewares\n(backend/src/middlewares)"]
        BE_VAL["✅ Validators\n(backend/src/validators)"]
        BE_UTILS["🛠️ Utils\n(backend/src/utils)"]
        BE_CONFIG["⚙️ Config\n(backend/src/config)"]
        BE_CONST["📋 Constants\n(backend/src/constants)"]
        BE_DB["💾 Database\n(backend/src/database)"]
    end

    %% Frontend internal dependencies
    FE_APP --> FE_COMP
    FE_APP --> FE_HOOKS
    FE_APP --> FE_SVC
    FE_APP --> FE_TYPES
    FE_COMP --> FE_LIB
    FE_COMP --> FE_TYPES
    FE_HOOKS --> FE_SVC
    FE_HOOKS --> FE_TYPES
    FE_SVC --> FE_TYPES
    FE_LIB --> FE_TYPES

    %% Backend internal dependencies (Clean Architecture)
    BE_ROUTES --> BE_CTRL
    BE_CTRL --> BE_SVC
    BE_CTRL --> BE_MW
    BE_CTRL --> BE_VAL
    BE_SVC --> BE_MODELS
    BE_SVC --> BE_UTILS
    BE_SVC --> BE_CONST
    BE_MODELS --> BE_DB
    BE_MW --> BE_UTILS
    BE_VAL --> BE_UTILS
    BE_UTILS --> BE_CONST
    BE_CONFIG --> BE_CONST

    %% Cross-layer boundaries (API boundary)
    FE_SVC -.->|"HTTP/API"| BE_ROUTES

    %% Styling
    classDef frontend fill:#3b82f6,color:#fff,stroke:#1e40af,stroke-width:2px;
    classDef backend fill:#10b981,color:#fff,stroke:#047857,stroke-width:2px;
    classDef boundary fill:#f59e0b,color:#fff,stroke:#b45309,stroke-width:2px,stroke-dasharray: 5 5;

    class FE_APP,FE_COMP,FE_LIB,FE_HOOKS,FE_SVC,FE_TYPES frontend;
    class BE_CTRL,BE_SVC,BE_MODELS,BE_ROUTES,BE_MW,BE_VAL,BE_UTILS,BE_CONFIG,BE_CONST,BE_DB backend;
`;

  return mermaid;
}

function generateBackendModuleDiagram(cruiseResult) {
  const modules = (cruiseResult.modules || []).filter(m =>
    m.source && m.source.startsWith('backend/src/') && !m.source.includes('node_modules')
  );

  const moduleMap = new Map();
  modules.forEach(m => {
    const relPath = m.source.replace('backend/src/', '');
    const name = relPath.replace(/\.js$/, '').replace(/\//g, '.');
    moduleMap.set(m.source, { name, deps: [] });
  });

  modules.forEach(m => {
    const sourceInfo = moduleMap.get(m.source);
    if (!sourceInfo) return;
    m.dependencies.forEach(d => {
      if (d.resolved && moduleMap.has(d.resolved)) {
        sourceInfo.deps.push(moduleMap.get(d.resolved).name);
      }
    });
  });

  let mermaid = `%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#1f2937'}}}%%
graph LR
    subgraph Controllers["🎮 Controllers"]
`;

  const controllers = Array.from(moduleMap.entries())
    .filter(([k]) => k.includes('/controllers/'))
    .map(([k, v]) => v.name);

  controllers.forEach(c => {
    mermaid += `        ${c.replace(/\./g, '_')}["${c}"]\n`;
  });

  mermaid += `    end\n\n    subgraph Services["🔧 Services"]\n`;

  const services = Array.from(moduleMap.entries())
    .filter(([k]) => k.includes('/services/'))
    .map(([k, v]) => v.name);

  services.forEach(s => {
    mermaid += `        ${s.replace(/\./g, '_')}["${s}"]\n`;
  });

  mermaid += `    end\n\n    subgraph Models["🗄️ Models"]\n`;

  const models = Array.from(moduleMap.entries())
    .filter(([k]) => k.includes('/database/models/'))
    .map(([k, v]) => v.name);

  models.forEach(m => {
    mermaid += `        ${m.replace(/\./g, '_')}["${m}"]\n`;
  });

  mermaid += `    end\n\n    subgraph Routes["🛣️ Routes"]\n`;

  const routes = Array.from(moduleMap.entries())
    .filter(([k]) => k.includes('/routes/'))
    .map(([k, v]) => v.name);

  routes.forEach(r => {
    mermaid += `        ${r.replace(/\./g, '_')}["${r}"]\n`;
  });

  mermaid += `    end\n\n    subgraph Middlewares["🛡️ Middlewares"]\n`;

  const middlewares = Array.from(moduleMap.entries())
    .filter(([k]) => k.includes('/middlewares/'))
    .map(([k, v]) => v.name);

  middlewares.forEach(m => {
    mermaid += `        ${m.replace(/\./g, '_')}["${m}"]\n`;
  });

  mermaid += `    end\n\n    subgraph Validators["✅ Validators"]\n`;

  const validators = Array.from(moduleMap.entries())
    .filter(([k]) => k.includes('/validators/'))
    .map(([k, v]) => v.name);

  validators.forEach(v => {
    mermaid += `        ${v.replace(/\./g, '_')}["${v}"]\n`;
  });

  mermaid += `    end\n\n    subgraph Utils["🛠️ Utils"]\n`;

  const utils = Array.from(moduleMap.entries())
    .filter(([k]) => k.includes('/utils/'))
    .map(([k, v]) => v.name);

  utils.forEach(u => {
    mermaid += `        ${u.replace(/\./g, '_')}["${u}"]\n`;
  });

  mermaid += `    end\n\n`;

  // Add dependencies
  moduleMap.forEach((info, source) => {
    const sourceId = info.name.replace(/\./g, '_');
    info.deps.forEach(dep => {
      const depId = dep.replace(/\./g, '_');
      mermaid += `    ${sourceId} --> ${depId}\n`;
    });
  });

  mermaid += `
    classDef ctrl fill:#3b82f6,color:#fff,stroke:#1e40af;
    classDef svc fill:#8b5cf6,color:#fff,stroke:#5b21b6;
    classDef mod fill:#10b981,color:#fff,stroke:#047857;
    classDef rt fill:#f59e0b,color:#fff,stroke:#b45309;
    classDef mw fill:#ec4899,color:#fff,stroke:#9d174d;
    classDef val fill:#ef4444,color:#fff,stroke:#991b1b;
    classDef util fill:#6b7280,color:#fff,stroke:#374151;

    class ${controllers.map(c => c.replace(/\./g, '_')).join(',')} ctrl;
    class ${services.map(s => s.replace(/\./g, '_')).join(',')} svc;
    class ${models.map(m => m.replace(/\./g, '_')).join(',')} mod;
    class ${routes.map(r => r.replace(/\./g, '_')).join(',')} rt;
    class ${middlewares.map(m => m.replace(/\./g, '_')).join(',')} mw;
    class ${validators.map(v => v.replace(/\./g, '_')).join(',')} val;
    class ${utils.map(u => u.replace(/\./g, '_')).join(',')} util;
`;

  return mermaid;
}

function generateCrossProjectDiagram() {
  let mermaid = `%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#1f2937'}}}%%
graph LR
    subgraph FE["Frontend (Next.js/React)"]
        direction TB
        FE_APP["📱 App Routes"]
        FE_COMP["🧩 Components"]
        FE_SVC["⚙️ Services/API Client"]
        FE_TYPES["📝 Shared Types"]
    end

    subgraph BE["Backend (Express/Node.js)"]
        direction TB
        BE_API["🌐 API Routes"]
        BE_CTRL["🎮 Controllers"]
        BE_SVC["🔧 Services"]
        BE_MODELS["🗄️ Models"]
    end

    %% Frontend internal
    FE_APP --> FE_COMP
    FE_APP --> FE_SVC
    FE_APP --> FE_TYPES
    FE_COMP --> FE_TYPES
    FE_SVC --> FE_TYPES

    %% Backend internal (Clean Architecture)
    BE_API --> BE_CTRL
    BE_CTRL --> BE_SVC
    BE_SVC --> BE_MODELS

    %% API Boundary (the ONLY allowed cross-project dependency)
    FE_SVC -.->|"HTTP/REST API"| BE_API

    classDef fe fill:#3b82f6,color:#fff,stroke:#1e40af,stroke-width:2px;
    classDef be fill:#10b981,color:#fff,stroke:#047857,stroke-width:2px;
    classDef api fill:#f59e0b,color:#fff,stroke:#b45309,stroke-width:2px,stroke-dasharray: 5 5;

    class FE_APP,FE_COMP,FE_SVC,FE_TYPES fe;
    class BE_API,BE_CTRL,BE_SVC,BE_MODELS be;
`;

  return mermaid;
}

function generateMetricsDiagram(cruiseResult) {
  const metrics = cruiseResult.metrics || {};
  const summary = metrics.summary || {};

  let mermaid = `%%{init: {'theme': 'base'}}%%
graph TD
    subgraph Metrics["📊 Architecture Metrics"]
        direction TB
        MODULES["📦 Total Modules: ${summary.modules || 'N/A'}"]
        DEPS["🔗 Total Dependencies: ${summary.dependencies || 'N/A'}"]
        VIOLATIONS["❌ Violations: ${summary.violations || 0}"]
        INSTABILITY["📈 Avg Instability: ${summary.averageInstability?.toFixed(2) || 'N/A'}"]
        CYCLES["🔄 Circular Deps: ${summary.cycles || 0}"]
    end
`;

  if (metrics.modules) {
    mermaid += '\n    subgraph ModuleStats["Module Statistics"]\n';
    Object.entries(metrics.modules).slice(0, 20).forEach(([mod, data]) => {
      if (data.instability !== undefined) {
        mermaid += `        ${mod.replace(/[^a-zA-Z0-9]/g, '_')}["${mod}: I=${data.instability.toFixed(2)}"]\n`;
      }
    });
    mermaid += '    end\n';
  }

  return mermaid;
}

function main() {
  console.log('🏗️  Generating architecture documentation...\n');
  ensureDir(DOCS_DIR);

  const cruiseResult = loadCruiseResult();

  // Generate diagrams
  const diagrams = {
    'layer-diagram.mmd': generateLayerDiagram(cruiseResult),
    'backend-modules.mmd': generateBackendModuleDiagram(cruiseResult),
    'cross-project.mmd': generateCrossProjectDiagram(),
    'metrics.mmd': generateMetricsDiagram(cruiseResult),
  };

  Object.entries(diagrams).forEach(([filename, content]) => {
    fs.writeFileSync(path.join(DOCS_DIR, filename), content);
    console.log(`✅ Generated ${filename}`);
  });

  // Generate index.md
  const indexContent = `# Architecture Documentation

Auto-generated from \`dependency-cruiser\` analysis.

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

Defined in \`.dependency-cruiser.js\`:

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
\`\`\`
Frontend Services → HTTP/REST → Backend Routes
\`\`\`

This enforces a clean separation where the frontend communicates with the backend
exclusively through the API layer.
`;

  fs.writeFileSync(path.join(DOCS_DIR, 'index.md'), indexContent);
  console.log('\n✅ Generated index.md');
  console.log('\n📁 All diagrams saved to docs/architecture/');
  console.log('💡 View Mermaid diagrams in VS Code with Markdown Preview Mermaid Support extension');
  console.log('💡 Or render with: npx @mermaid-js/mermaid-cli -i docs/architecture/*.mmd -o docs/architecture/');
}

main();