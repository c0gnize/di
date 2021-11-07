import * as React from 'react';
import { render } from '@testing-library/react';
import { Container, createDecorator, IService } from './container';
import { ContainerProvider, useContainerChild, useService } from './container-hook';

const ITestService = createDecorator<ITestService>('ITestService');

interface ITestService extends IService {
  text: string;
}

class Service1 implements ITestService {
  declare _service: undefined;
  text = 'trick';
}

class Service2 implements ITestService {
  declare _service: undefined;
  text = 'treat';
}

const Text: React.FC = () => {
  const s = useService(ITestService);
  return <div>{s.text}</div>;
};

const RedeclareProvider: React.FC = (props) => {
  const value = useContainerChild((d) => d.set(ITestService, Service2));
  return <ContainerProvider value={value} {...props} />;
};

test('should use different implementation of service', () => {
  const result = render(
    <ContainerProvider value={new Container().set(ITestService, Service1)}>
      <Text />
      <RedeclareProvider>
        <Text />
      </RedeclareProvider>
    </ContainerProvider>,
  );

  expect(result.getByText('trick')).toBeDefined();
  expect(result.getByText('treat')).toBeDefined();
});

test('should use another implementation of service', () => {});
