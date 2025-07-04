// Service to track series population status
class SeriesPopulationService {
  private populatingSeriesIds = new Set<string>();
  private listeners = new Set<() => void>();

  addPopulatingId(seriesId: string) {
    this.populatingSeriesIds.add(seriesId);
    this.notifyListeners();
  }

  removePopulatingId(seriesId: string) {
    this.populatingSeriesIds.delete(seriesId);
    this.notifyListeners();
  }

  isPopulating(seriesId: string): boolean {
    return this.populatingSeriesIds.has(seriesId);
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

export const seriesPopulationService = new SeriesPopulationService();
