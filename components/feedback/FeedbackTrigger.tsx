"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { FeedbackPanel } from "./FeedbackPanel";

export type FeedbackTriggerSource = "nav" | "chat_message";

export type OpenFeedbackOptions = {
  triggerSource: FeedbackTriggerSource;
  initialSentiment?: "positive" | "negative";
  chatContext?: Array<{ role: "user" | "assistant"; content: string }>;
};

type Ctx = {
  openFeedback: (o: OpenFeedbackOptions) => void;
  closeFeedback: () => void;
};

const FeedbackCtx = createContext<Ctx | null>(null);

export function useFeedback() {
  const v = useContext(FeedbackCtx);
  if (!v) throw new Error("useFeedback must be used within FeedbackProvider");
  return v;
}

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<OpenFeedbackOptions>({ triggerSource: "nav" });

  const openFeedback = useCallback((o: OpenFeedbackOptions) => {
    setOptions(o);
    setIsOpen(true);
  }, []);

  const closeFeedback = useCallback(() => setIsOpen(false), []);

  return (
    <FeedbackCtx.Provider value={{ openFeedback, closeFeedback }}>
      {children}
      <FeedbackPanel
        isOpen={isOpen}
        onClose={closeFeedback}
        triggerSource={options.triggerSource}
        initialSentiment={options.initialSentiment}
        chatContext={options.chatContext}
      />
    </FeedbackCtx.Provider>
  );
}
