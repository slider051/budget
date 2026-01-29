import { useState } from "react";

export function useLocalStorage() {
  const [isClient] = useState(() => typeof window !== "undefined");

  return isClient;
}
