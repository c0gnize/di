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

export const IServiceContainer = createDecorator<IServiceContainer>('IServiceContainer');

export interface IServiceContainer extends IService {}

type Constructor<T, A extends any[]> = new (...args: A) => T;

/* prettier-ignore */
type GetLeadingNonServiceArgs<Args> =
	Args extends [...IService[]] ? []
	: Args extends [infer A1, ...IService[]] ? [A1]
	: Args extends [infer A1, infer A2, ...IService[]] ? [A1, A2]
	: Args extends [infer A1, infer A2, infer A3, ...IService[]] ? [A1, A2, A3]
	: Args extends [infer A1, infer A2, infer A3, infer A4, ...IService[]] ? [A1, A2, A3, A4]
	: Args extends [infer A1, infer A2, infer A3, infer A4, infer A5, ...IService[]] ? [A1, A2, A3, A4, A5]
	: Args extends [infer A1, infer A2, infer A3, infer A4, infer A5, infer A6, ...IService[]] ? [A1, A2, A3, A4, A5, A6]
	: Args extends [infer A1, infer A2, infer A3, infer A4, infer A5, infer A6, infer A7, ...IService[]] ? [A1, A2, A3, A4, A5, A6, A7]
	: Args extends [infer A1, infer A2, infer A3, infer A4, infer A5, infer A6, infer A7, infer A8, ...IService[]] ? [A1, A2, A3, A4, A5, A6, A7, A8]
	: never;
/* prettier-ignore-end */

interface ServiceItem<T, A extends any[]> {
  ctor?: new (...args: A) => T;
  args?: A;
  instance?: T;
  singletone?: boolean;
}

export class Container implements IServiceContainer {
  _serviceBadge?: undefined;

  private services: Map<ServiceId<any>, ServiceItem<any, any>> = new Map();

  constructor(private parent?: Container) {
    this.services.set(IServiceContainer, { instance: this });
  }

  set<C extends new (...args: any[]) => any, T extends InstanceType<C>>(
    id: ServiceId<T>,
    ctor: C,
    ...args: GetLeadingNonServiceArgs<ConstructorParameters<C>>
  ): this {
    this.throwIfExist(id);
    this.services.set(id, { ctor, args });
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

  create<C extends new (...args: any[]) => any, T extends InstanceType<C>>(
    ctor: C,
    ...args: GetLeadingNonServiceArgs<ConstructorParameters<C>>
  ): T {
    const dependencies = getDependencies(ctor).sort((a, b) => a.index - b.index);
    const firstServiceArgPos = dependencies.length > 0 ? dependencies[0].index : args.length;

    if (args.length !== firstServiceArgPos) {
      console.warn(
        `First service dependency of ${ctor.name} at position ${
          firstServiceArgPos + 1
        } conflicts with ${args.length} static arguments`,
      );
    }

    for (let i = 0; i < dependencies.length; i++) {
      (args[i + firstServiceArgPos] as any) = this.get(dependencies[i].id);
    }

    return <T>new ctor(...args);
  }

  private throwIfExist<T>(id: ServiceId<T>) {
    if (this.services.has(id)) {
      throw new Error(`Service ${id} already exists`);
    }
  }
}
