import { Button } from "@/components/ui/button";
import Image from "next/image";
import Header from "./_components/Header";
import LandingPage from "./_components/LandingPage";

export default function Home() {
  return (
    <div className="h-screen overflow-hidden">
      <Header />
      <LandingPage />
    </div>
  );
}
