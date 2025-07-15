'use client';

import React from 'react';

import { Button } from '@/registry/new-york-v4/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/registry/new-york-v4/ui/dialog';

import { CommentRulesBuilder } from './CommentRulesBuilder';
import { Plus } from 'lucide-react';

interface RulesBuilderModalProps {
    onRuleCreated?: (rule: any) => void;
    onRuleUpdated?: (ruleId: string, rule: any) => void;
    onRuleDeleted?: (ruleId: string) => void;
}

export function RulesBuilderModal({ onRuleCreated, onRuleUpdated, onRuleDeleted }: RulesBuilderModalProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant='outline' size='sm'>
                    <Plus className='mr-2 h-4 w-4' />
                    Add New Rule
                </Button>
            </DialogTrigger>
            <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>Create New Comment Rule</DialogTitle>
                    <DialogDescription>
                        Build a new Elasticsearch percolator rule for comment analysis
                    </DialogDescription>
                </DialogHeader>
                <div className='mt-4'>
                    <CommentRulesBuilder
                        onRuleCreated={onRuleCreated}
                        onRuleUpdated={onRuleUpdated}
                        onRuleDeleted={onRuleDeleted}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
