import { FormControl, TextField } from '@mui/material';
import React, { useState } from 'react';
import { TagsInput } from "../TagsInput";
import { suggestedFreelancingSkills, } from "@/config/freelancer-data";

const EditProfile = (): JSX.Element => {
    const [skills, setSkills] = useState<string[]>([]);

    const handleSubmit = (e: any) => {
        e.preventDefault()
        const firstName = e.target.firstName.value
        const lastName = e.target.lastName.value
        const otherName = e.target.lastName.value
        const country = e.target.country.value
        const city = e.target.city.value
        const network = e.target.network.value
        const publicKey = e.target.publicKey.value
        const bio = e.target.bio.value
        const education = e.target.education.value
        const certification = e.target.certification.value
        console.log({
            firstName,
            lastName,
            otherName,
            country,
            city,
            network,
            publicKey,
            bio,
            education,
            certification,
            skills
        });
    }

    return (
        <div className='bg-theme-grey-dark mx-auto h-full w-2/3 py-8 rounded-xl border border-light-white'>
            <h3 className='ml-[66px] mb-[22px]'>Edit Profile</h3>

            <div className='basicInfo w-full'>
                <form
                    className='w-full flex flex-col'
                    onSubmit={(e) => handleSubmit(e)}>

                    <div className='border-y border-y-light-white px-[66px] py-[32px]'>

                        <div className='flex flex-col gap-[16px]'>
                            <h3>Basic Info*</h3>
                            <TextField
                                className='w-full'
                                id="outlined-basic"
                                label="First Name"
                                name='firstName'
                            />

                            <TextField
                                className='w-full'
                                id="outlined-basic"
                                label="Last Name"
                                name='lastName'
                            />

                            <TextField
                                className='w-full'
                                id="outlined-basic"
                                label="Other Name"
                                name='otherName'
                            />
                        </div>

                        <div className='flex flex-col gap-[16px] pt-[20px]'>
                            <h3>Location*</h3>
                            <TextField
                                className='w-full'
                                id="outlined-basic"
                                label="Country/Region"
                                name='country'
                            />

                            <TextField
                                className='w-full'
                                id="outlined-basic"
                                label="City"
                                name='city'
                            />
                        </div>

                        <div className='flex flex-col gap-[16px] pt-[20px]'>
                            <h3>Among My Clinets*</h3>
                            <TextField
                                className='w-full'
                                id="outlined-basic"
                                label="Network"
                                name='network'
                            />
                        </div>

                        <div className='flex flex-col gap-[16px] pt-[20px]'>
                            <h3>Wallet Address*</h3>
                            <TextField
                                className='w-full'
                                id="outlined-basic"
                                label="Public Key"
                                name='publicKey'
                            />
                        </div>

                        <div className='flex flex-col gap-[16px] pt-[20px]'>
                            <h3>Linked Accounts*</h3>

                        </div>

                        <div className='flex flex-col pt-[20px]'>
                            <h3>Skills*</h3>
                            <div className="freelance-xp-container">
                                <div className="skills-container">
                                    <TagsInput
                                        suggestData={suggestedFreelancingSkills}
                                        tags={skills}
                                        onChange={(tags) => setSkills(tags)}
                                    />
                                </div>

                            </div>
                        </div>

                        <div className='flex flex-col gap-[16px] pt-[20px]'>
                            <h3>About*</h3>
                            <TextField
                                className='w-full'
                                id="outlined-basic"
                                label="Add Bio"
                                name='bio'
                            />
                        </div>

                        <div className='flex flex-col gap-[16px] pt-[20px]'>
                            <h3>Eduction*</h3>
                            <TextField
                                className='w-full'
                                id="outlined-basic"
                                label="Education"
                                name='education'
                            />

                            <TextField
                                className='w-full'
                                id="outlined-basic"
                                label="Certification"
                                name='certification'
                            />
                        </div>

                    </div>

                    <input type="submit" className='primary-btn in-dark ml-auto mt-[20px]' />


                </form>
            </div>
        </div>
    );
};

export default EditProfile;