"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "../_trpc/client";
import { Loader2 } from "lucide-react";

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");

  const { data, isLoading } = trpc.authCallback.useQuery(undefined, {
    onSuccess: ({ success, user }) => {
      if (success) {
        router.push(origin ? `/${origin}` : "/dashboard");
      }
    },

    onError: (err) => {
      router.push("api/auth/login?post_login_redirect_url=/dashboard");
    },
    retry: 2,
    retryDelay: 1000,
  });
  return (
    <div className="w-full mt-24 flex justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h8 w-8 animate-spin text-zinc-800 " />
        <h3 className="font-semibold text-xl">Setting up your account</h3>
        <p> You will be redirected soon</p>
      </div>
    </div>
  );
};

export default Page;
