import {
  render,
  fireEvent,
  waitFor,
  screen,
  RenderResult,
  Matcher,
  SelectorMatcherOptions,
  MatcherOptions,
} from "@testing-library/react";
import React from "react";
import { act } from "@testing-library/react";
import Briefs from "@/pages/briefs";
import {
  getAllBriefs,
  callSearchBriefs,
} from "../src/redux/services/briefService";
import {
  amountOfBriefsSubmitted,
  briefsData,
  intermediateExpData,
  projectLengthData,
  searchMockResponse,
} from "./__mocks__/briefsData";

jest.mock("../src/redux/services/briefService", () => ({
  getAllBriefs: jest.fn(),
  callSearchBriefs: jest.fn(),
}));

jest.mock("next/router");

describe("Briefs component", () => {
  beforeAll(() => {
    const mockBriefs = {
      currentData: briefsData,
      totalBriefs: 3,
    };
    // Mock the briefsService.getAllBriefs method to return a fixed array of briefs
    const mockGetAllBriefs = getAllBriefs as jest.MockedFunction<
      typeof getAllBriefs
    >;
    mockGetAllBriefs.mockResolvedValue(mockBriefs);
  });

  let briefsComponent: RenderResult<
    typeof import("@testing-library/dom/types/queries"),
    HTMLElement,
    HTMLElement
  >;
  let appContainer: HTMLElement;
  let appGetAllByText:
    | ((
        id: Matcher,
        options?: SelectorMatcherOptions | undefined
      ) => HTMLElement[])
    | ((arg0: string) => any[]);
  let appQueryAllByTestId:
    | ((id: Matcher, options?: MatcherOptions | undefined) => HTMLElement[])
    | ((arg0: string) => any[]);

  beforeEach(async () => {
    await act(async () => {
      await waitFor(() => {
        briefsComponent = render(<Briefs />);
      });
    });

    appContainer = briefsComponent.container;
    appGetAllByText = briefsComponent.getAllByText;
    appQueryAllByTestId = briefsComponent.queryAllByTestId;

    await waitFor(() =>
      expect(appContainer.getElementsByClassName("brief-title")).toHaveLength(3)
    );
  });

  it("should render brief items when the component mounts.", async () => {
    expect(briefsComponent).toBeTruthy();
  });

  it("should render briefs list and filter options", async () => {
    // Check that filter options are displayed
    await waitFor(() =>
      expect(appContainer.getElementsByClassName("filter-option")).toBeTruthy()
    );
  });

  it("should filter briefs by experience level", async () => {
    const mockCallSearchBriefs = callSearchBriefs as jest.MockedFunction<
      typeof callSearchBriefs
    >;
    const mockCallSearchResponse = {
      currentData: intermediateExpData,
      totalBriefs: 1,
    };

    // get intermidiate checkbox
    const intermidiateCheckBox = await waitFor(
      () => appQueryAllByTestId("0-1")[0]
    );

    expect(intermidiateCheckBox).toBeTruthy();

    if (appContainer) {
      fireEvent.click(intermidiateCheckBox);

      mockCallSearchBriefs.mockResolvedValue(mockCallSearchResponse);
      // search for intermidiate briefs
      await waitFor(() =>
        fireEvent.click(appContainer.getElementsByClassName("tab-item")[0])
      );

      await waitFor(() =>
        expect(appContainer.getElementsByClassName("brief-title")).toHaveLength(
          1
        )
      );
    }
  });

  it("should filter briefs by number of Briefs submitted", async () => {
    const mockCallSearchBriefs = callSearchBriefs as jest.MockedFunction<
      typeof callSearchBriefs
    >;
    const mockCallSearchResponse = {
      currentData: amountOfBriefsSubmitted,
      totalBriefs: 2,
    };

    const amountSubmittedCheckBox = await waitFor(
      () => appQueryAllByTestId("1-2")[0]
    );

    expect(amountSubmittedCheckBox).toBeTruthy();

    if (appContainer) {
      fireEvent.click(amountSubmittedCheckBox);

      mockCallSearchBriefs.mockResolvedValue(mockCallSearchResponse);

      await waitFor(() =>
        fireEvent.click(appContainer.getElementsByClassName("tab-item")[0])
      );

      await waitFor(() =>
        expect(appContainer.getElementsByClassName("brief-title")).toHaveLength(
          2
        )
      );
    }
  });

  it("should filter briefs by project length", async () => {
    const mockCallSearchBriefs = callSearchBriefs as jest.MockedFunction<
      typeof callSearchBriefs
    >;
    const mockCallSearchResponse = {
      currentData: projectLengthData,
      totalBriefs: 1,
    };

    const projectLengthCheckBox = await waitFor(
      () => appQueryAllByTestId("2-0")[0]
    );

    expect(projectLengthCheckBox).toBeTruthy();

    if (appContainer) {
      fireEvent.click(projectLengthCheckBox);

      mockCallSearchBriefs.mockResolvedValue(mockCallSearchResponse);

      await waitFor(() =>
        fireEvent.click(appContainer.getElementsByClassName("tab-item")[0])
      );

      await waitFor(() =>
        expect(appContainer.getElementsByClassName("brief-title")).toHaveLength(
          1
        )
      );
    }
  });

  test("test brief rendering and matching the snapshot", async () => {
    expect(screen.queryAllByText("briefs found")[0]).toMatchSnapshot();
  });

  test("onSearch should filter briefs based on search input and selected checkboxes", async () => {
    // Mock the elements and values needed for the test
    const mockCallSearchBriefs = callSearchBriefs as jest.MockedFunction<
      typeof callSearchBriefs
    >;
    const mockCallSearchResponse = {
      currentData: searchMockResponse,
      totalBriefs: 1,
    };

    const experienceCheckBox = await waitFor(
      () => appQueryAllByTestId("0-1")[0]
    );
    const submittedCheckBox = await waitFor(
      () => appQueryAllByTestId("1-2")[0]
    );

    const searchInput = appContainer.getElementsByClassName("search-input")[0];

    expect(experienceCheckBox).toBeTruthy();
    expect(submittedCheckBox).toBeTruthy();
    expect(searchInput).toBeTruthy();

    if (appContainer) {
      // fire checkboxes event
      fireEvent.click(experienceCheckBox);
      fireEvent.click(submittedCheckBox);

      // input search text
      fireEvent.change(searchInput, {
        target: { value: "briefThree" },
      });

      mockCallSearchBriefs.mockResolvedValue(mockCallSearchResponse);
      // search for input brief
      await waitFor(() =>
        fireEvent.click(appContainer.getElementsByClassName("tab-item")[0])
      );

      await waitFor(() =>
        expect(appGetAllByText("briefThree")[0]).toBeTruthy()
      );
    }
  });
});
