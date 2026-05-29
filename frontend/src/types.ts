export type Card = {
  id?: number;
  userId?: number;
  accountNumber: string;
  ownerNameLatin: string;
  expirationDate: string;
  cvc: string;
};

export type User = {
  id: number;
  fullName: string;
  birthDate: string;
  workPlace?: string | null;
  cardsCount?: number;
  cards?: Card[];
};

export type UserFormData = {
  fullName: string;
  birthDate: string;
  workPlace: string;
  cards: Card[];
};
