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
  board: {
    id?: string
    index: number
  }
}

export interface IPropertySaved extends IProperty {
  _id?: string;
  costs: Array<{
    costId: string;
    text: string;
    value: number;
  }>;
  totalCost: Array<{
    costId: string
    text: string;
    calc: string[]
    showInMainCard: {
      views: string[]
    }
  }>
}

export default function DefaultComponent() {
  return <div />;
}