---
title: Apollo GraphQL
icon: hexagon
description: Apollo Server로 코드 우선 GraphQL 구현
---

Apollo 패키지는 타입, 리졸버, 쿼리, 뮤테이션을 위한 데코레이터로 GraphQL API를 코드 우선 방식으로 구축할 수 있는 기능을 제공합니다.

## 설치

```bash
bun add @apollo/server graphql graphql-ws
```

## 설정

애플리케이션에 GraphQL 모듈을 등록합니다:

```typescript
import { Module } from "nestelia";
import { GraphQLModule } from "nestelia/apollo";

@Module({
  imports: [
    GraphQLModule.forRoot({
      playground: true,
    }),
    UserModule,
  ],
})
class AppModule {}
```

## 타입 정의

### 객체 타입

```typescript
import { ObjectType, Field } from "nestelia/apollo";

@ObjectType()
class User {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  email?: string;
}
```

### 입력 타입

```typescript
import { InputType, Field } from "nestelia/apollo";

@InputType()
class CreateUserInput {
  @Field()
  name: string;

  @Field()
  email: string;
}
```

### 열거형

`registerEnumType`으로 열거형을 등록하고 `@Field()`에 항상 명시적인 타입 팩토리를 전달하세요.
TypeScript는 열거형 필드에 대해 `design:type`으로 `String` 또는 `Number`를 내보내기 때문에 스키마 빌더가 자동으로 열거형 타입을 추론할 수 없습니다.

```typescript
import { registerEnumType } from "nestelia/apollo";

enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
}

registerEnumType(Role, { name: "Role", description: "User role" });

@ObjectType()
class User {
  @Field()
  name: string;

  // 열거형 필드에는 명시적인 타입 팩토리가 필요합니다
  @Field(() => Role)
  role: Role;
}
```

### 유니온 타입

코드 우선 유니온 타입에는 `createUnionType`을 사용합니다. `resolveType` 함수는 타입 이름 문자열이나 클래스 생성자를 반환할 수 있습니다.

```typescript
import { createUnionType } from "nestelia/apollo";

@ObjectType()
class Cat {
  @Field()
  meow: string;
}

@ObjectType()
class Dog {
  @Field()
  bark: string;
}

const PetUnion = createUnionType({
  name: "PetUnion",
  types: () => [Cat, Dog] as const,
  resolveType(value) {
    return "meow" in value ? Cat : Dog;
  },
});

@ObjectType()
class Owner {
  @Field(() => PetUnion)
  pet: typeof PetUnion;
}
```

### 커스텀 스칼라

```typescript
import { Scalar } from "nestelia/apollo";

@Scalar("DateTime")
class DateTimeScalar {
  description = "ISO 8601 date-time string";

  serialize(value: Date) {
    return value.toISOString();
  }

  parseValue(value: string) {
    return new Date(value);
  }
}
```

### 내장 스칼라

추가 설정 없이 바로 사용할 수 있는 6개의 스칼라가 포함되어 있습니다:

| 스칼라 | GraphQL 타입 | JS 타입 | 설명 |
|--------|-------------|---------|------|
| `GraphQLDateTime` | `DateTime` | `Date` | ISO 8601 문자열 ↔ JS Date |
| `GraphQLJSON` | `JSON` | `any` | 모든 JSON 값 |
| `GraphQLURL` | `URL` | `string` | 유효성이 검증된 URL 문자열 |
| `GraphQLBigInt` | `BigInt` | `bigint` | 64비트 정수, 문자열로 직렬화 |
| `GraphQLEmailAddress` | `EmailAddress` | `string` | 유효성이 검증된 이메일 주소 |
| `GraphQLUUID` | `UUID` | `string` | UUID, 소문자로 정규화 |

```typescript
import { GraphQLDateTime, GraphQLEmailAddress, GraphQLJSON, GraphQLUUID } from "nestelia/apollo";

@ObjectType()
class User {
  @Field(() => GraphQLUUID)
  id!: string;

  @Field(() => GraphQLEmailAddress)
  email!: string;

  @Field(() => GraphQLDateTime)
  createdAt!: Date;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, unknown>;
}
```

## Args 타입

`@ArgsType()`은 클래스의 `@Field()` 프로퍼티를 스키마에서 개별 최상위 인수로 펼칩니다 — 래퍼 입력 객체가 필요 없습니다. 이름 없이 `@Args()`와 함께 사용하세요:

```typescript
import { ArgsType, Field, Int } from "nestelia/apollo";

@ArgsType()
class BooksArgs {
  @Field(() => Int, { nullable: true, defaultValue: 0 })
  offset!: number;

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  limit!: number;
}

@Resolver(() => Book)
class BooksResolver {
  @Query(() => [Book])
  books(@Args() args: BooksArgs): Book[] {
    return this.store.slice(args.offset, args.offset + args.limit);
  }
}
```

## 페이지네이션

### 오프셋 기반

`Paginated(ItemType)`은 `items`, `total`, `hasNextPage`, `hasPreviousPage`를 포함하는 페이지네이션 응답을 생성합니다:

```typescript
import { Paginated, Int } from "nestelia/apollo";

@ObjectType()
class BooksPage extends Paginated(Book) {}

@Query(() => BooksPage)
books(@Args() args: BooksArgs): BooksPage {
  const items = this.store.slice(args.offset, args.offset + args.limit);
  return {
    items,
    total: this.store.length,
    hasNextPage: args.offset + args.limit < this.store.length,
    hasPreviousPage: args.offset > 0,
  };
}
```

### Relay (커서 기반)

