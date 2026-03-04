import { Controller, File, Files, Form, HttpCode, Post } from "@kiyasov/elysia-nest";

import type { FileInfo } from "./upload.service";
import { UploadService } from "./upload.service";

@Controller("/upload")
export class UploadController {
  constructor(private readonly uploads: UploadService) {}

  /**
   * POST /upload/single
   * Accepts a single file under the field name "file".
   *
   * curl -X POST http://localhost:3000/upload/single \
   *   -F "file=@/path/to/photo.jpg"
   */
  @Post("/single")
  @HttpCode(200)
  async uploadSingle(@File("file") file: File): Promise<FileInfo> {
    return this.uploads.getFileInfo(file);
  }

  /**
   * POST /upload/multiple
   * Accepts multiple files under the field name "files".
   *
   * curl -X POST http://localhost:3000/upload/multiple \
   *   -F "files=@photo1.jpg" -F "files=@photo2.jpg"
   */
  @Post("/multiple")
  @HttpCode(200)
  async uploadMultiple(
    @Files("files") files: File[],
  ): Promise<FileInfo[]> {
    return this.uploads.getFilesInfo(files);
  }

  /**
   * POST /upload/form
   * Accepts a form with a text field "name" and a file field "avatar".
   *
   * curl -X POST http://localhost:3000/upload/form \
   *   -F "name=John" -F "avatar=@avatar.png"
   */
  @Post("/form")
  @HttpCode(200)
  async uploadWithForm(
    @Form() data: { name: string },
    @File("avatar") avatar: File,
  ): Promise<{ name: string; avatar: FileInfo }> {
    return {
      name: data.name,
      avatar: await this.uploads.getFileInfo(avatar),
    };
  }

  /**
   * POST /upload/any
   * Picks up the first file found in the request, regardless of field name.
   *
   * curl -X POST http://localhost:3000/upload/any \
   *   -F "document=@report.pdf"
   */
  @Post("/any")
  @HttpCode(200)
  async uploadAny(@File() file: File | null): Promise<FileInfo | null> {
    if (!file) return null;
    return this.uploads.getFileInfo(file);
  }
}
