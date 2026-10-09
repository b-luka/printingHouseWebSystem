export interface OrderItem {
    _id?: string;
    productId: string;
    productName: string;
    quantity: number;
    color: string;
    printServiceId?: string;
    printTypeName: string;
    artworkUrl?: string;
    artworkText?: string;
    itemTotalPrice: number;
}

export interface Order {
    _id: string;
    clientId: string;
    printerId: {
        _id: string;
        institutionName: string;
        headquartersAddress: string;
        city: string;
    };
    items: OrderItem[];
    totalAmount: number;
    status: string;
    createdAt: string;
}
