import * as React from 'react';
import { render } from '@testing-library/react';
import { Container } from './container';
import { decorator, IService } from './decorator';
import { ContainerProvider, useContainerChild, useService } from './container-hook';

const ITestService = decorator<ITestService>('ITestService');

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

const ChildProvider: React.FC = (props) => {
  const value = useContainerChild((d) => d.set(ITestService, Service2));
  return <ContainerProvider value={value}>{props.children}</ContainerProvider>;
};

test('second Text should use redefined service', () => {
  const result = render(
    <ContainerProvider value={new Container().set(ITestService, Service1)}>
      <Text />
      <ChildProvider>
        <Text />
      </ChildProvider>
    </ContainerProvider>,
  );

  expect(result.getByText('trick')).toBeDefined();
  expect(result.getByText('treat')).toBeDefined();
});
