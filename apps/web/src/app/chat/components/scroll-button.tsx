import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

export const ScrollButton = ({
  isAutoScrollEnabled,
  handleScrollDownClick,
}: {
  isAutoScrollEnabled: boolean;
  handleScrollDownClick: () => void;
}) => {
  return (
    <>
      {!isAutoScrollEnabled && (
        <Button
          onClick={handleScrollDownClick}
          className="hover:cursor-pointer fixed bottom-24 left-1/2 -translate-x-1/2 z-10 rounded-full bg-primary/50 text-primary-foreground hover:bg-primary/80 shadow-md"
          aria-label="Scroll to bottom"
        >
          <ArrowDown />
        </Button>
      )}
    </>
  );
};
