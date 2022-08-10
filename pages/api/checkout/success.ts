import { NextApiRequest, NextApiResponse } from "next";
import { ApiInstance } from "../../../services/api";

export default async function PlanCheckoutSuccess(req: NextApiRequest, res: NextApiResponse) {
  const result = await ApiInstance.post(
    "/subscription-plans/payment-processed",
    req.query
  );
  return res.redirect('/plans/checkout/success')
}