import { Autocomplete, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { searchSkills } from '@/redux/services/briefService';

type EditSkillsProps = {
  skills: string[];
  setSkills: (_skills: string[]) => void;
};

const EditSkills = ({ skills, setSkills }: EditSkillsProps) => {
  const [suggestSkill, setSuggestSkills] = useState<any>([]);

  useEffect(() => {
    const setUp = async () => {
      await searchSkill('');
    };
    setUp();
  }, []);

  const searchSkill = async (name: string) => {
    const skillRes = await searchSkills(name);
    if (!skillRes || !skillRes?.skills.length) return;
    setSuggestSkills(skillRes?.skills.map((skill) => skill.name));
  };

  return (
    <div className='freelance-xp-container'>
      <div className='skills-container'>
        <Autocomplete
          id='tags-standard'
          multiple
          getOptionLabel={(option) => option}
          options={suggestSkill}
          sx={{ width: '100%' }}
          onChange={(e, value) => setSkills(value)}
          defaultValue={skills}
          renderInput={(params) => (
            <TextField
              color='secondary'
              onChange={(e) => searchSkill(e.target.value)}
              {...params}
            />
          )}
        />
      </div>
    </div>
  );
};

export default EditSkills;
