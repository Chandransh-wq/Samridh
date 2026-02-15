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
    console.log(credintials);

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

export const updatePage = async (
  credintials: sendPage,
  darkMode: boolean,
  pageId: string,
) => {
  try {
    const cleanPageId = pageId.trim();
    console.log(credintials);
    const res = await apiRequest(
      privateApi,
      "patch",
      `/user/page-update/${cleanPageId}`,
      credintials,
    );

    toast.success(
      "Success",
      `${credintials.title} has been updated.`,
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

export const deletePage = async (
  pageId: string,
  darkMode: boolean,
  title: string,
) => {
  try {
    const cleanPageId = pageId.trim();
    toast.info("In Progress", `Page ${title} is being deleted`, darkMode);
    const res = await apiRequest(
      privateApi,
      "delete",
      `/user/page-delete/${cleanPageId}`,
    );
    toast.success("Success", `Page ${title} has been deleted.`, darkMode);
    return res;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to create page";
    toast.error("Error", errorMessage, darkMode);
    console.error("Create page error:", error);
  }
};

export const deleteFolder = async (
  folderId: string,
  darkMode: boolean,
  title: string,
) => {
  try {
    const cleanFolderId = folderId.trim();
    toast.info("In Progress", `Folder ${title} is being deleted`, darkMode);
    const res = await apiRequest(
      privateApi,
      "delete",
      `/user/folder-delete/${cleanFolderId}`,
    );
    toast.success("Success", `Folder ${title} has been deleted.`, darkMode);
    return res;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to create page";
    toast.error("Error", errorMessage, darkMode);
    console.error("Create page error:", error);
  }
};
