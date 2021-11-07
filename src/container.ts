export interface ServiceId<T> {
  (...args: any[]): void;
  type: T;
}

interface Dependency {
  id: ServiceId<unknown>;
  index: number;
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
    setDependency(target, { id, index });
  }) as ServiceId<T>;
  id.toString = () => serviceId;
  return id;
}

export interface IService {
  _service: undefined;
}

/* prettier-ignore */
export type LeadingNonServiceArgs<A> =
  A extends [...IService[]] ? []
  : A extends [infer A1, ...IService[]] ? [A1]
  : A extends [infer A1, infer A2, ...IService[]] ? [A1, A2]
  : A extends [infer A1, infer A2, infer A3, ...IService[]] ? [A1, A2, A3]
  : A extends [infer A1, infer A2, infer A3, infer A4, ...IService[]] ? [A1, A2, A3, A4]
  : A extends [infer A1, infer A2, infer A3, infer A4, infer A5, ...IService[]] ? [A1, A2, A3, A4, A5]
  : A extends [infer A1, infer A2, infer A3, infer A4, infer A5, infer A6, ...IService[]] ? [A1, A2, A3, A4, A5, A6]
  : A extends [infer A1, infer A2, infer A3, infer A4, infer A5, infer A6, infer A7, ...IService[]] ? [A1, A2, A3, A4, A5, A6, A7]
  : never;
/* prettier-ignore-end */

interface ServiceItem<T> {
  ctor?: new (...args: any) => T;
  args?: any;
  instance?: T;
  singletone?: boolean;
}

export const IServiceContainer = createDecorator<IServiceContainer>('IServiceContainer');

export interface IServiceContainer extends IService {
  create<C extends new (...args: any[]) => any>(
    ctor: C,
    ...args: LeadingNonServiceArgs<ConstructorParameters<C>>
  ): InstanceType<C>;
  get<T>(id: ServiceId<T>): T;
}

export class Container implements IServiceContainer {
  declare _service: undefined;

  private services: Map<ServiceId<any>, ServiceItem<any>> = new Map();

  constructor(private parent?: Container) {
    this.setInstance(IServiceContainer, this);
  }

  createChild(): Container {
    return new Container(this);
  }

  set<T, C extends new (...args: any[]) => any>(
    id: ServiceId<T>,
    ctor: C,
    ...args: LeadingNonServiceArgs<ConstructorParameters<C>>
  ): this {
    this.throwIfExist(id);
    this.services.set(id, { ctor, args });
    return this;
  }

  setSingleton<T, C extends new (...args: any[]) => any>(
    id: ServiceId<T>,
    ctor: C,
    ...args: LeadingNonServiceArgs<ConstructorParameters<C>>
  ): this {
    this.throwIfExist(id);
    this.services.set(id, { ctor, args, singletone: true });
    return this;
  }

  setInstance<T>(id: ServiceId<T>, instance: T): this {
    this.throwIfExist(id);
    this.services.set(id, { instance });
    return this;
  }

  get<T>(id: ServiceId<T>): T {
    const service = this.services.get(id) ?? this.parent?.services.get(id);
    if (service !== undefined) {
      if (service.instance !== undefined) {
        return service.instance;
      } else if (service.ctor !== undefined) {
        const instance = this.create(service.ctor, ...(service.args ?? []));
        if (service.singletone === true) {
          service.instance = instance;
        }
        return instance;
      }
    }
    throw new Error(`Service ${id} does not exist`);
  }

  create<C extends new (...args: any[]) => any>(
    ctor: C,
    ...args: LeadingNonServiceArgs<ConstructorParameters<C>>
  ): InstanceType<C> {
    const deps = getDependencies(ctor).sort((a, b) => a.index - b.index);
    const start = deps.length > 0 ? deps[0].index : args.length;

    if (args.length !== start) {
      console.warn(
        `First service dependency of ${ctor.name} at position ${
          start + 1
        } conflicts with ${args.length} static arguments`,
      );
    }

    for (let i = 0; i < deps.length; i++) {
      (args[i + start] as any) = this.get(deps[i].id);
    }

    return new ctor(...args);
  }

  private throwIfExist<T>(id: ServiceId<T>) {
    if (this.services.has(id)) {
      throw new Error(`Service ${id} already exists`);
    }
  }
}
