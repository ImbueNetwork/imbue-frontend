import Freelancers from "@/pages/freelancers/new";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

function setUp() {
  const user = {
    id: 1,
    username: "test",
    display_name: "test",
    password: "test",
    web3Accounts: [],
    web3_address: "test",
    getstream_token: "test",
  };
  render(<Freelancers user={user} />);
}

const customTextMatcher = (text: string) => {
  const elements = screen.queryAllByText((content, element: any) => {
    const elementText = element.textContent || element.innerText || "";
    return elementText.includes(text);
  });

  if (elements.length === 0) {
    throw new Error(`Unable to find an element with the text: ${text}`);
  }

  return elements[0];
};

test("test Freelancer rendering", () => {
  expect(
    render(
      <Freelancers
        user={{
          id: 1,
          username: "test",
          display_name: "test",
          password: "test",
          web3Accounts: [],
          web3_address: "test",
          getstream_token: "test",
        }}
      />
    )
  ).toBeTruthy();
});

test("test Freelancer rendering and matching the snapshot", () => {
  setUp();
  expect(screen.getByText("Get Started!")).toMatchSnapshot();
});

test("test freelancer onclick next snapshot matching", async () => {
  setUp();
  expect(screen.getByText("Get Started!")).toMatchSnapshot();
  fireEvent.click(screen.getByTestId("get-started-button"));

  // Use the custom text matcher to find the desired text

  expect(screen.getByTestId("heading")).toMatchSnapshot();
});

test("test freelancer validation failure not proceeding the next step", () => {
  setUp();
  fireEvent.click(screen.getByTestId("get-started-button"));
  fireEvent.click(screen.getByTestId("next-button"));

  expect(screen.getByTestId("heading")).toMatchSnapshot();
});

test("test freelancer validation passing if the value is being entered ", () => {
  setUp();
  fireEvent.click(screen.getByTestId("get-started-button"));
  fireEvent.click(screen.getByTestId("freelance-xp-1"));
  fireEvent.click(screen.getByTestId("next-button"));
  console.log(
    screen.getByText("Great, so what’s your biggest goal for freelancing?")
  );
  expect(
    screen.getByText("Great, so what’s your biggest goal for freelancing?")
  ).toMatchSnapshot();
});

test("test freelancer capturing the input textbox value", () => {
  setUp();
  fireEvent.click(screen.getByTestId("get-started-button"));
  fireEvent.click(screen.getByTestId("freelance-xp-1"));
  fireEvent.click(screen.getByTestId("next-button"));
  fireEvent.click(screen.getByTestId("freelance-goal-2"));
  fireEvent.click(screen.getByTestId("next-button"));
  fireEvent.change(screen.getByTestId("title"), {
    target: { value: "imbueLegends" },
  });
  expect((screen.getByTestId("title") as HTMLInputElement).value).toEqual(
    "imbueLegends"
  );
});

test("test freelancer capturing the multiselect languages", () => {
  setUp();
  fireEvent.click(screen.getByTestId("get-started-button"));
  fireEvent.click(screen.getByTestId("freelance-xp-1"));
  fireEvent.click(screen.getByTestId("next-button"));
  fireEvent.click(screen.getByTestId("freelance-goal-2"));
  fireEvent.click(screen.getByTestId("next-button"));
  fireEvent.change(screen.getByTestId("title"), {
    target: { value: "imbueLegends" },
  });
  fireEvent.click(screen.getByTestId("next-button"));
  fireEvent.change(screen.getByTestId("tag-input"), {
    target: { value: ["German", "French"] },
  });
  expect((screen.getByTestId("tag-input") as HTMLInputElement).value).toEqual(
    "German,French"
  );
});
