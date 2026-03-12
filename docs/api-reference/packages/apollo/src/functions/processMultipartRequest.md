# Function: processMultipartRequest()

```ts
function processMultipartRequest(body, options?): Promise<Record<string, unknown>>;
```

Defined in: [packages/apollo/src/upload.ts:249](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/upload.ts#L249)

Processes a GraphQL multipart request per the
[GraphQL multipart request spec](https://github.com/jaydenseric/graphql-multipart-request-spec).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `body` | `MultipartBody` | The multipart request body. |
| `options?` | [`UploadOptions`](../interfaces/UploadOptions.md) | Optional upload limits. |

## Returns

`Promise`\<`Record`\<`string`, `unknown`\>\>

Operations object with uploaded files injected.

## Throws

Error if 'operations' field is missing or limits are exceeded.
