import Dashboard from "./dashboard";

export default function Home() {
  const user = {
    id: 6,
    username: "mike",
    getstream_token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoibWlrZSJ9.oSxIRfDYQjN35KF0nx3tINBLh-mlnHKuqIWwxtU_Cnk",
    display_name: "mike",
    web3Accounts: [],
  };
  
  return <Dashboard user={user} />;
}
