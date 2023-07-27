import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Briefs from '@/pages/briefs';
import { Providers } from '@/redux/providers/userProviders';
import {
  callSearchBriefs,
  deleteSavedBrief,
  getAllBriefs,
  getAllSavedBriefs,
  searchSkills,
} from '@/redux/services/briefService';

import {
  briefsData,
  expertExpData,
  // intermediateExpData,
} from './__mocks__/briefsData';

jest.mock('@/redux/services/briefService', () => ({
  getAllBriefs: jest.fn(),
  callSearchBriefs: jest.fn(),
  deleteSavedBrief: jest.fn(),
  getAllSavedBriefs: jest.fn(),
  searchSkills: jest.fn(),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    isReady: true,
    query: {},
    push: jest.fn(),
  })),
}));

const mockBriefs = {
  currentData: briefsData,
  totalBriefs: 3,
};

const skills = [{ name: 'java' }, { name: 'c++' }, { name: 'python' }];

beforeEach(() => {
  const mockGetAllBriefs = getAllBriefs as jest.MockedFunction<
    typeof getAllBriefs
  >;
  const mockCallSearchBriefs = callSearchBriefs as jest.MockedFunction<
    typeof callSearchBriefs
  >;
  const mockDeleteSavedBriefs = deleteSavedBrief as jest.MockedFunction<
    typeof deleteSavedBrief
  >;
  const mockGetAllSavedBriefs = getAllSavedBriefs as jest.MockedFunction<
    typeof getAllSavedBriefs
  >;
  const mockgetAllSkills = searchSkills as jest.MockedFunction<
    typeof searchSkills
  >;

  mockGetAllBriefs.mockResolvedValue(mockBriefs);
  mockCallSearchBriefs.mockResolvedValue(mockBriefs);
  mockDeleteSavedBriefs.mockResolvedValue(mockBriefs);
  mockGetAllSavedBriefs.mockResolvedValue(mockBriefs);
  mockgetAllSkills.mockResolvedValue({ skills });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Briefs Page', () => {
  test('renders without errors', () => {
    render(
      <Providers>
        <Briefs />
      </Providers>
    );
    // Assert that no errors occurred during rendering
  });

  test('displays briefs after data fetching', async () => {
    render(
      <Providers>
        <Briefs />
      </Providers>
    );
    // Mock the API call to getAllBriefs
    const mockGetAllBriefs = getAllBriefs as jest.MockedFunction<
      typeof getAllBriefs
    >;
    mockGetAllBriefs.mockResolvedValue(mockBriefs);

    // Wait for briefs to be fetched and displayed
    await screen.findByText('briefOne');
    await screen.findByText('briefTwo');

    // Assert that the briefs are displayed correctly
    expect(screen.getByText('briefOne')).toBeInTheDocument();
    expect(screen.getByText('briefTwo')).toBeInTheDocument();
  });

  test('applies filters and updates briefs', async () => {
    render(
      <Providers>
        <Briefs />
      </Providers>
    );
    // Mock the API calls used in the useEffect hook

    // Mock the briefsService.getAllBriefs method to return a fixed array of briefs
    const mockGetAllBriefs = getAllBriefs as jest.MockedFunction<
      typeof getAllBriefs
    >;
    mockGetAllBriefs.mockResolvedValue(mockBriefs);

    expect(getAllBriefs).toBeCalled();

    // Wait for briefs to be fetched and displayed
    await screen.findByText('briefOne');
    await screen.findByText('briefTwo');
    await screen.findByText('briefThree');

    expect(screen.queryByTestId('filter-modal')).toBeNull();

    // Simulate clicking on a filter
    const filterButton = screen.getByText('Filter');
    userEvent.click(filterButton);

    // Wait for the filter modal to be rendered in the DOM
    await waitFor(() => {
      expect(screen.getByTestId('filter-modal')).toBeInTheDocument();
    });

    // Perform additional assertions on the filter modal content
    expect(screen.getByText('Filter by:')).toBeInTheDocument();

    // Simulate clicking on the experience level dropdown from filter modal

    const expLevelDropdown = screen.getByTestId('Experience Level');

    userEvent.click(expLevelDropdown);

    await waitFor(() => {
      expect(screen.getByTestId('filterOptions')).toBeInTheDocument();
    });

    // select Expert option
    const entryLevelOption = screen.getByText('Expert');
    userEvent.click(entryLevelOption);

    // close dropdown
    userEvent.click(expLevelDropdown);

    const submitButton = screen.getByTestId('Apply');
    userEvent.click(submitButton);

    // Wait for updated briefs to be fetched and displayed
    const mockCallSearchBriefs = callSearchBriefs as jest.MockedFunction<
      typeof callSearchBriefs
    >;

    const mockCallSearchResponse = {
      currentData: expertExpData,
      totalBriefs: 1,
    };

    mockCallSearchBriefs.mockResolvedValue(mockCallSearchResponse);

    waitFor(() => {
      expect(callSearchBriefs).toBeCalled();
    });

    // Wait for updated briefs to be fetched and displayed
    await screen.findByText('briefThree');

    // Assert that the updated briefs are displayed correctly
    expect(screen.getByText('finance brief three')).toBeInTheDocument();
    expect(screen.getByText('briefThree')).toBeInTheDocument();
  });
});
