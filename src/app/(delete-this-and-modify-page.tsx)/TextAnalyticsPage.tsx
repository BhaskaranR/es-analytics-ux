'use client';
import React, { useEffect, useState } from 'react';
import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york-v4/ui/card';
import { Checkbox } from '@/registry/new-york-v4/ui/checkbox';
import { Input } from '@/registry/new-york-v4/ui/input';
import { Badge } from '@/registry/new-york-v4/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/new-york-v4/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/new-york-v4/ui/tabs';
import { Separator } from '@/registry/new-york-v4/ui/separator';
import { X, Search, Edit, Copy, Trash2 } from 'lucide-react';

// Mock rules and comments based on your Elasticsearch examples
const rules = [
  { id: '1', text: 'employee NEAR network WITHIN 2 WORDS', topic: 'Employee Networks' },
  { id: '2', text: 'jewish NEAR heritage NEAR chapter WITHIN 3 WORDS', topic: 'Jewish Heritage' },
  { id: '3', text: 'arab NEAR heritage NEAR chapter WITHIN 3 WORDS', topic: 'Arab Heritage' },
  { id: '4', text: 'culture NEAR heritage NEAR network WITHIN 5 WORDS', topic: 'Culture Heritage' },
  { id: '5', text: 'CHN', topic: 'CHN' },
  { id: '6', text: 'veteran NEAR network WITHIN 5 WORDS', topic: 'Veteran Network' },
];

const commentsByRule = {
  '1': [
    {
      text: 'I have always been engaged with one or more of the employee networks. I have always taken part in one of the mentorship programs and have become engaged with the people who have been part of the program as my mentor. This year, I took a leap, and became a mentor and so far, so good! BofA has offered me an opportunity to explore leadership skills as well as grow as a person outside of my direct line of work responsibilities.',
      highlights: ['employee networks'],
    },
    {
      text: 'I am looking for a new employee network or community stuff. I can\'t attend anything.',
      highlights: ['employee network'],
    },
  ],
  '2': [
    {
      text: 'The jewish heritage chapter organized a great event.',
      highlights: ['jewish heritage chapter'],
    },
  ],
  '3': [
    {
      text: 'The arab heritage chapter is very active in our company.',
      highlights: ['arab heritage chapter'],
    },
  ],
  '4': [
    {
      text: 'Our culture heritage network brings together people from diverse backgrounds.',
      highlights: ['culture heritage network'],
    },
  ],
  '5': [
    {
      text: 'CHN is a great resource for new employees.',
      highlights: ['CHN'],
    },
  ],
  '6': [
    {
      text: 'The veteran network within the company is very supportive.',
      highlights: ['veteran network'],
    },
  ],
};

interface Rule {
  id: string;
  text: string;
  topic?: string;
  unique: number;
  total: number;
  excluded: boolean;
}

interface MatchedComment {
  comment_text: string;
  [key: string]: any;
}

function highlightTerms(text: string, highlights: string[]) {
  if (!highlights || highlights.length === 0) return text;
  let result = text;
  highlights.forEach((term: string) => {
    const regex = new RegExp(`(${term})`, 'gi');
    result = result.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  });
  
  return result;
}

