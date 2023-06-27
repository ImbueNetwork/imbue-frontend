import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import { Proposal, ProposalItemProps } from '@/types/proposalsTypes';

const fetchProjects = async () => {
  // TODO:
  return [];
  // const resp = await fetch(`${config.apiBase}/projects/`, {
  //   headers: config.getAPIHeaders,
  // });

  // if (resp.ok) {
  //   return await resp.json();
  // } else {
  //   // probably only 500+ here since this is a listing route
  //   // this.dispatchEvent(utils.badRouteEvent("server-error"));
  // }
};

const ProposalItem = ({
  projectId,
  imageSrc,
  name,
}: ProposalItemProps): JSX.Element => {
  return (
    <div className='block mb-[30px] border border-solid border-[#007] shadow-lg shadow-[#333]'>
      <li className='no-underline block border border-solid border-[#007] shadow-sm shadow-[#333] w-full'>
        <a
          id='contribute'
          href={`/projects/${projectId}`}
          className='
          block 
          no-underline 
          hover:bg-[--theme-primary]
          hover:text-black
          transition-all
          base-transition 
          duration-200
          ease-in-out
          py-[20px] 
          px-[10px] 
          text-white 
          text-[16px] 
          font-normal'
        >
          <Image
            height={200}
            width={200}
            id='img'
            alt='proposalItemImage'
            src={imageSrc}
          />
          <div
            id='name'
            className='
            text-white 
            default-family 
            no-underline 
            text-[22px] 
            p-[20px] 
            font-normal 
            leading-[1.2]'
          >
            {name}
          </div>
        </a>
      </li>
    </div>
  );
};

const Proposals = (): JSX.Element => {
  const [projectsList, setProjectList] = useState<Proposal[]>([]);

  useEffect(() => {
    fetchProjects().then((projects) => {
      setProjectList(projects);
    });
  }, []);
  return (
    <div>
      <h1>Discover Proposals</h1>
      <ol
        className='
      flex 
      flex-wrap 
      flex-1 
      w-full 
      m-0 
      padding-[30px] 
      gap-[2%]  
      max-width-1100px:grid-31 
      max-width-750px:grid-48
      max-width-500px:flex
      max-width-500px:grid-none
      '
      >
        {projectsList &&
          projectsList.map(({ name, id, logo }) => (
            <ProposalItem
              key={id}
              projectId={id}
              imageSrc={logo}
              name={name}
            ></ProposalItem>
          ))}
      </ol>
    </div>
  );
};

export default Proposals;
