#!/bin/bash

# Bulk insert matched comments - Part 3 (Final)
# Deduplicated entries from lines 201-443
# Total: 85 unique documents (removed duplicates)

curl -X POST "localhost:9200/matched_comments/_bulk" -H 'Content-Type: application/x-ndjson' -d '
{"index":{}}
{"rule_id":"career_7","comment_text":"Mentorship and professional guidance are key for career development.","topic":"Career Development","description":"(bacghr_mentorship OR mentor OR guidance) NEAR (bacghr_career OR professional OR development) WITHIN 4 WORDS","score":0.85,"matched_terms":["mentorship","career"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Mentorship</mark> and professional <mark>guidance</mark> are key for <mark>career</mark> development.","timestamp":"2024-03-20T11:34:00Z"}
{"index":{}}
{"rule_id":"career_8","comment_text":"A clear career path should be defined for all employees.","topic":"Career Development","description":"\"career path\" NEAR (clear OR defined OR structured) WITHIN 5 WORDS","score":0.8,"matched_terms":["career path","clear"],"max_gaps":5,"ordered":false,"highlighted_text":"A <mark>clear</mark> <mark>career path</mark> should be defined for all employees.","timestamp":"2024-03-20T11:35:00Z"}
{"index":{}}
{"rule_id":"career_9","comment_text":"The training seminar provided new opportunities for advancement.","topic":"Career Development","description":"(training OR workshop OR seminar) NEAR bacghr_opportunity WITHIN 4 WORDS","score":0.8,"matched_terms":["training","opportunity"],"max_gaps":4,"ordered":false,"highlighted_text":"The <mark>training</mark> seminar provided new <mark>opportunities</mark> for advancement.","timestamp":"2024-03-20T11:36:00Z"}
{"index":{}}
{"rule_id":"career_10","comment_text":"Setting career goals is essential for long-term success.","topic":"Career Development","description":"(goal OR objective OR target) NEAR bacghr_career WITHIN 4 WORDS","score":0.8,"matched_terms":["goal","career"],"max_gaps":4,"ordered":false,"highlighted_text":"Setting <mark>career</mark> <mark>goals</mark> is essential for long-term success.","timestamp":"2024-03-20T11:37:00Z"}
{"index":{}}
{"rule_id":"client_4","comment_text":"The user received timely assistance from the support team.","topic":"Client Support","description":"user NEAR assistance WITHIN 4 WORDS","score":0.8,"matched_terms":["user","assistance"],"max_gaps":4,"ordered":false,"highlighted_text":"The <mark>user</mark> received timely <mark>assistance</mark> from the support team.","timestamp":"2024-03-20T11:38:00Z"}
{"index":{}}
{"rule_id":"client_5","comment_text":"End user support is available for all technical issues.","topic":"Client Support","description":"\"end user\" NEAR (support OR help OR assistance) WITHIN 5 WORDS","score":0.8,"matched_terms":["end user","support"],"max_gaps":5,"ordered":false,"highlighted_text":"<mark>End user</mark> <mark>support</mark> is available for all technical issues.","timestamp":"2024-03-20T11:39:00Z"}
{"index":{}}
{"rule_id":"client_6","comment_text":"The client reported an issue with the new software.","topic":"Client Support","description":"client NEAR issue WITHIN 4 WORDS","score":0.8,"matched_terms":["client","issue"],"max_gaps":4,"ordered":false,"highlighted_text":"The <mark>client</mark> reported an <mark>issue</mark> with the new software.","timestamp":"2024-03-20T11:40:00Z"}
{"index":{}}
{"rule_id":"client_7","comment_text":"Customer service is always ready to help.","topic":"Client Support","description":"customer NEAR service WITHIN 4 WORDS","score":0.8,"matched_terms":["customer","service"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Customer</mark> <mark>service</mark> is always ready to help.","timestamp":"2024-03-20T11:41:00Z"}
{"index":{}}
{"rule_id":"client_8","comment_text":"The client faced a problem with the product delivery.","topic":"Client Support","description":"client NEAR problem WITHIN 4 WORDS","score":0.8,"matched_terms":["client","problem"],"max_gaps":4,"ordered":false,"highlighted_text":"The <mark>client</mark> faced a <mark>problem</mark> with the product delivery.","timestamp":"2024-03-20T11:42:00Z"}
{"index":{}}
{"rule_id":"client_9","comment_text":"The user needed support for account setup.","topic":"Client Support","description":"user NEAR support WITHIN 4 WORDS","score":0.8,"matched_terms":["user","support"],"max_gaps":4,"ordered":false,"highlighted_text":"The <mark>user</mark> needed <mark>support</mark> for account setup.","timestamp":"2024-03-20T11:43:00Z"}
{"index":{}}
{"rule_id":"client_10","comment_text":"Customer support was helpful during the transition.","topic":"Client Support","description":"customer NEAR support WITHIN 5 WORDS","score":0.8,"matched_terms":["customer","support"],"max_gaps":5,"ordered":false,"highlighted_text":"<mark>Customer</mark> <mark>support</mark> was helpful during the transition.","timestamp":"2024-03-20T11:44:00Z"}
{"index":{}}
{"rule_id":"team_4","comment_text":"Team communication has improved project outcomes.","topic":"Team Collaboration","description":"team NEAR communication WITHIN 4 WORDS","score":0.8,"matched_terms":["team","communication"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Team</mark> <mark>communication</mark> has improved project outcomes.","timestamp":"2024-03-20T11:45:00Z"}
{"index":{}}
{"rule_id":"team_5","comment_text":"Cross functional teams and groups work well together.","topic":"Team Collaboration","description":"\"cross functional\" NEAR (team OR group) WITHIN 3 WORDS","score":0.8,"matched_terms":["cross functional","team"],"max_gaps":3,"ordered":false,"highlighted_text":"<mark>Cross functional</mark> <mark>teams</mark> and groups work well together.","timestamp":"2024-03-20T11:46:00Z"}
{"index":{}}
{"rule_id":"team_6","comment_text":"The team completed the project successfully.","topic":"Team Collaboration","description":"team NEAR project WITHIN 4 WORDS","score":0.8,"matched_terms":["team","project"],"max_gaps":4,"ordered":false,"highlighted_text":"The <mark>team</mark> completed the <mark>project</mark> successfully.","timestamp":"2024-03-20T11:47:00Z"}
{"index":{}}
{"rule_id":"team_7","comment_text":"Team success depends on collaboration and trust.","topic":"Team Collaboration","description":"team NEAR success WITHIN 4 WORDS","score":0.8,"matched_terms":["team","success"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Team</mark> <mark>success</mark> depends on collaboration and trust.","timestamp":"2024-03-20T11:48:00Z"}
{"index":{}}
{"rule_id":"team_8","comment_text":"Team performance has increased this quarter.","topic":"Team Collaboration","description":"team NEAR performance WITHIN 4 WORDS","score":0.8,"matched_terms":["team","performance"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Team</mark> <mark>performance</mark> has increased this quarter.","timestamp":"2024-03-20T11:49:00Z"}
{"index":{}}
{"rule_id":"team_9","comment_text":"Virtual team meetings are productive and efficient.","topic":"Team Collaboration","description":"virtual NEAR team WITHIN 4 WORDS","score":0.8,"matched_terms":["virtual","team"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Virtual</mark> <mark>team</mark> meetings are productive and efficient.","timestamp":"2024-03-20T11:50:00Z"}
{"index":{}}
{"rule_id":"team_10","comment_text":"Team innovation drives company growth.","topic":"Team Collaboration","description":"team NEAR innovation WITHIN 4 WORDS","score":0.8,"matched_terms":["team","innovation"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Team</mark> <mark>innovation</mark> drives company growth.","timestamp":"2024-03-20T11:51:00Z"}

# Comments that match ONLY specific rules (unique matches)
{"index":{}}
{"rule_id":"career_6","comment_text":"I need advancement opportunities in the engineering department.","topic":"Career Development","description":"bacghr_advancement NEAR bacghr_opportunity WITHIN 4 WORDS","score":0.9,"matched_terms":["advancement","opportunity"],"max_gaps":4,"ordered":false,"highlighted_text":"I need <mark>advancement</mark> <mark>opportunities</mark> in the engineering department.","timestamp":"2024-03-20T12:00:00Z"}
{"index":{}}
{"rule_id":"career_7","comment_text":"Mentorship programs are essential for professional development.","topic":"Career Development","description":"(bacghr_mentorship OR mentor OR guidance) NEAR (bacghr_career OR professional OR development) WITHIN 4 WORDS","score":0.9,"matched_terms":["mentorship","professional"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Mentorship</mark> programs are essential for <mark>professional</mark> development.","timestamp":"2024-03-20T12:01:00Z"}
{"index":{}}
{"rule_id":"career_8","comment_text":"A structured career path would help with planning.","topic":"Career Development","description":"\"career path\" NEAR (clear OR defined OR structured) WITHIN 5 WORDS","score":0.9,"matched_terms":["career path","structured"],"max_gaps":5,"ordered":false,"highlighted_text":"A <mark>structured</mark> <mark>career path</mark> would help with planning.","timestamp":"2024-03-20T12:02:00Z"}
{"index":{}}
{"rule_id":"career_9","comment_text":"The workshop provided new opportunities for skill development.","topic":"Career Development","description":"(training OR workshop OR seminar) NEAR bacghr_opportunity WITHIN 4 WORDS","score":0.9,"matched_terms":["workshop","opportunity"],"max_gaps":4,"ordered":false,"highlighted_text":"The <mark>workshop</mark> provided new <mark>opportunities</mark> for skill development.","timestamp":"2024-03-20T12:03:00Z"}
{"index":{}}
{"rule_id":"career_10","comment_text":"Setting career objectives is important for growth.","topic":"Career Development","description":"(goal OR objective OR target) NEAR bacghr_career WITHIN 4 WORDS","score":0.9,"matched_terms":["objective","career"],"max_gaps":4,"ordered":false,"highlighted_text":"Setting <mark>career</mark> <mark>objectives</mark> is important for growth.","timestamp":"2024-03-20T12:04:00Z"}
{"index":{}}
{"rule_id":"client_4","comment_text":"The user received excellent assistance with the new system.","topic":"Client Support","description":"user NEAR assistance WITHIN 4 WORDS","score":0.9,"matched_terms":["user","assistance"],"max_gaps":4,"ordered":false,"highlighted_text":"The <mark>user</mark> received excellent <mark>assistance</mark> with the new system.","timestamp":"2024-03-20T12:05:00Z"}
{"index":{}}
{"rule_id":"client_5","comment_text":"End user help is available 24/7.","topic":"Client Support","description":"\"end user\" NEAR (support OR help OR assistance) WITHIN 5 WORDS","score":0.9,"matched_terms":["end user","help"],"max_gaps":5,"ordered":false,"highlighted_text":"<mark>End user</mark> <mark>help</mark> is available 24/7.","timestamp":"2024-03-20T12:06:00Z"}
{"index":{}}
{"rule_id":"client_6","comment_text":"The client reported a critical issue with the platform.","topic":"Client Support","description":"client NEAR issue WITHIN 4 WORDS","score":0.9,"matched_terms":["client","issue"],"max_gaps":4,"ordered":false,"highlighted_text":"The <mark>client</mark> reported a critical <mark>issue</mark> with the platform.","timestamp":"2024-03-20T12:07:00Z"}
{"index":{}}
{"rule_id":"client_7","comment_text":"Customer service exceeded expectations.","topic":"Client Support","description":"customer NEAR service WITHIN 4 WORDS","score":0.9,"matched_terms":["customer","service"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Customer</mark> <mark>service</mark> exceeded expectations.","timestamp":"2024-03-20T12:08:00Z"}
{"index":{}}
{"rule_id":"client_8","comment_text":"The client faced a major problem with data migration.","topic":"Client Support","description":"client NEAR problem WITHIN 4 WORDS","score":0.9,"matched_terms":["client","problem"],"max_gaps":4,"ordered":false,"highlighted_text":"The <mark>client</mark> faced a major <mark>problem</mark> with data migration.","timestamp":"2024-03-20T12:09:00Z"}
{"index":{}}
{"rule_id":"client_9","comment_text":"The user needed immediate support for login issues.","topic":"Client Support","description":"user NEAR support WITHIN 4 WORDS","score":0.9,"matched_terms":["user","support"],"max_gaps":4,"ordered":false,"highlighted_text":"The <mark>user</mark> needed immediate <mark>support</mark> for login issues.","timestamp":"2024-03-20T12:10:00Z"}
{"index":{}}
{"rule_id":"client_10","comment_text":"Customer support resolved the billing issue quickly.","topic":"Client Support","description":"customer NEAR support WITHIN 5 WORDS","score":0.9,"matched_terms":["customer","support"],"max_gaps":5,"ordered":false,"highlighted_text":"<mark>Customer</mark> <mark>support</mark> resolved the billing issue quickly.","timestamp":"2024-03-20T12:11:00Z"}
{"index":{}}
{"rule_id":"team_4","comment_text":"Team communication improved significantly this quarter.","topic":"Team Collaboration","description":"team NEAR communication WITHIN 4 WORDS","score":0.9,"matched_terms":["team","communication"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Team</mark> <mark>communication</mark> improved significantly this quarter.","timestamp":"2024-03-20T12:12:00Z"}
{"index":{}}
{"rule_id":"team_5","comment_text":"Cross functional groups work efficiently together.","topic":"Team Collaboration","description":"\"cross functional\" NEAR (team OR group) WITHIN 3 WORDS","score":0.9,"matched_terms":["cross functional","group"],"max_gaps":3,"ordered":false,"highlighted_text":"<mark>Cross functional</mark> <mark>groups</mark> work efficiently together.","timestamp":"2024-03-20T12:13:00Z"}
{"index":{}}
{"rule_id":"team_6","comment_text":"The team delivered the project ahead of schedule.","topic":"Team Collaboration","description":"team NEAR project WITHIN 4 WORDS","score":0.9,"matched_terms":["team","project"],"max_gaps":4,"ordered":false,"highlighted_text":"The <mark>team</mark> delivered the <mark>project</mark> ahead of schedule.","timestamp":"2024-03-20T12:14:00Z"}
{"index":{}}
{"rule_id":"team_7","comment_text":"Team success metrics are improving steadily.","topic":"Team Collaboration","description":"team NEAR success WITHIN 4 WORDS","score":0.9,"matched_terms":["team","success"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Team</mark> <mark>success</mark> metrics are improving steadily.","timestamp":"2024-03-20T12:15:00Z"}
{"index":{}}
{"rule_id":"team_8","comment_text":"Team performance reviews are conducted quarterly.","topic":"Team Collaboration","description":"team NEAR performance WITHIN 4 WORDS","score":0.9,"matched_terms":["team","performance"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Team</mark> <mark>performance</mark> reviews are conducted quarterly.","timestamp":"2024-03-20T12:16:00Z"}
{"index":{}}
{"rule_id":"team_9","comment_text":"Virtual team collaboration tools are essential.","topic":"Team Collaboration","description":"virtual NEAR team WITHIN 4 WORDS","score":0.9,"matched_terms":["virtual","team"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Virtual</mark> <mark>team</mark> collaboration tools are essential.","timestamp":"2024-03-20T12:17:00Z"}
{"index":{}}
{"rule_id":"team_10","comment_text":"Team innovation workshops are highly productive.","topic":"Team Collaboration","description":"team NEAR innovation WITHIN 4 WORDS","score":0.9,"matched_terms":["team","innovation"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Team</mark> <mark>innovation</mark> workshops are highly productive.","timestamp":"2024-03-20T12:18:00Z"}

# Multi-rule matches (comments that match multiple rules)
{"index":{}}
{"rule_id":"career_1","comment_text":"Career growth and advancement opportunities are limited.","topic":"Career Development","description":"bacghr_career NEAR bacghr_opportunity WITHIN 5 WORDS","score":0.8,"matched_terms":["career","opportunity"],"max_gaps":5,"ordered":false,"highlighted_text":"<mark>Career</mark> growth and <mark>advancement</mark> opportunities are limited.","timestamp":"2024-03-20T12:19:00Z"}
{"index":{}}
{"rule_id":"career_6","comment_text":"Career growth and advancement opportunities are limited.","topic":"Career Development","description":"bacghr_advancement NEAR bacghr_opportunity WITHIN 4 WORDS","score":0.8,"matched_terms":["advancement","opportunity"],"max_gaps":4,"ordered":false,"highlighted_text":"Career growth and <mark>advancement</mark> <mark>opportunities</mark> are limited.","timestamp":"2024-03-20T12:19:00Z"}
{"index":{}}
{"rule_id":"client_1","comment_text":"Client support and user assistance are both excellent.","topic":"Client Support","description":"bacghr_client NEAR bacghr_support WITHIN 5 WORDS","score":0.8,"matched_terms":["client","support"],"max_gaps":5,"ordered":false,"highlighted_text":"<mark>Client</mark> <mark>support</mark> and user assistance are both excellent.","timestamp":"2024-03-20T12:20:00Z"}
{"index":{}}
{"rule_id":"client_4","comment_text":"Client support and user assistance are both excellent.","topic":"Client Support","description":"user NEAR assistance WITHIN 4 WORDS","score":0.8,"matched_terms":["user","assistance"],"max_gaps":4,"ordered":false,"highlighted_text":"Client support and <mark>user</mark> <mark>assistance</mark> are both excellent.","timestamp":"2024-03-20T12:20:00Z"}
{"index":{}}
{"rule_id":"team_1","comment_text":"Team collaboration and communication are top priorities.","topic":"Team Collaboration","description":"team NEAR collaboration WITHIN 4 WORDS","score":0.8,"matched_terms":["team","collaboration"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Team</mark> <mark>collaboration</mark> and communication are top priorities.","timestamp":"2024-03-20T12:21:00Z"}
{"index":{}}
{"rule_id":"team_4","comment_text":"Team collaboration and communication are top priorities.","topic":"Team Collaboration","description":"team NEAR communication WITHIN 4 WORDS","score":0.8,"matched_terms":["team","communication"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Team</mark> collaboration and <mark>communication</mark> are top priorities.","timestamp":"2024-03-20T12:21:00Z"}

# Additional multi-rule matches
{"index":{}}
{"rule_id":"career_1","comment_text":"Career opportunities and advancement prospects are excellent here.","topic":"Career Development","description":"bacghr_career NEAR bacghr_opportunity WITHIN 5 WORDS","score":0.9,"matched_terms":["career","opportunity"],"max_gaps":5,"ordered":false,"highlighted_text":"<mark>Career</mark> <mark>opportunities</mark> and advancement prospects are excellent here.","timestamp":"2024-03-20T12:22:00Z"}
{"index":{}}
{"rule_id":"career_6","comment_text":"Career opportunities and advancement prospects are excellent here.","topic":"Career Development","description":"bacghr_advancement NEAR bacghr_opportunity WITHIN 4 WORDS","score":0.9,"matched_terms":["advancement","opportunity"],"max_gaps":4,"ordered":false,"highlighted_text":"Career <mark>opportunities</mark> and <mark>advancement</mark> prospects are excellent here.","timestamp":"2024-03-20T12:22:00Z"}
{"index":{}}
{"rule_id":"career_2","comment_text":"Learning and training programs support career growth effectively.","topic":"Career Development","description":"bacghr_learning NEAR bacghr_career WITHIN 3 WORDS","score":0.9,"matched_terms":["learning","career"],"max_gaps":3,"ordered":false,"highlighted_text":"<mark>Learning</mark> and training programs support <mark>career</mark> growth effectively.","timestamp":"2024-03-20T12:23:00Z"}
{"index":{}}
{"rule_id":"career_5","comment_text":"Learning and training programs support career growth effectively.","topic":"Career Development","description":"skill NEAR development WITHIN 3 WORDS","score":0.9,"matched_terms":["skill","development"],"max_gaps":3,"ordered":false,"highlighted_text":"Learning and training programs support career growth and <mark>skill</mark> <mark>development</mark> effectively.","timestamp":"2024-03-20T12:23:00Z"}
{"index":{}}
{"rule_id":"career_3","comment_text":"Promotion opportunities and career advancement are clearly defined.","topic":"Career Development","description":"promotion NEAR career WITHIN 4 WORDS","score":0.9,"matched_terms":["promotion","career"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Promotion</mark> opportunities and <mark>career</mark> advancement are clearly defined.","timestamp":"2024-03-20T12:24:00Z"}
{"index":{}}
{"rule_id":"career_6","comment_text":"Promotion opportunities and career advancement are clearly defined.","topic":"Career Development","description":"bacghr_advancement NEAR bacghr_opportunity WITHIN 4 WORDS","score":0.9,"matched_terms":["advancement","opportunity"],"max_gaps":4,"ordered":false,"highlighted_text":"Promotion <mark>opportunities</mark> and career <mark>advancement</mark> are clearly defined.","timestamp":"2024-03-20T12:24:00Z"}
{"index":{}}
{"rule_id":"client_1","comment_text":"Client support and customer assistance are both outstanding.","topic":"Client Support","description":"bacghr_client NEAR bacghr_support WITHIN 5 WORDS","score":0.9,"matched_terms":["client","support"],"max_gaps":5,"ordered":false,"highlighted_text":"<mark>Client</mark> <mark>support</mark> and customer assistance are both outstanding.","timestamp":"2024-03-20T12:25:00Z"}
{"index":{}}
{"rule_id":"client_3","comment_text":"Client support and customer assistance are both outstanding.","topic":"Client Support","description":"customer NEAR help WITHIN 4 WORDS","score":0.9,"matched_terms":["customer","help"],"max_gaps":4,"ordered":false,"highlighted_text":"Client support and <mark>customer</mark> <mark>assistance</mark> are both outstanding.","timestamp":"2024-03-20T12:25:00Z"}
{"index":{}}
{"rule_id":"client_2","comment_text":"The client needs help and support with implementation.","topic":"Client Support","description":"client NEAR support WITHIN 5 WORDS","score":0.9,"matched_terms":["client","support"],"max_gaps":5,"ordered":false,"highlighted_text":"The <mark>client</mark> needs <mark>help</mark> and support with implementation.","timestamp":"2024-03-20T12:26:00Z"}
{"index":{}}
{"rule_id":"client_3","comment_text":"The client needs help and support with implementation.","topic":"Client Support","description":"customer NEAR help WITHIN 4 WORDS","score":0.9,"matched_terms":["customer","help"],"max_gaps":4,"ordered":false,"highlighted_text":"The client needs <mark>help</mark> and support with implementation.","timestamp":"2024-03-20T12:26:00Z"}
{"index":{}}
{"rule_id":"team_1","comment_text":"Team collaboration and help from colleagues is excellent.","topic":"Team Collaboration","description":"team NEAR collaboration WITHIN 4 WORDS","score":0.9,"matched_terms":["team","collaboration"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Team</mark> <mark>collaboration</mark> and help from colleagues is excellent.","timestamp":"2024-03-20T12:27:00Z"}
{"index":{}}
{"rule_id":"team_2","comment_text":"Team collaboration and help from colleagues is excellent.","topic":"Team Collaboration","description":"team NEAR help WITHIN 3 WORDS","score":0.9,"matched_terms":["team","help"],"max_gaps":3,"ordered":false,"highlighted_text":"<mark>Team</mark> collaboration and <mark>help</mark> from colleagues is excellent.","timestamp":"2024-03-20T12:27:00Z"}
{"index":{}}
{"rule_id":"team_3","comment_text":"Collaboration with other teams makes work more efficient.","topic":"Team Collaboration","description":"collaboration NEAR work WITHIN 4 WORDS","score":0.9,"matched_terms":["collaboration","work"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Collaboration</mark> with other teams makes <mark>work</mark> more efficient.","timestamp":"2024-03-20T12:28:00Z"}
{"index":{}}
{"rule_id":"team_1","comment_text":"Collaboration with other teams makes work more efficient.","topic":"Team Collaboration","description":"team NEAR collaboration WITHIN 4 WORDS","score":0.9,"matched_terms":["team","collaboration"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Team</mark> collaboration with other teams makes work more efficient.","timestamp":"2024-03-20T12:28:00Z"}

# Final unique matches
{"index":{}}
{"rule_id":"career_4","comment_text":"Lack of career development is concerning for retention.","topic":"Career Development","description":"lack NEAR bacghr_career WITHIN 3 WORDS","score":0.9,"matched_terms":["lack","career"],"max_gaps":3,"ordered":false,"highlighted_text":"<mark>Lack</mark> of <mark>career</mark> development is concerning for retention.","timestamp":"2024-03-20T12:29:00Z"}
{"index":{}}
{"rule_id":"career_7","comment_text":"Professional mentorship and guidance programs are valuable.","topic":"Career Development","description":"(bacghr_mentorship OR mentor OR guidance) NEAR (bacghr_career OR professional OR development) WITHIN 4 WORDS","score":0.9,"matched_terms":["mentorship","professional"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Professional</mark> <mark>mentorship</mark> and guidance programs are valuable.","timestamp":"2024-03-20T12:30:00Z"}
{"index":{}}
{"rule_id":"career_8","comment_text":"A defined career path with clear milestones is needed.","topic":"Career Development","description":"\"career path\" NEAR (clear OR defined OR structured) WITHIN 5 WORDS","score":0.9,"matched_terms":["career path","defined"],"max_gaps":5,"ordered":false,"highlighted_text":"A <mark>defined</mark> <mark>career path</mark> with clear milestones is needed.","timestamp":"2024-03-20T12:31:00Z"}
{"index":{}}
{"rule_id":"career_9","comment_text":"The seminar provided new opportunities for learning.","topic":"Career Development","description":"(training OR workshop OR seminar) NEAR bacghr_opportunity WITHIN 4 WORDS","score":0.9,"matched_terms":["seminar","opportunity"],"max_gaps":4,"ordered":false,"highlighted_text":"The <mark>seminar</mark> provided new <mark>opportunities</mark> for learning.","timestamp":"2024-03-20T12:32:00Z"}
{"index":{}}
{"rule_id":"career_10","comment_text":"Setting career targets is important for motivation.","topic":"Career Development","description":"(goal OR objective OR target) NEAR bacghr_career WITHIN 4 WORDS","score":0.9,"matched_terms":["target","career"],"max_gaps":4,"ordered":false,"highlighted_text":"Setting <mark>career</mark> <mark>targets</mark> is important for motivation.","timestamp":"2024-03-20T12:33:00Z"}
{"index":{}}
{"rule_id":"client_4","comment_text":"The user received comprehensive assistance with onboarding.","topic":"Client Support","description":"user NEAR assistance WITHIN 4 WORDS","score":0.9,"matched_terms":["user","assistance"],"max_gaps":4,"ordered":false,"highlighted_text":"The <mark>user</mark> received comprehensive <mark>assistance</mark> with onboarding.","timestamp":"2024-03-20T12:34:00Z"}
{"index":{}}
{"rule_id":"client_5","comment_text":"End user support is available through multiple channels.","topic":"Client Support","description":"\"end user\" NEAR (support OR help OR assistance) WITHIN 5 WORDS","score":0.9,"matched_terms":["end user","support"],"max_gaps":5,"ordered":false,"highlighted_text":"<mark>End user</mark> <mark>support</mark> is available through multiple channels.","timestamp":"2024-03-20T12:35:00Z"}
{"index":{}}
{"rule_id":"client_6","comment_text":"The client reported a technical issue with the system.","topic":"Client Support","description":"client NEAR issue WITHIN 4 WORDS","score":0.9,"matched_terms":["client","issue"],"max_gaps":4,"ordered":false,"highlighted_text":"The <mark>client</mark> reported a technical <mark>issue</mark> with the system.","timestamp":"2024-03-20T12:36:00Z"}
{"index":{}}
{"rule_id":"client_7","comment_text":"Customer service quality has improved significantly.","topic":"Client Support","description":"customer NEAR service WITHIN 4 WORDS","score":0.9,"matched_terms":["customer","service"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Customer</mark> <mark>service</mark> quality has improved significantly.","timestamp":"2024-03-20T12:37:00Z"}
{"index":{}}
{"rule_id":"client_8","comment_text":"The client faced a complex problem with integration.","topic":"Client Support","description":"client NEAR problem WITHIN 4 WORDS","score":0.9,"matched_terms":["client","problem"],"max_gaps":4,"ordered":false,"highlighted_text":"The <mark>client</mark> faced a complex <mark>problem</mark> with integration.","timestamp":"2024-03-20T12:38:00Z"}
{"index":{}}
{"rule_id":"client_9","comment_text":"The user needed urgent support for system access.","topic":"Client Support","description":"user NEAR support WITHIN 4 WORDS","score":0.9,"matched_terms":["user","support"],"max_gaps":4,"ordered":false,"highlighted_text":"The <mark>user</mark> needed urgent <mark>support</mark> for system access.","timestamp":"2024-03-20T12:39:00Z"}
{"index":{}}
{"rule_id":"client_10","comment_text":"Customer support handled the escalation efficiently.","topic":"Client Support","description":"customer NEAR support WITHIN 5 WORDS","score":0.9,"matched_terms":["customer","support"],"max_gaps":5,"ordered":false,"highlighted_text":"<mark>Customer</mark> <mark>support</mark> handled the escalation efficiently.","timestamp":"2024-03-20T12:40:00Z"}
{"index":{}}
{"rule_id":"team_4","comment_text":"Team communication channels are well organized.","topic":"Team Collaboration","description":"team NEAR communication WITHIN 4 WORDS","score":0.9,"matched_terms":["team","communication"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Team</mark> <mark>communication</mark> channels are well organized.","timestamp":"2024-03-20T12:41:00Z"}
{"index":{}}
{"rule_id":"team_5","comment_text":"Cross functional teams collaborate effectively.","topic":"Team Collaboration","description":"\"cross functional\" NEAR (team OR group) WITHIN 3 WORDS","score":0.9,"matched_terms":["cross functional","team"],"max_gaps":3,"ordered":false,"highlighted_text":"<mark>Cross functional</mark> <mark>teams</mark> collaborate effectively.","timestamp":"2024-03-20T12:42:00Z"}
{"index":{}}
{"rule_id":"team_6","comment_text":"The team completed the project successfully on time.","topic":"Team Collaboration","description":"team NEAR project WITHIN 4 WORDS","score":0.9,"matched_terms":["team","project"],"max_gaps":4,"ordered":false,"highlighted_text":"The <mark>team</mark> completed the <mark>project</mark> successfully on time.","timestamp":"2024-03-20T12:43:00Z"}
{"index":{}}
{"rule_id":"team_7","comment_text":"Team success depends on effective collaboration.","topic":"Team Collaboration","description":"team NEAR success WITHIN 4 WORDS","score":0.9,"matched_terms":["team","success"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Team</mark> <mark>success</mark> depends on effective collaboration.","timestamp":"2024-03-20T12:44:00Z"}
{"index":{}}
{"rule_id":"team_8","comment_text":"Team performance metrics are tracked regularly.","topic":"Team Collaboration","description":"team NEAR performance WITHIN 4 WORDS","score":0.9,"matched_terms":["team","performance"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Team</mark> <mark>performance</mark> metrics are tracked regularly.","timestamp":"2024-03-20T12:45:00Z"}
{"index":{}}
{"rule_id":"team_9","comment_text":"Virtual team meetings are well structured.","topic":"Team Collaboration","description":"virtual NEAR team WITHIN 4 WORDS","score":0.9,"matched_terms":["virtual","team"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Virtual</mark> <mark>team</mark> meetings are well structured.","timestamp":"2024-03-20T12:46:00Z"}
{"index":{}}
{"rule_id":"team_10","comment_text":"Team innovation processes are well documented.","topic":"Team Collaboration","description":"team NEAR innovation WITHIN 4 WORDS","score":0.9,"matched_terms":["team","innovation"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Team</mark> <mark>innovation</mark> processes are well documented.","timestamp":"2024-03-20T12:47:00Z"}

# Final unique entries from the end of the file
{"index":{}}
{"rule_id":"career_4","comment_text":"Lack of career recognition is disappointing.","topic":"Career Development","description":"lack NEAR bacghr_career WITHIN 3 WORDS","score":0.9,"matched_terms":["lack","bacghr_career"],"max_gaps":3,"ordered":false,"highlighted_text":"<mark>Lack</mark> of <mark>career</mark> recognition is disappointing.","timestamp":"2024-03-20T11:25:00Z"}
{"index":{}}
{"rule_id":"career_5","comment_text":"Communication skill development is essential.","topic":"Career Development","description":"skill NEAR development WITHIN 3 WORDS","score":0.9,"matched_terms":["skill","development"],"max_gaps":3,"ordered":false,"highlighted_text":"Communication <mark>skill</mark> <mark>development</mark> is essential.","timestamp":"2024-03-20T11:26:00Z"}
{"index":{}}
{"rule_id":"client_1","comment_text":"Client support training is comprehensive.","topic":"Client Support","description":"bacghr_client NEAR bacghr_support WITHIN 5 WORDS","score":0.85,"matched_terms":["bacghr_client","bacghr_support"],"max_gaps":5,"ordered":false,"highlighted_text":"<mark>Client</mark> <mark>support</mark> training is comprehensive.","timestamp":"2024-03-20T11:27:00Z"}
{"index":{}}
{"rule_id":"client_2","comment_text":"The client needs technical help with integration.","topic":"Client Support","description":"client NEAR support WITHIN 5 WORDS","score":0.85,"matched_terms":["client","help"],"max_gaps":5,"ordered":false,"highlighted_text":"The <mark>client</mark> needs technical <mark>help</mark> with integration.","timestamp":"2024-03-20T11:28:00Z"}
{"index":{}}
{"rule_id":"client_3","comment_text":"Customer help system is well-designed.","topic":"Client Support","description":"customer NEAR help WITHIN 4 WORDS","score":0.8,"matched_terms":["customer","help"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Customer</mark> <mark>help</mark> system is well-designed.","timestamp":"2024-03-20T11:29:00Z"}
{"index":{}}
{"rule_id":"team_1","comment_text":"Diverse team collaboration brings innovation.","topic":"Team Collaboration","description":"team NEAR collaboration WITHIN 4 WORDS","score":0.85,"matched_terms":["team","collaboration"],"max_gaps":4,"ordered":false,"highlighted_text":"Diverse <mark>team</mark> <mark>collaboration</mark> brings innovation.","timestamp":"2024-03-20T11:30:00Z"}
{"index":{}}
{"rule_id":"team_2","comment_text":"My team helped me develop new skills.","topic":"Team Collaboration","description":"team NEAR help WITHIN 3 WORDS","score":0.9,"matched_terms":["team","help"],"max_gaps":3,"ordered":false,"highlighted_text":"My <mark>team</mark> <mark>helped</mark> me develop new skills.","timestamp":"2024-03-20T11:31:00Z"}
{"index":{}}
{"rule_id":"team_3","comment_text":"Effective collaboration optimizes work efficiency.","topic":"Team Collaboration","description":"collaboration NEAR work WITHIN 4 WORDS","score":0.85,"matched_terms":["collaboration","work"],"max_gaps":4,"ordered":false,"highlighted_text":"Effective <mark>collaboration</mark> optimizes <mark>work</mark> efficiency.","timestamp":"2024-03-20T11:32:00Z"}
'