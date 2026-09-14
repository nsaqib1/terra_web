import { apiClient } from "./client";

export interface UploadedMedia {
  id: string;
  type: string;
  status: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  size: number | null;
  originalFilename: string;
  storageKey: string;
  createdAt: string;
}

export const mediaApi = {
  async upload(
    file: File,
  ): Promise<UploadedMedia> {
    const formData = new FormData();

    formData.append(
      "file",
      file,
    );

    return apiClient.post<UploadedMedia>(
      "/media/upload",
      formData,
    );
  },
};