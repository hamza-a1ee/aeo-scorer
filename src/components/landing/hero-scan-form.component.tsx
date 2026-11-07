'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateScan } from '@/query/scan.query';
import { scanInputSchema, type TScanInput } from '@/schema/scan-input.schema';

interface IHeroScanFormProps {
  maxPages: number;
  maxQuestions: number;
}

export function HeroScanForm({ maxPages, maxQuestions }: IHeroScanFormProps) {
  const { mutate, isPending } = useCreateScan();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TScanInput>({
    resolver: zodResolver(scanInputSchema),
    defaultValues: { url: '' },
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit(values => mutate(values))}
      className="mt-4 flex w-full max-w-[680px] flex-col gap-2 text-left"
    >
      <Label htmlFor="url" className="text-sm font-medium">
        Your app&apos;s website
      </Label>
      <div className="flex flex-wrap gap-2 rounded-xl border border-strong-border bg-card p-2 shadow-[0_1px_2px_rgba(14,17,22,0.04),0_8px_24px_rgba(14,17,22,0.06)] focus-within:ring-[3px] focus-within:ring-ring/20">
        <Input
          id="url"
          type="text"
          inputMode="url"
          autoComplete="url"
          placeholder="https://yourapp.com"
          aria-invalid={!!errors.url}
          aria-describedby={errors.url ? 'url-error' : 'url-note'}
          className="h-auto min-w-0 flex-[1_1_280px] border-0 bg-transparent px-3 py-3 font-mono text-lg shadow-none focus-visible:ring-0 md:text-lg"
          {...register('url')}
        />
        <Button
          type="submit"
          disabled={isPending}
          className="min-h-[52px] flex-none rounded-md px-6 text-base font-semibold"
        >
          {isPending ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : null}
          Scan my site
          {!isPending ? <ArrowRight className="size-[18px]" aria-hidden /> : null}
        </Button>
      </div>
      {errors.url ? (
        <p id="url-error" role="alert" className="m-0 text-[13px] text-destructive-strong">
          {errors.url.message}
        </p>
      ) : null}
      <p id="url-note" className="m-0 text-[13px] text-muted-foreground">
        Up to {maxPages} pages and {maxQuestions} buyer questions per scan. One
        scan per domain per day. Takes 2–10 minutes.
      </p>
    </form>
  );
}
