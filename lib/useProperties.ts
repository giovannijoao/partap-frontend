import useSWR, { mutate } from "swr";
import { AxiosResponse } from "axios";
import { ApiInstance } from "../services/api";
import { IPropertySaved } from "../pages/interfaces/IProperty";
import { IUser } from "../pages/api/user";
import useUser from "./useUser";
import { useCallback } from "react";

type IFilters = {
  address?: string;
  isAvailable?: boolean[];
};

type UsePropertiesProps = {
  filters?: IFilters;
  fallback?: PropertyInformationResponse
};

type PropertyInformationResponse = {
  data: Array<IPropertySaved>;
};

export default function useProperties({
  filters,
  fallback,
}: UsePropertiesProps) {
  const { user } = useUser();

   const fetchProperty = useCallback(
     (url: string, args) =>
       ApiInstance.get(url, {
         params: {
           ...args,
         },
         headers: {
           Authorization: user.token,
         },
       }).then((res) => res.data),
     [user?.token]
   );


  // We do a request to /api/events only if the user is logged in
  const { data: properties } = useSWR<PropertyInformationResponse>(
    user?.isLoggedIn ? ["/properties", filters] : null,
    (url, args) => fetchProperty(url, args),
    {
      errorRetryInterval: 5000,
      fallbackData: fallback
    }
  );

   const mutateProperties = useCallback(
     (filters: IFilters) => {
       if (!user?.isLoggedIn) return;
       mutate(["/properties", filters], () => fetchProperty(`/properties`, filters), {
         populateCache: true,
       });
     },
     [user, fetchProperty]
   );

  return { properties, mutateProperties };
}
