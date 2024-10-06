import { useRouter } from "next/navigation";
import { useState } from "react";

interface PressReleaseFormData {
  userInput: string;
}

interface UseSubmitPressReleaseResult {
  onSubmit: (data: PressReleaseFormData) => Promise<void>;
  isLoading: boolean;
  currentStep: number;
}

export const useSubmitPressRelease = (): UseSubmitPressReleaseResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  const onSubmit = async (data: PressReleaseFormData) => {
    setIsLoading(true);
    setCurrentStep(1);

    try {
      // Step 1: Generate the press release
      setTimeout(() => setCurrentStep(2), 1000);
      const response = await fetch(`/api/generate-press-release`, {
        method: "POST",
        body: JSON.stringify({ prompt: data.userInput }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error generating the press release.");
      }

      const { pressRelease } = await response.json();

      // Step 2: Generate keywords
      setCurrentStep(3);
      const keywordsResponse = await fetch(`/api/generate-keywords`, {
        method: "POST",
        body: JSON.stringify({ pressRelease }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!keywordsResponse.ok) {
        throw new Error("Error generating keywords.");
      }
      router.push(`/press-release/${pressRelease.id}`);
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) {
        alert(error.message || "An unexpected error occurred.");
      } else {
        alert("An unexpected error occurred.");
      }
      setIsLoading(false);
      setCurrentStep(1);
    }
  };

  return { onSubmit, isLoading, currentStep };
};
