import { useCallback } from "react";
import useSWR from "swr";
import { IPropertySaved } from "../pages/interfaces/IProperty";
import { ApiInstance } from "../services/api";
import useUser from "./useUser";

type IFilters = {
  address?: string;
  isAvailable?: boolean[];
};

type UsePropertiesProps = {
  filters?: IFilters;
  fallback?: BoardsResponse
};

type BoardsResponse = {
  data: Array<{
    _id: string;
    cards: [{
      id: string;
      index: number
    }]
  }>;
};

export default function useBoards({
  filters,
  fallback,
}: UsePropertiesProps) {
  const { user } = useUser();

   const fetchBoard = useCallback(
     (url: string, args) =>
       ApiInstance.get(url, {
         params: {
           ...args,
         },
         headers: {
           Authorization: user.token as unknown as string,
         },
       }).then((res) => res.data),
     [user?.token]
   );

  // We do a request to /api/events only if the user is logged in
  const { data: boards } = useSWR<BoardsResponse>(
    user?.isLoggedIn ? ["/boards", filters] : null,
    (url, args) => fetchBoard(url, args),
    {
      errorRetryInterval: 5000,
      fallbackData: fallback
    }
  );

  return { boards };
}
