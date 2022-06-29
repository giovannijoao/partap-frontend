export default interface IProperty {
  _id?: string;
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
  costs: {
    rentValue?: number;
    condominiumValue?: number;
    iptuValue?: number;
    sellPrice?: number;
    totalCost?: number;
  };
  images: {
    url: string;
    description: string;
  }[];
  provider: string | "own";
  url?: string;
}