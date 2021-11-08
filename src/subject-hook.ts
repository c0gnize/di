import { useEffect, useReducer } from 'react';
import type { ServiceId } from './decorator';
import { useContainer } from './container-hook';
import { ISubject } from './subject';

export function useSubject<T extends ISubject>(subject: T): void {
  const forceUpdate = useReducer((x) => x + 1, 0)[1];
  useEffect(() => subject.subscribe(forceUpdate), [subject]);
}

export function useServiceSubject<T extends ISubject>(id: ServiceId<T>): T {
  const subject = useContainer().get(id);
  useSubject(subject);
  return subject;
}
