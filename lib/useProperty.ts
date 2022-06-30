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
  data: IPropertySaved;
};

export default function useProperty({ propertyId, token }: UsePropertyProps = {}) {
  const { user } = useUser();

  const fetchProperty = useCallback((url: string) =>
    ApiInstance.get(url, {
      headers: {
        Authorization: user.token,
      },
    }).then(res => res.data)
  , [user]);

  const { data: property } =
    useSWR<PropertyInformationResponse>(
      user?.isLoggedIn && propertyId ? `/properties/${propertyId}${token ? `?token=${token}` : ``}` : null,
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

  const mutateProperty = useCallback(
    (id: string) => {
      if (!user?.isLoggedIn) return;
      mutate(`/properties/${id}`, fetchProperty(`/properties/${id}`), {
        populateCache: true,
      });
    },
    [user, fetchProperty]
  );

  const propertyData = property?.data;
  let modo;
  if (propertyData) {
    if (propertyData.isRent && propertyData.isSell) modo = "";
    else if (propertyData.isRent) modo = "aluguel";
    else if (propertyData.isSell) modo = "compra";
    propertyData.modo = modo;
  }

  return { property: propertyData, mutateProperty };
}
