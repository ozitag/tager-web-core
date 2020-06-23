import { useRouter } from 'next/router';

import { getSearchParamsFromUrl } from '../utils/searchParams';

function useSearchParams(): URLSearchParams {
  const router = useRouter();

  return getSearchParamsFromUrl(router.asPath ?? '');
}

export default useSearchParams;
