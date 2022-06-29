export default interface IProperty {
  address: string;
  isRent: boolean;
  isSell: boolean;
  modo?: string;
  information: {
    bedrooms: number;
    parkingSlots: number;
    totalArea: number;
    description: string;
    acceptPets: boolean;
    isFurnished: boolean;
    nearSubway: boolean;
    floor: number;
    bathrooms: number;
  };
  costs: object;
  images: {
    url: string;
    description: string;
  }[];
  provider: string | "own";
  url?: string;
}

export interface IPropertyResponse extends IProperty {
  _id?: string;
  costs: {
    rentValue?: number;
    condominiumValue?: number;
    iptuValue?: number;
    sellPrice?: number;
    totalCost?: number;
  };
}