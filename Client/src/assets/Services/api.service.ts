import { toast } from "../../utils/Toast";
import { apiRequest, publicApi } from "./basic";

export interface responseProps {
  query: string;
  answer: string;
  mode: string;
}

export interface summarizeProps {
  text: string;
  mode: string;
}

export interface expandProps {
  text: string;
  mode: string;
}

export const searchWeb = async (
  query: string,
  darkMode: boolean,
  setLoading: (val: boolean) => void, // Pass the state setter here
) => {
  try {
    setLoading(true); // Start loading in UI

    const response: responseProps = await apiRequest(
      publicApi,
      "get",
      `api/scrape?query=${encodeURIComponent(query)}`,
    );

    toast.success("Retrieved Successfully", "", darkMode);
    console.log("Search results:", response);

    return response.answer;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Search failed";
    toast.error("Error", errorMessage, darkMode);
    return null;
  } finally {
    setLoading(false); // Stop loading regardless of success or error
  }
};

export const summarize = async (
  credintials: expandProps,
  darkMode: boolean,
) => {
  try {
    const response: any = await apiRequest(
      publicApi,
      "post",
      `/api/expand`,
      credintials,
    );

    toast.success("Retrieved Successfully", "", darkMode);
    console.log("Search results:", response);

    return response.summary;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Search failed";
    toast.error("Error", errorMessage, darkMode);
    return null;
  }
};

export const expand = async (
  credintials: summarizeProps,
  darkMode: boolean,
) => {
  try {
    const response: any = await apiRequest(
      publicApi,
      "post",
      `/api/summarize`,
      credintials,
    );

    toast.success("Retrieved Successfully", "", darkMode);
    console.log("Search results:", response);

    return response.summary;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Search failed";
    toast.error("Error", errorMessage, darkMode);
    return null;
  }
};
