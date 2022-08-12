import { useCallback } from "react";
import useSWR from "swr";
import { ApiInstance } from "../services/api";
import useUser from "./useUser";

export type LimitsResponse = {
  data: {
    _id: string;
    text: string;
    isRead: boolean;
    createdAt: string;
    metadata: {
      propertyId?: string;
      highlight?: string[];
    }
  }[];
};

export default function useNotifications({ fallback }: { fallback?: LimitsResponse }) {
  const { user } = useUser();

  const fetch = useCallback(
    (url: string) =>
      ApiInstance.get(url, {
        headers: {
          Authorization: user.token,
        },
      }).then((res) => res.data),
    [user?.token]
  );

  // We do a request to /api/events only if the user is logged in
  const { data: notifications } = useSWR<LimitsResponse>(
    user?.isLoggedIn ? "/notifications" : null,
    (url) => fetch(url),
    {
      fallbackData: fallback,
      errorRetryInterval: 5000,
    }
  );

  return { notifications };
}
