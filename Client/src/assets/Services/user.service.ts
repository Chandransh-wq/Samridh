import type { folder } from "../DemoData";

import { apiRequest, privateApi } from "./basic";

export const allFolders = async () => {
  const res = await apiRequest(privateApi, "get", "/user/getAll");
  console.log(res);
  return res;
};

export const createFolder = async (credentials: folder, darkMode: boolean) => {
  const res = await apiRequest(
    privateApi,
    "post",
    "/user/folder-create",
    credentials
  );
  console.log(credentials);
  console.log(res);
};
