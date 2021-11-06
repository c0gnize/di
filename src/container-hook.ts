import { createContext, useContext, useMemo, createElement } from 'react';

import { Container, LeadingNonServiceArgs, ServiceId } from './container';

const ContainerContext = createContext(new Container());

export const ContainerProvider = ContainerContext.Provider;

export function useContainer() {
  return useContext(ContainerContext);
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

export const ChildContainerProvider: React.FC = (props) => {
  const container = useContainer();
  const value = useMemo(() => container.createChild(), [container]);
  return createElement(ContainerProvider, { value }, props.children);
};
