import { Field, Float, Int, ObjectType } from "../../../packages/apollo/src";

@ObjectType()
export class UploadResult {
  @Field(() => String)
  filename!: string;

  @Field(() => String)
  mimetype!: string;

  @Field(() => Int)
  size!: number;
}

@ObjectType()
export class MultiUploadResult {
  @Field(() => [UploadResult])
  files!: UploadResult[];

  @Field(() => Int)
  count!: number;

  @Field(() => Float)
  totalSize!: number;
}
