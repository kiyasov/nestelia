import { Field, Int, ObjectType } from "../../../packages/apollo/src";

@ObjectType()
export class Book {
  @Field(() => Int)
  id!: number;

  @Field(() => String)
  title!: string;

  @Field(() => String)
  author!: string;
}
