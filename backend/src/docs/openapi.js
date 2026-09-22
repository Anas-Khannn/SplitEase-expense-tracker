const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'SplitEase API',
      version: '1.0.0',
      description: 'SplitEase Expense Tracker API Documentation',
      contact: {
        name: 'SplitEase Team',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Development server',
      },
      {
        url: 'https://api.splitease.com/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            name: { type: 'string', example: 'John Doe' },
            avatarUrl: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Group: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Trip to Bali' },
            description: { type: 'string', nullable: true },
            currency: { type: 'string', example: 'USD' },
            createdBy: { type: 'integer', example: 1 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Expense: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            groupId: { type: 'integer', example: 1 },
            paidBy: { type: 'integer', example: 1 },
            amount: { type: 'number', format: 'float', example: 50.00 },
            currency: { type: 'string', example: 'USD' },
            description: { type: 'string', example: 'Dinner at restaurant' },
            category: { type: 'string', example: 'Food' },
            splitType: { type: 'string', enum: ['equal', 'exact', 'percentage', 'shares'], example: 'equal' },
            date: { type: 'string', format: 'date', example: '2024-01-15' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            groupId: { type: 'integer', example: 1 },
            fromUserId: { type: 'integer', example: 2 },
            toUserId: { type: 'integer', example: 1 },
            amount: { type: 'number', format: 'float', example: 25.00 },
            currency: { type: 'string', example: 'USD' },
            description: { type: 'string', example: 'Settlement for Bali trip' },
            status: { type: 'string', enum: ['pending', 'completed', 'cancelled'], example: 'completed' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Balance: {
          type: 'object',
          properties: {
            userId: { type: 'integer', example: 1 },
            userName: { type: 'string', example: 'John Doe' },
            balance: { type: 'number', format: 'float', example: -25.00 },
            currency: { type: 'string', example: 'USD' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            statusCode: { type: 'integer', example: 400 },
            message: { type: 'string', example: 'Validation error' },
            error: { type: 'string', example: 'Bad Request' },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            data: { type: 'array', items: { type: 'object' } },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 10 },
                total: { type: 'integer', example: 100 },
                totalPages: { type: 'integer', example: 10 },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management' },
      { name: 'Groups', description: 'Group management' },
      { name: 'Expenses', description: 'Expense management' },
      { name: 'Payments', description: 'Payment/settlement management' },
      { name: 'Balances', description: 'Balance calculations' },
      { name: 'Dashboard', description: 'Dashboard analytics' },
      { name: 'Activity', description: 'Activity logs' },
      { name: 'Summary', description: 'Summary reports' },
    ],
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

function generateOpenApiSpec() {
  const outputDir = path.join(__dirname, '..', '..', 'docs', 'api');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(outputDir, 'openapi.json'),
    JSON.stringify(swaggerSpec, null, 2)
  );
  
  fs.writeFileSync(
    path.join(outputDir, 'openapi.yaml'),
    require('js-yaml').dump(swaggerSpec)
  );
  
  console.log('OpenAPI spec generated at:', outputDir);
  return swaggerSpec;
}

function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'SplitEase API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
  }));
  
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  return swaggerSpec;
}

module.exports = {
  swaggerSpec,
  generateOpenApiSpec,
  setupSwagger,
  swaggerUi,
};