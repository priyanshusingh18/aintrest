"use client";
import { Ghost, MessageSquare, Plus } from "lucide-react";
import { trpc } from "@/app/_trpc/client";
import Skeleton from "react-loading-skeleton";
import Link from "next/link";
import { format } from "date-fns";

const SubjectBooks = () => {
  const { data: files, isLoading } = trpc.getSubjectBooks.useQuery();
  return (
    <main className="mx-auto max-w-7xl md:p-10">
      {files && files?.length != 0 ? (
        <ul className="mt-8 grid grid-col-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3 ">
          {files
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((el) => (
              <li
                key={el.fileId}
                className="colspan-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg"
              >
                <Link
                  href={`/subjects/${el.fileId}`}
                  className="flex flex-col gap-2"
                >
                  <div className="py-3 px-6 flex w-rull items-center justify-between space-x-6">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                    <div className="flex-1 truncate ">
                      <div className="flex items-center space-x-3">
                        <h3 className="truncate text-lg font-medium text-zinc-900">
                          {" "}
                          {el.name || "no name provided"}
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
                    38 Messages
                  </div>
                </div>
              </li>
            ))}
        </ul>
      ) : isLoading ? (
        <Skeleton height={100} className="my-2" count={3} />
      ) : (
        <div className="mt-16  flex flex-col items-center gap-2">
          <Ghost className="h-8 w-8 text-zinc-800" />
          <h3 className="font-semibold text-xl"> Pretty empty around here </h3>
          <p> lets&apos;s upload your first PDF.</p>
        </div>
      )}
    </main>
  );
};

export default SubjectBooks;
