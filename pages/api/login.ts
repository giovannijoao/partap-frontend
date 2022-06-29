import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "../../lib/session";
import { NextApiRequest, NextApiResponse } from "next";
import { ApiInstance } from "../../services/api";

export default withIronSessionApiRoute(loginRoute, sessionOptions);

async function loginRoute(req: NextApiRequest, res: NextApiResponse) {
  const { email, password } = await req.body;

  try {

    const result = await ApiInstance.post(`/sessions`, {
      email,
      password,
    })

    const token = result.data.data.token;
    const userData = result.data.data.user;
    const user = { isLoggedIn: true, token, ...userData  };
    req.session.user = result.data.data.user;
    await req.session.save();
    res.json(user);
  } catch (error) {
    const customMessage = error.response?.data.message;
    res.status(500).json({ message: customMessage || error });
  }
}