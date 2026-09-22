/**
 * Generate Mermaid sequence diagrams from OpenAPI spec
 * Creates sequence diagrams for each API endpoint showing the flow
 */

const fs = require('fs');
const path = require('path');

function generateSequenceDiagrams(swaggerSpec) {
  const diagrams = {};
  
  if (!swaggerSpec.paths) return diagrams;
  
  for (const [endpoint, methods] of Object.entries(swaggerSpec.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (typeof operation !== 'object' || !operation.operationId) continue;
      
      const tag = operation.tags?.[0] || 'Default';
      
      const diagramKey = `${tag}-${operation.operationId}`;
      diagrams[diagramKey] = generateSequenceDiagram(endpoint, method, operation, tag);
    }
  }
  
  return diagrams;
}

function generateSequenceDiagram(endpoint, method, operation, tag) {
  const operationId = operation.operationId || `${method.toUpperCase()} ${endpoint}`;
  const summary = operation.summary || operationId;
  const parameters = operation.parameters || [];
  const responses = operation.responses || {};
  const security = operation.security || [];
  
  let mermaid = `%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#1f2937'}}}%%
sequenceDiagram
    autonumber
    actor Client as "🌐 Client"
    participant API as "🚪 API Gateway"
    participant Auth as "🔐 Auth Service"
    participant Controller as "🎮 ${tag} Controller"
    participant Service as "🔧 ${tag} Service"
    participant DB as "🗄️ Database"
`;

  // Authentication flow
  if (security.length > 0) {
    mermaid += `
    Client->>API: ${method.toUpperCase()} ${endpoint}
    API->>Auth: Validate JWT Token
    Auth-->>API: Token Valid / User Info
`;
  } else {
    mermaid += `
    Client->>API: ${method.toUpperCase()} ${endpoint}
`;
  }

  // Request validation
  const hasBodyParam = parameters.some(p => p.in === 'requestBody');
  const hasPathParams = parameters.some(p => p.in === 'path');
  const hasQueryParams = parameters.some(p => p.in === 'query');
  
  if (hasPathParams || hasQueryParams || hasBodyParam) {
    mermaid += `
    API->>Controller: Validate Request
    Controller->>Controller: Validate Params
`;
    if (hasBodyParam) {
      mermaid += `    Controller->>Controller: Validate Body (Joi)\n`;
    }
    mermaid += `    Controller-->>API: Request Valid\n`;
  }

  // Controller to Service
  mermaid += `
    API->>Controller: Execute ${operationId}
    Controller->>Service: Business Logic
`;

  // Service operations
  if (operationId.includes('create') || operationId.includes('add') || method === 'post') {
    mermaid += `
    Service->>DB: INSERT / CREATE
    DB-->>Service: Created Record
`;
  } else if (operationId.includes('update') || operationId.includes('edit') || method === 'put' || method === 'patch') {
    mermaid += `
    Service->>DB: UPDATE
    DB-->>Service: Updated Record
`;
  } else if (operationId.includes('delete') || operationId.includes('remove') || method === 'delete') {
    mermaid += `
    Service->>DB: DELETE
    DB-->>Service: Deleted Record
`;
  } else if (operationId.includes('get') || operationId.includes('list') || operationId.includes('find') || method === 'get') {
    mermaid += `
    Service->>DB: SELECT / QUERY
    DB-->>Service: Result Set
`;
  }

  // Response
  mermaid += `
    Service-->>Controller: Result
    Controller-->>API: Response
`;

  // Response handling
  const successResponses = Object.keys(responses).filter(code => code.startsWith('2'));
  if (successResponses.length > 0) {
    mermaid += `    API-->>Client: ${successResponses[0]} ${responses[successResponses[0]]?.description || 'Success'}\n`;
  }

  // Error responses
  const errorResponses = Object.keys(responses).filter(code => code.startsWith('4') || code.startsWith('5'));
  if (errorResponses.length > 0) {
    mermaid += `
    alt Error Cases
`;
    for (const code of errorResponses.slice(0, 3)) {
      const desc = responses[code]?.description || 'Error';
      mermaid += `        API-->>Client: ${code} ${desc}\n`;
    }
    mermaid += `    end\n`;
  }

  mermaid += `
    Note right of Client: ${summary}
    Note right of Service: Tag: ${tag}
`;

  return mermaid;
}

function generateMermaidIndex(diagrams) {
  let mermaid = `# API Sequence Diagrams

Auto-generated from OpenAPI specification.

`;

  // Group by tag
  const byTag = {};
  for (const [key, diagram] of Object.entries(diagrams)) {
    const tag = key.split('-')[0];
    if (!byTag[tag]) byTag[tag] = [];
    byTag[tag].push({ key, diagram });
  }

  for (const [tag, items] of Object.entries(byTag)) {
    mermaid += `## ${tag}\n\n`;
    for (const { key, diagram } of items) {
      const operationId = key.replace(`${tag}-`, '');
      mermaid += `### ${operationId}\n\n\`\`\`mermaid\n${diagram}\n\`\`\`\n\n`;
    }
  }

  return mermaid;
}

function generateAll(apiSpec) {
  const diagrams = generateSequenceDiagrams(apiSpec);
  const index = generateMermaidIndex(diagrams);
  
  const outputDir = path.join(__dirname, '..', '..', 'docs', 'api', 'sequence-diagrams');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write individual diagrams
  for (const [key, diagram] of Object.entries(diagrams)) {
    fs.writeFileSync(
      path.join(outputDir, `${key}.mmd`),
      diagram
    );
  }
  
  // Write index
  fs.writeFileSync(
    path.join(outputDir, 'index.md'),
    index
  );
  
  console.log(`Generated ${Object.keys(diagrams).length} sequence diagrams in ${outputDir}`);
  return { diagrams, index };
}

module.exports = {
  generateSequenceDiagrams,
  generateMermaidIndex,
  generateAll,
};