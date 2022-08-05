import React from "react"
export interface IProperty {
  address: string;
  isRent: boolean;
  isSell: boolean;
  modo?: 'aluguel' | 'compra' | 'both';
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
  share: {
    token: string;
    users: {
      _id: string;
      name: string;
    }[]
  };
  user: {
    _id: string;
    name: string;
  };
  provider: string | "own";
  url?: string;
  isAvailable: boolean;
  messages: {
    user: {
      _id: string;
      name: string;
    }
    message: string;
    _id: string;
    date: string;
  }[]
  contactInfo: {
    description?: string
  }
}

export interface IPropertySaved extends IProperty {
  _id?: string;
  costs: {
    rentValue?: number;
    condominiumValue?: number;
    iptuValue?: number;
    sellPrice?: number;
    totalCost?: number;
  };
}

export default function DefaultComponent() {
  return <div />;
}