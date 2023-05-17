import React, { useEffect, useState } from 'react';
import EditSkills from '../CustomMaterialComponents/EditSkills';

type SkillsCompProps = {
    isEditMode : boolean;
    setFreelancer: Function;
    freelancer: any;
    skills: string[];
    setSkills: Function;
}

const Skills = ({isEditMode, setFreelancer, freelancer, skills, setSkills}:SkillsCompProps) => {
  useEffect(() => {
    setFreelancer({ ...freelancer, skills: skills.map((skill) => ({ name: skill })) })
  }, [skills])

    return (
        <div className="mx-[30px] lg:mx-[40px]">
        <div className="header-editable">
          <h5>Skills</h5>
        </div>
        {
          isEditMode
            ? (
              <EditSkills {...{ skills, setSkills }} />
            )
            : (
              <div className="flex flex-wrap gap-5 mt-6">
                {freelancer?.skills?.map?.((skill: any, skillIndex: string) => (
                  <p
                    className={`pill-button capitalize`}
                    key={skillIndex}
                  >
                    {skill?.name}
                  </p>
                ))}
              </div>
            )
        }

      </div>
    );
};

export default Skills;