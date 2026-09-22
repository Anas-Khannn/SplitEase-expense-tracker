/**
 * ERD Generator from Sequelize Models
 * Generates Mermaid ER diagrams and documentation
 */

const fs = require('fs');
const path = require('path');

const MODELS_DIR = path.join(__dirname, '..', 'database', 'models');
const INDEX_FILE = path.join(MODELS_DIR, 'index.js');

const MODEL_FILES = [
  'user.js',
  'group.js',
  'group-member.js',
  'expense.js',
  'expense-split.js',
  'payment.js',
  'expense-reaction.js',
  'activity-log.js',
];

function parseModelFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const modelName = path.basename(filePath, '.js').replace(/-/g, '');
  
  // Extract table name
  const tableNameMatch = content.match(/tableName:\s*["'](\w+)["']/);
  const tableName = tableNameMatch ? tableNameMatch[1] : modelName.toLowerCase() + 's';
  
  // Extract columns
  const columns = [];
  const columnRegex = /(\w+):\s*\{([^}]+)\}/g;
  let match;
  while ((match = columnRegex.exec(content)) !== null) {
    const colName = match[1];
    const colDef = match[2];
    
    const typeMatch = colDef.match(/type:\s*DataTypes\.(\w+)(?:\([^)]+\))?/);
    const type = typeMatch ? typeMatch[1] : 'UNKNOWN';
    
    const primaryKey = colDef.includes('primaryKey: true');
    const allowNull = !colDef.includes('allowNull: false');
    const unique = colDef.includes('unique: true');
    const defaultValue = colDef.match(/defaultValue:\s*([^,\n]+)/);
    
    columns.push({
      name: colName,
      type: mapDataType(type),
      primaryKey,
      allowNull,
      unique,
      defaultValue: defaultValue ? defaultValue[1].trim() : null,
    });
  }
  
  return { modelName, tableName, columns };
}

function mapDataType(sequelizeType) {
  const typeMap = {
    UUID: 'uuid',
    STRING: 'varchar',
    TEXT: 'text',
    INTEGER: 'integer',
    BIGINT: 'bigint',
    DECIMAL: 'decimal',
    FLOAT: 'float',
    DOUBLE: 'double',
    BOOLEAN: 'boolean',
    DATE: 'timestamp',
    DATEONLY: 'date',
    TIME: 'time',
    JSON: 'jsonb',
    JSONB: 'jsonb',
    ENUM: 'enum',
    ARRAY: 'array',
    BLOB: 'bytea',
  };
  return typeMap[sequelizeType.toUpperCase()] || sequelizeType.toLowerCase();
}

