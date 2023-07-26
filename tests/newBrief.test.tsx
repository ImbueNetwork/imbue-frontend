import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import * as utils from '@/utils';
import { getServerSideProps } from '@/utils/serverSideProps';

import NewBrief from '@/pages/briefs/new';
import { Providers } from '@/redux/providers/userProviders';

import { dummyUser, getServerSideData } from './__mocks__/userData';

import { getAllSkills } from '@/redux/services/briefService';

jest.mock('@/utils', () => ({
  getCurrentUser: jest.fn(),
}));
jest.mock('@/utils/serverSideProps', () => ({
  getServerSideProps: jest.fn(),
}));

jest.mock('@/redux/services/briefService', () => ({
  getAllSkills: jest.fn(),
}));

const skills = [{ name: 'java' }, { name: 'c++' }, { name: 'python' }];

describe('NewBrief', () => {
  beforeAll(() => {
    // Mock the utils.getCurrentUser method to return a fixed array of briefs
    const mockGetAllBriefs = utils.getCurrentUser as jest.MockedFunction<
      typeof utils.getCurrentUser
    >;

    const mockgetAllSkills = getAllSkills as jest.MockedFunction<
      typeof getAllSkills
    >;

    mockGetAllBriefs.mockResolvedValue(dummyUser);
    // Mock the utils.getCurrentUser method to return a fixed array of briefs
    const mockGetServerSideProps = getServerSideProps as jest.MockedFunction<
      typeof getServerSideProps
    >;
    mockGetServerSideProps.mockResolvedValue(getServerSideData);
    mockgetAllSkills.mockResolvedValue({ skills });
  });

  beforeEach(() => {
    render(
      <Providers>
        <NewBrief />
      </Providers>
    );
  });

  test('renders the headline input field', () => {
    const headlineInput = screen.getByTestId('headline-input');
    expect(headlineInput).toBeInTheDocument();
  });

  test('updates the headline value when typed into the input field', () => {
    const headlineInput = screen.getByTestId(
      'headline-input'
    ) as HTMLInputElement;
    fireEvent.change(headlineInput, { target: { value: 'New project' } });
    expect(headlineInput.value).toBe('New project');
  });

  test('renders the industries input field', () => {
    const headlineInput = screen.getByTestId(
      'headline-input'
    ) as HTMLInputElement;
    fireEvent.change(headlineInput, { target: { value: 'New project' } });
    //navigate to industries screen
    const nextBtn = screen.getByTestId('next-button');
    fireEvent.click(nextBtn);
    const industriesInput = screen.getByText(
      /search industries or add your own/i
    );
    expect(industriesInput).toBeInTheDocument();
  });

  test('updates the industries value when tags are added', () => {
    const headlineInput = screen.getByTestId(
      'headline-input'
    ) as HTMLInputElement;
    fireEvent.change(headlineInput, { target: { value: 'New project' } });
    //navigate to industries screen
    const nextBtn = screen.getByTestId('next-button');
    fireEvent.click(nextBtn);

    const industriesInput = screen.getByTestId('tag-input') as HTMLInputElement;
    fireEvent.change(industriesInput, { target: { value: 'Industry1' } });
    fireEvent.keyDown(industriesInput, { key: 'Enter' });
    fireEvent.change(industriesInput, { target: { value: 'Industry2' } });
    fireEvent.keyDown(industriesInput, { key: 'Enter' });
    expect(industriesInput.value).toBe('');
    const selectedTags = screen.getAllByTestId('unselect-tag');
    expect(selectedTags).toHaveLength(2);
  });

  test('adds the project description', () => {
    const headlineInput = screen.getByTestId(
      'headline-input'
    ) as HTMLInputElement;
    fireEvent.change(headlineInput, { target: { value: 'New project' } });
    //navigate to industries screen
    const nextBtn = screen.getByTestId('next-button');
    fireEvent.click(nextBtn);

    const industriesInput = screen.getByTestId('tag-input') as HTMLInputElement;
    fireEvent.change(industriesInput, { target: { value: 'Industry1' } });
    fireEvent.keyDown(industriesInput, { key: 'Enter' });
    fireEvent.change(industriesInput, { target: { value: 'Industry2' } });
    fireEvent.keyDown(industriesInput, { key: 'Enter' });
    expect(industriesInput.value).toBe('');

    //navigate to description screen
    fireEvent.click(nextBtn);
    const descriptionInput = screen.getByTestId(
      'description-input'
    ) as HTMLInputElement;
    fireEvent.change(descriptionInput, {
      target: { value: 'create a new mobile application' },
    });
    expect(descriptionInput.value).toBe('create a new mobile application');
  });

  test('updates the skills value when tags are added', () => {
    const headlineInput = screen.getByTestId(
      'headline-input'
    ) as HTMLInputElement;
    fireEvent.change(headlineInput, { target: { value: 'New project' } });
    //navigate to industries screen
    const nextBtn = screen.getByTestId('next-button');
    fireEvent.click(nextBtn);

    const industriesInput = screen.getByTestId('tag-input') as HTMLInputElement;
    fireEvent.change(industriesInput, { target: { value: 'Industry1' } });
    fireEvent.keyDown(industriesInput, { key: 'Enter' });
    fireEvent.change(industriesInput, { target: { value: 'Industry2' } });
    fireEvent.keyDown(industriesInput, { key: 'Enter' });
    expect(industriesInput.value).toBe('');

    //navigate to description screen
    fireEvent.click(nextBtn);
    const descriptionInput = screen.getByTestId(
      'description-input'
    ) as HTMLInputElement;
    fireEvent.change(descriptionInput, {
      target: { value: 'create a new mobile application' },
    });

    //navigate to skills screen
    fireEvent.click(nextBtn);
    const skillsInput = screen.getByTestId('tag-input') as HTMLInputElement;
    expect(descriptionInput.value).toBe('create a new mobile application');
    fireEvent.change(skillsInput, { target: { value: 'Kusama' } });
    fireEvent.keyDown(skillsInput, { key: 'Enter' });
    fireEvent.change(skillsInput, { target: { value: 'Polkadot' } });
    fireEvent.keyDown(skillsInput, { key: 'Enter' });
    expect(skillsInput.value).toBe('');
    const selectedTags = screen.getAllByTestId('unselect-tag');
    expect(selectedTags).toHaveLength(2);
  });

  test('selects experience level', () => {
    const headlineInput = screen.getByTestId(
      'headline-input'
    ) as HTMLInputElement;
    fireEvent.change(headlineInput, { target: { value: 'New project' } });
    //navigate to industries screen
    const nextBtn = screen.getByTestId('next-button');
    fireEvent.click(nextBtn);

    const industriesInput = screen.getByTestId('tag-input') as HTMLInputElement;
    fireEvent.change(industriesInput, { target: { value: 'Industry1' } });
    fireEvent.keyDown(industriesInput, { key: 'Enter' });
    fireEvent.change(industriesInput, { target: { value: 'Industry2' } });
    fireEvent.keyDown(industriesInput, { key: 'Enter' });
    expect(industriesInput.value).toBe('');

    //navigate to description screen
    fireEvent.click(nextBtn);
    const descriptionInput = screen.getByTestId(
      'description-input'
    ) as HTMLInputElement;
    fireEvent.change(descriptionInput, {
      target: { value: 'create a new mobile application' },
    });

    //navigate to skills screen
    fireEvent.click(nextBtn);
    const skillsInput = screen.getByTestId('tag-input') as HTMLInputElement;
    expect(descriptionInput.value).toBe('create a new mobile application');
    fireEvent.change(skillsInput, { target: { value: 'Kusama' } });
    fireEvent.keyDown(skillsInput, { key: 'Enter' });
    fireEvent.change(skillsInput, { target: { value: 'Polkadot' } });
    fireEvent.keyDown(skillsInput, { key: 'Enter' });
    expect(skillsInput.value).toBe('');
    const selectedTags = screen.getAllByTestId('unselect-tag');
    expect(selectedTags).toHaveLength(2);

    //navigate to experience level screen
    fireEvent.click(nextBtn);
    //select experience level by selecting input field of type radio with value as "3"
    const expLevelInput = screen.getByDisplayValue('3') as HTMLInputElement;
    fireEvent.click(expLevelInput, { target: { value: '3' } });
    expect(expLevelInput.value).toBe('3');
  });

  test('selects project estimate', () => {
    const headlineInput = screen.getByTestId(
      'headline-input'
    ) as HTMLInputElement;
    fireEvent.change(headlineInput, { target: { value: 'New project' } });
    //navigate to industries screen
    const nextBtn = screen.getByTestId('next-button');
    fireEvent.click(nextBtn);

    const industriesInput = screen.getByTestId('tag-input') as HTMLInputElement;
    fireEvent.change(industriesInput, { target: { value: 'Industry1' } });
    fireEvent.keyDown(industriesInput, { key: 'Enter' });
    fireEvent.change(industriesInput, { target: { value: 'Industry2' } });
    fireEvent.keyDown(industriesInput, { key: 'Enter' });
    expect(industriesInput.value).toBe('');

    //navigate to description screen
    fireEvent.click(nextBtn);
    const descriptionInput = screen.getByTestId(
      'description-input'
    ) as HTMLInputElement;
    fireEvent.change(descriptionInput, {
      target: { value: 'create a new mobile application' },
    });

    //navigate to skills screen
    fireEvent.click(nextBtn);
    const skillsInput = screen.getByTestId('tag-input') as HTMLInputElement;
    expect(descriptionInput.value).toBe('create a new mobile application');
    fireEvent.change(skillsInput, { target: { value: 'Kusama' } });
    fireEvent.keyDown(skillsInput, { key: 'Enter' });
    fireEvent.change(skillsInput, { target: { value: 'Polkadot' } });
    fireEvent.keyDown(skillsInput, { key: 'Enter' });
    expect(skillsInput.value).toBe('');
    const selectedTags = screen.getAllByTestId('unselect-tag');
    expect(selectedTags).toHaveLength(2);

    //navigate to experience level screen
    fireEvent.click(nextBtn);
    //select experience level by selecting input field of type radio with value as "3"
    const expLevelInput = screen.getByDisplayValue('3') as HTMLInputElement;
    fireEvent.click(expLevelInput, { target: { value: '3' } });
    expect(expLevelInput.value).toBe('3');

    //navigate to project scope screen
    fireEvent.click(nextBtn);

    const scopeInput = screen.getByDisplayValue('2') as HTMLInputElement;
    fireEvent.click(scopeInput, { target: { value: '2' } });
    expect(scopeInput.value).toBe('2');
  });

  test('selects project durartion', () => {
    const headlineInput = screen.getByTestId(
      'headline-input'
    ) as HTMLInputElement;
    fireEvent.change(headlineInput, { target: { value: 'New project' } });
    //navigate to industries screen
    const nextBtn = screen.getByTestId('next-button');
    fireEvent.click(nextBtn);

    const industriesInput = screen.getByTestId('tag-input') as HTMLInputElement;
    fireEvent.change(industriesInput, { target: { value: 'Industry1' } });
    fireEvent.keyDown(industriesInput, { key: 'Enter' });
    fireEvent.change(industriesInput, { target: { value: 'Industry2' } });
    fireEvent.keyDown(industriesInput, { key: 'Enter' });
    expect(industriesInput.value).toBe('');

    //navigate to description screen
    fireEvent.click(nextBtn);
    const descriptionInput = screen.getByTestId(
      'description-input'
    ) as HTMLInputElement;
    fireEvent.change(descriptionInput, {
      target: { value: 'create a new mobile application' },
    });

    //navigate to skills screen
    fireEvent.click(nextBtn);
    const skillsInput = screen.getByTestId('tag-input') as HTMLInputElement;
    expect(descriptionInput.value).toBe('create a new mobile application');
    fireEvent.change(skillsInput, { target: { value: 'Kusama' } });
    fireEvent.keyDown(skillsInput, { key: 'Enter' });
    fireEvent.change(skillsInput, { target: { value: 'Polkadot' } });
    fireEvent.keyDown(skillsInput, { key: 'Enter' });
    expect(skillsInput.value).toBe('');
    const selectedTags = screen.getAllByTestId('unselect-tag');
    expect(selectedTags).toHaveLength(2);

    //navigate to experience level screen
    fireEvent.click(nextBtn);
    //select experience level by selecting input field of type radio with value as "3"
    const expLevelInput = screen.getByDisplayValue('3') as HTMLInputElement;
    fireEvent.click(expLevelInput, { target: { value: '3' } });
    expect(expLevelInput.value).toBe('3');

    //navigate to project scope screen
    fireEvent.click(nextBtn);

    const scopeInput = screen.getByDisplayValue('2') as HTMLInputElement;
    fireEvent.click(scopeInput, { target: { value: '2' } });
    expect(scopeInput.value).toBe('2');

    //navigate to project duration screen
    fireEvent.click(nextBtn);

    const durationInput = screen.getByDisplayValue('1') as HTMLInputElement;
    fireEvent.click(durationInput, { target: { value: '1' } });
    expect(durationInput.value).toBe('1');
    expect(durationInput.value).not.toBe('2');
  });

  test('inputs budget amount', () => {
    const headlineInput = screen.getByTestId(
      'headline-input'
    ) as HTMLInputElement;
    fireEvent.change(headlineInput, { target: { value: 'New project' } });
    //navigate to industries screen
    const nextBtn = screen.getByTestId('next-button');
    fireEvent.click(nextBtn);

    const industriesInput = screen.getByTestId('tag-input') as HTMLInputElement;
    fireEvent.change(industriesInput, { target: { value: 'Industry1' } });
    fireEvent.keyDown(industriesInput, { key: 'Enter' });
    fireEvent.change(industriesInput, { target: { value: 'Industry2' } });
    fireEvent.keyDown(industriesInput, { key: 'Enter' });
    expect(industriesInput.value).toBe('');

    //navigate to description screen
    fireEvent.click(nextBtn);
    const descriptionInput = screen.getByTestId(
      'description-input'
    ) as HTMLInputElement;
    fireEvent.change(descriptionInput, {
      target: { value: 'create a new mobile application' },
    });

    //navigate to skills screen
    fireEvent.click(nextBtn);
    const skillsInput = screen.getByTestId('tag-input') as HTMLInputElement;
    expect(descriptionInput.value).toBe('create a new mobile application');
    fireEvent.change(skillsInput, { target: { value: 'Kusama' } });
    fireEvent.keyDown(skillsInput, { key: 'Enter' });
    fireEvent.change(skillsInput, { target: { value: 'Polkadot' } });
    fireEvent.keyDown(skillsInput, { key: 'Enter' });
    expect(skillsInput.value).toBe('');
    const selectedTags = screen.getAllByTestId('unselect-tag');
    expect(selectedTags).toHaveLength(2);

    //navigate to experience level screen
    fireEvent.click(nextBtn);
    //select experience level by selecting input field of type radio with value as "3"
    const expLevelInput = screen.getByDisplayValue('3') as HTMLInputElement;
    fireEvent.click(expLevelInput, { target: { value: '3' } });
    expect(expLevelInput.value).toBe('3');

    //navigate to project scope screen
    fireEvent.click(nextBtn);

    const scopeInput = screen.getByDisplayValue('2') as HTMLInputElement;
    fireEvent.click(scopeInput, { target: { value: '2' } });
    expect(scopeInput.value).toBe('2');

    //navigate to project duration screen
    fireEvent.click(nextBtn);

    const durationInput = screen.getByDisplayValue('1') as HTMLInputElement;
    fireEvent.click(durationInput, { target: { value: '1' } });

    //navigate to budget screen
    fireEvent.click(nextBtn);

    const budgetInput = screen.getByTestId('budget-input') as HTMLInputElement;
    fireEvent.change(budgetInput, { target: { value: '1000' } });
    expect(budgetInput.value).toBe('1000');
    expect(budgetInput.value).not.toBe('');
  });

  test('Test case for validating the form submission', () => {
    // Ensure that the form cannot be submitted if any required fields are empty.
    const headlineInput = screen.getByTestId(
      'headline-input'
    ) as HTMLInputElement;
    fireEvent.change(headlineInput, { target: { value: '' } });
    //navigate to industries screen
    const nextBtn = screen.getByTestId('next-button');
    fireEvent.click(nextBtn);
    // expect next button to be disabled
    expect(nextBtn).toBeDisabled();
  });
});

