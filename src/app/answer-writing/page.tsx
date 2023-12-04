import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { format } from "date-fns";
import { Ghost, MessageSquare, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import Skeleton from "react-loading-skeleton";

const Page = async () => {
  // const { data: prompts, isLoading } = trpc.questions.getPrompts.useQuery();
  const { getUser } = getKindeServerSession();
  const user = getUser();
  if (!user || !user.id) redirect("/auth-callback?origin=dashboard");

  const prompts = await db.prompt.findMany({
    where: {
      userId: user.id,
    },
    include: {
      _count: {
        select: { questions: true },
      },
    },
  });
  return (
    <div className="mt-8 flex flex-col  items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-col sm:items-center sm:gap-0">
      <h1 className="mb-3 text-5xl font-bold tracking-tight text-gray-900">
        Past Questions
      </h1>
      <div> </div>
      {prompts && prompts?.length != 0 ? (
        <ul className="mt-8 grid grid-col-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3 ">
          {prompts
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((el) => (
              <li
                key={el.id}
                className="colspan-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg"
              >
                {" "}
                <Link
                  href={`/answer-writing/${el.id}`}
                  className="flex flex-col gap-2"
                >
                  <div className="py-3 px-6 flex w-rull items-center justify-between space-x-6">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                    <div className="flex-1 truncate ">
                      <div className="flex items-center space-x-3">
                        <h3 className="truncate text-lg font-medium text-zinc-900">
                          {" "}
                          {el.text}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="border-none px-6 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs text-zinc-500">
                  <div className="flex itmes-center gap-2 ">
                    {" "}
                    <Plus className="h-4 w-4" />{" "}
                    {format(new Date(el.createdAt), "dd MMM yyyy")}
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h4 w-4" />
                    {el._count.questions}{" "}
                    {el._count.questions > 1 ? `Questions` : `Question`}
                  </div>
                </div>
              </li>
            ))}
        </ul>
      ) : (
        <div className="mt-16  flex flex-col items-center gap-2">
          <Ghost className="h-8 w-8 text-zinc-800" />
          <h3 className="font-semibold text-xl"> Pretty empty around here </h3>
          <p> lets&apos;s upload your first PDF.</p>
        </div>
      )}
    </div>
  );
};

export default Page;
// : isLoading ? (
//   <Skeleton height={100} className="my-2" count={3} />
// )
