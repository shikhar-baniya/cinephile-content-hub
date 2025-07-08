// Service to track series population status
class SeriesPopulationService {
  private populatingSeriesIds = new Set<string>();
  private listeners = new Set<() => void>();
  private completionListeners = new Set<(seriesId: string) => void>();

  addPopulatingId(seriesId: string) {
    console.log('📝 Adding series to populating list:', seriesId);
    this.populatingSeriesIds.add(seriesId);
    console.log('📝 Current populating series:', Array.from(this.populatingSeriesIds));
    this.notifyListeners();
  }

  removePopulatingId(seriesId: string) {
    console.log('🗑️ Removing series from populating list:', seriesId);
    this.populatingSeriesIds.delete(seriesId);
    console.log('🗑️ Remaining populating series:', Array.from(this.populatingSeriesIds));
    this.notifyListeners();
    this.notifyCompletionListeners(seriesId);
  }

  isPopulating(seriesId: string): boolean {
    const result = this.populatingSeriesIds.has(seriesId);
    console.log(`🔍 Checking if ${seriesId} is populating:`, result);
    return result;
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
