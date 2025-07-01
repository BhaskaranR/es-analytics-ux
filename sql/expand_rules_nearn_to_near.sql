-- Expanded rules for NEARn into plain NEAR logic
UPDATE rb_comment_rules SET rule_expr_raw = '"career" NEAR5 "growth" OR "promotion" NEAR5 "growth" OR "learning" NEAR5 "growth"' WHERE id = 1;
UPDATE rb_comment_rules SET rule_expr_raw = '"internal transfer" NEAR4 "opportunity" OR "from_within" NEAR4 "opportunity" OR "lateral move" NEAR4 "opportunity" OR "IJP" NEAR4 "opportunity"' WHERE id = 2;
UPDATE rb_comment_rules SET rule_expr_raw = '"client" NEAR "support" OR "customer" NEAR "support" OR "end user" NEAR "support"' WHERE id = 3;
UPDATE rb_comment_rules SET rule_expr_raw = '"support" NEAR3 "helpful" OR "assistance" NEAR3 "helpful" OR "HR help" NEAR3 "helpful" OR "guidance" NEAR3 "helpful"' WHERE id = 4;
UPDATE rb_comment_rules SET rule_expr_raw = '"team" NEAR2 "issues" OR "collaboration" NEAR2 "issues" OR "peers" NEAR2 "issues" OR "coworkers" NEAR2 "issues"' WHERE id = 5;
UPDATE rb_comment_rules SET rule_expr_raw = '"onboarding" NEAR "orientation" OR "orientation" NEAR "orientation" OR "welcome process" NEAR "orientation"' WHERE id = 6;
