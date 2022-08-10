import useSWRImmutable from "swr/immutable";
import { AxiosResponse } from "axios";
import { ApiInstance } from "../services/api";
import { IPropertySaved } from "../pages/interfaces/IProperty";
import { IUser } from "../pages/api/user";
import useUser from "./useUser";
import { useCallback } from "react";

type ICostFilter = {
  property: string;
  text: string;
};

type PropertyInformationResponse = {
  data: {
    costFilters: ICostFilter[]
  };
};

export default function useCostsFilters() {
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
  const { data: filtersCustomData } = useSWRImmutable<PropertyInformationResponse>(
    user?.isLoggedIn ? "/filters" : null,
    (url) => fetchProperty(url),
    {
      errorRetryInterval: 5000,
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        if (retryCount >= 10) return;
        revalidate({ retryCount });
      },
    }
  );

  return { filtersCustomData };
}
