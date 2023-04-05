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
    id: "1",
    headline: "Amazing Frontend Developer NEEDED!!",
    description:
      "We need some absolute wizard to create an ultra dynamic thing with carosels",
    scope_level: "Medium",
    scope_id: 2,
    duration: "3-6 months",
    duration_id: 2,
    budget: 1000,
    created_by: "Dude Mckenzie",
    experience_level: "Intermediate",
    experience_id: 2,
    created: new Date("2023-03-30T07:10:04.510Z"),
    user_id: 1,
    project_id: null,
    number_of_briefs_submitted: 20,
    skills: [
      { id: 1, name: "substrate" },
      { id: 2, name: "rust" },
      { id: 6, name: "c++" },
      { id: 7, name: "polkadot" },
    ],
    skill_ids: ["1", "2", "6", "7"],
    industries: [
      { id: 1, name: "substrate" },
      { id: 2, name: "rust" },
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
