import { Container, createDecorator, IService } from './container';

const IService1 = createDecorator<IService1>('IService1');

interface IService1 extends IService {
  name: string;
}

class Service1 implements IService1 {
  _service?: undefined;
  name = 'service-1';
}

const IService2 = createDecorator<IService2>('IService2');

interface IService2 extends IService {
  name: string;
  s1: IService1;
}

class Service2 implements IService2 {
  constructor(public name: string, @IService1 public s1: IService1) {}
}

class Service3 {
  constructor(public name: string, @IService2 public s2: IService2) {}
}

test('should correctly create object with dependency', () => {
  const container = new Container();
  container.set(IService1, Service1);
  const s2 = container.create(Service2, 'service-2');
  expect(s2.name).toBe('service-2');
  expect(s2.s1.name).toBe('service-1');
});

test('should correctly create object with grand-dependency', () => {
  const container = new Container();
  container.set(IService1, Service1);
  container.set(IService2, Service2, 'service-2');
  const s3 = container.create(Service3, 'service-3');
  expect(s3.s2.s1.name).toBe('service-1');
});

test('should use singletone', () => {
  const container = new Container();
  container.setSingleton(IService1, Service1);
  const s2 = container.create(Service2, '');
  const s22 = container.create(Service2, '');
  expect(s2.s1.name).toBe('service-1');
  s2.s1.name = 'service-1-singleton';
  expect(s22.s1.name).toBe('service-1-singleton');
});

test('should use instance', () => {
  const container = new Container();
  const s1 = new Service1();
  s1.name = 'service-1-instance';
  container.setInstance(IService1, s1);
  const s2 = container.create(Service2, 'service-2');
  expect(s2.s1.name).toBe('service-1-instance');
});
