import React, { useEffect } from 'react';

import EditSkills from '../CustomMaterialComponents/EditSkills';

type SkillsCompProps = {
  isEditMode: boolean;
  setFreelancer: (_freelancer: any) => void;
  freelancer: any;
  skills: string[];
  setSkills: (_skills: string[]) => void;
};

const Skills = ({
  isEditMode,
  setFreelancer,
  freelancer,
  skills,
  setSkills,
}: SkillsCompProps) => {
  useEffect(() => {
    setFreelancer({
      ...freelancer,
      skills: skills.map((skill) => ({ name: skill })),
    });
  }, [skills]);

  return (
    <div className='mx-[30px] lg:mx-[40px]'>
      <div className='header-editable'>
        <h5>Skills</h5>
      </div>
      {isEditMode ? (
        <EditSkills {...{ skills, setSkills }} />
      ) : (
        <div className='flex flex-wrap gap-5 mt-6'>
          {freelancer?.skills?.map?.((skill: any, skillIndex: string) => (
            <p className={`pill-button capitalize`} key={skillIndex}>
              {skill?.name}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default Skills;
