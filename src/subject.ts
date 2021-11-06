type Observer = () => void;

export interface ISubject {
  subscribe(o: Observer): () => void;
  unsubscribe(o: Observer): void;
  notify(): void;
}

export class Subject implements ISubject {
  protected observers = new Set<Observer>();

  subscribe(o: Observer) {
    this.observers.add(o);
    return () => this.unsubscribe(o);
  }

  unsubscribe(o: Observer) {
    this.observers.delete(o);
  }

  notify() {
    this.observers.forEach((d) => d());
  }
}
