"use client";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCw,
  Search,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Toast } from "./ui/toast";
import { useState } from "react";
import { useToast } from "./ui/use-toast";
import { useResizeDetector } from "react-resize-detector";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuItem } from "./ui/dropdown-menu";
import PdfFullScreen from "./PdfFullScreen";
import {
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import SimpleBar from "simplebar-react";
import { ro } from "date-fns/locale";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface PdfRendererProps {
  url: string;
}
const PdfRenderer = ({ url }: PdfRendererProps) => {
  const [numPages, setNumPages] = useState<number | undefined>(undefined);
  const [scale, setScale] = useState<number>(1);
  const [currPageNumber, setCurrPageNumber] = useState<number>(1);
  const [rotate, setRoatate] = useState<number>(0);
  const [renderedScale, setRenderedScale] = useState<number | null>(null);

  const isLoading = renderedScale !== scale;

  const { toast } = useToast();
  const CustomPageValidator: any = z.object({
    page: z
      .string()
      .refine((num) => Number(num) > 0 && Number(num) <= numPages!),
  });
  type TCustomPageValidator = z.infer<typeof CustomPageValidator>;
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TCustomPageValidator>({
    defaultValues: {
      page: "1",
    },
    resolver: zodResolver(CustomPageValidator),
  });

  const { width, ref } = useResizeDetector();

  const onPageChange = (setPage: number) => {
    setCurrPageNumber(setPage);
  };

  const handleSubmitPageNumber = ({ page }: TCustomPageValidator) => {
    setCurrPageNumber(Number(page));
    setValue("page", String(page));
  };
  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center ">
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">
          <Button
            onClick={() => {
              setCurrPageNumber((prev) => {
                setValue("page", String(prev - 1 > 1 ? prev - 1 : 1));
                return prev - 1 > 1 ? prev - 1 : 1;
              });
            }}
            disabled={currPageNumber <= 1}
            variant="ghost"
            aria-label="previous page"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1.5">
            <Input
              {...register("page")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(handleSubmitPageNumber)();
                }
              }}
              className={cn(
                "w-12 h-8",
                errors.page && " focus-visible:ring-red-500"
              )}
              // value={currPageNumber || 1}

              // placeholder={`${currPageNumber}`}
              // onChange={(e) => onPageChange(Number(e.target.value || 1))}
            />
            <p className="text-zinc-700 text-sm space-x-1">
              <span>/</span>
              <span>{numPages ?? "x"}</span>
            </p>
          </div>
          <Button
            onClick={() => {
              setCurrPageNumber((prev) => {
                setValue(
                  "page",
                  String(prev + 1 > numPages! ? numPages! : prev + 1)
                );
                return prev + 1 > numPages! ? numPages! : prev + 1;
              });
            }}
            disabled={numPages === undefined || currPageNumber === numPages}
            variant="ghost"
            aria-label="previous page"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-1.5" aria-label="zoom" variant="ghost">
                {" "}
                <Search className="h-4 w-4" /> {scale * 100}%{" "}
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-40 bg-gray-50  ">
              <DropdownMenuItem
                className="hover:cursor-pointer"
                onSelect={() => setScale(0.75)}
              >
                75%
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:cursor-pointer"
                onSelect={() => setScale(1)}
              >
                100%
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:cursor-pointer"
                onSelect={() => setScale(1.5)}
              >
                150%
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:cursor-pointer"
                onSelect={() => setScale(1.75)}
              >
                175%
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:cursor-pointer"
                onSelect={() => setScale(2)}
              >
                200%
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:cursor-pointer"
                onSelect={() => setScale(2.5)}
              >
                250%
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={() => {
              setRoatate((prev) => prev + 90);
            }}
            aria-label="rotate pdf 90 degrees"
            variant="ghost"
          >
            <RotateCw className="h-4 w-4 " />
          </Button>
          <PdfFullScreen fileUrl={url} />
        </div>
      </div>
      <div className="flex-1 w-full max-h-screen">
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
          <div className="" ref={ref}>
            <Document
              loading={
                <div className="flex justify-center">
                  <Loader2 className="my-24 h-6 w-6 animate-spin" />
                </div>
              }
              onLoadSuccess={({ numPages }) => {
                setNumPages(numPages);
              }}
              onLoadError={() => {
                toast({
                  title: "Error loading pdf",
                  description: "Please try again later",
                  variant: "destructive",
                });
              }}
              file={url}
              className="max-h-full "
            >
              {isLoading && renderedScale ? (
                <Page
                  width={width ? width : 1}
                  pageNumber={currPageNumber}
                  scale={scale}
                  rotate={rotate}
                  key={"@" + renderedScale}
                />
              ) : null}
              <Page
                className={isLoading ? "hidden" : ""}
                width={width ? width : 1}
                pageNumber={currPageNumber}
                scale={scale}
                rotate={rotate}
                key={"@" + scale}
                loading={
                  <div className="flex justify-center">
                    <Loader2 className="my-24 h-6 w-6 animate-spin" />
                  </div>
                }
                onRenderSuccess={() => setRenderedScale(scale)}
              />
              {/* <Page
                className={cn(isLoading ? "hidden" : "")}
                scale={scale}
                width={width ? width : 1}
                pageNumber={currPageNumber}
                rotate={rotate}
                key={"@" + scale}
                loading={
                  <div className="flex justify-center visible">
                    <Loader2 className="my-24 h-6 w-6 animate-spin" />
                  </div>
                }
                onRenderSuccess={() => setRenderedScale(scale)}
              /> */}
            </Document>
          </div>
        </SimpleBar>
      </div>
    </div>
  );
};

export default PdfRenderer;
