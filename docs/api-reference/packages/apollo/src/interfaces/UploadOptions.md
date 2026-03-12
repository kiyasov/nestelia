# Interface: UploadOptions

Defined in: [packages/apollo/src/upload.ts:227](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/upload.ts#L227)

Options for controlling file upload limits in a GraphQL multipart request.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="maxfiles"></a> `maxFiles?` | `number` | Maximum number of files allowed per request. **Default** `10` | [packages/apollo/src/upload.ts:232](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/upload.ts#L232) |
| <a id="maxfilesize"></a> `maxFileSize?` | `number` | Maximum allowed size per file in bytes. Requests containing a file that exceeds this limit will throw an error. | [packages/apollo/src/upload.ts:237](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/upload.ts#L237) |
