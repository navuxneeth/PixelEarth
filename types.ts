export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MapLocation extends Coordinates {
  title?: string;
  address?: string;
  zoom?: number;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface SearchResult {
  text: string;
  location?: MapLocation;
  sources?: GroundingSource[];
}

export interface Message {
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
  location?: MapLocation; // If the message references a specific location
}

export enum MapMode {
  SATELLITE = 'satellite',
  STREET = 'street',
}
