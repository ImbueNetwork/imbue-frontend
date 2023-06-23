import React from 'react';

import { suggestedFreelancingSkills } from '@/config/freelancer-data';

import { TagsInput } from '../TagsInput';

type EditSkillsProps = {
  skills: string[];
  setSkills: (_skills: string[]) => void;
};

const EditSkills = ({ skills, setSkills }: EditSkillsProps) => {
  return (
    <div className='freelance-xp-container'>
      <div className='skills-container'>
        <TagsInput
          suggestData={suggestedFreelancingSkills}
          tags={skills}
          onChange={(tags) => setSkills(tags)}
        />
      </div>
    </div>
  );
};

export default EditSkills;
