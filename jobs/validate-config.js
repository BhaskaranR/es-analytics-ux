#!/usr/bin/env node

/**
 * Configuration validation script
 * Checks if all required environment variables are set correctly
 */

// Load environment variables from .env file
require('dotenv').config();

const requiredEnvVars = {
    ORACLE_USER: 'Oracle database username',
    ORACLE_PASSWORD: 'Oracle database password',
    ORACLE_HOST: 'Oracle database host',
    ORACLE_PORT: 'Oracle database port',
    ORACLE_SID: 'Oracle database SID',
    ELASTICSEARCH_URL: 'Elasticsearch URL (e.g., http://localhost:9200)',
    ELASTICSEARCH_USERNAME: 'Elasticsearch username',
    ELASTICSEARCH_PASSWORD: 'Elasticsearch password'
};

const optionalEnvVars = {
    BATCH_SIZE: 'Number of records to process per batch (default: 1000)',
    ES_INDEX_NAME: 'Elasticsearch index name (default: comments_2024)',
    MATCHED_COMMENTS_INDEX: 'Matched comments index name (default: matched_comments)',
    COMMENT_RULES_INDEX: 'Comment rules index name (default: comment_rules)',
    ENABLE_PERCOLATOR: 'Enable percolator matching (default: true)',
    NODE_TLS_REJECT_UNAUTHORIZED: 'Disable SSL verification (default: 1, set to 0 for dev)'
};

function validateConfiguration() {
    console.log('🔍 Validating configuration...\n');

    let allValid = true;
    const missingVars = [];
    const invalidVars = [];

    // Check required environment variables
    console.log('📋 Required Environment Variables:');
    for (const [varName, description] of Object.entries(requiredEnvVars)) {
        const value = process.env[varName];

        if (!value) {
            console.log(`❌ ${varName}: ${description} - NOT SET`);
            missingVars.push(varName);
            allValid = false;
        } else if (value === 'your_username' || value === 'your_password' || value === 'changeme') {
            console.log(`⚠️  ${varName}: ${description} - USING DEFAULT VALUE`);
            invalidVars.push(varName);
            allValid = false;
        } else {
            console.log(`✅ ${varName}: ${description} - SET`);
        }
    }

    // Check optional environment variables
    console.log('\n📋 Optional Environment Variables:');
    for (const [varName, description] of Object.entries(optionalEnvVars)) {
        const value = process.env[varName];

        if (!value) {
            console.log(`ℹ️  ${varName}: ${description} - NOT SET (using default)`);
        } else {
            console.log(`✅ ${varName}: ${description} - SET to "${value}"`);
        }
    }

    // Summary
    console.log('\n📊 Configuration Summary:');

    if (allValid) {
        console.log('✅ All required configuration is valid!');
        console.log('🚀 Ready to run the migration job.');
    } else {
        console.log('❌ Configuration validation failed!');

        if (missingVars.length > 0) {
            console.log(`\nMissing required variables: ${missingVars.join(', ')}`);
        }

        if (invalidVars.length > 0) {
            console.log(`\nVariables using default values (should be changed): ${invalidVars.join(', ')}`);
        }

        console.log('\n💡 To fix this:');
        console.log('1. Create a .env file in the jobs directory');
        console.log('2. Set the required environment variables');
        console.log('3. Run this validation script again');

        console.log('\n📝 Example .env file:');
        console.log('# Oracle Database Configuration');
        console.log('ORACLE_USER=your_actual_username');
        console.log('ORACLE_PASSWORD=your_actual_password');
        console.log('ORACLE_CONNECT_STRING=localhost:1521/XE');
        console.log('');
        console.log('# Elasticsearch Configuration');
        console.log('ELASTICSEARCH_URL=http://localhost:9200');
        console.log('ELASTICSEARCH_USERNAME=elastic');
        console.log('ELASTICSEARCH_PASSWORD=your_actual_password');
        console.log('');
        console.log('# Job Configuration');
        console.log('BATCH_SIZE=1000');
        console.log('ES_INDEX_NAME=comments_2024');
        console.log('NODE_TLS_REJECT_UNAUTHORIZED=0');
    }

    return allValid;
}

// Run validation if this file is executed directly
if (require.main === module) {
    const isValid = validateConfiguration();
    process.exit(isValid ? 0 : 1);
}

module.exports = {
    validateConfiguration,
    requiredEnvVars,
    optionalEnvVars
};
