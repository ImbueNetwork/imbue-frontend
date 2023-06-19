import { render, screen } from '@testing-library/react';

import Project from '@/pages/projects/[id]';

jest.mock('next/router', () => ({
  useRouter: () => ({
    query: { id: '123' },
  }),
}));

jest.mock('stream-chat-react', () => ({
  Channel: jest.fn(),
  Chat: jest.fn(),
  MessageInput: jest.fn(),
  MessageList: jest.fn(),
  Thread: jest.fn(),
  useChannelStateContext: jest.fn(),
  useChatContext: jest.fn(),
  Window: jest.fn(),
}));

jest.mock('stream-chat-react/dist/css/v2/index.css', () => jest.fn());

describe('Project page', () => {
  it('renders project details correctly', async () => {
    render(<Project />);

    // Mock the API response or provide sample data to test the component

    // Assert the presence of specific elements or text on the page
    const milestoneElement = screen.getByText(/Milestone 1/i);
    expect(milestoneElement).toBeInTheDocument();

    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeInTheDocument();

    // Add more assertions as needed
  });
});
