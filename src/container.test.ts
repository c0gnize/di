import { Container } from './container';
import { decorator, IService } from './decorator';

const IService1 = decorator<IService1>('IService1');

interface IService1 extends IService {
  name: string;
}

class Service1 implements IService1 {
  declare _service: undefined;
  name = 'service-1';
}

const IService2 = decorator<IService2>('IService2');

interface IService2 extends IService {
  name: string;
  s1: IService1;
}

class Service2 implements IService2 {
  declare _service: undefined;
  constructor(public name: string, @IService1 public s1: IService1) {}
}

class Service2Consumer {
  constructor(@IService2 public s2: IService2) {}
}

test('should correctly create an object with dependency', () => {
  const container = new Container();
  container.set(IService1, Service1);
  const consumer = container.create(Service2, 'service-2');
  expect(consumer.name).toBe('service-2');
  expect(consumer.s1.name).toBe('service-1');
});

test('should return specified instance', () => {
  const s1 = new Service1();
  const container = new Container();
  container.setInstance(IService1, s1);
  expect(container.get(IService1)).toBe(s1);
});

test('should correctly create an object with dependency which has own dependency', () => {
  const container = new Container();
  container.set(IService1, Service1);
  container.set(IService2, Service2, 'service-2');
  const consumer = container.create(Service2Consumer);
  expect(consumer.s2.s1.name).toBe('service-1');
});

test('should create singleton', () => {
  const container = new Container();
  container.setSingleton(IService1, Service1);
  const consumer1 = container.create(Service2, '');
  const consumer2 = container.create(Service2, '');
  consumer1.s1.name = 'service-1-singleton';
  expect(consumer2.s1.name).toBe('service-1-singleton');
});

test('should use specified instance', () => {
  const s1 = new Service1();
  const consumer = new Container()
    .setInstance(IService1, s1)
    .create(Service2, 'service-2');
  expect(consumer.s1).toBe(s1);
});

test('should not accept duplicate', () => {
  const container = new Container().set(IService1, Service1);
  expect(() => container.set(IService1, Service1)).toThrow();
});

test('should return service from parent', () => {
  const consumer = new Container()
    .set(IService1, Service1)
    .createChild()
    .set(IService2, Service2, 'service-2')
    .create(Service2Consumer);
  expect(consumer.s2.s1.name).toBe('service-1');
});
