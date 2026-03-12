import { QuoteRequestService } from '@/services/mechanic/quote-request/quote-request.service';
import { getQueryClient } from '@/utils/react-query.util';
import QuoteRequestView from '@/views/mechanic/(dashboard)/quote-request/quote-request.view';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

const mechanicQuoteRequestService = new QuoteRequestService('server');
export default async function Page() {
  // ======================Query Client=======================
  const queryClient = getQueryClient();

  // ======================Prefetch Queries=======================
  await queryClient.prefetchQuery({
    queryKey: [QuoteRequestService.keyFactory.getQuoteRequestCount],
    queryFn: () => mechanicQuoteRequestService.getQuoteRequestCount(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <QuoteRequestView />
    </HydrationBoundary>
  );
}
