export interface ServiceId<T> {
  (...args: any[]): void;
  type: T;
}

interface Dependency {
  id: ServiceId<any>;
  index: number;
  optional?: boolean;
}

const DEPENDENCIES = '$dependencies';

export function getDependencies(target: any): Dependency[] {
  return target[DEPENDENCIES] || [];
}

function setDependency(target: any, dependency: Dependency) {
  if (target[DEPENDENCIES]) {
    target[DEPENDENCIES].push(dependency);
  } else {
    target[DEPENDENCIES] = [dependency];
  }
}

export function createDecorator<T>(serviceId: string): ServiceId<T> {
  const id = (<ParameterDecorator>function (target, _, index) {
    setDependency(target, { id, index, optional: false });
  }) as ServiceId<T>;
  id.toString = () => serviceId;
  return id;
}

export class Container {
  get() {}
}
