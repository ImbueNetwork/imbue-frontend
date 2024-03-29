import { BriefFilterOption } from '../../src/types/briefTypes';

export const briefsData = [
  {
    id: 1,
    headline: 'briefOne',
    industries: [
      {
        id: 23,
        name: 'finance',
      },
      {
        id: 23,
        name: 'gramental',
      },
      {
        id: 23,
        name: 'agriculture',
      },
    ],
    description:
      'finance brief briefOne has to be longer ? so make this longer briefOne has to be longer ? so make this longer',
    skills: [
      {
        id: 23,
        name: 'finance',
      },
      {
        id: 23,
        name: 'finance',
      },
      {
        id: 23,
        name: 'finance',
      },
    ],
    scope_id: 123,
    scope_level: 'average',
    duration: '3 months',
    duration_id: 1234,
    budget: 123445,
    created: new Date(),
    created_by: 'sandam',
    experience_level: 'Intermediate',
    experience_id: 13,
    document_url: 'http://www.imbue.com',
    number_of_briefs_submitted: 12,
    user_id: 1234,
    verified_only: false,
  },
  {
    id: 2,
    headline: 'briefTwo',
    industries: [
      {
        id: 23,
        name: 'finance two',
      },
      {
        id: 23,
        name: 'gramental two',
      },
      {
        id: 23,
        name: 'agriculture two',
      },
    ],
    description: 'finance brief two',
    skills: [
      {
        id: 23,
        name: 'finance',
      },
      {
        id: 23,
        name: 'finance',
      },
      {
        id: 23,
        name: 'finance',
      },
    ],
    scope_id: 123,
    scope_level: 'average',
    duration: '3 months',
    duration_id: 1234,
    budget: 123445,
    created: new Date(),
    created_by: 'sandam two',
    experience_level: 'expert',
    experience_id: 13,
    document_url: 'http://www.imbue.com',
    number_of_briefs_submitted: 3,
    user_id: 1234,
    verified_only: true,
  },
  {
    id: 3,
    headline: 'briefThree',
    industries: [
      {
        id: 23,
        name: 'finance',
      },
      {
        id: 23,
        name: 'finance',
      },
      {
        id: 23,
        name: 'finance',
      },
    ],
    description: 'finance brief three',
    skills: [
      {
        id: 23,
        name: 'finance',
      },
      {
        id: 23,
        name: 'finance',
      },
      {
        id: 23,
        name: 'finance',
      },
    ],
    scope_id: 123,
    scope_level: 'average',
    duration: '7 months',
    duration_id: 1234,
    budget: 123445,
    created: new Date(),
    created_by: 'sandam three',
    experience_level: 'expert',
    experience_id: 13,
    document_url: 'http://www.imbue.com',
    number_of_briefs_submitted: 11,
    user_id: 1234,
    verified_only: false,
  },
];

export const searchMockResponse = [
  {
    id: 3,
    headline: 'briefThree',
    industries: [
      {
        id: 23,
        name: 'finance',
      },
      {
        id: 23,
        name: 'finance',
      },
      {
        id: 23,
        name: 'finance',
      },
    ],
    description: 'finance brief three',
    skills: [
      {
        id: 23,
        name: 'finance',
      },
      {
        id: 23,
        name: 'finance',
      },
      {
        id: 23,
        name: 'finance',
      },
    ],
    scope_id: 123,
    scope_level: 'average',
    duration: '1-3 months',
    duration_id: 1234,
    budget: 123445,
    created: new Date(),
    created_by: 'sandam three',
    experience_level: 'Intermediate',
    document_url: 'http://www.imbue.com',
    experience_id: 13,
    number_of_briefs_submitted: 11,
    user_id: 1234,
  },
];

export const projectLengthData = [
  {
    id: 3,
    headline: 'briefThree',
    industries: [
      {
        id: 23,
        name: 'finance three',
      },
    ],
    description: 'finance brief three',
    skills: [
      {
        id: 23,
        name: 'finance three',
      },
    ],
    scope_id: 123,
    scope_level: 'average',
    duration: '1-3 months',
    duration_id: 1234,
    budget: 123445,
    created: new Date(),
    created_by: 'sandam three',
    experience_level: 'expert',
    document_url: 'http://www.imbue.com',
    experience_id: 13,
    number_of_briefs_submitted: 11,
    user_id: 1234,
  },
];

