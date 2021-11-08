import { createContext, useContext, useMemo } from 'react';
import { Container, LeadingNonServiceArgs } from './container';
import type { ServiceId } from './decorator';

const Context = createContext(new Container());

export const ContainerProvider = Context.Provider;

export function useContainer(): Container {
  return useContext(Context);
}

export function useService<T>(id: ServiceId<T>): T {
  return useContainer().get(id);
}

export function useInstance<C extends new (...args: any[]) => any>(
  ctor: C,
  ...args: LeadingNonServiceArgs<ConstructorParameters<C>>
): InstanceType<C> {
  const container = useContainer();
  return useMemo(() => container.create(ctor, ...args), [container]);
}

export function useContainerChild(cb: (container: Container) => Container): Container {
  const container = useContainer();
  const child = useMemo(() => container.createChild(), [container]);
  return cb(child);
}
