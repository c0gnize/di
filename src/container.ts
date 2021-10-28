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
  if (Array.isArray(target[DEPENDENCIES])) {
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

export interface IService {
  _serviceBadge?: undefined;
}

export const IServiceContainer =
  createDecorator<IServiceContainer>('IServiceContainer');

export interface IServiceContainer extends IService {}

export class Container implements IServiceContainer {
  _serviceBadge?: undefined;

  private services: Map<ServiceId<any>, any> = new Map();

  constructor(private parent?: Container) {
    this.services.set(IServiceContainer, this);
  }

  get<T>(id: ServiceId<T>): T {
    // if (!this.services.has(id)) {
    //   throw new Error(`Service ${id} does not exist`);
    // }
    return this.services.get(id) ?? this.parent?.get(id);
  }

  create<T>(ctor: any, args: any[] = []): T {
    let dependencies = getDependencies(ctor).sort((a, b) => a.index - b.index);
    let serviceArgs: any[] = [];
    for (const dependency of dependencies) {
      let service = this.get(dependency.id);
      if (!service && !dependency.optional) {
        throw new Error(
          `${ctor.name} depends on UNKNOWN service ${dependency.id}.`,
        );
      }
      serviceArgs.push(service);
    }

    let firstServiceArgPos =
      dependencies.length > 0 ? dependencies[0].index : args.length;

    if (args.length !== firstServiceArgPos) {
      console.warn(
        `First service dependency of ${ctor.name} at position ${
          firstServiceArgPos + 1
        } conflicts with ${args.length} static arguments`,
      );

      let delta = firstServiceArgPos - args.length;
      if (delta > 0) {
        args = args.concat(new Array(delta));
      } else {
        args = args.slice(0, firstServiceArgPos);
      }
    }

    return <T>new ctor(...[...args, ...serviceArgs]);
  }
}
