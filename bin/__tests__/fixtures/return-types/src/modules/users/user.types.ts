export interface User {
  id: string;
  name: string;
  email: string | null;
}

export type UserWithPosts = User & {
  posts: { title: string; body: string }[];
};
