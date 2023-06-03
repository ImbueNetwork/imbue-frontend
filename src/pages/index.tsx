/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/utils";
import { User } from "stream-chat";
import { useRouter } from "next/router";
import Login from "@/components/Login";
import FullScreenLoader from "@/components/FullScreenLoader";

export default function Home() {
  const router = useRouter();
  const [loginModal, setLoginModal] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    getLogedInUser();
  }, []);

  const getLogedInUser = async () => {
    try {
      const userResponse = await getCurrentUser();
      if (userResponse) {
        const userAuth = {
          isAuthenticated: true,
          user: userResponse,
        };
        // localStorage.setItem("userAuth", JSON.stringify(userAuth));
        router.push("/dashboard");
      }
      else{
        setLoginModal(true)
      }
    } catch (error) {
      console.log(error);
    }
    finally {
      setLoading(false)
    }

  };

  if (loading) return <FullScreenLoader />

  return (
    <Login
      visible={loginModal && !loading}
      setVisible={(val) => {
        setLoginModal(val);
      }}
      redirectUrl={"/dashboard"}
    />
  );
}
