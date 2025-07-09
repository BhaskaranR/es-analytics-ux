#!/bin/bash

# Bulk insert all matched comments for demo purposes
# This consolidates all individual POST commands into a single bulk operation
# Total: 85 documents (65 original + 20 additional)

curl -X POST "localhost:9200/matched_comments/_bulk" -H 'Content-Type: application/x-ndjson' -d '
{"index":{}}
{"rule_id":"career_1","comment_text":"I want more career opportunities for growth and advancement.","topic":"Career Development","description":"bacghr_career NEAR bacghr_opportunity WITHIN 5 WORDS","score":0.8,"matched_terms":["bacghr_career","bacghr_opportunity"],"max_gaps":5,"ordered":false,"highlighted_text":"I want more <mark>career</mark> <mark>opportunities</mark> for growth and advancement.","timestamp":"2024-03-20T10:00:00Z"}
{"index":{}}
{"rule_id":"career_2","comment_text":"I want more career opportunities for growth and advancement.","topic":"Career Development","description":"bacghr_learning NEAR bacghr_career WITHIN 3 WORDS","score":0.6,"matched_terms":["bacghr_learning","bacghr_career"],"max_gaps":3,"ordered":false,"highlighted_text":"I want more <mark>career</mark> opportunities for growth and advancement.","timestamp":"2024-03-20T10:00:00Z"}
{"index":{}}
{"rule_id":"client_1","comment_text":"I received excellent support from the customer service team.","topic":"Client Support","description":"bacghr_client NEAR bacghr_support WITHIN 5 WORDS","score":0.8,"matched_terms":["bacghr_client","bacghr_support"],"max_gaps":5,"ordered":false,"highlighted_text":"I received excellent <mark>support</mark> from the <mark>customer</mark> service team.","timestamp":"2024-03-20T10:00:00Z"}
{"index":{}}
{"rule_id":"client_2","comment_text":"I received excellent support from the customer service team.","topic":"Client Support","description":"client NEAR support WITHIN 5 WORDS","score":0.6,"matched_terms":["client","support"],"max_gaps":5,"ordered":false,"highlighted_text":"I received excellent <mark>support</mark> from the customer service team.","timestamp":"2024-03-20T10:00:00Z"}
{"index":{}}
{"rule_id":"career_2","comment_text":"The training session helped me understand the new tools better.","topic":"Career Development","description":"bacghr_learning NEAR bacghr_career WITHIN 3 WORDS","score":0.9,"matched_terms":["bacghr_learning","bacghr_career"],"max_gaps":3,"ordered":false,"highlighted_text":"The <mark>training</mark> session helped me understand the new tools better.","timestamp":"2024-03-20T10:01:00Z"}
{"index":{}}
{"rule_id":"team_1","comment_text":"Team collaboration and communication have been excellent lately.","topic":"Team Collaboration","description":"team NEAR collaboration WITHIN 4 WORDS","score":0.85,"matched_terms":["team","collaboration"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Team</mark> <mark>collaboration</mark> and communication have been excellent lately.","timestamp":"2024-03-20T10:02:00Z"}
{"index":{}}
{"rule_id":"team_2","comment_text":"Team collaboration and communication have been excellent lately.","topic":"Team Collaboration","description":"team NEAR help WITHIN 3 WORDS","score":0.7,"matched_terms":["team","help"],"max_gaps":3,"ordered":false,"highlighted_text":"<mark>Team</mark> collaboration and communication have been excellent lately.","timestamp":"2024-03-20T10:02:00Z"}
{"index":{}}
{"rule_id":"career_2","comment_text":"Onboarding process was smooth and orientation was helpful.","topic":"Career Development","description":"bacghr_learning NEAR bacghr_career WITHIN 3 WORDS","score":0.9,"matched_terms":["bacghr_learning","bacghr_career"],"max_gaps":3,"ordered":false,"highlighted_text":"Onboarding process was smooth and <mark>orientation</mark> was helpful.","timestamp":"2024-03-20T10:03:00Z"}
{"index":{}}
{"rule_id":"career_4","comment_text":"Career growth seems stagnant without promotion opportunities.","topic":"Career Development","description":"lack NEAR bacghr_career WITHIN 3 WORDS","score":0.95,"matched_terms":["lack","bacghr_career"],"max_gaps":3,"ordered":false,"highlighted_text":"<mark>Career</mark> growth seems stagnant without <mark>promotion</mark> opportunities.","timestamp":"2024-03-20T10:04:00Z"}
{"index":{}}
{"rule_id":"career_3","comment_text":"Career growth seems stagnant without promotion opportunities.","topic":"Career Development","description":"promotion NEAR career WITHIN 4 WORDS","score":0.8,"matched_terms":["promotion","career"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Career</mark> growth seems stagnant without <mark>promotion</mark> opportunities.","timestamp":"2024-03-20T10:04:00Z"}
{"index":{}}
{"rule_id":"career_1","comment_text":"Internal transfers offer great opportunities for career development.","topic":"Career Development","description":"bacghr_career NEAR bacghr_opportunity WITHIN 5 WORDS","score":0.85,"matched_terms":["bacghr_career","bacghr_opportunity"],"max_gaps":5,"ordered":false,"highlighted_text":"<mark>Internal</mark> transfers offer great <mark>opportunities</mark> for career development.","timestamp":"2024-03-20T10:05:00Z"}
{"index":{}}
{"rule_id":"career_4","comment_text":"Internal transfers offer great opportunities for career development.","topic":"Career Development","description":"lack NEAR bacghr_career WITHIN 3 WORDS","score":0.7,"matched_terms":["lack","bacghr_career"],"max_gaps":3,"ordered":false,"highlighted_text":"Internal transfers offer great opportunities for <mark>career</mark> development.","timestamp":"2024-03-20T10:05:00Z"}
{"index":{}}
{"rule_id":"career_2","comment_text":"The new learning program supports employee growth and skill-building.","topic":"Career Development","description":"bacghr_learning NEAR bacghr_career WITHIN 3 WORDS","score":0.9,"matched_terms":["bacghr_learning","bacghr_career"],"max_gaps":3,"ordered":false,"highlighted_text":"The new <mark>learning</mark> program supports employee <mark>growth</mark> and skill-building.","timestamp":"2024-03-20T10:06:00Z"}
{"index":{}}
{"rule_id":"career_2","comment_text":"The new learning program supports employee growth and skill-building.","topic":"Career Development","description":"bacghr_learning NEAR bacghr_career WITHIN 3 WORDS","score":0.75,"matched_terms":["bacghr_learning","bacghr_career"],"max_gaps":3,"ordered":false,"highlighted_text":"The new <mark>learning</mark> <mark>growth</mark> program supports employee skill-building.","timestamp":"2024-03-20T10:06:00Z"}
{"index":{}}
{"rule_id":"client_1","comment_text":"Our client was satisfied with the prompt assistance provided.","topic":"Client Support","description":"bacghr_client NEAR bacghr_support WITHIN 5 WORDS","score":0.85,"matched_terms":["client","support"],"max_gaps":5,"ordered":false,"highlighted_text":"Our <mark>client</mark> was satisfied with the prompt <mark>assistance</mark> provided.","timestamp":"2024-03-20T10:07:00Z"}
{"index":{}}
{"rule_id":"client_2","comment_text":"Our client was satisfied with the prompt assistance provided.","topic":"Client Support","description":"client NEAR support WITHIN 5 WORDS","score":0.7,"matched_terms":["client","support"],"max_gaps":5,"ordered":false,"highlighted_text":"Our <mark>client</mark> was satisfied with the prompt assistance provided.","timestamp":"2024-03-20T10:07:00Z"}
{"index":{}}
{"rule_id":"career_2","comment_text":"Orientation experience could be improved to reduce confusion.","topic":"Career Development","description":"bacghr_learning NEAR bacghr_career WITHIN 3 WORDS","score":0.95,"matched_terms":["bacghr_learning","bacghr_career"],"max_gaps":3,"ordered":false,"highlighted_text":"<mark>Orientation</mark> <mark>experience</mark> could be improved to reduce confusion.","timestamp":"2024-03-20T10:08:00Z"}
{"index":{}}
{"rule_id":"career_1","comment_text":"IJP offers a good internal opportunity for advancement.","topic":"Career Development","description":"bacghr_career NEAR bacghr_opportunity WITHIN 5 WORDS","score":0.9,"matched_terms":["bacghr_career","bacghr_opportunity"],"max_gaps":5,"ordered":false,"highlighted_text":"IJP offers a good <mark>internal</mark> <mark>opportunity</mark> for advancement.","timestamp":"2024-03-20T10:09:00Z"}
{"index":{}}
{"rule_id":"career_1","comment_text":"IJP offers a good internal opportunity for advancement.","topic":"Career Development","description":"bacghr_career NEAR bacghr_opportunity WITHIN 5 WORDS","score":0.8,"matched_terms":["bacghr_career","bacghr_opportunity"],"max_gaps":5,"ordered":false,"highlighted_text":"IJP offers a good <mark>internal</mark> opportunity for advancement.","timestamp":"2024-03-20T10:09:00Z"}
{"index":{}}
{"rule_id":"career_1","comment_text":"I want more career opportunities for growth and advancement.","topic":"Career Development","description":"bacghr_career NEAR bacghr_opportunity WITHIN 5 WORDS","score":0.8,"matched_terms":["bacghr_career","bacghr_opportunity"],"max_gaps":5,"ordered":false,"highlighted_text":"I want more <mark>career</mark> <mark>opportunities</mark> for growth and advancement.","timestamp":"2024-03-20T10:10:00Z"}
{"index":{}}
{"rule_id":"career_2","comment_text":"Learning is important for my career development and growth.","topic":"Career Development","description":"bacghr_learning NEAR bacghr_career WITHIN 3 WORDS","score":0.8,"matched_terms":["bacghr_learning","bacghr_career"],"max_gaps":3,"ordered":false,"highlighted_text":"<mark>Learning</mark> is important for my <mark>career</mark> development and growth.","timestamp":"2024-03-20T10:11:00Z"}
{"index":{}}
{"rule_id":"career_3","comment_text":"I want promotion and advancement opportunities in my role.","topic":"Career Development","description":"promotion NEAR career WITHIN 4 WORDS","score":0.8,"matched_terms":["promotion","career"],"max_gaps":4,"ordered":false,"highlighted_text":"I want <mark>promotion</mark> and <mark>advancement</mark> opportunities in my role.","timestamp":"2024-03-20T10:12:00Z"}
{"index":{}}
{"rule_id":"career_4","comment_text":"I need a clear career path to understand my future direction.","topic":"Career Development","description":"lack NEAR bacghr_career WITHIN 3 WORDS","score":0.8,"matched_terms":["lack","bacghr_career"],"max_gaps":3,"ordered":false,"highlighted_text":"I need a <mark>clear</mark> <mark>career path</mark> to understand my future direction.","timestamp":"2024-03-20T10:13:00Z"}
{"index":{}}
{"rule_id":"career_5","comment_text":"I need mentorship for my career development and guidance.","topic":"Career Development","description":"skill NEAR development WITHIN 3 WORDS","score":0.8,"matched_terms":["skill","development"],"max_gaps":3,"ordered":false,"highlighted_text":"I need <mark>mentorship</mark> for my <mark>career</mark> development and guidance.","timestamp":"2024-03-20T10:14:00Z"}
{"index":{}}
{"rule_id":"client_1","comment_text":"Client support and career development are both important to me.","topic":"Client Support","description":"bacghr_client NEAR bacghr_support WITHIN 5 WORDS","score":0.8,"matched_terms":["bacghr_client","bacghr_support"],"max_gaps":5,"ordered":false,"highlighted_text":"<mark>Client</mark> <mark>support</mark> and career development are both important to me.","timestamp":"2024-03-20T10:25:00Z"}
{"index":{}}
{"rule_id":"career_2","comment_text":"Client support and career development are both important to me.","topic":"Career Development","description":"bacghr_learning NEAR bacghr_career WITHIN 3 WORDS","score":0.8,"matched_terms":["bacghr_learning","bacghr_career"],"max_gaps":3,"ordered":false,"highlighted_text":"Client <mark>support</mark> and <mark>career</mark> development are both important to me.","timestamp":"2024-03-20T10:25:00Z"}
{"index":{}}
{"rule_id":"team_1","comment_text":"Team collaboration helps with career growth and development.","topic":"Team Collaboration","description":"team NEAR collaboration WITHIN 4 WORDS","score":0.8,"matched_terms":["team","collaboration"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Team</mark> <mark>collaboration</mark> helps with career growth and development.","timestamp":"2024-03-20T10:26:00Z"}
{"index":{}}
{"rule_id":"career_1","comment_text":"Team collaboration helps with career growth and development.","topic":"Career Development","description":"bacghr_career NEAR bacghr_opportunity WITHIN 5 WORDS","score":0.8,"matched_terms":["bacghr_career","bacghr_opportunity"],"max_gaps":5,"ordered":false,"highlighted_text":"Team collaboration helps with <mark>career</mark> <mark>growth</mark> and development.","timestamp":"2024-03-20T10:26:00Z"}
{"index":{}}
{"rule_id":"career_1","comment_text":"I am looking for career opportunities in the marketing department.","topic":"Career Development","description":"bacghr_career NEAR bacghr_opportunity WITHIN 5 WORDS","score":0.85,"matched_terms":["bacghr_career","bacghr_opportunity"],"max_gaps":5,"ordered":false,"highlighted_text":"I am looking for <mark>career</mark> <mark>opportunities</mark> in the marketing department.","timestamp":"2024-03-20T10:27:00Z"}
{"index":{}}
{"rule_id":"career_2","comment_text":"Training programs are essential for career advancement.","topic":"Career Development","description":"bacghr_learning NEAR bacghr_career WITHIN 3 WORDS","score":0.9,"matched_terms":["bacghr_learning","bacghr_career"],"max_gaps":3,"ordered":false,"highlighted_text":"<mark>Training</mark> programs are essential for <mark>career</mark> advancement.","timestamp":"2024-03-20T10:28:00Z"}
{"index":{}}
{"rule_id":"career_3","comment_text":"I want a promotion to senior developer position.","topic":"Career Development","description":"promotion NEAR career WITHIN 4 WORDS","score":0.95,"matched_terms":["promotion","career"],"max_gaps":4,"ordered":false,"highlighted_text":"I want a <mark>promotion</mark> to senior developer position.","timestamp":"2024-03-20T10:29:00Z"}
{"index":{}}
{"rule_id":"career_4","comment_text":"There is a lack of career growth in this team.","topic":"Career Development","description":"lack NEAR bacghr_career WITHIN 3 WORDS","score":0.9,"matched_terms":["lack","bacghr_career"],"max_gaps":3,"ordered":false,"highlighted_text":"There is a <mark>lack</mark> of <mark>career</mark> growth in this team.","timestamp":"2024-03-20T10:30:00Z"}
{"index":{}}
{"rule_id":"career_5","comment_text":"I need skill development for my current role.","topic":"Career Development","description":"skill NEAR development WITHIN 3 WORDS","score":0.85,"matched_terms":["skill","development"],"max_gaps":3,"ordered":false,"highlighted_text":"I need <mark>skill</mark> <mark>development</mark> for my current role.","timestamp":"2024-03-20T10:31:00Z"}
{"index":{}}
{"rule_id":"client_1","comment_text":"Our client needs better support from the technical team.","topic":"Client Support","description":"bacghr_client NEAR bacghr_support WITHIN 5 WORDS","score":0.9,"matched_terms":["bacghr_client","bacghr_support"],"max_gaps":5,"ordered":false,"highlighted_text":"Our <mark>client</mark> needs better <mark>support</mark> from the technical team.","timestamp":"2024-03-20T10:32:00Z"}
{"index":{}}
{"rule_id":"client_2","comment_text":"The client requested additional help with the project.","topic":"Client Support","description":"client NEAR support WITHIN 5 WORDS","score":0.8,"matched_terms":["client","help"],"max_gaps":5,"ordered":false,"highlighted_text":"The <mark>client</mark> requested additional <mark>help</mark> with the project.","timestamp":"2024-03-20T10:33:00Z"}
{"index":{}}
{"rule_id":"client_3","comment_text":"Customer service team provides excellent assistance.","topic":"Client Support","description":"customer NEAR help WITHIN 4 WORDS","score":0.85,"matched_terms":["customer","help"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Customer</mark> service team provides excellent <mark>assistance</mark>.","timestamp":"2024-03-20T10:34:00Z"}
{"index":{}}
{"rule_id":"team_1","comment_text":"Our team collaboration has improved significantly.","topic":"Team Collaboration","description":"team NEAR collaboration WITHIN 4 WORDS","score":0.9,"matched_terms":["team","collaboration"],"max_gaps":4,"ordered":false,"highlighted_text":"Our <mark>team</mark> <mark>collaboration</mark> has improved significantly.","timestamp":"2024-03-20T10:35:00Z"}
{"index":{}}
{"rule_id":"team_2","comment_text":"The team helped me complete the project on time.","topic":"Team Collaboration","description":"team NEAR help WITHIN 3 WORDS","score":0.85,"matched_terms":["team","help"],"max_gaps":3,"ordered":false,"highlighted_text":"The <mark>team</mark> <mark>helped</mark> me complete the project on time.","timestamp":"2024-03-20T10:36:00Z"}
{"index":{}}
{"rule_id":"team_3","comment_text":"Collaboration with other departments makes work easier.","topic":"Team Collaboration","description":"collaboration NEAR work WITHIN 4 WORDS","score":0.8,"matched_terms":["collaboration","work"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Collaboration</mark> with other departments makes <mark>work</mark> easier.","timestamp":"2024-03-20T10:37:00Z"}
{"index":{}}
{"rule_id":"career_1","comment_text":"I see great career opportunities in the new division.","topic":"Career Development","description":"bacghr_career NEAR bacghr_opportunity WITHIN 5 WORDS","score":0.9,"matched_terms":["bacghr_career","bacghr_opportunity"],"max_gaps":5,"ordered":false,"highlighted_text":"I see great <mark>career</mark> <mark>opportunities</mark> in the new division.","timestamp":"2024-03-20T10:38:00Z"}
{"index":{}}
{"rule_id":"career_2","comment_text":"Learning new technologies will advance my career.","topic":"Career Development","description":"bacghr_learning NEAR bacghr_career WITHIN 3 WORDS","score":0.85,"matched_terms":["bacghr_learning","bacghr_career"],"max_gaps":3,"ordered":false,"highlighted_text":"<mark>Learning</mark> new technologies will advance my <mark>career</mark>.","timestamp":"2024-03-20T10:39:00Z"}
{"index":{}}
{"rule_id":"career_3","comment_text":"Promotion opportunities should be more transparent.","topic":"Career Development","description":"promotion NEAR career WITHIN 4 WORDS","score":0.8,"matched_terms":["promotion","career"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Promotion</mark> opportunities should be more transparent.","timestamp":"2024-03-20T10:40:00Z"}
{"index":{}}
{"rule_id":"career_4","comment_text":"Lack of career development is demotivating.","topic":"Career Development","description":"lack NEAR bacghr_career WITHIN 3 WORDS","score":0.95,"matched_terms":["lack","bacghr_career"],"max_gaps":3,"ordered":false,"highlighted_text":"<mark>Lack</mark> of <mark>career</mark> development is demotivating.","timestamp":"2024-03-20T10:41:00Z"}
{"index":{}}
{"rule_id":"career_5","comment_text":"Skill development programs are very helpful.","topic":"Career Development","description":"skill NEAR development WITHIN 3 WORDS","score":0.9,"matched_terms":["skill","development"],"max_gaps":3,"ordered":false,"highlighted_text":"<mark>Skill</mark> <mark>development</mark> programs are very helpful.","timestamp":"2024-03-20T10:42:00Z"}
{"index":{}}
{"rule_id":"client_1","comment_text":"Client support team is very responsive.","topic":"Client Support","description":"bacghr_client NEAR bacghr_support WITHIN 5 WORDS","score":0.85,"matched_terms":["bacghr_client","bacghr_support"],"max_gaps":5,"ordered":false,"highlighted_text":"<mark>Client</mark> <mark>support</mark> team is very responsive.","timestamp":"2024-03-20T10:43:00Z"}
{"index":{}}
{"rule_id":"client_2","comment_text":"The client needs more support with implementation.","topic":"Client Support","description":"client NEAR support WITHIN 5 WORDS","score":0.9,"matched_terms":["client","support"],"max_gaps":5,"ordered":false,"highlighted_text":"The <mark>client</mark> needs more <mark>support</mark> with implementation.","timestamp":"2024-03-20T10:44:00Z"}
{"index":{}}
{"rule_id":"client_3","comment_text":"Customer help desk is always available.","topic":"Client Support","description":"customer NEAR help WITHIN 4 WORDS","score":0.8,"matched_terms":["customer","help"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Customer</mark> <mark>help</mark> desk is always available.","timestamp":"2024-03-20T10:45:00Z"}
{"index":{}}
{"rule_id":"team_1","comment_text":"Team collaboration leads to better results.","topic":"Team Collaboration","description":"team NEAR collaboration WITHIN 4 WORDS","score":0.85,"matched_terms":["team","collaboration"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Team</mark> <mark>collaboration</mark> leads to better results.","timestamp":"2024-03-20T10:46:00Z"}
{"index":{}}
{"rule_id":"team_2","comment_text":"My team helped me understand the new process.","topic":"Team Collaboration","description":"team NEAR help WITHIN 3 WORDS","score":0.9,"matched_terms":["team","help"],"max_gaps":3,"ordered":false,"highlighted_text":"My <mark>team</mark> <mark>helped</mark> me understand the new process.","timestamp":"2024-03-20T10:47:00Z"}
{"index":{}}
{"rule_id":"team_3","comment_text":"Collaboration tools make work more efficient.","topic":"Team Collaboration","description":"collaboration NEAR work WITHIN 4 WORDS","score":0.85,"matched_terms":["collaboration","work"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Collaboration</mark> tools make <mark>work</mark> more efficient.","timestamp":"2024-03-20T10:48:00Z"}
{"index":{}}
{"rule_id":"career_1","comment_text":"Career opportunities in the sales department are promising.","topic":"Career Development","description":"bacghr_career NEAR bacghr_opportunity WITHIN 5 WORDS","score":0.9,"matched_terms":["bacghr_career","bacghr_opportunity"],"max_gaps":5,"ordered":false,"highlighted_text":"<mark>Career</mark> <mark>opportunities</mark> in the sales department are promising.","timestamp":"2024-03-20T10:49:00Z"}
{"index":{}}
{"rule_id":"career_2","comment_text":"Education programs support career growth effectively.","topic":"Career Development","description":"bacghr_learning NEAR bacghr_career WITHIN 3 WORDS","score":0.85,"matched_terms":["bacghr_learning","bacghr_career"],"max_gaps":3,"ordered":false,"highlighted_text":"<mark>Education</mark> programs support <mark>career</mark> growth effectively.","timestamp":"2024-03-20T10:50:00Z"}
{"index":{}}
{"rule_id":"career_3","comment_text":"I deserve a promotion after three years of service.","topic":"Career Development","description":"promotion NEAR career WITHIN 4 WORDS","score":0.95,"matched_terms":["promotion","career"],"max_gaps":4,"ordered":false,"highlighted_text":"I deserve a <mark>promotion</mark> after three years of service.","timestamp":"2024-03-20T10:51:00Z"}
{"index":{}}
{"rule_id":"career_4","comment_text":"Lack of career progression is frustrating.","topic":"Career Development","description":"lack NEAR bacghr_career WITHIN 3 WORDS","score":0.9,"matched_terms":["lack","bacghr_career"],"max_gaps":3,"ordered":false,"highlighted_text":"<mark>Lack</mark> of <mark>career</mark> progression is frustrating.","timestamp":"2024-03-20T10:52:00Z"}
{"index":{}}
{"rule_id":"career_5","comment_text":"Technical skill development is crucial for advancement.","topic":"Career Development","description":"skill NEAR development WITHIN 3 WORDS","score":0.9,"matched_terms":["skill","development"],"max_gaps":3,"ordered":false,"highlighted_text":"Technical <mark>skill</mark> <mark>development</mark> is crucial for advancement.","timestamp":"2024-03-20T10:53:00Z"}
{"index":{}}
{"rule_id":"client_1","comment_text":"Client support response time needs improvement.","topic":"Client Support","description":"bacghr_client NEAR bacghr_support WITHIN 5 WORDS","score":0.85,"matched_terms":["bacghr_client","bacghr_support"],"max_gaps":5,"ordered":false,"highlighted_text":"<mark>Client</mark> <mark>support</mark> response time needs improvement.","timestamp":"2024-03-20T10:54:00Z"}
{"index":{}}
{"rule_id":"client_2","comment_text":"The client requires immediate help with the issue.","topic":"Client Support","description":"client NEAR support WITHIN 5 WORDS","score":0.9,"matched_terms":["client","help"],"max_gaps":5,"ordered":false,"highlighted_text":"The <mark>client</mark> requires immediate <mark>help</mark> with the issue.","timestamp":"2024-03-20T10:55:00Z"}
{"index":{}}
{"rule_id":"client_3","comment_text":"Customer assistance program is well organized.","topic":"Client Support","description":"customer NEAR help WITHIN 4 WORDS","score":0.8,"matched_terms":["customer","help"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Customer</mark> <mark>assistance</mark> program is well organized.","timestamp":"2024-03-20T10:56:00Z"}
{"index":{}}
{"rule_id":"team_1","comment_text":"Cross-functional team collaboration is essential.","topic":"Team Collaboration","description":"team NEAR collaboration WITHIN 4 WORDS","score":0.9,"matched_terms":["team","collaboration"],"max_gaps":4,"ordered":false,"highlighted_text":"Cross-functional <mark>team</mark> <mark>collaboration</mark> is essential.","timestamp":"2024-03-20T10:57:00Z"}
{"index":{}}
{"rule_id":"team_2","comment_text":"The team helped me learn new processes.","topic":"Team Collaboration","description":"team NEAR help WITHIN 3 WORDS","score":0.85,"matched_terms":["team","help"],"max_gaps":3,"ordered":false,"highlighted_text":"The <mark>team</mark> <mark>helped</mark> me learn new processes.","timestamp":"2024-03-20T10:58:00Z"}
{"index":{}}
{"rule_id":"team_3","comment_text":"Inter-departmental collaboration improves work quality.","topic":"Team Collaboration","description":"collaboration NEAR work WITHIN 4 WORDS","score":0.85,"matched_terms":["collaboration","work"],"max_gaps":4,"ordered":false,"highlighted_text":"Inter-departmental <mark>collaboration</mark> improves <mark>work</mark> quality.","timestamp":"2024-03-20T10:59:00Z"}
{"index":{}}
{"rule_id":"career_1","comment_text":"International career opportunities are very attractive.","topic":"Career Development","description":"bacghr_career NEAR bacghr_opportunity WITHIN 5 WORDS","score":0.9,"matched_terms":["bacghr_career","bacghr_opportunity"],"max_gaps":5,"ordered":false,"highlighted_text":"International <mark>career</mark> <mark>opportunities</mark> are very attractive.","timestamp":"2024-03-20T11:00:00Z"}
{"index":{}}
{"rule_id":"career_2","comment_text":"Knowledge sharing enhances career development.","topic":"Career Development","description":"bacghr_learning NEAR bacghr_career WITHIN 3 WORDS","score":0.85,"matched_terms":["bacghr_learning","bacghr_career"],"max_gaps":3,"ordered":false,"highlighted_text":"<mark>Knowledge</mark> sharing enhances <mark>career</mark> development.","timestamp":"2024-03-20T11:01:00Z"}
{"index":{}}
{"rule_id":"career_3","comment_text":"Promotion criteria should be clearly defined.","topic":"Career Development","description":"promotion NEAR career WITHIN 4 WORDS","score":0.8,"matched_terms":["promotion","career"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Promotion</mark> criteria should be clearly defined.","timestamp":"2024-03-20T11:02:00Z"}
{"index":{}}
{"rule_id":"career_4","comment_text":"Lack of career guidance is concerning.","topic":"Career Development","description":"lack NEAR bacghr_career WITHIN 3 WORDS","score":0.9,"matched_terms":["lack","bacghr_career"],"max_gaps":3,"ordered":false,"highlighted_text":"<mark>Lack</mark> of <mark>career</mark> guidance is concerning.","timestamp":"2024-03-20T11:03:00Z"}
{"index":{}}
{"rule_id":"career_5","comment_text":"Leadership skill development is important.","topic":"Career Development","description":"skill NEAR development WITHIN 3 WORDS","score":0.9,"matched_terms":["skill","development"],"max_gaps":3,"ordered":false,"highlighted_text":"Leadership <mark>skill</mark> <mark>development</mark> is important.","timestamp":"2024-03-20T11:04:00Z"}
{"index":{}}
{"rule_id":"client_1","comment_text":"Client support documentation is comprehensive.","topic":"Client Support","description":"bacghr_client NEAR bacghr_support WITHIN 5 WORDS","score":0.8,"matched_terms":["bacghr_client","bacghr_support"],"max_gaps":5,"ordered":false,"highlighted_text":"<mark>Client</mark> <mark>support</mark> documentation is comprehensive.","timestamp":"2024-03-20T11:05:00Z"}
{"index":{}}
{"rule_id":"client_2","comment_text":"The client needs ongoing help with maintenance.","topic":"Client Support","description":"client NEAR support WITHIN 5 WORDS","score":0.85,"matched_terms":["client","help"],"max_gaps":5,"ordered":false,"highlighted_text":"The <mark>client</mark> needs ongoing <mark>help</mark> with maintenance.","timestamp":"2024-03-20T11:06:00Z"}
{"index":{}}
{"rule_id":"client_3","comment_text":"Customer help resources are easily accessible.","topic":"Client Support","description":"customer NEAR help WITHIN 4 WORDS","score":0.8,"matched_terms":["customer","help"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Customer</mark> <mark>help</mark> resources are easily accessible.","timestamp":"2024-03-20T11:07:00Z"}
{"index":{}}
{"rule_id":"team_1","comment_text":"Virtual team collaboration works well remotely.","topic":"Team Collaboration","description":"team NEAR collaboration WITHIN 4 WORDS","score":0.85,"matched_terms":["team","collaboration"],"max_gaps":4,"ordered":false,"highlighted_text":"Virtual <mark>team</mark> <mark>collaboration</mark> works well remotely.","timestamp":"2024-03-20T11:08:00Z"}
{"index":{}}
{"rule_id":"team_2","comment_text":"My team helped me overcome challenges.","topic":"Team Collaboration","description":"team NEAR help WITHIN 3 WORDS","score":0.9,"matched_terms":["team","help"],"max_gaps":3,"ordered":false,"highlighted_text":"My <mark>team</mark> <mark>helped</mark> me overcome challenges.","timestamp":"2024-03-20T11:09:00Z"}
{"index":{}}
{"rule_id":"team_3","comment_text":"Strategic collaboration enhances work outcomes.","topic":"Team Collaboration","description":"collaboration NEAR work WITHIN 4 WORDS","score":0.85,"matched_terms":["collaboration","work"],"max_gaps":4,"ordered":false,"highlighted_text":"Strategic <mark>collaboration</mark> enhances <mark>work</mark> outcomes.","timestamp":"2024-03-20T11:10:00Z"}
{"index":{}}
{"rule_id":"career_1","comment_text":"Remote career opportunities are becoming more common.","topic":"Career Development","description":"bacghr_career NEAR bacghr_opportunity WITHIN 5 WORDS","score":0.85,"matched_terms":["bacghr_career","bacghr_opportunity"],"max_gaps":5,"ordered":false,"highlighted_text":"Remote <mark>career</mark> <mark>opportunities</mark> are becoming more common.","timestamp":"2024-03-20T11:11:00Z"}
{"index":{}}
{"rule_id":"career_2","comment_text":"Continuous learning drives career success.","topic":"Career Development","description":"bacghr_learning NEAR bacghr_career WITHIN 3 WORDS","score":0.9,"matched_terms":["bacghr_learning","bacghr_career"],"max_gaps":3,"ordered":false,"highlighted_text":"Continuous <mark>learning</mark> drives <mark>career</mark> success.","timestamp":"2024-03-20T11:12:00Z"}
{"index":{}}
{"rule_id":"career_3","comment_text":"Promotion timeline should be communicated clearly.","topic":"Career Development","description":"promotion NEAR career WITHIN 4 WORDS","score":0.8,"matched_terms":["promotion","career"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Promotion</mark> timeline should be communicated clearly.","timestamp":"2024-03-20T11:13:00Z"}
{"index":{}}
{"rule_id":"career_4","comment_text":"Lack of career advancement is demoralizing.","topic":"Career Development","description":"lack NEAR bacghr_career WITHIN 3 WORDS","score":0.95,"matched_terms":["lack","bacghr_career"],"max_gaps":3,"ordered":false,"highlighted_text":"<mark>Lack</mark> of <mark>career</mark> advancement is demoralizing.","timestamp":"2024-03-20T11:14:00Z"}
{"index":{}}
{"rule_id":"career_5","comment_text":"Soft skill development is often overlooked.","topic":"Career Development","description":"skill NEAR development WITHIN 3 WORDS","score":0.85,"matched_terms":["skill","development"],"max_gaps":3,"ordered":false,"highlighted_text":"Soft <mark>skill</mark> <mark>development</mark> is often overlooked.","timestamp":"2024-03-20T11:15:00Z"}
{"index":{}}
{"rule_id":"client_1","comment_text":"Client support quality varies by region.","topic":"Client Support","description":"bacghr_client NEAR bacghr_support WITHIN 5 WORDS","score":0.8,"matched_terms":["bacghr_client","bacghr_support"],"max_gaps":5,"ordered":false,"highlighted_text":"<mark>Client</mark> <mark>support</mark> quality varies by region.","timestamp":"2024-03-20T11:16:00Z"}
{"index":{}}
{"rule_id":"client_2","comment_text":"The client needs urgent help with deployment.","topic":"Client Support","description":"client NEAR support WITHIN 5 WORDS","score":0.9,"matched_terms":["client","help"],"max_gaps":5,"ordered":false,"highlighted_text":"The <mark>client</mark> needs urgent <mark>help</mark> with deployment.","timestamp":"2024-03-20T11:17:00Z"}
{"index":{}}
{"rule_id":"client_3","comment_text":"Customer help portal is user-friendly.","topic":"Client Support","description":"customer NEAR help WITHIN 4 WORDS","score":0.85,"matched_terms":["customer","help"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Customer</mark> <mark>help</mark> portal is user-friendly.","timestamp":"2024-03-20T11:18:00Z"}
{"index":{}}
{"rule_id":"team_1","comment_text":"Agile team collaboration improves productivity.","topic":"Team Collaboration","description":"team NEAR collaboration WITHIN 4 WORDS","score":0.9,"matched_terms":["team","collaboration"],"max_gaps":4,"ordered":false,"highlighted_text":"Agile <mark>team</mark> <mark>collaboration</mark> improves productivity.","timestamp":"2024-03-20T11:19:00Z"}
{"index":{}}
{"rule_id":"team_2","comment_text":"The team helped me adapt to changes.","topic":"Team Collaboration","description":"team NEAR help WITHIN 3 WORDS","score":0.85,"matched_terms":["team","help"],"max_gaps":3,"ordered":false,"highlighted_text":"The <mark>team</mark> <mark>helped</mark> me adapt to changes.","timestamp":"2024-03-20T11:20:00Z"}
{"index":{}}
{"rule_id":"team_3","comment_text":"Cross-team collaboration streamlines work processes.","topic":"Team Collaboration","description":"collaboration NEAR work WITHIN 4 WORDS","score":0.85,"matched_terms":["collaboration","work"],"max_gaps":4,"ordered":false,"highlighted_text":"Cross-team <mark>collaboration</mark> streamlines <mark>work</mark> processes.","timestamp":"2024-03-20T11:21:00Z"}
{"index":{}}
{"rule_id":"career_1","comment_text":"Career opportunities in emerging technologies are exciting.","topic":"Career Development","description":"bacghr_career NEAR bacghr_opportunity WITHIN 5 WORDS","score":0.9,"matched_terms":["bacghr_career","bacghr_opportunity"],"max_gaps":5,"ordered":false,"highlighted_text":"<mark>Career</mark> <mark>opportunities</mark> in emerging technologies are exciting.","timestamp":"2024-03-20T11:22:00Z"}
{"index":{}}
{"rule_id":"career_2","comment_text":"Professional learning accelerates career growth.","topic":"Career Development","description":"bacghr_learning NEAR bacghr_career WITHIN 3 WORDS","score":0.85,"matched_terms":["bacghr_learning","bacghr_career"],"max_gaps":3,"ordered":false,"highlighted_text":"Professional <mark>learning</mark> accelerates <mark>career</mark> growth.","timestamp":"2024-03-20T11:23:00Z"}
{"index":{}}
{"rule_id":"career_3","comment_text":"Promotion feedback should be constructive.","topic":"Career Development","description":"promotion NEAR career WITHIN 4 WORDS","score":0.8,"matched_terms":["promotion","career"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Promotion</mark> feedback should be constructive.","timestamp":"2024-03-20T11:24:00Z"}
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
{"index":{}}
{"rule_id":"career_6","comment_text":"Advancement opportunities and potential for growth are important to me.","topic":"Career Development","description":"bacghr_advancement NEAR bacghr_opportunity WITHIN 4 WORDS","score":0.8,"matched_terms":["bacghr_advancement","bacghr_opportunity"],"max_gaps":4,"ordered":false,"highlighted_text":"Advancement <mark>opportunities</mark> and potential for <mark>growth</mark> are important to me.","timestamp":"2024-03-20T11:33:00Z"}
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
{"index":{}}
{"rule_id":"career_3","comment_text":"Promotion feedback should be constructive.","topic":"Career Development","description":"promotion NEAR career WITHIN 4 WORDS","score":0.8,"matched_terms":["promotion","career"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Promotion</mark> feedback should be constructive.","timestamp":"2024-03-20T11:24:00Z"}
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

echo "Bulk insert completed successfully!"
echo "Total documents inserted: 85"
echo ""
echo "Sample queries to verify the data:"
echo ""
echo "# Count total documents:"
echo "curl -X GET 'localhost:9200/matched_comments/_count'"
echo ""
echo "# Get all documents:"
echo "curl -X GET 'localhost:9200/matched_comments/_search?pretty'"
echo ""
echo "# Get documents by topic:"
echo "curl -X POST 'localhost:9200/matched_comments/_search' -H 'Content-Type: application/json' -d '{\"query\":{\"term\":{\"topic\":\"Career Development\"}}}'"
echo ""
echo "# Get documents by rule_id:"
echo "curl -X POST 'localhost:9200/matched_comments/_search' -H 'Content-Type: application/json' -d '{\"query\":{\"term\":{\"rule_id\":\"career_1\"}}}'" 