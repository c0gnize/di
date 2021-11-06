import { useEffect, useReducer } from 'react';
import { ServiceId } from './container';
import { useContainer } from './container-hook';

import { ISubject } from './subject';

export function useSubject<T extends ISubject>(s: T): T {
  const forceUpdate = useReducer((x) => x + 1, 0)[1];
  useEffect(() => s.subscribe(forceUpdate), [s]);
  return s;
}

export function useServiceSubject<T extends ISubject>(id: ServiceId<T>): T {
  return useSubject(useContainer().get(id));
}
