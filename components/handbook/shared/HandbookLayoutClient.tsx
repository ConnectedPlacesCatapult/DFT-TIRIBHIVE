"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useChatContext } from "./ChatContext";
import { HandbookNav } from "./HandbookNav";
import { ChatPanel } from "./ChatPanel";
import { OnboardingTooltips } from "./OnboardingTooltips";
import { FeedbackSurvey } from "./FeedbackSurvey";
import { FeedbackReviewPanel } from "./FeedbackReviewPanel";

export function HandbookLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { chatOpen, chatContext, closeChat, reviewMode } = useChatContext();

  const isBriefPage =
    pathname === "/handbook/brief" ||
    pathname?.startsWith("/handbook/brief/");

  if (isBriefPage) {
    return <main id="brief-main">{children}</main>;
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <HandbookNav />

      <main
        id="handbook-main"
        style={{
          transition: "padding-right 0.25s cubic-bezier(0.4,0,0.2,1)",
          paddingRight: reviewMode ? "320px" : chatOpen ? "420px" : 0,
        }}
      >
        {children}
      </main>

      <ChatPanel context={chatContext} open={chatOpen} onClose={closeChat} />

      {reviewMode && <FeedbackReviewPanel />}

      <OnboardingTooltips />
      <FeedbackSurvey />
    </div>
  );
}
