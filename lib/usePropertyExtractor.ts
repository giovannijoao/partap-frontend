import useSWR, { mutate } from "swr";
import { ApiInstance } from "../services/api";
import { IPropertySaved } from "../pages/interfaces/IProperty";
import useUser from "./useUser";
import { useCallback } from "react";
interface UsePropertyExtractorProps {
  url?: string
}

type PropertyInformationResponse = {
  data: IPropertySaved;
};

export default function usePropertyExtractor({ url }: UsePropertyExtractorProps = {}) {
  const { user } = useUser();

  const fetchProperty = useCallback(
    (url: string) =>
      ApiInstance.get(url, {
        headers: {
          Authorization: user.token,
        },
      }).then((res) => res.data),
    [user]
  );

  const { data: property, error } = useSWR<PropertyInformationResponse>(
    user?.isLoggedIn && url ? `/properties-extractor?url=${url}` : null,
    (url) => fetchProperty(url),
    {
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        // TODO: implementar logica para nao buscar mais caso a propriedade nao exista
        if (retryCount >= 10) return;
        revalidate({ retryCount });
      },
    }
  );

  const mutatePropertyExtractor = useCallback(
    async (url: string) => {
      if (!user?.isLoggedIn) return;
      mutate(
        `/properties-extractor?url=${url}`,
        () => fetchProperty(`/properties-extractor?url=${url}`),
        {
          populateCache: true,
        }
      );
    },
    [user, fetchProperty]
  );

  return { property: property?.data, mutatePropertyExtractor, error };
}
