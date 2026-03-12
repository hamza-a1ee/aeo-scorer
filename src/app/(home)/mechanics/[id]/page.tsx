import { HomeMechanicsService } from '@/services/(home)/mechanics/home-mechanics.service';
import { getQueryClient } from '@/utils/react-query.util';
import MechanicDetailsView from '@/views/(home)/mechanic-details/mechanic-details.view';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

const homeMechanicsService = new HomeMechanicsService('server');
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: [HomeMechanicsService.keyFactory.getHomeMechanics, id],
    queryFn: () => homeMechanicsService.getHomeMechanics({ id }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MechanicDetailsView id={id} />
    </HydrationBoundary>
  );
}