describe('Test case for API call', () => {
  beforeAll(() => {
    // Mock the utils.getCurrentUser method to return a fixed array of briefs
    const mockGetAllBriefs = utils.getCurrentUser as jest.MockedFunction<
      typeof utils.getCurrentUser
    >;
    mockGetAllBriefs.mockResolvedValue(dummyUser);
    // Mock the utils.getCurrentUser method to return a fixed array of briefs
    const mockGetServerSideProps = getServerSideProps as jest.MockedFunction<
      typeof getServerSideProps
    >;
    mockGetServerSideProps.mockResolvedValue(getServerSideData);
  });

  beforeEach(() => {
    render(
      <Providers>
        <NewBrief />
      </Providers>
    );
  });
  test('Test case for validating the API call', () => {
    const headlineInput = screen.getByTestId(
      'headline-input'
    ) as HTMLInputElement;
    fireEvent.change(headlineInput, { target: { value: 'New project' } });
    //navigate to industries screen
    const nextBtn = screen.getByTestId('next-button');
    fireEvent.click(nextBtn);
    const industriesInput = screen.getByTestId('tag-input') as HTMLInputElement;
    fireEvent.change(industriesInput, { target: { value: 'Industry1' } });
    fireEvent.keyDown(industriesInput, { key: 'Enter' });
    fireEvent.change(industriesInput, { target: { value: 'Industry2' } });
    fireEvent.keyDown(industriesInput, { key: 'Enter' });
    //navigate to description screen
    fireEvent.click(nextBtn);
    const descriptionInput = screen.getByTestId(
      'description-input'
    ) as HTMLInputElement;
    fireEvent.change(descriptionInput, { target: { value: 'Description' } });
    //navigate to skills screen
    fireEvent.click(nextBtn);
    const skillsInput = screen.getByTestId('tag-input') as HTMLInputElement;
    fireEvent.change(skillsInput, { target: { value: 'Skill1' } });
    fireEvent.keyDown(skillsInput, { key: 'Enter' });
    fireEvent.change(skillsInput, { target: { value: 'Skill2' } });
    fireEvent.keyDown(skillsInput, { key: 'Enter' });
    //navigate to experience level screen
    fireEvent.click(nextBtn);
    //select experience level by selecting input field of type radio with value as "3"
    const expLevelInput = screen.getByDisplayValue('3') as HTMLInputElement;
    fireEvent.click(expLevelInput, { target: { value: '3' } });

    //navigate to scope screen
    fireEvent.click(nextBtn);

    const scopeInput = screen.getByDisplayValue('4') as HTMLInputElement;
    fireEvent.click(scopeInput, { target: { value: '3' } });
    //navigate to duration screen
    fireEvent.click(nextBtn);

    const durationInput = screen.getByDisplayValue('2') as HTMLInputElement;
    fireEvent.click(durationInput, { target: { value: '2' } });
    //navigate to budget screen
    fireEvent.click(nextBtn);

    const budgetInput = screen.getByTestId('budget-input') as HTMLInputElement;
    fireEvent.change(budgetInput, { target: { value: '1000' } });

    const submitBtn = screen.getByTestId('submit-button');

    fireEvent.click(submitBtn);

    waitFor(() => {
      const completedText = screen.getByText("That's It. All done!");
      expect(completedText).toBeInTheDocument();
    });
  });
});
