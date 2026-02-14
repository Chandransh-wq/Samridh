import type { sendPage } from "../../pages/FolderDesktop";
import { toast } from "../../utils/Toast";
import type { folder } from "../DemoData";
import { apiRequest, privateApi } from "./basic";

export interface resInt {
  data: folder[];
  message: string;
}

export const allFolders = async () => {
  try {
    const res: resInt = await apiRequest(privateApi, "get", "/user/getAll");
    console.log(res.data);
    return res.data;
  } catch (error: any) {
    console.error("Error fetching folders:", error);
    // Optional: toast.error("Error", "Could not load folders", false);
    return []; // Return empty array to prevent .map() crashes in UI
  }
};

export const createFolder = async (credentials: folder, darkMode: boolean) => {
  try {
    const res = await apiRequest(
      privateApi,
      "post",
      "/user/folder-create",
      credentials,
    );
    toast.success(
      "Folder created",
      `${credentials.title} has been successfully created`,
      darkMode,
    );
    return res;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to create folder";
    toast.error("Error", errorMessage, darkMode);
    console.error("Create folder error:", error);
  }
};

export const createPage = async (
  credintials: sendPage,
  darkMode: boolean,
  folderId: string,
) => {
  try {
    const cleanFolderId = folderId.trim();

    const res = await apiRequest(
      privateApi,
      "put",
      `/user/page-create/${cleanFolderId}`,
      credintials,
    );

    toast.success(
      "Success",
      `${credintials.title} has been created.`,
      darkMode,
    );
    return res;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to create page";
    toast.error("Error", errorMessage, darkMode);
    console.error("Create page error:", error);
  }
};
