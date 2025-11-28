/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm, Controller, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { JobListingSchema, JobListingSchemaType } from "@/lib/schemas/job";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/LoadingSwap";
import { JobListing } from "@/types/jobListing";
import { Checkbox } from "@/components/ui/checkbox";
import { MarkdownEditor } from "@/components/markdown/MarkdownEditor";

interface JobFormProps {
  initialData?: JobListing;
  onSubmit: (data: JobListingSchemaType) => Promise<void>;
  isSubmitting?: boolean;
}

export function JobForm({ initialData, onSubmit, isSubmitting }: JobFormProps) {
  const form = useForm<JobListingSchemaType>({
    resolver: zodResolver(JobListingSchema) as any,
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      wage: initialData?.wage || undefined,
      wage_interval: initialData?.wage_interval || "yearly",
      state_abbreviation: initialData?.state_abbreviation || "",
      city: initialData?.city || "",
      location_requirement: initialData?.location_requirement || "in-office",
      experience_level: initialData?.experience_level || "mid-level",
      type: initialData?.type || "full-time",
      status: initialData?.status || "draft",
      is_featured: initialData?.is_featured || false,
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <Field className="col-span-2">
          <FieldLabel htmlFor="title">Job Title</FieldLabel>
          <Controller
            control={form.control}
            name="title"
            render={({ field, fieldState }) => (
              <>
                <Input
                  id="title"
                  placeholder="e.g. Senior Frontend Engineer"
                  {...field}
                />
                <FieldError
                  errors={fieldState.error ? [fieldState.error] : []}
                />
              </>
            )}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="type">Job Type</FieldLabel>
          <Controller
            control={form.control}
            name="type"
            render={({ field, fieldState }) => (
              <>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full Time</SelectItem>
                    <SelectItem value="part-time">Part Time</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError
                  errors={fieldState.error ? [fieldState.error] : []}
                />
              </>
            )}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="experience_level">Experience Level</FieldLabel>
          <Controller
            control={form.control}
            name="experience_level"
            render={({ field, fieldState }) => (
              <>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger id="experience_level">
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Junior</SelectItem>
                    <SelectItem value="mid-level">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError
                  errors={fieldState.error ? [fieldState.error] : []}
                />
              </>
            )}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="location_requirement">
            Location Requirement
          </FieldLabel>
          <Controller
            control={form.control}
            name="location_requirement"
            render={({ field, fieldState }) => (
              <>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger id="location_requirement">
                    <SelectValue placeholder="Select location requirement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-office">In Office</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError
                  errors={fieldState.error ? [fieldState.error] : []}
                />
              </>
            )}
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="city">City</FieldLabel>
            <Controller
              control={form.control}
              name="city"
              render={({ field, fieldState }) => (
                <>
                  <Input
                    id="city"
                    placeholder="e.g. San Francisco"
                    {...field}
                    value={field.value || ""}
                  />
                  <FieldError
                    errors={fieldState.error ? [fieldState.error] : []}
                  />
                </>
              )}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="state_abbreviation">State (Abbr)</FieldLabel>
            <Controller
              control={form.control}
              name="state_abbreviation"
              render={({ field, fieldState }) => (
                <>
                  <Input
                    id="state_abbreviation"
                    placeholder="e.g. CA"
                    maxLength={2}
                    {...field}
                    value={field.value || ""}
                  />
                  <FieldError
                    errors={fieldState.error ? [fieldState.error] : []}
                  />
                </>
              )}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="wage">Wage</FieldLabel>
            <Controller
              control={form.control}
              name="wage"
              render={({ field, fieldState }) => (
                <>
                  <Input
                    id="wage"
                    type="number"
                    placeholder="e.g. 120000"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    value={field.value || ""}
                  />
                  <FieldError
                    errors={fieldState.error ? [fieldState.error] : []}
                  />
                </>
              )}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="wage_interval">Interval</FieldLabel>
            <Controller
              control={form.control}
              name="wage_interval"
              render={({ field, fieldState }) => (
                <>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || undefined}
                  >
                    <SelectTrigger id="wage_interval">
                      <SelectValue placeholder="Select interval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError
                    errors={fieldState.error ? [fieldState.error] : []}
                  />
                </>
              )}
            />
          </Field>
        </div>

        <Field className="col-span-2">
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Controller
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <>
                <div className="min-h-[300px] border rounded-md overflow-hidden bg-background">
                  <MarkdownEditor
                    markdown={field.value || ""}
                    onChange={field.onChange}
                  />
                </div>
                <FieldError
                  errors={fieldState.error ? [fieldState.error] : []}
                />
              </>
            )}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="status">Status</FieldLabel>
          <Controller
            control={form.control}
            name="status"
            render={({ field, fieldState }) => (
              <>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="delisted">Delisted</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Published jobs are visible to all candidates.
                </p>
                <FieldError
                  errors={fieldState.error ? [fieldState.error] : []}
                />
              </>
            )}
          />
        </Field>

        <Field className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
          <Controller
            control={form.control}
            name="is_featured"
            render={({ field }) => (
              <Checkbox
                id="is_featured"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <div className="space-y-1 leading-none">
            <FieldLabel htmlFor="is_featured">Featured Job</FieldLabel>
            <p className="text-sm text-muted-foreground">
              Featured jobs are highlighted and appear at the top of lists.
            </p>
          </div>
        </Field>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        <LoadingSwap isLoading={isSubmitting || false}>
          {initialData ? "Update Job Listing" : "Create Job Listing"}
        </LoadingSwap>
      </Button>
    </form>
  );
}
