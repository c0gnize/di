import { useEffect, useReducer } from 'react';
import { ServiceId } from './container';
import { useContainer } from './container-hook';
import { ISubject } from './subject';

export function useSubject<T extends ISubject>(subject: T): T {
  const forceUpdate = useReducer((x) => x + 1, 0)[1];
  useEffect(() => subject.subscribe(forceUpdate), [subject]);
  return subject;
}

export function useServiceSubject<T extends ISubject>(id: ServiceId<T>): T {
  return useSubject(useContainer().get(id));
}
