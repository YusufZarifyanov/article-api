interface INameLike {
  firstName: string;
  lastName: string;
  middleName: string | null;
}

export const joinFullName = (user: INameLike): string =>
  `${user.lastName || ''} ${user.firstName || ''} ${user.middleName || ''}`.trim();
