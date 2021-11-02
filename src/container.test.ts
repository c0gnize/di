import { Container, createDecorator, IService } from './container';

const IService1 = createDecorator<IService1>('IService1');

interface IService1 extends IService {
  name: string;
}

class Service1 implements IService1 {
  name = 'service-1';
}

class Service2 {
  constructor(public name: string, @IService1 public s1: IService1) {}
}

test('should correctly create', () => {
  const container = new Container();
  container.set(IService1, Service1);
  const s2 = container.create(Service2, 'service-2');
  expect(s2.name).toBe('service-2');
  expect(s2.s1).toBeDefined();
  expect(s2.s1.name).toBe('service-1');
});
