/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/utils";
import { User } from "stream-chat";
import { useRouter } from "next/router";
import Login from "@/components/Login";

export default function Home() {
  const router = useRouter();
  const [loginModal, setLoginModal] = useState<boolean>(true)

  useEffect(() => {
    getLogedInUser();
  }, []);

  const getLogedInUser = async () => {
    const userResponse = await getCurrentUser();
    if (userResponse) {
      const userAuth = {
        isAuthenticated: true,
        user: userResponse,
      };
      localStorage.setItem("userAuth", JSON.stringify(userAuth));
      router.push("/dashboard");
    }
  };
  

  return (
    <Login
        visible={loginModal}
        setVisible={(val) => {
          setLoginModal(val);
        }}
        redirectUrl={"/dashboard"}
      />
  );
}
