import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { sessionOptions } from "../../lib/session";

export interface IUser {
  isLoggedIn: boolean;
  token?: string;
  name?: string;
  email?: string;
}

export default withIronSessionApiRoute(userRoute, sessionOptions);

async function userRoute(req: NextApiRequest, res: NextApiResponse<IUser>) {
  if (req.session.user) {
    // in a real world application you might read the user id from the session and then do a database request
    // to get more information on the user if needed
    console.log(18, req.session)
    res.json({
      ...req.session.user,
      isLoggedIn: true,
    });
  } else {
    res.json({
      isLoggedIn: false,
    });
  }
}