import { freelancerData } from "@/config/freelancer-data";
import FreelancerProfile from "@/pages/freelancers/[slug]";
import {
  render,
  screen,
  fireEvent,
  RenderResult,
  Matcher,
  SelectorMatcherOptions,
  MatcherOptions,
  act,
} from "@testing-library/react";
import React from "react";
import { mockUser } from "./__mocks__/userData";

let freelancerProfileComponent: RenderResult<
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

async function setUp() {
  freelancerProfileComponent = await act(async () =>
    render(
      <FreelancerProfile user={mockUser} initFreelancer={freelancerData} />
    )
  );
  const { container, queryAllByTestId, getAllByText } = await act(async () =>
    render(
      <FreelancerProfile user={mockUser} initFreelancer={freelancerData} />
    )
  );
  appContainer = container;
  appGetAllByText = getAllByText;
  appQueryAllByTestId = queryAllByTestId;
}

describe("Freelancer Profile Page", () => {
  beforeEach(async () => {
    await setUp();
  });

  test("test Freelancer Profile rendering", () =>
    expect(freelancerProfileComponent).toBeTruthy());
});
