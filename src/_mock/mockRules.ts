export interface MockRule {
    id: string;
    description: string;
    topic: string;
    unique: number;
    total: number;
    excluded: boolean;
}

export const getMockRulesForTopic = (topic: string): MockRule[] => {
    switch (topic) {
        case 'career-development':
            return [
                {
                    id: 'cd_1',
                    description: 'bacghr_career NEAR bacghr_opportunity WITHIN 5 WORDS',
                    topic: 'Career Growth Opportunities',
                    unique: 45,
                    total: 1343,
                    excluded: false
                },
                {
                    id: 'cd_2',
                    description: 'bacghr_learning NEAR bacghr_career WITHIN 3 WORDS',
                    topic: 'Learning and Development',
                    unique: 32,
                    total: 987,
                    excluded: false
                },
                {
                    id: 'cd_3',
                    description: 'promotion NEAR bacghr_advancement WITHIN 4 WORDS',
                    topic: 'Promotion and Advancement',
                    unique: 28,
                    total: 756,
                    excluded: false
                }
            ];
        case 'employee-networks':
            return [
                {
                    id: '1',
                    description: 'employee NEAR network WITHIN 2 WORDS',
                    topic: 'Employee Networks',
                    unique: 45,
                    total: 1343,
                    excluded: false
                },
                {
                    id: '2',
                    description: 'jewish NEAR heritage NEAR chapter WITHIN 3 WORDS',
                    topic: 'Jewish Heritage',
                    unique: 12,
                    total: 89,
                    excluded: false
                },
                {
                    id: '3',
                    description: 'arab NEAR heritage NEAR chapter WITHIN 3 WORDS',
                    topic: 'Arab Heritage',
                    unique: 8,
                    total: 67,
                    excluded: false
                }
            ];
        default:
            return [
                {
                    id: '1',
                    description: 'Sample rule for ' + topic,
                    topic: 'Sample Topic',
                    unique: 10,
                    total: 100,
                    excluded: false
                }
            ];
    }
};
