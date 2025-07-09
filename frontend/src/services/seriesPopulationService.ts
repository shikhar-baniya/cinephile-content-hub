// Service to track series population status
class SeriesPopulationService {
  private populatingSeriesIds = new Set<string>();
  private listeners = new Set<() => void>();
  private completionListeners = new Set<(seriesId: string) => void>();

  addPopulatingId(seriesId: string) {
    this.populatingSeriesIds.add(seriesId);
    this.notifyListeners();
  }

  removePopulatingId(seriesId: string) {
    this.populatingSeriesIds.delete(seriesId);
    this.notifyListeners();
    this.notifyCompletionListeners(seriesId);
  }

  isPopulating(seriesId: string): boolean {
    return this.populatingSeriesIds.has(seriesId);
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  subscribeToCompletion(listener: (seriesId: string) => void) {
    this.completionListeners.add(listener);
    return () => this.completionListeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  private notifyCompletionListeners(seriesId: string) {
    this.completionListeners.forEach(listener => listener(seriesId));
  }
}

export const seriesPopulationService = new SeriesPopulationService();
