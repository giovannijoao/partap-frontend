import useSWR from "swr";
import { AxiosResponse } from "axios";
import { ApiInstance } from "../services/api";
import { IPropertySaved } from "../pages/interfaces/IProperty";
import useUser from "./useUser";

interface UsePropertyProps {
  propertyId: string
}

type PropertyInformationResponse = AxiosResponse<{
  data: Array<IPropertySaved>;
}>;


export default function useProperty({ propertyId }: UsePropertyProps) {
  const { user } = useUser();
  // We do a request to /api/events only if the user is logged in
  const { data: property } = useSWR<PropertyInformationResponse>(
    user?.isLoggedIn ? `/properties/${propertyId}` : null,
    (url, args) =>
      ApiInstance.get(url, {
        headers: {
          Authorization: user.token,
        },
      }),
    {
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        // TODO: implementar logica para nao buscar mais caso a propriedade nao exista
        if (retryCount >= 10) return;
        revalidate({ retryCount });
      },
    }
  );
  return property?.data.data;
}
