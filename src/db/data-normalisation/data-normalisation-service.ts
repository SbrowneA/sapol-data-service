export class DataNormalisationService {
  getStreetAndSuburbNormalised() {

  }


  /**
   * returns the street name WITHOUT the street type suffix
   */
  normalizeStreetName(name: string) {
    return name
      .toUpperCase()
      .replace(/\b(ROAD|RD|STREET|ST|AVENUE|AVE)\b/g, '')
      .trim();
  }
}