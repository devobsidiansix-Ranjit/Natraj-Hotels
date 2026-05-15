export const dynamic = 'force-dynamic';
import React from "react";
import Image from "next/image";
import { IoMdArrowDropright } from "react-icons/io";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { Category } from "@prisma/client";
import DateSelector from "./components/date-selector";
import { fetchCategories } from "@/functions/fetchcategory";
import { getImageUrl } from "@/lib/utils";
import { ImageSlider } from "@/components/image-slider";

export default async function Page({
  searchParams,
}: {
  searchParams: { startDate: string; endDate: string };
}) {
  const fetchCategoryData = await fetchCategories();

  if (!searchParams.startDate || !searchParams.endDate) {
    redirect("/");
  }

  return (
    <main className="mt-28 flex flex-col gap-6 pb-20">
      <div>
        <DateSelector />
      </div>
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-16 px-4 sm:px-6 lg:px-8">
        {fetchCategoryData.map((data: Category) => (
          <div key={data.id}>
            <div className="w-full grid sm:grid-cols-12 shadow-[0_4px_15px_0_rgba(0,0,0,0.14)] rounded-sm overflow-hidden">
              <div className="relative h-[300px] sm:h-full w-full sm:col-span-5">
                <ImageSlider
                  images={data.images}
                  alt={data.name || "room image"}
                />
              </div>
              <div className="sm:col-span-7 px-4 sm:px-6 lg:px-8 flex flex-col gap-6 py-4 lg:py-8">
                <h3 className="text-3xl font-semibold">{data.name}</h3>
                <p className="text-muted-foreground">{data.description}</p>
                <div className="grid grid-cols-2 gap-y-4 lg:gap-y-6 lg:py-4">
                  {data.features.map((e, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <IoMdArrowDropright className="text-primary text-xl" />
                      <span className="text-sm sm:text-base">{e}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center py-4 sm:py-0 lg:py-2 xl:py-4 px-0">
                  <div>
                    <span className="text-3xl lg:text-2xl xl:text-3xl font-bold">
                      ₹{data.price}
                    </span>
                    <span className="text-sm text-gray-500">/per night</span>
                  </div>
                  <Link
                    href={`/roomdetails?id=${data.id}&startDate=${searchParams.startDate}&endDate=${searchParams.endDate}`}
                  >
                    <Button className="text-sm xl:text-lg font-medium bg-white text-primary border border-primary hover:text-white hover:bg-primary">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}