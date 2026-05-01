const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const runSchema = async () => {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('Connected to PostgreSQL');
        
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        
        await client.query(schemaSql);
        console.log('✅ Schema executed successfully!');
    } catch (err) {
        console.error('❌ Error executing schema:', err);
    } finally {
        await client.end();
    }
};

runSchema();
