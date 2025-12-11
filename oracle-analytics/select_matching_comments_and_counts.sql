-- Matching comments per topic rule

-- Onboarding Mention
SELECT r.id AS rule_id, r.topic, c.id AS comment_id, c.comment_text
FROM rb_comment_rules r
JOIN rb_survey_comments c
  ON CONTAINS(c.comment_text, r.rule_expr_raw, 1) > 0
WHERE r.topic = 'Onboarding Mention';

-- Career Development Concern
SELECT r.id AS rule_id, r.topic, c.id AS comment_id, c.comment_text
FROM rb_comment_rules r
JOIN rb_survey_comments c
  ON CONTAINS(c.comment_text, r.rule_expr_raw, 1) > 0
WHERE r.topic = 'Career Development Concern';

-- Client Reference
SELECT r.id AS rule_id, r.topic, c.id AS comment_id, c.comment_text
FROM rb_comment_rules r
JOIN rb_survey_comments c
  ON CONTAINS(c.comment_text, r.rule_expr_raw, 1) > 0
WHERE r.topic = 'Client Reference';

-- Promotion Mention
SELECT r.id AS rule_id, r.topic, c.id AS comment_id, c.comment_text
FROM rb_comment_rules r
JOIN rb_survey_comments c
  ON CONTAINS(c.comment_text, r.rule_expr_raw, 1) > 0
WHERE r.topic = 'Promotion Mention';

-- Support Experience
SELECT r.id AS rule_id, r.topic, c.id AS comment_id, c.comment_text
FROM rb_comment_rules r
JOIN rb_survey_comments c
  ON CONTAINS(c.comment_text, r.rule_expr_raw, 1) > 0
WHERE r.topic = 'Support Experience';

-- Orientation Experience
SELECT r.id AS rule_id, r.topic, c.id AS comment_id, c.comment_text
FROM rb_comment_rules r
JOIN rb_survey_comments c
  ON CONTAINS(c.comment_text, r.rule_expr_raw, 1) > 0
WHERE r.topic = 'Orientation Experience';

-- Learning Opportunity
SELECT r.id AS rule_id, r.topic, c.id AS comment_id, c.comment_text
FROM rb_comment_rules r
JOIN rb_survey_comments c
  ON CONTAINS(c.comment_text, r.rule_expr_raw, 1) > 0
WHERE r.topic = 'Learning Opportunity';

-- Summary count per topic
SELECT r.topic, COUNT(*) AS match_count
FROM rb_comment_rules r
JOIN rb_survey_comments c
  ON CONTAINS(c.comment_text, r.rule_expr_raw, 1) > 0
GROUP BY r.topic;
