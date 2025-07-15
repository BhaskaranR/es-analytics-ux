# ES Analytics UX

A Next.js application for Elasticsearch analytics with a modern UI built using shadcn/ui components.

## Features

- **Text Analytics**: Analyze comments and feedback using Elasticsearch
- **Comment Rules Builder**: Dynamically create and manage Elasticsearch percolator rules
- **Real-time Search**: Search through comments with advanced filtering
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+
- Elasticsearch instance running
- Environment variables configured

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Elasticsearch Configuration
ELASTICSEARCH_URL=https://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your_password

# Development SSL Settings
NODE_TLS_REJECT_UNAUTHORIZED=false  # Only for development
```

### Installation

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

### Text Analytics

- Analyze comments by topic
- View comment counts and rules
- Search through matched comments
- Real-time filtering and search

### Rules Builder

The Rules Builder allows you to dynamically create Elasticsearch percolator rules:

- **Intervals Queries**: Create proximity-based searches
- **Match Queries**: Simple term matching
- **Multi-Match Queries**: Search across multiple fields
- **Boolean Queries**: Complex logical combinations

#### Supported Query Types

1. **Intervals Query**: Find terms within a specified distance
   - Example: "career NEAR development WITHIN 5 WORDS"

2. **Match Query**: Simple text matching
   - Example: "client support"

3. **Multi-Match Query**: Search across multiple fields
   - Example: Search in both title and content

4. **Boolean Query**: Complex logical operations
   - Example: MUST contain "career" AND SHOULD contain "development"

#### Usage

1. Navigate to the Rules Builder page
2. Select a query type
3. Configure the parameters
4. Preview the generated Elasticsearch query
5. Save the rule to your Elasticsearch instance

### API Endpoints

- `GET /api/elasticsearch` - Search comments and rules
- `POST /api/elasticsearch/rules` - Create new rules
- `GET /api/elasticsearch/rules` - Fetch existing rules
- `DELETE /api/elasticsearch/rules?id=<rule_id>` - Delete rules

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── CommentRulesBuilder.tsx    # Rules builder component
│   │   ├── TextAnalyticsPage.tsx      # Main analytics page
│   │   └── NavigationLinks.tsx        # Navigation component
│   ├── api/
│   │   └── elasticsearch/
│   │       ├── route.ts               # Main ES API
│   │       └── rules/route.ts         # Rules management API
│   ├── rules-builder/
│   │   └── page.tsx                   # Rules builder page
│   └── page.tsx                       # Home page
└── components/                        # shadcn/ui components
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier

### Adding New Components

This project uses shadcn/ui for components. To add new components:

```bash
npx shadcn@latest add <component-name>
```

## Elasticsearch Setup

### Required Indices

1. **comment_rules**: Stores percolator rules
2. **matched_comments**: Stores matched comments with rule IDs

### Index Mappings

The application expects specific field mappings in your Elasticsearch indices. Refer to the SQL scripts in the `sql/` directory for setup examples.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
