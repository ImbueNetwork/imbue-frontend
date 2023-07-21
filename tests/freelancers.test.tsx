import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import Freelancers from '@/pages/freelancers/new';
import { Providers } from '@/redux/providers/userProviders';

function setUp() {
  // const user = {
  //   id: 1,
  //   username: 'test',
  //   display_name: 'test',
  //   password: 'test',
  //   web3Accounts: [],
  //   web3_address: 'test',
  //   getstream_token: 'test',
  // };
  render(
    <Providers>
      <Freelancers />
    </Providers>
  );
}

test('test Freelancer rendering', () => {
  expect(
    render(
      <Providers>
        <Freelancers />
      </Providers>
    )
  ).toBeTruthy();
});

test('test Freelancer rendering and matching the snapshot', () => {
  setUp();
  expect(screen.getByText('Get Started!')).toMatchSnapshot();
});

test('test freelancer onclick next snapshot matching', async () => {
  setUp();
  expect(screen.getByText('Get Started!')).toMatchSnapshot();
  fireEvent.click(screen.getByTestId('get-started-button'));

  // Use the custom text matcher to find the desired text

  expect(screen.getByTestId('heading')).toMatchSnapshot();
});

test('test freelancer validation failure not proceeding the next step', () => {
  setUp();
  fireEvent.click(screen.getByTestId('get-started-button'));
  fireEvent.click(screen.getByTestId('next-button'));

  expect(screen.getByTestId('heading')).toMatchSnapshot();
});

test('test freelancer validation passing if the value is being entered ', () => {
  setUp();
  fireEvent.click(screen.getByTestId('get-started-button'));
  fireEvent.click(screen.getByTestId('next-button'));
  fireEvent.click(screen.getByTestId('freelance-xp-1'));
  fireEvent.click(screen.getByTestId('next-button'));
  expect(
    screen.getByText('Great, so what’s your biggest goal for freelancing?')
  ).toMatchSnapshot();
});

test('test freelancer capturing the input textbox value', () => {
  setUp();
  fireEvent.click(screen.getByTestId('get-started-button'));
  fireEvent.click(screen.getByTestId('next-button'));
  fireEvent.click(screen.getByTestId('freelance-xp-1'));
  fireEvent.click(screen.getByTestId('next-button'));
  fireEvent.click(screen.getByTestId('freelance-goal-2'));
  fireEvent.click(screen.getByTestId('next-button'));
  fireEvent.change(screen.getByTestId('title'), {
    target: { value: 'imbueLegends' },
  });
  expect((screen.getByTestId('title') as HTMLInputElement).value).toEqual(
    'imbueLegends'
  );
});

test('test freelancer capturing the multiselect languages', () => {
  setUp();
  fireEvent.click(screen.getByTestId('get-started-button'));
  fireEvent.click(screen.getByTestId('next-button'));
  fireEvent.click(screen.getByTestId('freelance-xp-1'));
  fireEvent.click(screen.getByTestId('next-button'));
  fireEvent.click(screen.getByTestId('freelance-goal-2'));
  fireEvent.click(screen.getByTestId('next-button'));
  fireEvent.change(screen.getByTestId('title'), {
    target: { value: 'imbueLegends' },
  });
  fireEvent.click(screen.getByTestId('next-button'));
  fireEvent.change(screen.getByTestId('education'), {
    target: { value: 'University of Russia' },
  });
  fireEvent.click(screen.getByTestId('next-button'));
  fireEvent.change(screen.getByTestId('tag-input'), {
    target: { value: ['German'] },
  });
  expect((screen.getByTestId('tag-input') as HTMLInputElement).value).toEqual(
    'German'
  );
});
