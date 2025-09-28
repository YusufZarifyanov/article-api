export interface IGetArticleResponse {
  id: number;
  title: string;
  description: string;
  publicationDate: Date;
  author: {
    id: number;
    fullName: string;
  };
}
