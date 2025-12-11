-- Top 5 Oracle Text + Analytical SQL Patterns

-- 1. Count of comments matching each topic rule
SELECT r.topic, COUNT(*) AS match_count
FROM rb_survey_comments c
JOIN rb_comment_rules r
  ON CONTAINS(c.comment_text, rb_expand_macros(r.rule_expr_raw), 1) > 0
GROUP BY r.topic;

-- 2. List comments with match rank using SCORE()
SELECT c.id, r.topic, c.comment_text, SCORE(1) AS relevance_score
FROM rb_survey_comments c
JOIN rb_comment_rules r
  ON CONTAINS(c.comment_text, rb_expand_macros(r.rule_expr_raw), 1) > 0
ORDER BY r.topic, relevance_score DESC;

-- 3. First comment match per topic using ROW_NUMBER()
SELECT *
FROM (
  SELECT c.id, r.topic, c.comment_text,
         ROW_NUMBER() OVER (PARTITION BY r.topic ORDER BY c.id) AS rn
  FROM rb_survey_comments c
  JOIN rb_comment_rules r
    ON CONTAINS(c.comment_text, rb_expand_macros(r.rule_expr_raw), 1) > 0
)
WHERE rn = 1;

-- 4. Number of matching comments per respondent
SELECT c.respondent_id, COUNT(*) AS matches
FROM rb_survey_comments c
JOIN rb_comment_rules r
  ON CONTAINS(c.comment_text, rb_expand_macros(r.rule_expr_raw), 1) > 0
GROUP BY c.respondent_id
ORDER BY matches DESC;

-- 5. Count of rules matched per comment
SELECT c.id, COUNT(*) AS rules_matched
FROM rb_survey_comments c
JOIN rb_comment_rules r
  ON CONTAINS(c.comment_text, rb_expand_macros(r.rule_expr_raw), 1) > 0
GROUP BY c.id
ORDER BY rules_matched DESC;

-- Sample update to refresh rule expressions
UPDATE rb_comment_rules SET rule_expr_raw = rb_expand_macros(rule_expr_raw);
COMMIT;
