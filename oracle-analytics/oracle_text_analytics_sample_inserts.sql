-- Sample survey comments
INSERT INTO survey_comments (respondent_id, comment_text) VALUES (101, 'I am looking for an internal transfer opportunity in the client support team.');
INSERT INTO survey_comments (respondent_id, comment_text) VALUES (102, 'The onboarding experience was very helpful, and my team has been great.');
INSERT INTO survey_comments (respondent_id, comment_text) VALUES (103, 'I feel the career growth opportunities are lacking in this branch.');
INSERT INTO survey_comments (respondent_id, comment_text) VALUES (104, 'Client communication and support could be better.');
INSERT INTO survey_comments (respondent_id, comment_text) VALUES (105, 'I appreciate the support from HR during my internal move.');


-- Word group definitions (macros)
INSERT INTO word_groups (group_name, words) VALUES ('#bacghr_internalmove', '"from_within" OR "IJP" OR "lateral" OR "internal" OR "transfer"');
INSERT INTO word_groups (group_name, words) VALUES ('#bacghr_client', '"client" OR "customer" OR "user"');
INSERT INTO word_groups (group_name, words) VALUES ('#bacghr_branch', '"branch" OR "office" OR "location"');
INSERT INTO word_groups (group_name, words) VALUES ('#bacghr_career', '"career" OR "promotion" OR "growth" OR "development"');


-- Rules using macro groups
INSERT INTO comment_rules (topic, rule_expr_raw, exclude_expr_raw) 
VALUES ('Internal Mobility', '#bacghr_internalmove NEAR opportunity WITHIN 5', NULL);

INSERT INTO comment_rules (topic, rule_expr_raw, exclude_expr_raw) 
VALUES ('Client Feedback', '#bacghr_client NEAR support WITHIN 4', 'attorney OR #bacghr_branch');

INSERT INTO comment_rules (topic, rule_expr_raw, exclude_expr_raw) 
VALUES ('Career Growth Concerns', '#bacghr_career NEAR lacking WITHIN 5', NULL);

INSERT INTO comment_rules (topic, rule_expr_raw, exclude_expr_raw) 
VALUES ('Onboarding Experience', 'onboarding NEAR experience WITHIN 3', NULL);