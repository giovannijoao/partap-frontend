import axios from "axios";
import { ApiURL } from "../config";
import { parseCookies } from "nookies";
import { cookiesCtx } from "../contexts/AuthContext";

export const ApiInstance = axios.create({
  baseURL: ApiURL,
});

const { token } = parseCookies(undefined);
if (token) {
  ApiInstance.defaults.headers['Authorization'] = token;
}
