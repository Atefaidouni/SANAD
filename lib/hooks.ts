"use client";

import { useEffect, useState } from "react";

/**
 * Reads URL query params on the client after mount. Avoids the Suspense
 * requirement of next/navigation's useSearchParams in statically-rendered
 * client pages — sufficient for our mock auth flows.
 */
export function useQueryParams(): URLSearchParams {
  const [params, setParams] = useState<URLSearchParams>(
    () => new URLSearchParams()
  );
  useEffect(() => {
    setParams(new URLSearchParams(window.location.search));
  }, []);
  return params;
}
