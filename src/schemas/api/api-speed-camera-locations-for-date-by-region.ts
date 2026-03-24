type ApiCameraLocation = {
  cameraLocationId: number;
  resolvedLocationId: number;
  streetName: string;
  suburbName: string;
  suburbId: number;
  startDate: string;
  endDate: string;
  streetGeom: JSON;
  suburbGeom: JSON;
};

type ApiCameraLocationsByRegion = {
  locations: {
    country: ApiCameraLocation[];
    metro: ApiCameraLocation[];
  };
  dateRange: { startDate: string; endDate: string };
};

export type { ApiCameraLocation, ApiCameraLocationsByRegion };
