import React from "react";

interface LoginButtonProps {}

export const LoginButton: React.FC<LoginButtonProps> = ({}) => {
  return (
    <a
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      href={`${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
      }/auth/discord`}
    >
      Login with Discord
    </a>
  );
};
