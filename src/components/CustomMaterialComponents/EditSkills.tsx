import React, { useState } from 'react';
import { TagsInput } from '../TagsInput';
import { suggestedFreelancingSkills } from '@/config/freelancer-data';
import { type } from 'os';

type EditSkillsProps = {
    skills : string[];
    setSkills : Function;
}

const EditSkills = ({skills, setSkills} :EditSkillsProps) => {
    return (
        <div className="freelance-xp-container">
            <div className="skills-container">
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