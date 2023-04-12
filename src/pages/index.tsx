/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/utils";
import { User } from "stream-chat";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    getLogedInUser();
  }, []);

  const getLogedInUser = async () => {
    const userResponse = await getCurrentUser();
    if (userResponse) {
      router.push("/dashboard");
    }
  };

  return <></>;
}
