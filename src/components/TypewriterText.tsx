import { useState, useEffect } from "react";

interface TypewriterTextProps {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
}

const TypewriterText = ({
  phrases,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 1500,
  className = "",
}: TypewriterTextProps) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex];

    const handleTyping = () => {
      if (isPaused) {
        // Wait before starting to delete
        const pauseTimeout = setTimeout(() => {
          setIsPaused(false);
          setIsDeleting(true);
        }, pauseDuration);
        return () => clearTimeout(pauseTimeout);
      }

      if (isDeleting) {
        // Deleting characters
        if (currentText.length > 0) {
          const deleteTimeout = setTimeout(() => {
            setCurrentText(currentText.slice(0, -1));
          }, deletingSpeed);
          return () => clearTimeout(deleteTimeout);
        } else {
          // Move to next phrase
          setIsDeleting(false);
          setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      } else {
        // Typing characters
        if (currentText.length < currentPhrase.length) {
          const typeTimeout = setTimeout(() => {
            setCurrentText(currentPhrase.slice(0, currentText.length + 1));
          }, typingSpeed);
          return () => clearTimeout(typeTimeout);
        } else {
          // Finished typing, pause before deleting
          setIsPaused(true);
        }
      }
    };

    const cleanup = handleTyping();
    return cleanup;
  }, [currentText, isDeleting, isPaused, currentPhraseIndex, phrases, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <span className={className}>
      {currentText}
      <span className="animate-pulse text-[#0D6A6A]">|</span>
    </span>
  );
};

export default TypewriterText;

