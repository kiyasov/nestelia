import { Field, Int, ObjectType } from "../../../packages/apollo/src";

@ObjectType()
export class Notification {
  @Field(() => Int)
  id!: number;

  @Field(() => String)
  message!: string;

  @Field(() => String)
  createdAt!: string;
}
