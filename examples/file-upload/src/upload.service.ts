import { Injectable } from "@kiyasov/elysia-nest";

export interface FileInfo {
  name: string;
  size: number;
  type: string;
}

@Injectable()
export class UploadService {
  async getFileInfo(file: File): Promise<FileInfo> {
    return {
      name: file.name,
      size: file.size,
      type: file.type,
    };
  }

  async getFilesInfo(files: File[]): Promise<FileInfo[]> {
    return Promise.all(files.map((f) => this.getFileInfo(f)));
  }
}
