# Oracle Analytics Setup Guide

## ⚠️ Important Issues to Fix

The Oracle Analytics implementation has several issues that need to be addressed based on your actual Oracle database schema:

### 1. **Table Names & Column Names**

The API currently assumes:
- Table: `COMMENT_RULES` with columns: `RULE_ID`, `TOPIC`, `DESCRIPTION`, `QUERY_TEXT`
- Table: `MATCHED_COMMENTS` with standard columns

**But your actual Oracle schema likely uses:**
- `rb_comment_rules` (or similar) with `rule_expr_raw` column
- Column names may be in different case (Oracle is case-sensitive for quoted identifiers)

### 2. **Oracle Text CONTAINS Query Issue**

The current `matchRules` operation has a fundamental problem: Oracle Text `CONTAINS` requires:
- An **indexed column** (with CONTEXT index) on the left side
- A **search expression** on the right side

For percolation-style matching (testing one comment against many rules), you need one of these approaches:

#### **Option A: Use Existing Comment Table** (Recommended if you have one)
```sql
-- If you have a SURVEY_COMMENTS or similar table with indexed comment_text
SELECT 
    r.RULE_ID,
    r.TOPIC,
    r.DESCRIPTION,
    SCORE(1) as SCORE,
    CTX_DOC.SNIPPET('comment_text_idx', c.id, r.RULE_EXPR_RAW) as HIGHLIGHTED_TEXT
FROM COMMENT_RULES r
JOIN (SELECT 999999 as id, :comment_text as comment_text FROM DUAL) c
    ON CONTAINS(c.comment_text, rb_expand_macros(r.RULE_EXPR_RAW), 1) > 0
WHERE (r.EXCLUDE_EXPR_RAW IS NULL 
    OR CONTAINS(c.comment_text, rb_expand_macros(r.EXCLUDE_EXPR_RAW), 2) = 0)
ORDER BY SCORE(1) DESC
```

#### **Option B: Temporary Table Approach**
1. Create a temp table
2. Insert the comment
3. Create CONTEXT index
4. Query against rules
5. Drop temp table

#### **Option C: Application-Side Matching** (Simpler but less efficient)
- Fetch all rules
- Test each rule expression against comment in Node.js
- Return matches

### 3. **Required Oracle Setup**

You need:
1. **Oracle Text** installed and configured
2. **CONTEXT indexes** on comment columns
3. **Macro expansion function** (`rb_expand_macros`) if using word groups
4. **Proper table structure** matching your schema

## 🔧 Required Changes

### Step 1: Update Table/Column Names

Edit `src/app/api/oracle/route.ts` and update:

```typescript
// Replace generic names with your actual schema
FROM COMMENT_RULES  // → FROM rb_comment_rules (or your actual table name)
RULE_EXPR_RAW       // → rule_expr_raw (match your column case)
QUERY_TEXT          // → rule_expr_raw or whatever your column is named
```

### Step 2: Fix matchRules Query

Update the `matchRules` case with one of the approaches above based on your setup.

### Step 3: Install oracledb

```bash
npm install oracledb
```

### Step 4: Configure Environment Variables

```bash
# .env.local
ORACLE_USER=your_username
ORACLE_PASSWORD=your_password
ORACLE_CONNECT_STRING=localhost:1521/XE
# OR
ORACLE_HOST=localhost
ORACLE_PORT=1521
ORACLE_SID=XE
```

### Step 5: Verify Oracle Text Setup

Check if you have:
- CONTEXT indexes created
- Macro expansion functions
- Proper table permissions

## 📝 Example Working Query (Adapt to Your Schema)

```sql
-- If you have a comments table with CONTEXT index
SELECT 
    r.id AS RULE_ID,
    r.topic AS TOPIC,
    r.description AS DESCRIPTION,
    SCORE(1) AS SCORE,
    CTX_DOC.SNIPPET('comment_text_idx', c.id, 
        rb_expand_macros(r.rule_expr_raw)) AS HIGHLIGHTED_TEXT
FROM rb_comment_rules r
CROSS JOIN (
    SELECT 1 AS id, :comment_text AS comment_text FROM DUAL
) c
WHERE CONTAINS(c.comment_text, rb_expand_macros(r.rule_expr_raw), 1) > 0
  AND (r.exclude_expr_raw IS NULL 
    OR CONTAINS(c.comment_text, rb_expand_macros(r.exclude_expr_raw), 2) = 0)
ORDER BY SCORE(1) DESC
```

## ⚡ Quick Fix for Testing

If you want to test the UI without full Oracle Text setup, you can temporarily modify `matchRules` to:

```typescript
case 'matchRules': {
    const { comment_text } = params;
    // Simple LIKE-based matching for testing (replace with Oracle Text later)
    result = await connection.execute(
        `SELECT 
            RULE_ID,
            TOPIC,
            DESCRIPTION,
            1.0 as SCORE,
            :comment_text as HIGHLIGHTED_TEXT
        FROM COMMENT_RULES
        WHERE :comment_text LIKE '%' || SUBSTR(RULE_EXPR_RAW, 1, 20) || '%'
        ORDER BY RULE_ID`,
        { comment_text },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    break;
}
```

## ✅ Checklist

- [ ] Install `oracledb` package
- [ ] Update table/column names in API route
- [ ] Verify Oracle Text is installed and configured
- [ ] Create/verify CONTEXT indexes exist
- [ ] Update `matchRules` query for your schema
- [ ] Test connection to Oracle database
- [ ] Verify `rb_expand_macros` function exists (if using macros)
- [ ] Update `MATCHED_COMMENTS` table structure if needed

## 🐛 Common Issues

1. **"ORA-00942: table or view does not exist"**
   - Fix: Update table names in queries to match your schema

2. **"ORA-20000: Oracle Text error"**
   - Fix: Ensure CONTEXT indexes are created and Oracle Text is properly set up

3. **"ORA-00904: invalid identifier"**
   - Fix: Check column names match your actual schema (case-sensitive if quoted)

4. **Connection pool errors**
   - Fix: Verify Oracle credentials and connection string

## 📚 Resources

- Oracle Text Documentation: https://docs.oracle.com/en/database/oracle/oracle-database/19/ccref/introduction-to-oracle-text.html
- oracledb Node.js Driver: https://oracle.github.io/node-oracledb/