```typescript
import { createEdgeType, createConnectionType, PageInfo } from "nestelia/apollo";

@ObjectType()
class BookEdge extends createEdgeType(Book) {}

@ObjectType()
class BookConnection extends createConnectionType(Book, BookEdge) {}

@Query(() => BookConnection)
booksConnection(@Args("first", { type: () => Int }) first: number): BookConnection {
  const edges = this.store.slice(0, first).map((book, i) => ({
    node: book,
    cursor: Buffer.from(String(i)).toString("base64"),
  }));
  return {
    edges,
    pageInfo: { hasNextPage: first < this.store.length, hasPreviousPage: false,
      startCursor: edges[0]?.cursor, endCursor: edges.at(-1)?.cursor },
    totalCount: this.store.length,
  };
}
```

## 리졸버

`@Resolver()` 데코레이터로 GraphQL 리졸버를 정의합니다:

```typescript
import { Resolver, Query, Mutation, Args } from "nestelia/apollo";
import { Injectable, Inject } from "nestelia";

@Resolver(() => User)
@Injectable()
class UserResolver {
  constructor(@Inject(UserService) private userService: UserService) {}

  @Query(() => [User])
  async users() {
    return this.userService.findAll();
  }

  @Query(() => User)
  async user(@Args("id") id: string) {
    return this.userService.findById(id);
  }

  @Mutation(() => User)
  async createUser(@Args("input") input: CreateUserInput) {
    return this.userService.create(input);
  }
}
```

## 필드 리졸버

`@FieldResolver()` (또는 `@ResolveField()` 별칭)를 사용해 중첩 필드를 해결합니다:

```typescript
import { Resolver, FieldResolver, Parent } from "nestelia/apollo";

@Resolver(() => Post)
class PostResolver {
  @FieldResolver()
  async author(@Parent() post: Post) {
    return this.userService.findById(post.authorId);
  }
}
```

## 구독

```typescript
import { Resolver, Subscription } from "nestelia/apollo";

@Resolver(() => User)
class UserResolver {
  @Subscription(() => User)
  userCreated() {
    return pubsub.asyncIterator("USER_CREATED");
  }
}
```

## 컨텍스트 및 Info

```typescript
import { Context, Info } from "nestelia/apollo";

@Query(() => User)
async me(@Context("user") user: User, @Info() info: GraphQLResolveInfo) {
  return user;
}
```

## 파일 업로드

Nestelia는 [GraphQL multipart request 스펙](https://github.com/jaydenseric/graphql-multipart-request-spec)을 구현합니다.
추가 패키지 불필요 — `GraphQLUpload`와 `UploadedFile`이 내장되어 있습니다.

### 단일 파일

```typescript
import { GraphQLUpload, type UploadedFile } from "nestelia/apollo";

@Mutation(() => UploadResult)
async uploadFile(
  @Args("file", { type: () => GraphQLUpload }) file: Promise<UploadedFile>,
): Promise<UploadResult> {
  const upload = await file;
  // upload.filename, upload.mimetype, upload.size, upload.stream
  return { filename: upload.filename, mimetype: upload.mimetype, size: upload.size };
}
```

### 여러 파일

```typescript
@Mutation(() => MultiUploadResult)
async uploadFiles(
  @Args("files", { type: () => [GraphQLUpload] }) files: Promise<UploadedFile>[],
): Promise<MultiUploadResult> {
  const uploads = await Promise.all(files);
  return {
    count: uploads.length,
    totalSize: uploads.reduce((sum, f) => sum + f.size, 0),
  };
}
```

### 디스크로 스트리밍

```typescript
import { createWriteStream } from "node:fs";
import { Writable } from "node:stream";

@Mutation(() => UploadResult)
async uploadFile(
  @Args("file", { type: () => GraphQLUpload }) file: Promise<UploadedFile>,
): Promise<UploadResult> {
  const upload = await file;
  const dest = createWriteStream(`./uploads/${upload.filename}`);
  await upload.stream.pipeTo(Writable.toWeb(dest));
  return { filename: upload.filename, mimetype: upload.mimetype, size: upload.size };
}
```

### multipart 요청 예시

```
operations: {"query":"mutation($file:Upload!){uploadFile(file:$file){filename size}}","variables":{"file":null}}
map:        {"0":["variables.file"]}
0:          <binary file data>
```

### `UploadedFile` 인터페이스

| 속성 | 타입 | 설명 |
|------|------|------|
| `filename` | `string` | 원본 파일명 |
| `mimetype` | `string` | MIME 타입 |
| `size` | `number` | 바이트 단위 크기 |
| `stream` | `ReadableStream` | Web Streams 읽기 스트림 |
| `blob()` | `Promise<Blob>` | Blob으로 읽기 |
| `arrayBuffer()` | `Promise<ArrayBuffer>` | ArrayBuffer로 읽기 |
| `text()` | `Promise<string>` | 문자열로 읽기 |

### 업로드 제한

`UploadOptions` 객체를 `processMultipartRequest`의 두 번째 인수로 전달합니다:

```typescript
import { processMultipartRequest, type UploadOptions } from "nestelia/apollo";

const options: UploadOptions = {
  maxFiles: 5,              // 요청당 최대 파일 수 (기본값: 10)
  maxFileSize: 10_485_760,  // 파일당 10 MB
};

const operations = await processMultipartRequest(body, options);
```

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `maxFiles` | `number` | `10` | 요청당 최대 파일 수 |
| `maxFileSize` | `number` | — | 파일당 최대 바이트 수. 생략 시 제한 없음 |

## 리졸버에 가드 적용

```typescript
import { UseGuards } from "nestelia";

@Resolver(() => User)
class AdminResolver {
  @Query(() => [User])
  @UseGuards(AdminGuard)
  async allUsers() {
    return this.userService.findAll();
  }
}
```
