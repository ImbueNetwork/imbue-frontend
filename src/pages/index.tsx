/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/utils";
import { User } from "stream-chat";
import { useRouter } from "next/router";
import Login from "@/components/Login";

export default function Home() {
  const router = useRouter();
  const [loginModal, setLoginModal] = useState<boolean>(false);
  useEffect(() => {
    getLogedInUser();
  }, []);

  const getLogedInUser = async () => {
    const userResponse = await getCurrentUser();
    if (userResponse) {
      router.push("/dashboard");
    } else {
      setLoginModal(true);
    }
  };
  // const user = {
  //   id: 6,
  //   username: "mike",
  //   getstream_token:
  //     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoibWlrZSJ9.oSxIRfDYQjN35KF0nx3tINBLh-mlnHKuqIWwxtU_Cnk",
  //   display_name: "mike",
  //   web3Accounts: [],
  // };

  return (
    <>
      <Login
        visible={loginModal}
        setVisible={setLoginModal}
        redirectUrl="/dashboard"
      />
    </>
  );
  // return <Dashboard user={user} />;
}
