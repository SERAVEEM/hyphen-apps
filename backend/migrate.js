require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('./src/config/db');

async function runMigration() {
    try {
        console.log('Reading schema.sql...');
        const sqlFilePath = path.join(__dirname, 'database', 'schema.sql');
        let sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

        // Remove CREATE DATABASE and USE statements to avoid permission errors on Aiven
        sqlContent = sqlContent.replace(/CREATE DATABASE[\s\S]*?;/i, '');
        sqlContent = sqlContent.replace(/USE\s+\w+;/i, '');

        // Strip comments first
        sqlContent = sqlContent.replace(/\/\*[\s\S]*?\*\//g, ''); // Multi-line comments
        sqlContent = sqlContent.replace(/--.*$/gm, '');          // Single-line comments

        // Split statements by semicolon
        const statements = sqlContent
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        console.log(`Found ${statements.length} SQL statements to execute.`);

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            console.log(`Executing statement ${i + 1}/${statements.length}...`);
            try {
                await db.query(statement);
            } catch (queryErr) {
                // If it is a warning or already exists, we can log and continue
                console.error(`Error in statement ${i + 1}:`, queryErr.message);
                if (queryErr.message.includes('already exists') || queryErr.message.includes('Duplicate')) {
                    console.log('Continuing...');
                } else {
                    throw queryErr;
                }
            }
        }

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

runMigration();
