import { folderData, type Page, type folder } from "../assets/DemoData";

export const createFolder = (folder: folder) => {
  folderData.push(folder);
};

export const createPage = (page: Page, index: number) => {
  folderData[index].pages.push(page);
};
