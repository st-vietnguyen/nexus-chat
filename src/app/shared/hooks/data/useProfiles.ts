import useSWR from 'swr';
import { useAuth } from '@app/shared/contexts/auth.context';
import { getProfiles, type Profile } from '@app/core/services/profile.service';

const EMPTY: Profile[] = [];

export const useProfiles = () => {
  const { user } = useAuth();

  const { data, error, isLoading } = useSWR(
    user ? ['profiles', user.id] : null,
    () => getProfiles(user!.id),
  );

  return { profiles: data ?? EMPTY, error, isLoading: !user || isLoading };
};
