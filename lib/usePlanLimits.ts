import useSWR from "swr";
import { AxiosResponse } from "axios";
import { ApiInstance } from "../services/api";
import { IPropertySaved } from "../pages/interfaces/IProperty";
import { IUser } from "../pages/api/user";
import useUser from "./useUser";
import { useCallback } from "react";

type LimitsResposne = {
  data: {
    plan: string;
    ads: boolean;
    properties: {
      unlimited: boolean;
      allowed: number;
      available?: number;
      totalCount?: number;
      unavailableCount?: number;
    };
    share: {
      unlimited: boolean;
      allowed: number;
      available?: number;
    };
  };
};

export default function usePlanLimits({
  fallback,
}) {
  const { user } = useUser();

   const fetchProperty = useCallback(
     (url: string) =>
       ApiInstance.get(url, {
         headers: {
           Authorization: user.token,
         },
       }).then((res) => res.data),
     [user?.token]
   );


  // We do a request to /api/events only if the user is logged in
  const { data: limitsData } = useSWR<LimitsResposne>(
    user?.isLoggedIn ? "/user-plan-limits" : null,
    (url) => fetchProperty(url),
    {
      fallbackData: fallback,
      errorRetryInterval: 5000
    }
  );

  return { limitsData };
}
