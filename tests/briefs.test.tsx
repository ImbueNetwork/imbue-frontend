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
import Briefs from "../src/pages/briefs/index";
import {
  getAllBriefs,
  callSearchBriefs,
} from "../src/redux/services/briefService";
import { useRouter } from "next/router";
import {
  amountOfBriefsSubmitted,
  briesData,
  intermidiateExpData,
  projectLengthData,
  searchMockResponse,
} from "./__mocks__/briefsData";
import { renderHook } from "@testing-library/react-hooks";

jest.mock("../src/redux/services/briefService");

jest.mock("../src/pages/briefs/index", () => ({
  getAllBriefs: jest.fn(),
  callSearchBriefs: jest.fn(),
}));

// mock useRouter
jest.mock("next/router", () => ({
  useRouter() {
    return {
      query: {},
    };
  },
}));

describe("Briefs component", () => {
  render(<Briefs />);
  // check if all components are rendered
  expect(screen.getByTestId("result")).toBeInTheDocument();
  // Mock the briefsService.getAllBriefs method to return a fixed array of briefs
  // beforeAll(() => {
  //   const mockGetAllBriefs = getAllBriefs as jest.MockedFunction<
  //     typeof getAllBriefs
  //   >;
  //   mockGetAllBriefs.mockResolvedValue(briesData);
  // });
  // let briefsComponent: RenderResult<
  //   typeof import("@testing-library/dom/types/queries"),
  //   HTMLElement,
  //   HTMLElement
  // >;
  // let appContainer: HTMLElement;
  // let appGetAllByText:
  //   | ((
  //       id: Matcher,
  //       options?: SelectorMatcherOptions | undefined
  //     ) => HTMLElement[])
  //   | ((arg0: string) => any[]);
  // let appQueryAllByTestId:
  //   | ((id: Matcher, options?: MatcherOptions | undefined) => HTMLElement[])
  //   | ((arg0: string) => any[]);
  // beforeEach(async () => {
  //   briefsComponent = await act(async () => render(<Briefs />));
  //   const { container, queryAllByTestId, getAllByText } = await act(async () =>
  //     render(<Briefs />)
  //   );
  //   appContainer = container;
  //   appGetAllByText = getAllByText;
  //   appQueryAllByTestId = queryAllByTestId;
  //   expect(getAllBriefs).toHaveBeenCalled();
  //   await waitFor(() =>
  //     expect(appContainer.getElementsByClassName("brief-title")).toHaveLength(3)
  //   );
  // });
  // it("should render brief items when the component mounts.", async () => {
  //   expect(briefsComponent).toBeTruthy();
  // });
  // it("should render briefs list and filter options", async () => {
  //   // Check that filter options are displayed
  //   await waitFor(() =>
  //     expect(appContainer.getElementsByClassName("filter-option")).toBeTruthy()
  //   );
  // });
  // it("should filter briefs by experience level", async () => {
  //   const mockCallSearchBriefs = callSearchBriefs as jest.MockedFunction<
  //     typeof callSearchBriefs
  //   >;
  //   // get intermidiate checkbox
  //   const intermidiateCheckBox = await waitFor(
  //     () => appQueryAllByTestId("0-1")[0]
  //   );
  //   expect(intermidiateCheckBox).toBeTruthy();
  //   if (appContainer) {
  //     fireEvent.click(intermidiateCheckBox);
  //     mockCallSearchBriefs.mockResolvedValue(intermidiateExpData);
  //     // search for intermidiate briefs
  //     await waitFor(() =>
  //       fireEvent.click(appContainer.getElementsByClassName("tab-item")[0])
  //     );
  //     await waitFor(() =>
  //       expect(appContainer.getElementsByClassName("brief-title")).toHaveLength(
  //         1
  //       )
  //     );
  //   }
  // });
  // it("should filter briefs by number of Briefs submitted", async () => {
  //   const mockCallSearchBriefs = callSearchBriefs as jest.MockedFunction<
  //     typeof callSearchBriefs
  //   >;
  //   const amountSubmittedCheckBox = await waitFor(
  //     () => appQueryAllByTestId("1-2")[0]
  //   );
  //   expect(amountSubmittedCheckBox).toBeTruthy();
  //   if (appContainer) {
  //     fireEvent.click(amountSubmittedCheckBox);
  //     mockCallSearchBriefs.mockResolvedValue(amountOfBriefsSubmitted);
  //     await waitFor(() =>
  //       fireEvent.click(appContainer.getElementsByClassName("tab-item")[0])
  //     );
  //     await waitFor(() =>
  //       expect(appContainer.getElementsByClassName("brief-title")).toHaveLength(
  //         2
  //       )
  //     );
  //   }
  // });
  // it("should filter briefs by project length", async () => {
  //   const mockCallSearchBriefs = callSearchBriefs as jest.MockedFunction<
  //     typeof callSearchBriefs
  //   >;
  //   const projectLengthCheckBox = await waitFor(
  //     () => appQueryAllByTestId("2-0")[0]
  //   );
  //   expect(projectLengthCheckBox).toBeTruthy();
  //   if (appContainer) {
  //     fireEvent.click(projectLengthCheckBox);
  //     mockCallSearchBriefs.mockResolvedValue(projectLengthData);
  //     await waitFor(() =>
  //       fireEvent.click(appContainer.getElementsByClassName("tab-item")[0])
  //     );
  //     await waitFor(() =>
  //       expect(appContainer.getElementsByClassName("brief-title")).toHaveLength(
  //         1
  //       )
  //     );
  //   }
  // });
  // test("test brief rendering and matching the snapshot", async () => {
  //   expect(screen.queryAllByText("briefs found")[0]).toMatchSnapshot();
  // });
  // test("onSearch should filter briefs based on search input and selected checkboxes", async () => {
  //   // Mock the elements and values needed for the test
  //   const mockCallSearchBriefs = callSearchBriefs as jest.MockedFunction<
  //     typeof callSearchBriefs
  //   >;
  //   const experienceCheckBox = await waitFor(
  //     () => appQueryAllByTestId("0-1")[0]
  //   );
  //   const submittedCheckBox = await waitFor(
  //     () => appQueryAllByTestId("1-2")[0]
  //   );
  //   const searchInput = appContainer.getElementsByClassName("search-input")[0];
  //   expect(experienceCheckBox).toBeTruthy();
  //   expect(submittedCheckBox).toBeTruthy();
  //   expect(searchInput).toBeTruthy();
  //   if (appContainer) {
  //     // fire checkboxes event
  //     fireEvent.click(experienceCheckBox);
  //     fireEvent.click(submittedCheckBox);
  //     // input search text
  //     fireEvent.change(searchInput, {
  //       target: { value: "briefThree" },
  //     });
  //     mockCallSearchBriefs.mockResolvedValue(searchMockResponse);
  //     // search for input brief
  //     await waitFor(() =>
  //       fireEvent.click(appContainer.getElementsByClassName("tab-item")[0])
  //     );
  //     await waitFor(() =>
  //       expect(appGetAllByText("briefThree")[0]).toBeTruthy()
  //     );
  //   }
  // });
});
