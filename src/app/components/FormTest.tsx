'use client';

import { useRef } from 'react';

import { useRouter } from 'next/navigation';

import { useZodForm } from '@/hooks/use-zod-form';
import { useTRPC } from '@/trpc/client';
import { Button } from '@midday/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@midday/ui/form';
import { Input } from '@midday/ui/input';
import { SubmitButton } from '@midday/ui/submit-button';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';

import { AvatarUpload } from './avatar-upload';
import { z } from 'zod';

const formSchema = z.object({
    fullName: z.string().min(2).max(32)
});

export function SetupForm() {
    const router = useRouter();
    const uploadRef = useRef<HTMLInputElement>(null);

    const trpc = useTRPC();
    const { data: user } = useSuspenseQuery(trpc.user.me.queryOptions());

    const form = useZodForm(formSchema, {
        defaultValues: {
            fullName: user?.fullName ?? ''
        }
    });

    const updateUserMutation = useMutation(
        trpc.user.update.mutationOptions({
            onSuccess: () => {
                router.push('/');
            }
        })
    );

    function handleSubmit(data: z.infer<typeof formSchema>) {
        updateUserMutation.mutate(data);
    }

    return (
        import React from "react";
        import { useForm } from "react-hook-form";
        import { Row, Col } from "react-bootstrap";
        import {
          Form,
          FormField,
          FormItem,
          FormLabel,
          FormControl,
          FormDescription,
          FormMessage,
        } from "path-to-your-form-component"; // <-- update this import path
        
        type FormValues = {
          starterTemplate: string;
          programName: string;
          programDescription: string;
          programStatus: boolean;
        };
        
        export default function ProgramForm() {
          const { control, handleSubmit } = useForm<FormValues>({
            defaultValues: {
              starterTemplate: "",
              programName: "",
              programDescription: "",
              programStatus: false,
            },
          });
        
          const onSubmit = (data: FormValues) => {
            console.log(data);
          };
        
          return (
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Form.Group>
                <Row>
                  <Col md={3} className="mb-3 mb-md-0">
                    <FormField
                      name="starterTemplate"
                      control={control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Program starter template</FormLabel>
                          <FormControl
                            as="select"
                            {...field}
                            aria-describedby="FeedbackProgramStarterTemplate"
                          >
                            <option value="" disabled>
                              Select template
                            </option>
                            <option value="option1">Program Template 1</option>
                            <option value="option2">Program Template 2</option>
                            <option value="option3">Program Template 3</option>
                          </FormControl>
                          <FormDescription id="FeedbackProgramStarterTemplate">
                            Choose a pre-defined template
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Col>
        
                  <Col md={3} className="mb-3 mb-md-0">
                    <FormField
                      name="programName"
                      control={control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Program name</FormLabel>
                          <FormControl
                            {...field}
                            placeholder="Enter program name"
                            type="text"
                            aria-describedby="FeedbackProgramName"
                            required
                          />
                          <FormDescription id="FeedbackProgramName">
                            Create a name for the program
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Col>
                </Row>
              </Form.Group>
        
              <Form.Group>
                <Row>
                  <Col md={10}>
                    <FormField
                      name="programDescription"
                      control={control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Program description</FormLabel>
                          <FormControl
                            {...field}
                            placeholder="Enter program description"
                            type="text"
                            aria-describedby="FeedbackProgramDescription"
                          />
                          <FormDescription id="FeedbackProgramDescription">
                            Add description for the program
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Col>
        
                  <Col md={2}>
                    <FormField
                      name="programStatus"
                      control={control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Program status</FormLabel>
                          <FormControl
                            as="input"
                            type="checkbox"
                            checked={field.value}
                            onChange={e => field.onChange(e.target.checked)}
                            id="ToggleProgramStatus"
                            aria-describedby="FeedbackProgramStatus"
                          />
                          <FormDescription id="FeedbackProgramStatus">
                            Toggle program status
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Col>
                </Row>
              </Form.Group>
        
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </Form>
          );
        }
    );
}
