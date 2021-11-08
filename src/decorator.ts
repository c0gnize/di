export interface IService {
  _service: undefined;
}

export interface ServiceId<T> extends ParameterDecorator {}

interface Dependency {
  id: ServiceId<unknown>;
  index: number;
}

const DEPS = '$deps';

export function getDeps(target: any): Dependency[] {
  return target[DEPS] || [];
}

function setDep(target: any, dependency: Dependency) {
  if (Array.isArray(target[DEPS])) {
    target[DEPS].push(dependency);
  } else {
    target[DEPS] = [dependency];
  }
}

export function decorator<T>(serviceId: string): ServiceId<T> {
  const id: ServiceId<T> = (target, _, index) => setDep(target, { id, index });
  id.toString = () => serviceId;
  return id;
}
