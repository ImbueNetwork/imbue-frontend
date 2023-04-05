import { User, Freelancer } from "@/model";

export type FreelancerProps = {
  user: User;
};

export type FreelancerState = {
  step: number;
  info: Freelancer;
  display_name: string;
};
