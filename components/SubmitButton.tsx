"use client";

import { useFormStatus } from "react-dom";

type Props = {
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
};

export default function SubmitButton({ children, loadingText, className }: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      aria-busy={pending}
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {loadingText ?? "送信中..."}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
