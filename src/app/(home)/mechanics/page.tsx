import { ServicesAPIService } from '@/services/(home)/services/services.service';
import MechanicsListView from '@/views/(home)/mechanics-list/mechanic-list.view';
import { getQueryClient } from '@/utils/react-query.util';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

const servicesAPIService = new ServicesAPIService('server');

export default async function Page() {
  // ======================Query Client=======================
  const queryClient = getQueryClient();

  // ======================Prefetch Queries=======================
  await queryClient.prefetchQuery({
    queryKey: [ServicesAPIService.keyFactory.getCategoryServices],
    queryFn: () => servicesAPIService.getCategoryServices(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MechanicsListView />
    </HydrationBoundary>
  );
}
