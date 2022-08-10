import { withIronSessionSsr } from "iron-session/next";
import { GetServerSidePropsResult } from "next";
import { ApiURL } from "../config";
import { sessionOptions } from "./session";

type IHandler = (
  result
) => Promise<GetServerSidePropsResult<any>>;

export default function withPlanLimits(handler: IHandler): (context) => Promise<GetServerSidePropsResult<any>> {
  return async (context) => {
    const result = await withIronSessionSsr(async ({ req, res }) => {
      const result = await fetch(`${ApiURL}/user-plan-limits`, {
        headers: {
          Authorization: req.session.user.token,
        },
      });
      const data = await result.json();

      return {
        props: {
          planLimits: data
        },
      };
    }, sessionOptions)(context);
    return handler(result);
  };
}