import axios from "axios";
import { ApiURL } from "../config";

export const ApiInstance = axios.create({
  baseURL: ApiURL
});