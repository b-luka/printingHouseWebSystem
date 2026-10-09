export interface Offer {
  _id?: string;
  printerId: {
    _id: string;
    institutionName?: string;
    username?: string;
  } | string;
  totalPrice: number;
  offerDate: string;
  isWinning: boolean;
}

export interface RequestedProduct {
  _id?: string;
  category: string;
  name: string;
  quantity: number;
}

export interface Procurement {
  _id: string;
  clientLegalId: string;
  items: RequestedProduct[];
  createdAt: string;
  isActive: boolean;
  offers: Offer[];
}
