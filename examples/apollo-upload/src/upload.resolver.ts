import { Injectable } from "nestelia";
import {
  Args,
  Mutation,
  Query,
  Resolver,
} from "../../../packages/apollo/src";
import {
  GraphQLUpload,
  type UploadedFile,
} from "../../../packages/apollo/src/upload";

import { MultiUploadResult, UploadResult } from "./upload-result.type";

@Resolver()
@Injectable()
export class UploadResolver {
  /**
   * Health-check query so GraphQL schema has at least one Query field.
   */
  @Query(() => String)
  ping(): string {
    return "pong";
  }

  /**
   * Upload a single file.
   *
   * Example multipart request (graphql-multipart-request-spec):
   *
   *   operations: {"query":"mutation($file:Upload!){uploadFile(file:$file){filename mimetype size}}","variables":{"file":null}}
   *   map:        {"0":["variables.file"]}
   *   0:          <binary file data>
   */
  @Mutation(() => UploadResult)
  async uploadFile(
    @Args("file", { type: () => GraphQLUpload }) file: Promise<UploadedFile>,
  ): Promise<UploadResult> {
    const upload = await file;
    return {
      filename: upload.filename,
      mimetype: upload.mimetype,
      size: upload.size,
    };
  }

  /**
   * Upload multiple files at once.
   *
   * Example multipart request:
   *
   *   operations: {"query":"mutation($files:[Upload!]!){uploadFiles(files:$files){count totalSize files{filename size}}}","variables":{"files":[null,null]}}
   *   map:        {"0":["variables.files.0"],"1":["variables.files.1"]}
   *   0:          <binary file 1>
   *   1:          <binary file 2>
   */
  @Mutation(() => MultiUploadResult)
  async uploadFiles(
    @Args("files", { type: () => [GraphQLUpload] })
    files: Promise<UploadedFile>[],
  ): Promise<MultiUploadResult> {
    const uploads = await Promise.all(files);
    const results = uploads.map((u) => ({
      filename: u.filename,
      mimetype: u.mimetype,
      size: u.size,
    }));
    return {
      files: results,
      count: results.length,
      totalSize: results.reduce((sum, f) => sum + f.size, 0),
    };
  }
}
