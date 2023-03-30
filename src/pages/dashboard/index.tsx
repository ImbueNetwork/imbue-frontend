import Link from "next/link";
import React from "react";

function Dashboard({ query }: any) {
  return (
    <div>
      <h1>My Project</h1>

      <ol id="projects-list">
        <p>You haven&apos;t created a proposal yet</p>
        <div>
          <Link
            href="/proposals/draft"
            className="primary-btn in-dark w-button"
            id="create-a-proposal"
          >
            Submit a proposal
          </Link>
        </div>
      </ol>

      <h1>My Contributions</h1>

      <ol id="contributions-list">
        <li>
          <h2>Coming Soon!</h2>
          <div>
            <Link
              href="/proposals"
              className="primary-btn in-dark w-button underline"
              id="discover-projects"
            >
              Discover projects
            </Link>
          </div>
        </li>
      </ol>
    </div>
  );
}

export default Dashboard;
