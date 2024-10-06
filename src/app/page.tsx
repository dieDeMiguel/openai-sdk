"use client";

import { Button } from "@/components/ui/button";
import Stepper from "@/components/ui/stepper";
import { Textarea } from "@/components/ui/textarea";
import GenieLamp from "@/public/genie-lamp.svg";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PressReleaseGenerator() {
  const [userInput, setUserInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const router = useRouter();

  const handleGenerate = async () => {
    setIsLoading(true);
    setTimeout(() => setCurrentStep(2), 1000);
    const response = await fetch(`/api/generate-press-release`, {
      method: "POST",
      body: JSON.stringify({ prompt: userInput }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const { pressRelease } = await response.json();
    setCurrentStep(3);
    await fetch(`/api/generate-keywords`, {
      method: "POST",
      body: JSON.stringify({ pressRelease }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    router.push(`/press-release/${pressRelease.id}`);
  };

  if (isLoading) {
    return <Stepper currentStep={currentStep} />;
  }

  return (
    <div className="w-full sm:w-1/3 p-4 flex flex-col gap-xl h-screen items-center justify-around">
      <div className="w-full">
        <div className="flex items-center h-20">
          <h1 className="text-2xl font-bold">Press Release Genie</h1>
          <GenieLamp
            style={{ width: 50, height: 50, marginBottom: 10 }}
            alt="genie lamp"
          />
        </div>
        <Textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="What's your press release about? Any language will work : ) Min 10 characters"
          className="h-40 resize-none mb-4"
        />
        <Button
          onClick={handleGenerate}
          className="w-full font-semibold"
          disabled={userInput.trim().length < 10}
        >
          Generate Press Release
        </Button>
      </div>
      <Link
        href="/impressum"
        className="text-gray-400 hover:text-white cursor-pointer"
      >
        Impressum
      </Link>
    </div>
  );
}
