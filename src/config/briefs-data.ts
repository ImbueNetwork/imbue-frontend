export const stepData = [
  {
    heading: "First, let's start with a clear name",
    content: `This helps your brief post stand out to the right candidates.
    It’s the first thing they’ll see, so make it count!`,
    progress: 0,
  },
  {
    heading: "Great! What industry does your project fall under?",
    content: `This helps your brief post stand out to the right candidates.
    It’s the first thing they’ll see, so make it count!`,
    progress: 0.5,
  },
  {
    heading: "Describe the project you are envisioning.",
    content: `This is how imbuers figure out what you need and why you’re great to work with!
    Include your expectations about the task or deliverable, what you’re looking for in a work relationship, and anything unique about your project, team, or company.`,
    next: "Skills",
    progress: 0.5,
  },
  {
    heading: "What skills do you require?",
    content: `This helps your brief post stand out to the right candidates.
    It’s the first thing they’ll see, so make it count!`,
    next: "Skills",
    progress: 1.0,
  },
  {
    heading: "Experience?",
    content: `This is how imbuers figure out who should apply to this brief! 
    The more experienced they are the bigger you should set your budget`,
    next: "Scope",
    progress: 1.5,
  },
  {
    heading: "Next, estimate the scope of your project.",
    content: `Consider the size of your project, the team you will require and the time it will take.`,
    next: "Time",
    progress: 2.0,
  },
  {
    heading: "How long do you estimate your project will take?",
    content: `This is not set in stone, but it will offer those that submit guidance on what you are expecting.`,
    next: "Budget",
    progress: 2.5,
  },
  {
    heading: "Almost done! Tell us about the budget you have in mind.",
    content:
      "This will help people submit proposals that are within your range.",
    progress: 3.0,
  },
  {
    heading: "That's It. All done!",
    content:
      "Your brief will be listed shortly after submission and people will be able to submit proposals for you to review.",
    progress: 3.0,
  },
];

export const nameExamples = [
  "Build a dapp",
  "Write a smart contract",
  "Generate Content, e.g. blog, videos",
];

export const scopeData = [
  {
    label: "Complex",
    value: 4,
    description:
      "A long term project with complex initiatives, intersecting tasks and numerous teams.",
  },
  {
    label: "Large",
    value: 3,
    description:
      "A long term project with multiple tasks and requirements, with well defined milestones and a set plan",
  },
  {
    label: "Medium",
    value: 2,
    description: "A well-defined project, with tasks already mapped out",
  },
  {
    label: "Small",
    value: 1,
    description: "A relatively fast and straightforward project",
  },
];

export const timeData = [
  {
    label: "More than a year",
    value: 4,
  },
  {
    label: "More than 6 months",
    value: 3,
  },
  {
    label: "3-6 months",
    value: 2,
  },
  {
    label: "1 to 3 months",
    value: 1,
  },
];

export const experiencedLevel = [
  {
    label: "Entry Level",
    value: 1,
  },
  {
    label: "Intermediate",
    value: 2,
  },
  {
    label: "Expert",
    value: 3,
  },
  {
    label: "Specialist",
    value: 4,
  },
];

export const suggestedIndustries = [
  "Web3",
  "DeFi",
  "Education",
  "Agriculture",
  "Communications",
  "Health",
  "Wellness",
  "Energy",
  "Sustainability",
  "Arts and Culture",
  "Entertainment",
  "Real Estate",
  "Technology",
  "Supply Chain",
];

export const suggestedSkills = [
  "Substrate",
  "Rust",
  "Polkadot",
  "Kusama",
  "React",
  "Typescript",
];

export const dumyBriefs = [
  {
    id: 1,
    headline: "Amazing Frontend Developer NEEDED!!",
    description:
      "We need some absolute wizard to create an ultra dynamic thing with carosels",
    scope_level: "Medium",
    scope_id: 2,
    duration: "3-6 months",
    duration_id: 2,
    budget: "1000",
    created_by: "Dude Mckenzie",
    experience_level: "Intermediate",
    experience_id: 2,
    created: "2023-04-08T15:32:25.561Z",
    user_id: 1,
    project_id: null,
    number_of_briefs_submitted: 20,
    skills: [
      {
        id: 1,
        name: "substrate",
      },
      {
        id: 2,
        name: "rust",
      },
      {
        id: 6,
        name: "c++",
      },
      {
        id: 7,
        name: "polkadot",
      },
    ],
    skill_ids: ["1", "2", "6", "7"],
    industries: [
      {
        id: 1,
        name: "substrate",
      },
      {
        id: 2,
        name: "rust",
      },
    ],
    industry_ids: ["1", "2"],
  },
  {
    id: "2",
    headline: "Amazing C++ Developer",
    description:
      "We need some absolute wizard to create an ultra cool, mega thing with spinning balls",
    scope_level: "Small",
    scope_id: 1,
    duration: "1 to 3 months",
    duration_id: 1,
    budget: 200,
    created_by: "Mike Doomer",
    experience_level: "Expert",
    experience_id: 3,
    created: new Date("2023-03-30T07:10:04.510Z"),
    user_id: 2,
    project_id: null,
    number_of_briefs_submitted: 3,
    skills: [
      { id: 3, name: "react" },
      { id: 4, name: "typescript" },
      { id: 5, name: "javascript" },
      { id: 8, name: "figma" },
    ],
    skill_ids: ["3", "4", "5", "8"],
    industries: [
      { id: 1, name: "substrate" },
      { id: 2, name: "rust" },
    ],
    industry_ids: ["1", "2"],
  },
];

