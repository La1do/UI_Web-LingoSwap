import type { ReactNode } from "react";

type LoadingDotsProps = {
  label: ReactNode;
  className?: string;
};

function normalizeLabel(label: ReactNode): ReactNode {
  if (typeof label !== "string") return label;
  return label.replace(/(\.{3}|\u2026)\s*$/, "");
}

export default function LoadingDots({ label, className = "" }: LoadingDotsProps) {
  return (
    <>
      <style>{`
        @keyframes lingoLoadingDot {
          0%, 80%, 100% { opacity: 0.28; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-1px); }
        }

        .lingo-loading-dot {
          animation: lingoLoadingDot 1s ease-in-out infinite;
        }

        .lingo-loading-dot:nth-child(2) {
          animation-delay: 150ms;
        }

        .lingo-loading-dot:nth-child(3) {
          animation-delay: 300ms;
        }
      `}</style>
      <span className={`inline-flex items-center justify-center gap-1 ${className}`}>
        <span>{normalizeLabel(label)}</span>
        <span aria-hidden="true" className="inline-flex w-[1.1em] justify-start">
          <span className="lingo-loading-dot">.</span>
          <span className="lingo-loading-dot">.</span>
          <span className="lingo-loading-dot">.</span>
        </span>
      </span>
    </>
  );
}
