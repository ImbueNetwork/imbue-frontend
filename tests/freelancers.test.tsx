import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import * as reactRedux from 'react-redux';

import { AppContext } from '@/components/Layout';

import Freelancers from '@/pages/freelancers/new';
import { Providers } from '@/redux/providers/userProviders';
import { searchLanguageByName, searchSkills } from '@/redux/services/briefService';

import { dummyUser } from './__mocks__/userData';

jest.mock('@/redux/services/briefService', () => ({
  searchSkills: jest.fn(),
  searchLanguageByName: jest.fn(),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));



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
      <AppContext.Provider value={{ profileView: "client", setProfileMode: (_value: string) => null }}>
        <Freelancers />
      </AppContext.Provider>
    </Providers>
  );
}

const skills = [{ name: 'java' }, { name: 'c++' }, { name: 'python' }];
const languages = [{ name: "German" }, { name: 'English' }]
beforeEach(() => {
  const useSelectorMock = jest.spyOn(reactRedux, 'useSelector');
  const mockgetAllSkills = searchSkills as jest.MockedFunction<
    typeof searchSkills
  >;
  const mocksearchLanguageByName = searchLanguageByName as jest.MockedFunction<typeof searchLanguageByName>
  mockgetAllSkills.mockResolvedValue({ skills });
  mocksearchLanguageByName.mockResolvedValue({ languages });

  useSelectorMock.mockReturnValue({ user: dummyUser, loading: false });
});

afterEach(() => {
  jest.clearAllMocks();
});

test('test Freelancer rendering', async () => {
  expect(
    render(
      <Providers>
        <AppContext.Provider value={{ profileView: "client", setProfileMode: (_value: string) => null }}>
          <Freelancers />
        </AppContext.Provider>
      </Providers>
    )
  ).toBeTruthy();
});


test('test Freelancer rendering and matching the snapshot', async () => {
  await waitFor(() => setUp());
  expect(screen.getByText('Get Started!')).toMatchSnapshot();
});

test('test freelancer onclick next snapshot matching', async () => {
  await waitFor(() => setUp());
  expect(screen.getByText('Get Started!')).toMatchSnapshot();
  fireEvent.click(screen.getByTestId('get-started-button'));

  // Use the custom text matcher to find the desired text

  expect(screen.getByTestId('heading')).toMatchSnapshot();
});

test('test freelancer validation failure not proceeding the next step', async () => {
  await waitFor(() => setUp());
  fireEvent.click(screen.getByTestId('get-started-button'));
  fireEvent.click(screen.getByTestId('next-button'));

  expect(screen.getByTestId('heading')).toMatchSnapshot();
});

test('test freelancer validation passing if the value is being entered ', async () => {
  await waitFor(() => setUp());
  fireEvent.click(screen.getByTestId('get-started-button'));
  fireEvent.click(screen.getByTestId('next-button'));
  fireEvent.click(screen.getByTestId('freelance-xp-1'));
  fireEvent.click(screen.getByTestId('next-button'));
  expect(
    screen.getByText('Great, so what’s your biggest goal for freelancing?')
  ).toMatchSnapshot();
});

test('test freelancer capturing the input textbox value', async () => {
  await waitFor(() => setUp());
  fireEvent.click(screen.getByTestId('get-started-button'));
  fireEvent.click(screen.getByTestId('next-button'));
  fireEvent.click(screen.getByTestId('freelance-xp-1'));
  fireEvent.click(screen.getByTestId('next-button'));
  fireEvent.click(screen.getByTestId('freelance-goal-2'));
  fireEvent.click(screen.getByTestId('next-button'));
  const title = document.querySelector("#outlined-multiline-static");
  fireEvent.change(title as HTMLElement, {
    target: { value: 'imbueLegends' },
  });
  expect((title as HTMLInputElement).value).toEqual(
    'imbueLegends'
  );
});

test('test freelancer capturing the multiselect languages', async () => {
  await waitFor(() => setUp());
  fireEvent.click(screen.getByTestId('get-started-button'));
  fireEvent.click(screen.getByTestId('next-button'));
  fireEvent.click(screen.getByTestId('freelance-xp-1'));
  fireEvent.click(screen.getByTestId('next-button'));
  fireEvent.click(screen.getByTestId('freelance-goal-2'));
  fireEvent.click(screen.getByTestId('next-button'));
  const title = document.querySelector("#outlined-multiline-static");
  fireEvent.change(title as HTMLElement, {
    target: { value: 'imbueLegends' },
  });
  fireEvent.click(screen.getByTestId('next-button'));
  const education = title;
  fireEvent.change(education as HTMLElement, {
    target: { value: 'University of Russia' },
  });
  fireEvent.click(screen.getByTestId('next-button'));
  const language = document.getElementById('tags-standard') as HTMLInputElement;
  fireEvent.change(language, {
    target: { value: 'German' },
  });
  const GermanOption = screen.getByText('German');
  fireEvent.click(GermanOption)
  expect(language.value).toBe(
    ""
  );
});
