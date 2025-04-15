const path = require('path');
const YAML = require('yamljs');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'FitAura API',
            version: '1.0.0',
            description: 'FitAura Fitness Tracker Backend API'
        },
        servers: [
            {
                url: 'http://localhost:8081/api/v1',
                description: 'Development Server'
            }
        ]
    },
    apis: [path.join(__dirname, './swagger-doc.js')] // ✅ MATCH THIS NAME
};

const swaggerDocument = YAML.load('./swagger-doc.yaml');
const swaggerUi = require('swagger-ui-express');

module.exports = { swaggerDocument, swaggerUi };
