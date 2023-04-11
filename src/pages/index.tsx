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

  return (
    <>
      <Login
        visible={loginModal}
        setVisible={setLoginModal}
        redirectUrl="/dashboard"
      />
    </>
  );
}
