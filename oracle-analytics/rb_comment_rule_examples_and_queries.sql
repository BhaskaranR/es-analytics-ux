-- Sample rb_comment_rules INSERTs with expanded expressions (no macros)
INSERT INTO rb_comment_rules (id, topic, rule_expr_raw) VALUES (1, 'Client Satisfaction', '"client" NEAR "support" WITHIN 5 OR "customer" NEAR "support" WITHIN 5 OR "end user" NEAR "support" WITHIN 5');
INSERT INTO rb_comment_rules (id, topic, rule_expr_raw) VALUES (2, 'Internal Mobility', '"internal transfer" NEAR "opportunity" WITHIN 4 OR "from_within" NEAR "opportunity" WITHIN 4 OR "lateral move" NEAR "opportunity" WITHIN 4 OR "IJP" NEAR "opportunity" WITHIN 4');
INSERT INTO rb_comment_rules (id, topic, rule_expr_raw) VALUES (3, 'Career Growth', '"career" NEAR "growth" WITHIN 6 OR "promotion" NEAR "growth" WITHIN 6 OR "learning" NEAR "growth" WITHIN 6');
INSERT INTO rb_comment_rules (id, topic, rule_expr_raw) VALUES (4, 'Onboarding', '"onboarding" NEAR "helpful" WITHIN 3 OR "orientation" NEAR "helpful" WITHIN 3 OR "welcome process" NEAR "helpful" WITHIN 3');
INSERT INTO rb_comment_rules (id, topic, rule_expr_raw) VALUES (5, 'Team Culture', '"team" NEAR "issues" WITHIN 2 OR "collaboration" NEAR "issues" WITHIN 2 OR "peers" NEAR "issues" WITHIN 2 OR "coworkers" NEAR "issues" WITHIN 2');


-- Example SELECT queries using rule_expr_raw directly
SELECT * FROM rb_survey_comments
WHERE CONTAINS(comment_text, '"client" NEAR "support" WITHIN 5 OR "customer" NEAR "support" WITHIN 5 OR "end user" NEAR "support" WITHIN 5', 1) > 0;

SELECT * FROM rb_survey_comments
WHERE CONTAINS(comment_text, '"internal transfer" NEAR "opportunity" WITHIN 4 OR "from_within" NEAR "opportunity" WITHIN 4 OR "lateral move" NEAR "opportunity" WITHIN 4 OR "IJP" NEAR "opportunity" WITHIN 4', 1) > 0;

SELECT * FROM rb_survey_comments
WHERE CONTAINS(comment_text, '"career" NEAR "growth" WITHIN 6 OR "promotion" NEAR "growth" WITHIN 6 OR "learning" NEAR "growth" WITHIN 6', 1) > 0;

SELECT * FROM rb_survey_comments
WHERE CONTAINS(comment_text, '"onboarding" NEAR "helpful" WITHIN 3 OR "orientation" NEAR "helpful" WITHIN 3 OR "welcome process" NEAR "helpful" WITHIN 3', 1) > 0;

SELECT * FROM rb_survey_comments
WHERE CONTAINS(comment_text, '"team" NEAR "issues" WITHIN 2 OR "collaboration" NEAR "issues" WITHIN 2 OR "peers" NEAR "issues" WITHIN 2 OR "coworkers" NEAR "issues" WITHIN 2', 1) > 0;