export const dummyUnderReviewBriefs = [
  {
    id: 4,
    headline: "Mobile Lead at SABI",
    description: "wedfjywcb iydgciu viuhevo uihweoivn",
    scope_level: "Medium",
    scope_id: 2,
    duration: "3-6 months",
    duration_id: 2,
    budget: "1200",
    created_by: "mike",
    experience_level: "Expert",
    experience_id: 3,
    created: "2023-04-06T16:11:19.263Z",
    user_id: 6,
    project_id: null,
    number_of_briefs_submitted: 1,
    skills: ["polkadot", "rust"],
    skill_ids: ["2", "7"],
    industries: ["education"],
    industry_ids: ["3"],
    number_of_applications: 1,
  },
];

export const dummyDashboardApplications = [
  {
    id: 4,
    name: "Brief Application: Mobile Lead at SABI",
    logo: "null",
    description: "null",
    website: "null",
    category: undefined,
    currency_id: 0,
    chain_project_id: undefined,
    total_cost_without_fee: 1200.0,
    imbue_fee: 60.0,
    status_id: 1,
    required_funds: 1260.0,
    owner: undefined,
    user_id: 6,
    created: new Date("2023-04-06T16:13:29.873Z"),
    modified: new Date("2023-04-06T16:13:29.873Z"),
    brief_id: 4,
    milestones: [],
  },
];

export const dummyDashboardBriefApplications = [
  {
    id: 4,
    name: "Brief Application: Mobile Lead at SABI",
    logo: "null",
    description: "null",
    website: "null",
    category: "null",
    currency_id: 0,
    chain_project_id: undefined,
    total_cost_without_fee: 1200.0,
    imbue_fee: 60.0,
    status_id: 1,
    required_funds: 1260.0,
    owner: undefined,
    user_id: 6,
    create_block_number: null,
    created: new Date("2023-04-06T16:13:29.873Z"),
    modified: new Date("2023-04-06T16:13:29.873Z"),
    brief_id: 4,
    freelancer: {
      id: 2,
      freelanced_before:
        "I've freelanced before however, i may need some extra help.",
      freelancing_goal: "To make a little extra money on the side",
      work_type: "",
      education: "",
      experience: "I've freelanced before however, i may need some extra help.",
      facebook_link: "",
      twitter_link: "",
      telegram_link: "",
      discord_link: "",
      title: "Senior react developer",
      bio: "dackhbs uah oiahji m",
      user_id: 6,
      username: "mike",
      display_name: "mike",
      web3_address: "5GRHPcY3zEgJezesmYHQyuo7YouwXVjnDR8ZcX9CQuFJadaL",
      created: "2023-04-06T16:12:40.202Z",
      skills: ["adobe photoshop", "solidity"],
      skill_ids: ["11", "9"],
      languages: ["arabic", "spanish"],
      language_ids: ["4", "5"],
      services: ["mobile (android/ios)", "web design"],
      service_ids: ["2", "3"],
      clients: [null],
      client_ids: [null],
      client_images: [null],
      client_image_ids: [null],
      rating: null,
      num_ratings: "0",
    },
    milestones: [
      {
        milestone_index: 0,
        project_id: 4,
        amount: 1200.0,
        name: "uysgdvi swuivhouws dhvw",
        percentage_to_unlock: 100,
        is_approved: false,
        created: "2023-04-06T16:13:29.873Z",
        modified: "2023-04-06T16:13:29.873Z",
        milestone_key: 0,
        isApproved: false,
      },
    ],
  },
];

export const dummyApplicationProject = {
  id: 1,
  name: "Amazing Frontend Developer NEEDED!!",
  logo: null,
  description: null,
  website: null,
  category: null,
  currency_id: 0,
  chain_project_id: null,
  total_cost_without_fee: "1000.00",
  imbue_fee: "50.00",
  status_id: 1,
  required_funds: "1050.00",
  owner: null,
  user_id: 5,
  create_block_number: null,
  created: "2023-04-09T19:02:35.998Z",
  modified: "2023-04-09T19:05:24.991Z",
  brief_id: 1,
  milestones: [
    {
      milestone_index: 0,
      project_id: 1,
      amount: "1000.00",
      name: "first one",
      percentage_to_unlock: 100,
      is_approved: false,
      created: "2023-04-09T19:05:24.991Z",
      modified: "2023-04-09T19:05:24.991Z",
    },
  ],
};

export const dummyFreelanderProfile = {
  id: 1,
  freelanced_before:
    "I've freelanced before however, i may need some extra help.",
  freelancing_goal: "To make a little extra money on the side",
  work_type: "",
  education: "",
  experience: "I've freelanced before however, i may need some extra help.",
  facebook_link: "",
  twitter_link: "",
  telegram_link: "",
  discord_link: "",
  title: "Senior Frontend Developer",
  bio: "The best life ever",
  user_id: 5,
  username: "mike",
  display_name: "mike",
  web3_address: "5GRHPcY3zEgJezesmYHQyuo7YouwXVjnDR8ZcX9CQuFJadaL",
  created: "2023-04-08T15:38:29.157Z",
  skills: [
    {
      id: 5,
      name: "javascript",
    },
  ],
  skill_ids: ["5"],
  languages: [
    {
      id: 8,
      name: "english",
    },
  ],
  language_ids: ["8"],
  services: [
    {
      id: 1,
      name: "web development",
    },
    {
      id: 2,
      name: "web design",
    },
    {
      id: 3,
      name: "mobile (android/ios)",
    },
    {
      id: 5,
      name: "smart contracts",
    },
  ],
  service_ids: ["1", "2", "3", "5"],
  clients: [null],
  client_ids: [null],
  client_images: [],
  client_image_ids: [null],
  rating: null,
  num_ratings: "0",
};
