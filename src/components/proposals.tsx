import { Proposal, ProposalItemProps } from "@/types/proposalsTypes";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import * as config from "../config";

const fetchProjects = async () => {
  const resp = await fetch(`${config.apiBase}/projects/`, {
    headers: config.getAPIHeaders,
  });

  if (resp.ok) {
    return await resp.json();
  } else {
    // probably only 500+ here since this is a listing route
    // this.dispatchEvent(utils.badRouteEvent("server-error"));
  }
};

const ProposalItem = ({
  projectId,
  imageSrc,
  name,
}: ProposalItemProps): JSX.Element => {
  return (
    <div className="imbu-proposal-item">
      <h1>Discover Proposals</h1>
      <li>
        <a id="contribute" href={`/projects/${projectId}`}>
          <Image id="img" alt="proposalItemImage" src={imageSrc} />
          <div id="name">{name}</div>
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
      <ol id="list" className="proposals-list">
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
