import useSWR from "swr";
import { AxiosResponse } from "axios";
import { ApiInstance } from "../services/api";
import { IPropertyResponse } from "../pages/interfaces/IProperty";
import { IUser } from "../pages/api/user";

type UsePropertiesProps = {
  addressFilter: string;
  user: IUser | undefined;
};

type PropertyInformationResponse = AxiosResponse<{
  data: Array<IPropertyResponse>;
}>;

export default function useProperties({
  addressFilter,
  user,
}: UsePropertiesProps) {
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
