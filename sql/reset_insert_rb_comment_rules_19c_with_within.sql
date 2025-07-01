-- Delete existing rules
DELETE FROM rb_comment_rules;

-- Insert new Oracle 19c-safe rules with NEAR and WITHIN
INSERT INTO rb_comment_rules (id, topic, rule_expr_raw) VALUES (1, 'Client Satisfaction', '"client" NEAR "support" OR "customer" NEAR "support" OR "end user" NEAR "support"');
INSERT INTO rb_comment_rules (id, topic, rule_expr_raw) VALUES (2, 'Internal Mobility', '"internal transfer" NEAR "opportunity" OR "from_within" NEAR "opportunity" OR "lateral move" NEAR "opportunity" OR "IJP" NEAR "opportunity"');
INSERT INTO rb_comment_rules (id, topic, rule_expr_raw) VALUES (3, 'Career Growth', '"career" NEAR "growth" OR "promotion" NEAR "growth" OR "learning" NEAR "growth"');
INSERT INTO rb_comment_rules (id, topic, rule_expr_raw) VALUES (4, 'Onboarding', '"onboarding" NEAR "helpful" OR "orientation" NEAR "helpful" OR "welcome process" NEAR "helpful"');
INSERT INTO rb_comment_rules (id, topic, rule_expr_raw) VALUES (5, 'Team Culture', '"team" NEAR "issues" OR "collaboration" NEAR "issues" OR "peers" NEAR "issues" OR "coworkers" NEAR "issues"');
INSERT INTO rb_comment_rules (id, topic, rule_expr_raw) VALUES (6, 'Onboarding Mention', '"onboarding"');
INSERT INTO rb_comment_rules (id, topic, rule_expr_raw) VALUES (7, 'Career Development Concern', '"career" NEAR "development"');
INSERT INTO rb_comment_rules (id, topic, rule_expr_raw) VALUES (8, 'Client Reference', '"client"');
INSERT INTO rb_comment_rules (id, topic, rule_expr_raw) VALUES (9, 'Promotion Mention', '"promotion" NEAR "opportunity"');
INSERT INTO rb_comment_rules (id, topic, rule_expr_raw) VALUES (10, 'Support Experience', '"support" NEAR "team"');
INSERT INTO rb_comment_rules (id, topic, rule_expr_raw) VALUES (11, 'Orientation Experience', '"orientation"');
INSERT INTO rb_comment_rules (id, topic, rule_expr_raw) VALUES (12, 'Learning Opportunity', '"learning" NEAR "growth"');

COMMIT;


DROP INDEX rb_comment_text_idx;


BEGIN
  CTX_DDL.CREATE_SECTION_GROUP('rb_comment_sec_group', 'BASIC_SECTION_GROUP');
  CTX_DDL.ADD_FIELD_SECTION('rb_comment_sec_group', 'COMMENT', 'comment_text');
END;
