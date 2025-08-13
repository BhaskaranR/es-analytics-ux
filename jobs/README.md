# Oracle Comments Rule Matching Job

This Node.js job reads all records from Oracle table `comments_2024` and for each comment, runs percolator queries against existing rules and stores matches in the `matched_comments` index.

## Oracle Table Structure

The job expects the following Oracle table structure:

```sql
CREATE TABLE comments_2024 (
    QUESTION_ID VARCHAR2(50),    -- Identifies the survey question
    COMMENTS CLOB,               -- Free-text responses from users
    TOPICS VARCHAR2(500)         -- Tag(s) assigned to the comment
);
```

## Elasticsearch Index Structure

The job creates the `matched_comments` index to store rule matches:

### Matched Comments Index (`matched_comments`)

```json
{
  "mappings": {
    "properties": {
      "rule_id": { "type": "keyword" },
      "comment_text": { "type": "text" },
      "topic": { "type": "keyword" },
      "description": { "type": "text" },
      "score": { "type": "float" },
      "matched_terms": { "type": "keyword" },
      "max_gaps": { "type": "integer" },
      "ordered": { "type": "boolean" },
      "highlighted_text": { "type": "text" },
      "timestamp": { "type": "date" },
      "oracle_id": { "type": "keyword" },
      "question_id": { "type": "keyword" }
    }
  }
}
```

## Prerequisites

1. **Oracle Database**: Access to Oracle database with the `comments_2024` table
2. **Elasticsearch**: Running Elasticsearch instance
3. **Node.js**: Version 18 or higher
4. **Oracle Instant Client**: Required for Oracle connectivity

## Installation

1. Install dependencies:

```bash
cd jobs
npm install
```

2. Install Oracle Instant Client (if not already installed):
   - **macOS**: `brew install oracle-instantclient`
   - **Ubuntu/Debian**: Download from Oracle website
   - **Windows**: Download from Oracle website

3. Set environment variables (create `.env` file):

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
ES_INDEX_NAME=comments_2024

# SSL Configuration (for development)
NODE_TLS_REJECT_UNAUTHORIZED=0
```

## Usage

### Quick Start

1. **Install dependencies:**

```bash
cd jobs
npm install
```

2. **Create `.env` file with your configuration:**

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

3. **Test connections:**

```bash
npm run test
```

4. **Validate configuration:**

```bash
npm run validate
```

5. **Run the rule matching job:**

```bash
npm start
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ORACLE_USER` | Oracle database username | `your_username` |
| `ORACLE_PASSWORD` | Oracle database password | `your_password` |
| `ORACLE_HOST` | Oracle database host | `localhost` |
| `ORACLE_PORT` | Oracle database port | `1521` |
| `ORACLE_SID` | Oracle database SID | `XE` |
| `ELASTICSEARCH_URL` | Elasticsearch URL | `http://localhost:9200` |
| `ELASTICSEARCH_USERNAME` | Elasticsearch username | `elastic` |
| `ELASTICSEARCH_PASSWORD` | Elasticsearch password | `changeme` |
| `BATCH_SIZE` | Number of records to process per batch | `1000` |
| `MATCHED_COMMENTS_INDEX` | Matched comments index name | `matched_comments` |
| `COMMENT_RULES_INDEX` | Comment rules index name | `comment_rules` |
| `NODE_TLS_REJECT_UNAUTHORIZED` | Disable SSL verification (dev only) | `1` |

## Features

- **Batch Processing**: Processes records in configurable batches to manage memory usage
- **Retry Logic**: Automatically retries failed Elasticsearch operations
- **Progress Tracking**: Shows real-time progress of the migration
- **Error Handling**: Comprehensive error handling and logging
- **Connection Pooling**: Efficient Oracle connection management
- **Graceful Shutdown**: Handles SIGINT and SIGTERM signals properly

## Job Flow

1. **Initialize Connections**: Creates Oracle connection pool and Elasticsearch client
2. **Create Index**: Creates matched_comments index with proper mapping
3. **Get Record Count**: Counts total records in Oracle table
4. **Batch Processing**:
   - Reads records from Oracle in batches
   - For each comment, runs percolator queries against existing rules
   - Stores rule matches in matched_comments index
   - Shows progress updates
5. **Verification**: Confirms total rule matches
6. **Cleanup**: Closes all connections

## Error Handling

The job includes comprehensive error handling:

- **Connection Errors**: Retries Oracle and Elasticsearch connections
- **Bulk Indexing Errors**: Retries failed Elasticsearch operations
- **Data Transformation Errors**: Logs and continues with next record
- **Network Errors**: Implements exponential backoff for retries

## Monitoring

The job provides detailed logging:

- Connection status
- Batch processing progress
- Error details with stack traces
- Final verification statistics

## Troubleshooting

### Common Issues

1. **Oracle Connection Failed**:
   - Verify Oracle Instant Client is installed
   - Check connection string format
   - Ensure database is accessible

2. **Elasticsearch Connection Failed**:
   - Verify Elasticsearch is running
   - Check authentication credentials
   - Disable SSL verification for development

3. **Memory Issues**:
   - Reduce `BATCH_SIZE` environment variable
   - Monitor system memory usage

4. **Performance Issues**:
   - Increase `BATCH_SIZE` for faster processing
   - Check network latency between systems
   - Monitor Elasticsearch cluster health

## Security Notes

- Store sensitive credentials in environment variables
- Use encrypted connections in production
- Implement proper access controls for both Oracle and Elasticsearch
- Consider using API keys for Elasticsearch authentication

## Production Considerations

- Use connection pooling for high-volume migrations
- Implement monitoring and alerting
- Set up proper logging and error tracking
- Consider using a job scheduler (cron, systemd, etc.)
- Implement data validation and integrity checks