export default function TextAnalyticsPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [selectedRule, setSelectedRule] = useState<string | null>(null);
  const [selectedRules, setSelectedRules] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [comments, setComments] = useState<MatchedComment[]>([]);

  // Fetch rules on mount - keeping original Elasticsearch call
  useEffect(() => {
    fetch('http://<elasticsearch-host>:9200/comment_rules/_search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ size: 100, query: { match_all: {} } })
    })
      .then(res => res.json())
      .then(data => {
        const rulesList: Rule[] = data.hits.hits.map((hit: any) => ({
          id: hit._id,
          text: hit._source.text || hit._source.query, // adjust as per your mapping
          topic: hit._source.topic,
          unique: Math.floor(Math.random() * 100) + 1, // Mock data for now
          total: Math.floor(Math.random() * 1000) + 100, // Mock data for now
          excluded: false // Mock data for now
        }));
        setRules(rulesList);
        if (rulesList.length > 0) setSelectedRule(rulesList[0].id);
        
        return null;
      })
      .catch(() => {
        // Fallback to mock data if API fails
        const mockRules = [
          { 
            id: '1', 
            text: 'employee NEAR network WITHIN 2 WORDS', 
            topic: 'Employee Networks',
            unique: 45,
            total: 1343,
            excluded: false
          },
          { 
            id: '2', 
            text: 'jewish NEAR heritage NEAR chapter WITHIN 3 WORDS', 
            topic: 'Jewish Heritage',
            unique: 12,
            total: 89,
            excluded: false
          },
          { 
            id: '3', 
            text: 'arab NEAR heritage NEAR chapter WITHIN 3 WORDS', 
            topic: 'Arab Heritage',
            unique: 8,
            total: 67,
            excluded: false
          },
          { 
            id: '4', 
            text: 'culture NEAR heritage NEAR network WITHIN 5 WORDS', 
            topic: 'Culture Heritage',
            unique: 23,
            total: 156,
            excluded: false
          },
          { 
            id: '5', 
            text: 'CHN', 
            topic: 'CHN',
            unique: 34,
            total: 234,
            excluded: false
          },
          { 
            id: '6', 
            text: 'veteran NEAR network WITHIN 5 WORDS', 
            topic: 'Veteran Network',
            unique: 15,
            total: 98,
            excluded: true
          },
        ];
        setRules(mockRules);
        if (mockRules.length > 0) setSelectedRule(mockRules[0].id);
      });
  }, []);

  // Fetch comments for selected rule - keeping original Elasticsearch call
  useEffect(() => {
    if (!selectedRule) return;
    
    // Find the selected rule's text for highlighting
    const ruleText = rules.find(r => r.id === selectedRule)?.text || '';
    fetch('http://<elasticsearch-host>:9200/matched_comments/_search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        size: 100,
        query: {
          bool: {
            must: [
              { term: { rule_id: selectedRule } },
              ...(ruleText ? [{ match: { comment_text: ruleText } }] : [])
            ]
          }
        },
        highlight: {
          fields: {
            comment_text: {}
          }
        },
        sort: [{ timestamp: { order: 'desc' } }]
      })
    })
      .then(res => res.json())
      .then(data => {
        setComments(
          data.hits.hits.map((hit: any) => ({
            ...hit._source,
            highlight: hit.highlight?.comment_text || []
          }))
        );
        
        return null;
      })
      .catch(() => {
        // Fallback to mock data if API fails
        const mockCommentsByRule = {
          '1': [
            {
              comment_text: 'I have always been engaged with one or more of the employee networks. I have always taken part in one of the mentorship programs and have become engaged with the people who have been part of the program as my mentor. This year, I took a leap, and became a mentor and so far, so good! BofA has offered me an opportunity to explore leadership skills as well as grow as a person outside of my direct line of work responsibilities.',
              highlight: ['employee networks'],
            },
            {
              comment_text: 'I am looking for a new employee network or community stuff. I can\'t attend anything.',
              highlight: ['employee network'],
            },
          ],
          '2': [
            {
              comment_text: 'The jewish heritage chapter organized a great event.',
              highlight: ['jewish heritage chapter'],
            },
          ],
          '3': [
            {
              comment_text: 'The arab heritage chapter is very active in our company.',
              highlight: ['arab heritage chapter'],
            },
          ],
          '4': [
            {
              comment_text: 'Our culture heritage network brings together people from diverse backgrounds.',
              highlight: ['culture heritage network'],
            },
          ],
          '5': [
            {
              comment_text: 'CHN is a great resource for new employees.',
              highlight: ['CHN'],
            },
          ],
          '6': [
            {
              comment_text: 'The veteran network within the company is very supportive.',
              highlight: ['veteran network'],
            },
          ],
        };
        
        const mockComments = mockCommentsByRule[selectedRule as keyof typeof mockCommentsByRule] || [];
        setComments(mockComments);
      });
  }, [selectedRule, rules]);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRules(rules.map(rule => rule.id));
    } else {
      setSelectedRules([]);
    }
  };

  const toggleRuleSelection = (ruleId: string) => {
    setSelectedRules(prev => 
      prev.includes(ruleId) 
        ? prev.filter(id => id !== ruleId)
        : [...prev, ruleId]
    );
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-medium text-gray-900">EDIT TOPIC - CAREER AND DEVELOPMENT - EMPLOYEE NETWORKS</h1>
        <Button variant="outline" size="sm">
          <X className="w-4 h-4 mr-2" />
          Close
        </Button>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Panel */}
        <div className="w-2/3 bg-white border-r">
          <div className="p-6">
            {/* Topic Rules Header */}
            <div className="flex items-center gap-4 mb-6">
              <span className="font-medium">Topics rules for</span>
              <Select defaultValue="english">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="core-topics">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="core-topics">Core Topics</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                <Button variant="link" className="p-0 h-auto text-blue-600">
                  Advanced Search
                </Button>
                <div className="flex items-center gap-4">
                  <span>Used in 0 places</span>
                  <span>1343 Total Matches</span>
                </div>
              </div>
            </div>

            {/* New Rule Section */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">New Rule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Add words
                  </Button>
                  <Badge variant="secondary">AND</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">NOT</span>
                  <Button variant="outline" size="sm">
                    Add words to exclude
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button size="sm">Save</Button>
                  <Button variant="outline" size="sm">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Rules Table */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={selectedRules.length === rules.length} 
                  onCheckedChange={toggleSelectAll} 
                />
                <span className="text-sm font-medium">Select All</span>
              </div>

              <div className="space-y-2">
                {rules.map((rule) => (
                  <div key={rule.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50">
                    <Checkbox
                      checked={selectedRules.includes(rule.id)}
                      onCheckedChange={() => toggleRuleSelection(rule.id)}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-mono">{rule.text}</div>
                      {rule.excluded && (
                        <div className="text-xs text-gray-500 mt-1">but does not contain: networking</div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium">{rule.unique}</div>
                        <div className="text-xs text-gray-500">Unique</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{rule.total}</div>
                        <div className="text-xs text-gray-500">Total</div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-1/3">
          <div className="p-6">
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="topic-notes">Topic Notes</TabsTrigger>
                <TabsTrigger value="user-features">User Features</TabsTrigger>
                <TabsTrigger value="word-groups">Word Groups</TabsTrigger>
                <TabsTrigger value="segments">Segments</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="mt-6">
                <div className="space-y-4">
                  <div className="border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Displaying comments captured by highlighted rule</span>
                      <X className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Checkbox />
                      <span>Show unique matches</span>
                    </div>
                  </div>

                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Preview</CardTitle>
                        <div className="flex items-center gap-2 text-sm">
                          <span>High</span>
                          <div className="flex gap-1">
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              0
                            </Badge>
                            <Badge variant="secondary" className="bg-red-100 text-red-800">
                              0
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {comments.map((comment, idx) => (
                        <div key={idx} className="text-sm">
                          <div className="mb-2">
                            <span className="font-medium">Should be captured?</span>
                            <div className="flex gap-2 mt-1">
                              <Button variant="outline" size="sm">
                                Yes
                              </Button>
                              <Button variant="outline" size="sm">
                                No
                              </Button>
                            </div>
                          </div>
                          <p 
                            className="text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ 
                              __html: highlightTerms(comment.comment_text, comment.highlight || []) 
                            }}
                          />
                          <div className="flex gap-2 mt-2">
                            <Button variant="outline" size="sm">
                              Yes
                            </Button>
                            <Button variant="outline" size="sm">
                              No
                            </Button>
                          </div>
                          {idx < comments.length - 1 && <Separator className="my-4" />}
                        </div>
                      ))}
                      
                      {comments.length === 0 && (
                        <div className="text-gray-500 text-center py-8">
                          No comments found for this rule.
                        </div>
                      )}

                      <div className="text-xs text-gray-500 mt-4">Last updated 3/27/2025 1:09 PM</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
} 