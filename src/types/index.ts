/** GPS-координаты в формате Decimal Degrees */
export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type Place = {
  id: string;
  name: string;
  description: string;
  visitlater: boolean;
  liked: boolean;
  /** Decimal Degrees; null если координаты ещё не заданы */
  dd: Coordinates | null;
  /** Локальные URI фотографий в файловой системе приложения */
  photos: string[];
  createdAt: string;
};

export type TripPlace = {
  id: string;
  tripId: string;
  placeId: string;
  /** Порядок в маршруте (начиная с 0) */
  order: number;
  visited: boolean;
  visitDate: string | null;
  notes: string;
  photos: string[];
};

export type Trip = {
  id: string;
  title: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
  places: TripPlace[];
  createdAt: string;
  current: boolean;
};

export type PlaceInput = {
  name: string;
  description?: string;
  visitlater?: boolean;
  liked?: boolean;
  dd?: Coordinates | null;
  photos?: string[];
};

export type TripInput = {
  title: string;
  description?: string;
  startDate?: string | null;
  endDate?: string | null;
  current?: boolean;
};

export type TripPlaceInput = {
  placeId: string;
  order?: number;
  visited?: boolean;
  visitDate?: string | null;
  notes?: string;
  photos?: string[];
};
