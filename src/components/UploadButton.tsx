"use client";

import { useState } from "react";

import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import Dropzone from "react-dropzone";
import { Cloud, File } from "lucide-react";
import { Progress } from "./ui/progress";
import { useToast } from "./ui/use-toast";
import { trpc } from "@/app/_trpc/client";

import { useRouter } from "next/navigation";
import React from "react";
const UploadDropzone = () => {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState<boolean | null>(true);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const { toast } = useToast();

  const { mutate: startPolling } = trpc.getFile.useMutation({
    onSuccess(file) {
      router.push(`/dashboard/${file.id}`);
    },
    onError(err) {
      console.error(err);
    },
    retry: true,
    retryDelay: 500,
  });

  const startSimulatedProgress = () => {
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        if (prevProgress >= 10) {
          if (prevProgress >= 90)
            return prevProgress + (100 - prevProgress) / 500;
          return prevProgress + (100 - prevProgress) / 90;
        } else return prevProgress + 1;
      });
    }, 90);
    return interval;
  };
  return (
    <Dropzone
      multiple={false}
      onDrop={async (acceptedFiles) => {
        console.log(acceptedFiles);

        setIsUploading(true);
        const progressInterval = startSimulatedProgress();
        // await new Promise((resolve, reject) => setTimeout(resolve, 250000));
        const file = acceptedFiles[0];
        const formData = new FormData();
        formData.append("file", file);
        const contentDispositionValue = `attachment; filename="${file.name}"`;

        const response = await fetch("/api/upload-pdf", {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": contentDispositionValue,
          },
        });
        if (!response) {
          return toast({
            title: "Something went wrong",
            description: "Please try again later",
            variant: "destructive",
          });
        }
        clearInterval(progressInterval);
        setUploadProgress(100);
        const as = await response.json();
        startPolling({ id: as.key });
      }}
    >
      {({ getRootProps, getInputProps, acceptedFiles }) => (
        <div
          {...getRootProps()}
          className="border h-64 m-4 border-dashed border-gray-300 rounded-lg"
        >
          <div className="flex items-center justify-center h-full w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Cloud className="h-6 w-6 text-zinc-500 mb-2 " />
                <p className="mb-2 text-sm text-zinc-700">
                  {" "}
                  <span> Upload PDFs </span>
                  and chat with them
                </p>
                <p className="text-xs text-zinc-500">PDF (up to 4MB)</p>
              </div>
              {acceptedFiles && acceptedFiles[0] ? (
                <div className="max-w-xs flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200">
                  <div className="px-2 py-2 h-full place-items-center">
                    <File className="h-4 2-4 text-blue-500" />
                  </div>
                  <div className="px-3 py-2 text-sm h-full truncate">
                    {" "}
                    {acceptedFiles[0].name}
                  </div>
                </div>
              ) : null}
              {isUploading ? (
                <div className="w-full mt-4 max-w-xs mx-auto">
                  <Progress
                    value={uploadProgress}
                    className="h-1 w-full bg-zinc-200"
                  />
                </div>
              ) : null}
              <input
                {...getInputProps()}
                type="file"
                id="dropzone-file"
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}
    </Dropzone>
  );
};
const UploadButton = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setIsOpen(v);
        }
      }}
    >
      <DialogTrigger onClick={() => setIsOpen(true)} asChild>
        <Button>Upload PDF</Button>
      </DialogTrigger>
      <DialogContent>{UploadDropzone()}</DialogContent>
    </Dialog>
  );
};

export default UploadButton;
