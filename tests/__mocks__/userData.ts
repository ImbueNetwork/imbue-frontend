export const dummyUser = {
  id: 5,
  username: "mike",
  getstream_token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoibWlrZSJ9.oSxIRfDYQjN35KF0nx3tINBLh-mlnHKuqIWwxtU_Cnk",
  display_name: "mike",
  // web3_address: "5GRHPcY3zEgJezesmYHQyuo7YouwXVjnDR8ZcX9CQuFJadaL",
  web3Accounts: [],
};

export const getServerSideData = {
  props: {
    isAuthenticated: true,
    user: dummyUser,
  },
};
