# Installation Guide

This guide ensures that Oracle and Elasticsearch dependencies are properly installed via npm.

## Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Latest version
- **Oracle Instant Client**: Required for Oracle connectivity

## Step 1: Install Node.js Dependencies

All required dependencies are managed through npm:

```bash
cd jobs
npm install
```

This will install:

- `oracledb`: Oracle database driver for Node.js
- `@elastic/elasticsearch`: Official Elasticsearch client for Node.js
- `dotenv`: Environment variable loader

## Step 2: Install Oracle Instant Client

The `oracledb` npm package requires Oracle Instant Client to be installed on your system:

### macOS

```bash
brew install oracle-instantclient
```

### Ubuntu/Debian

```bash
# Download from Oracle website and install
# https://www.oracle.com/database/technologies/instant-client/linux-x64-downloads.html
```

### Windows

```bash
# Download from Oracle website and install
# https://www.oracle.com/database/technologies/instant-client/winx64-downloads.html
```

## Step 3: Verify Installation

Check that all dependencies are properly installed:

```bash
# Check npm dependencies
npm list

# Test Oracle connection
npm run test

# Validate configuration
npm run validate
```

## Step 4: Environment Configuration

Create a `.env` file in the jobs directory:

```bash
# Oracle Database Configuration
ORACLE_USER=your_oracle_username
ORACLE_PASSWORD=your_oracle_password
ORACLE_CONNECT_STRING=localhost:1521/XE

# Elasticsearch Configuration
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme

# Job Configuration
BATCH_SIZE=1000
MATCHED_COMMENTS_INDEX=matched_comments
COMMENT_RULES_INDEX=comment_rules
NODE_TLS_REJECT_UNAUTHORIZED=0
```

## Step 5: Run the Job

```bash
npm start
```

## Troubleshooting

### Oracle Connection Issues

1. **Oracle Instant Client not found**:

    ```bash
    # Check if Oracle Instant Client is installed
    ls /usr/local/lib/oracle
    ```

2. **Environment variables not set**:

    ```bash
    # Verify .env file exists
    ls -la .env

    # Check environment variables
    npm run validate
    ```

### Elasticsearch Connection Issues

1. **Elasticsearch not running**:

    ```bash
    # Check if Elasticsearch is running
    curl -X GET "localhost:9200/_cluster/health"
    ```

2. **Authentication failed**:

    ```bash
    # Test authentication
    curl -u elastic:password "localhost:9200/_cluster/health"
    ```

## Package.json Dependencies

The following dependencies are automatically installed via npm:

```json
{
    "dependencies": {
        "oracledb": "^6.3.0", // Oracle database driver
        "@elastic/elasticsearch": "^8.15.0", // Elasticsearch client
        "dotenv": "^16.4.5" // Environment variable loader
    }
}
```

## Verification Commands

```bash
# Check if all dependencies are installed
npm list --depth=0

# Test Oracle connectivity
node -e "const oracledb = require('oracledb'); console.log('Oracle driver loaded successfully')"

# Test Elasticsearch connectivity
node -e "const { Client } = require('@elastic/elasticsearch'); console.log('Elasticsearch client loaded successfully')"

# Test environment loading
node -e "require('dotenv').config(); console.log('Environment loaded:', process.env.ORACLE_USER ? 'Oracle config found' : 'Oracle config missing')"
```

All dependencies are managed through npm - no manual installation required beyond Oracle Instant Client!
