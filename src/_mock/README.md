# Mock Data

This folder contains mock data for the Text Analytics application when the Elasticsearch API is not available or fails.

## Files

- `mockRules.ts` - Mock rules data for different topics (uses `description` field)
- `mockComments.ts` - Mock comments data for different topics and rules
- `index.ts` - Export file for easy importing

## Usage

The mock data is used as fallback when API calls fail. Import the functions from the main index:

```typescript
import { getMockRulesForTopic, getMockCommentsForTopic, getMockCommentsByRule } from '../../_mock';
```

## Functions

### `getMockRulesForTopic(topic: string)`

Returns mock rules for a specific topic. Supports:

- career-development
- employee-networks
- client-support
- team-collaboration
- onboarding
- And more...

### `getMockCommentsForTopic(topic: string)`

Returns mock comments for a specific topic.

### `getMockCommentsByRule(ruleId: string)`

Returns mock comments for a specific rule ID.

## Adding New Mock Data

To add new mock data:

1. Add the new case to the appropriate function
2. Follow the existing data structure
3. Update the interfaces if needed
4. Export from index.ts
