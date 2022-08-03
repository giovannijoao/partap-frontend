import useSWR, { mutate } from "swr";
import { ApiInstance } from "../services/api";
import { IPropertySaved } from "../pages/interfaces/IProperty";
import useUser from "./useUser";
import { useCallback } from "react";
interface UsePropertyProps {
  propertyId?: string,
  token?: string;
}

type PropertyInformationResponse = {
  address: string;
  places: Array<{
    name: string;
    place_id: string;
    types: string[];
    address: string;
    icon: string;
    icon_background_color: string;
  }>
};

export default function useNearbyData({ propertyId, token }: UsePropertyProps = {}) {
  const { user } = useUser();

  const fetchProperty = useCallback((url: string) =>
    ApiInstance.get(url, {
      headers: {
        Authorization: user.token,
      },
    }).then(res => res.data)
  , [user]);

  const { data: nearbyData } =
    useSWR<PropertyInformationResponse>(
      user?.isLoggedIn && propertyId ? `/nearby-places/${propertyId}${token ? `?token=${token}` : ``}` : null,
      (url) =>
        fetchProperty(url),
      {
        onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
          // TODO: implementar logica para nao buscar mais caso a propriedade nao exista
          if (retryCount >= 10) return;
          revalidate({ retryCount });
        },
      }
    );

  return { nearbyData };
}