function parseAssociations() {
  const content = fs.readFileSync(INDEX_FILE, 'utf-8');
  const associations = [];
  
  // Parse hasMany/belongsTo
  const hasManyRegex = /(\w+)\.hasMany\((\w+),\s*\{[^}]*foreignKey:\s*["'](\w+)["'][^}]*as:\s*["'](\w+)["']/g;
  let match;
  while ((match = hasManyRegex.exec(content)) !== null) {
    associations.push({
      type: 'one-to-many',
      source: match[1],
      target: match[2],
      foreignKey: match[3],
      alias: match[4],
    });
  }
  
  // Parse belongsTo
  const belongsToRegex = /(\w+)\.belongsTo\((\w+),\s*\{[^}]*foreignKey:\s*["'](\w+)["'][^}]*as:\s*["'](\w+)["']/g;
  while ((match = belongsToRegex.exec(content)) !== null) {
    associations.push({
      type: 'many-to-one',
      source: match[1],
      target: match[2],
      foreignKey: match[3],
      alias: match[4],
    });
  }
  
  // Parse belongsToMany
  const belongsToManyRegex = /(\w+)\.belongsToMany\((\w+),\s*\{[^}]*through:\s*(\w+),[^}]*foreignKey:\s*["'](\w+)["'][^}]*otherKey:\s*["'](\w+)["'][^}]*as:\s*["'](\w+)["']/g;
  while ((match = belongsToManyRegex.exec(content)) !== null) {
    associations.push({
      type: 'many-to-many',
      source: match[1],
      target: match[2],
      through: match[3],
      foreignKey: match[4],
      otherKey: match[5],
      alias: match[6],
    });
  }
  
  return associations;
}

function generateMermaidERD(models, associations) {
  let mermaid = `%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#1f2937', 'er': {'diagramPadding': 20}}}}%%
erDiagram
`;

  // Entities
  for (const model of models) {
    mermaid += `    ${model.modelName.toUpperCase()} {\n`;
    for (const col of model.columns) {
      const pk = col.primaryKey ? 'PK' : '';
      const fk = col.name.endsWith('_id') && !col.primaryKey ? 'FK' : '';
      const notNull = !col.allowNull ? 'NOT NULL' : '';
      const unique = col.unique ? 'UNIQUE' : '';
      const constraints = [pk, fk, notNull, unique].filter(Boolean).join(', ');
      mermaid += `        ${col.type} ${col.name} ${constraints}\n`;
    }
    mermaid += `    }\n\n`;
  }

  // Relationships
  for (const assoc of associations) {
    let notation = '';
    switch (assoc.type) {
      case 'one-to-many':
        notation = '||--o{';
        break;
      case 'many-to-one':
        notation = '}o--||';
        break;
      case 'many-to-many':
        notation = '}o--o{';
        break;
    }
    
    const sourceLabel = assoc.alias ? ` "${assoc.alias}"` : '';
    
    if (assoc.type === 'many-to-many') {
      mermaid += `    ${assoc.source.toUpperCase()} ${notation} ${assoc.through.toUpperCase()} : "${assoc.alias}"\n`;
      mermaid += `    ${assoc.through.toUpperCase()} }o--|| ${assoc.target.toUpperCase()} : ""\n`;
    } else {
      mermaid += `    ${assoc.source.toUpperCase()} ${notation} ${assoc.target.toUpperCase()} : "${assoc.foreignKey}"${sourceLabel}\n`;
    }
  }

  return mermaid;
}

function generateMarkdownDoc(models, associations) {
  let md = `# Database Entity Relationship Diagram

Auto-generated from Sequelize models.

## Entities

`;

  for (const model of models) {
    md += `### ${model.modelName} (\`${model.tableName}\`)\n\n`;
    md += `| Column | Type | Constraints |\n`;
    md += `|--------|------|-------------|\n`;
    for (const col of model.columns) {
      const constraints = [];
      if (col.primaryKey) constraints.push('PK');
      if (col.name.endsWith('_id') && !col.primaryKey) constraints.push('FK');
      if (!col.allowNull) constraints.push('NOT NULL');
      if (col.unique) constraints.push('UNIQUE');
      if (col.defaultValue) constraints.push(`DEFAULT ${col.defaultValue}`);
      md += `| \`${col.name}\` | ${col.type} | ${constraints.join(', ') || '—'} |\n`;
    }
    md += '\n';
  }

  md += `## Relationships\n\n`;
  
  const byType = {};
  for (const assoc of associations) {
    if (!byType[assoc.type]) byType[assoc.type] = [];
    byType[assoc.type].push(assoc);
  }

  for (const [type, assocs] of Object.entries(byType)) {
    md += `### ${type.replace(/-/g, ' ').toUpperCase()}\n\n`;
    for (const assoc of assocs) {
      if (assoc.type === 'many-to-many') {
        md += `- **${assoc.source}** ↔ **${assoc.target}** (through **${assoc.through}**)\n`;
        md += `  - ${assoc.source}.${assoc.foreignKey} → ${assoc.through}.${assoc.foreignKey}\n`;
        md += `  - ${assoc.target}.${assoc.otherKey || assoc.foreignKey} → ${assoc.through}.${assoc.otherKey || assoc.foreignKey}\n`;
        if (assoc.alias) md += `  - Alias: \`${assoc.alias}\`\n`;
      } else {
        md += `- **${assoc.source}** → **${assoc.target}**\n`;
        md += `  - Foreign Key: \`${assoc.foreignKey}\`\n`;
        if (assoc.alias) md += `  - Alias: \`${assoc.alias}\`\n`;
      }
      md += '\n';
    }
  }

  return md;
}

function generateAll() {
  console.log('📊 Generating ERD from Sequelize models...\n');
  
  const models = [];
  for (const file of MODEL_FILES) {
    const filePath = path.join(MODELS_DIR, file);
    if (fs.existsSync(filePath)) {
      const model = parseModelFile(filePath);
      models.push(model);
      console.log(`✅ Parsed ${model.modelName} (${model.tableName}) - ${model.columns.length} columns`);
    }
  }

  const associations = parseAssociations();
  console.log(`\n🔗 Found ${associations.length} associations`);

  const outputDir = path.join(__dirname, '..', '..', '..', 'docs', 'database');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate Mermaid ERD
  const mermaidERD = generateMermaidERD(models, associations);
  fs.writeFileSync(path.join(outputDir, 'erd.mmd'), mermaidERD);
  console.log(`\n✅ Generated erd.mmd`);

  // Generate Markdown documentation
  const markdownDoc = generateMarkdownDoc(models, associations);
  fs.writeFileSync(path.join(outputDir, 'erd.md'), markdownDoc);
  console.log(`✅ Generated erd.md`);

  // Generate JSON for programmatic use
  const jsonData = { models, associations, generatedAt: new Date().toISOString() };
  fs.writeFileSync(path.join(outputDir, 'erd.json'), JSON.stringify(jsonData, null, 2));
  console.log(`✅ Generated erd.json`);

  console.log(`\n📁 All files saved to docs/database/`);
  console.log('💡 View Mermaid ERD in VS Code with Markdown Preview Mermaid Support');
  console.log('💡 Or render with: npx @mermaid-js/mermaid-cli -i docs/database/erd.mmd -o docs/database/');

  return { models, associations, mermaidERD, markdownDoc };
}

// Run if called directly
if (require.main === module) {
  generateAll();
}

module.exports = {
  parseModelFile,
  parseAssociations,
  generateMermaidERD,
  generateMarkdownDoc,
  generateAll,
};