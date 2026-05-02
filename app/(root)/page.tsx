export const dynamic = 'force-dynamic';
import NextDynamic from "next/dynamic";
import HeroSection from "./components/hero-section";
import FilterSection from "./components/filter-section";

const OurServices = NextDynamic(() => import("./components/our-services"));
const ReviewSection = NextDynamic(() => import("./components/review-section"));
const WhyChooseUs = NextDynamic(() => import("./components/why-us"));

export default function Home() {
  return (
    <>
      <main className="overflow-x-hidden">
        <HeroSection />
        <FilterSection />
        <OurServices />
        <WhyChooseUs />
        <ReviewSection />
      </main>
    </>
  );
}
