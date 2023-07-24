import { fireEvent, render, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import * as reactRedux from 'react-redux';

import { getCurrentUser } from '@/utils';

import { dummyFreelanderProfile } from '@/config/briefs-data';
import { SubmitProposal } from '@/pages/briefs/[id]/apply';
import { Providers } from '@/redux/providers/userProviders';
import { getBrief, getFreelancerBrief } from '@/redux/services/briefService';
import { getFreelancerProfile } from '@/redux/services/freelancerService';

import { briefsData, dummyFreelancerBrief } from './__mocks__/briefsData';
import { dummyUser } from './__mocks__/userData';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/utils', () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock('@/redux/services/briefService', () => ({
  getFreelancerBrief: jest.fn(),
  getBrief: jest.fn(),
}));

jest.mock('@/redux/services/freelancerService', () => ({
  getFreelancerProfile: jest.fn(),
}));

describe('SubmitProposal', () => {
  const useSelectorMock = jest.spyOn(reactRedux, 'useSelector');

  beforeEach(() => {
    const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<
      typeof getCurrentUser
    >;
    mockGetCurrentUser.mockResolvedValue(dummyUser);

    useSelectorMock.mockReturnValue({ user: dummyUser });

    const mockGetFreelancerProfile =
      getFreelancerProfile as jest.MockedFunction<typeof getFreelancerProfile>;
    mockGetFreelancerProfile.mockResolvedValue(dummyFreelanderProfile);

    const mockGetFreelancerBrief = getFreelancerBrief as jest.MockedFunction<
      typeof getFreelancerBrief
    >;
    mockGetFreelancerBrief.mockResolvedValue(undefined);

    const mockgetBrief = getBrief as jest.MockedFunction<typeof getBrief>;
    mockgetBrief.mockResolvedValue(dummyFreelancerBrief);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders SubmitProposal page correctly', () => {
    const pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      query: { id: '1' },
      push: pushMock,
    });

    const { getByText } = render(
      <Providers>
        <SubmitProposal />
      </Providers>
    );

    expect(getByText('Job description')).toBeInTheDocument();
    expect(getByText('Milestones')).toBeInTheDocument();
    expect(getByText('Payment terms')).toBeInTheDocument();
    expect(getByText('Submit')).toBeInTheDocument();
  });

  test('displays brief insights if brief exists', async () => {
    (useRouter as jest.Mock).mockReturnValue({
      query: { id: '1' },
      isReady: true,
    });

    const { getByText } = render(
      <Providers>
        <SubmitProposal />
      </Providers>
    );

    await waitFor(() => expect(getByText('jhdkb')).toBeInTheDocument());
  });

  test('redirects to freelancer creation page if freelancer profile does not exist', async () => {
    const mockGetFreelancerProfile =
      getFreelancerProfile as jest.MockedFunction<typeof getFreelancerProfile>;
    mockGetFreelancerProfile.mockResolvedValue(undefined);

    render(
      <Providers>
        <SubmitProposal />
      </Providers>
    );

    await waitFor(() =>
      expect(useRouter().push).toHaveBeenCalledWith('/freelancers/new')
    );
  });

  test('redirects to application page if user has existing application', async () => {
    const mockGetFreelancerBrief = getFreelancerBrief as jest.MockedFunction<
      typeof getFreelancerBrief
    >;
    mockGetFreelancerBrief.mockResolvedValue(briefsData[0]);

    render(
      <Providers>
        <SubmitProposal />
      </Providers>
    );

    await waitFor(() =>
      expect(useRouter().push).toHaveBeenCalledWith('/briefs/1/applications/1/')
    );
  });

  test('calls getCurrentUser and getFreelancerProfile on component mount', async () => {
    render(
      <Providers>
        <SubmitProposal />
      </Providers>
    );

    await waitFor(() => {
      // expect(getCurrentUser).toHaveBeenCalledTimes(1);
      expect(getFreelancerProfile).toHaveBeenCalledTimes(1);
      // expect(getCurrentUser).toHaveBeenCalledWith();
      expect(getFreelancerProfile).toHaveBeenCalledWith('mike');
    });
  });

  test('calls getBrief when user exists and brief does not exist', async () => {
    const mockgetBrief = getBrief as jest.MockedFunction<typeof getBrief>;
    mockgetBrief.mockResolvedValue(undefined);

    render(
      <Providers>
        <SubmitProposal />
      </Providers>
    );

    await waitFor(() => {
      expect(getBrief).toHaveBeenCalledTimes(1);
      expect(getBrief).toHaveBeenCalledWith('1');
    });
  });

  test('calls getFreelancerBrief when user exists and brief exists', async () => {
    const mockgetBrief = getBrief as jest.MockedFunction<typeof getBrief>;
    mockgetBrief.mockResolvedValue(briefsData[1]);

    render(
      <Providers>
        <SubmitProposal />
      </Providers>
    );

    await waitFor(() => {
      expect(getFreelancerBrief).toHaveBeenCalledTimes(1);
      expect(getFreelancerBrief).toHaveBeenCalledWith(5, '1');
    });
  });

  test('adds milestone field on click of add milestone button', async () => {
    const { getByText, getAllByText } = render(
      <Providers>
        <SubmitProposal />
      </Providers>
    );

    fireEvent.click(getByText('Add milestone'));

    await waitFor(() => expect(getAllByText('Description').length).toBe(2));
  });

  test('fills input fields and clicks submit button', async () => {
    const { getByText, getByTestId } = render(
      <Providers>
        <SubmitProposal />
      </Providers>
    );

    const descriptionInput = getByTestId(
      'milestone-description-0'
    ) as HTMLInputElement;
    const amountInput = getByTestId('milestone-amount-0') as HTMLInputElement;

    const titleInput = getByTestId('milestone-title-0') as HTMLInputElement;

    fireEvent.change(descriptionInput, {
      target: { value: 'Test description' },
    });

    fireEvent.change(amountInput, { target: { value: 20 } });

    fireEvent.change(titleInput, { target: { value: 'Title one' } });

    fireEvent.click(getByText('Submit'));

    const walletPopup = getByText('Connect wallet');

    await waitFor(() => {
      expect(descriptionInput.value).toBe('Test description');
      expect(amountInput.value).toBe('20');
      expect(walletPopup).toBeVisible();
    });
  });
});
