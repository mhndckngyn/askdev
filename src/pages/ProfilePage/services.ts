import { ApiResponse, MemberProfile } from '@/types';
import fetcher from '@/utils/fetcher';

export function getProfileById(
  id: string,
): Promise<ApiResponse<MemberProfile>> {
  return fetcher({ method: 'GET', route: `/user/profile/${id}` });
}
