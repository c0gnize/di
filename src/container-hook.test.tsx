import * as React from 'react';
import { render } from '@testing-library/react';
import { Container, createDecorator, IService } from './container';
import { ContainerProvider, useInstance, useService } from './container-hook';

const IService1 = createDecorator<IService1>('IService1');

interface IService1 extends IService {
  name: string;
}

class Service1 implements IService1 {
  declare _service: undefined;
  name = 'service-1';
}

const Service1Component: React.FC = () => {
  const d = useService(IService1);
  return <div>{d.name}</div>;
};

test('should use service by id', () => {
  const container = new Container().set(IService1, Service1);

  const result = render(
    <ContainerProvider value={container}>
      <Service1Component />
    </ContainerProvider>,
  );

  expect(result.getByText('service-1')).toBeDefined();
});

class Service1Consumer {
  constructor(public name: string, @IService1 public s1: IService1) {}
}

const Service1ConsumerComponent: React.FC = () => {
  const d = useInstance(Service1Consumer, 'consumer');
  return <div>{d.name}</div>;
};

test('should create instance', () => {
  const container = new Container().set(IService1, Service1);

  const result = render(
    <ContainerProvider value={container}>
      <Service1ConsumerComponent />
    </ContainerProvider>,
  );

  expect(result.getByText('consumer')).toBeDefined();
});
