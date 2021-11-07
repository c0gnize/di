import * as React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { Container, createDecorator, IService } from './container';
import { ContainerProvider } from './container-hook';
import { ISubject, Subject } from './subject';
import { useServiceSubject } from './subject-hook';

const IUser = createDecorator<IUser>('IUser');

interface IUser extends IService, ISubject {
  logged: boolean;
  toggle(): void;
}

class User extends Subject implements IUser {
  declare _service: undefined;

  logged = false;

  toggle() {
    this.logged = !this.logged;
    this.notify();
  }
}

const UserButton: React.FC = () => {
  const user = useServiceSubject(IUser);
  return (
    <button onClick={() => user.toggle()}>{user.logged ? 'Logout' : 'Log In'}</button>
  );
};

test('should rerender component on notify', async () => {
  const container = new Container().setSingleton(IUser, User);

  render(
    <ContainerProvider value={container}>
      <UserButton />
    </ContainerProvider>,
  );

  fireEvent.click(screen.getByText('Log In'));

  expect(await screen.findByText('Logout')).toBeDefined();
});