export const intermediateExpData = [
  {
    id: 1,
    headline: 'briefOne',
    industries: [
      {
        id: 23,
        name: 'finance',
      },
    ],
    description: 'finance brief',
    skills: [
      {
        id: 23,
        name: 'finance',
      },
    ],
    scope_id: 123,
    scope_level: 'average',
    duration: '3 months',
    duration_id: 1234,
    budget: 123445,
    created: new Date(),
    created_by: 'sandam',
    experience_level: 'Intermediate',
    experience_id: 13,
    document_url: 'http://www.imbue.com',
    number_of_briefs_submitted: 12,
    user_id: 1234,
  },
];

export const expertExpData = [
  {
    id: 3,
    headline: 'briefThree',
    industries: [
      {
        id: 23,
        name: 'finance three',
      },
    ],
    description: 'finance brief three',
    skills: [
      {
        id: 23,
        name: 'finance three',
      },
    ],
    scope_id: 123,
    scope_level: 'average',
    duration: '7 months',
    duration_id: 1234,
    budget: 123445,
    created: new Date(),
    created_by: 'sandam three',
    experience_level: 'expert',
    experience_id: 13,
    document_url: 'http://www.imbue.com',
    number_of_briefs_submitted: 11,
    user_id: 1234,
  },
];

export const amountOfBriefsSubmitted = [
  {
    id: 1,
    headline: 'briefOne',
    industries: [
      {
        id: 23,
        name: 'finance',
      },
    ],
    description: 'finance brief',
    skills: [
      {
        id: 23,
        name: 'finance',
      },
    ],
    scope_id: 123,
    scope_level: 'average',
    duration: '3 months',
    duration_id: 1234,
    budget: 123445,
    created: new Date(),
    created_by: 'sandam',
    experience_level: 'Intermediate',
    experience_id: 13,
    document_url: 'http://www.imbue.com',
    number_of_briefs_submitted: 12,
    user_id: 1234,
  },
  {
    id: 3,
    headline: 'briefThree',
    industries: [
      {
        id: 23,
        name: 'finance three',
      },
    ],
    description: 'finance brief three',
    skills: [
      {
        id: 23,
        name: 'finance three',
      },
    ],
    scope_id: 123,
    scope_level: 'average',
    duration: '7 months',
    duration_id: 1234,
    budget: 123445,
    created: new Date(),
    created_by: 'sandam three',
    experience_level: 'expert',
    document_url: 'http://www.imbue.com',
    experience_id: 13,
    number_of_briefs_submitted: 11,
    user_id: 1234,
  },
];

export const expfilter = {
  // This is a table named "experience"
  // If you change this you must remigrate the experience table and add the new field.
  filterType: BriefFilterOption.ExpLevel,
  label: 'Experience Level',
  options: [
    {
      interiorIndex: 0,
      search_for: [1],
      value: 'Entry Level',
      or_max: false,
    },
    {
      interiorIndex: 1,
      search_for: [2],
      value: 'Intermediate',
      or_max: false,
    },
    {
      interiorIndex: 2,
      search_for: [3],
      value: 'Expert',
      or_max: false,
    },
    {
      interiorIndex: 3,
      search_for: [4],
      value: 'Specialist',
      or_max: false,
    },
  ],
};

export const dummyFreelancerBrief = {
  id: 4,
  headline: 'jhdkb\n',
  description: 'dkvxjncv',
  scope_level: 'Medium',
  scope_id: 2,
  duration: '3-6 months',
  duration_id: 2,
  budget: 10,
  created_by: 'TegaBrave',
  experience_level: 'Expert',
  experience_id: 3,
  created: new Date('2023-06-14T19:33:02.790Z'),
  user_id: 6,
  project_id: undefined,
  number_of_briefs_submitted: 2,
  verified_only: false,
  skills: [
    {
      id: 7,
      name: 'polkadot',
    },
  ],
  skill_ids: ['7'],
  industries: [
    {
      id: 10,
      name: 'arts and culture',
    },
  ],
  industry_ids: ['10'],
  owner_name: 'polkadot',
  owner_photo: '',
};
