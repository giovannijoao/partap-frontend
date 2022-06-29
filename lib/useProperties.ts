import useSWR from "swr";
import { AxiosResponse } from "axios";
import { ApiInstance } from "../services/api";
import { IPropertyResponse } from "../pages/interfaces/IProperty";
import { IUser } from "../pages/api/user";
import useUser from "./useUser";

type UsePropertiesProps = {
  addressFilter: string;
};

type PropertyInformationResponse = AxiosResponse<{
  data: Array<IPropertyResponse>;
}>;

export default function useProperties({
  addressFilter,
}: UsePropertiesProps) {
  const { user } = useUser();
  // We do a request to /api/events only if the user is logged in
  const { data: properties } = useSWR<PropertyInformationResponse>(
    user?.isLoggedIn ? ["/properties", addressFilter] : null,
    (url, args) =>
      ApiInstance.get(url, {
        params: {
          ...(args && { address: args }),
        },
        headers: {
          Authorization: user.token
        },
      }),
    {
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        if (retryCount >= 10) return;
        revalidate({ retryCount });
      },
    }
  );
  return { properties };
}
