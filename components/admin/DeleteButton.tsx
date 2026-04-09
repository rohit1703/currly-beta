'use client';

import { useTransition } from 'react';

interface Props {
  action: () => Promise<void>;
  label?: string;
  confirmMessage: string;
  className?: string;
}

export default function DeleteButton({ action, confirmMessage, label = 'Delete', className }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (confirm(confirmMessage)) {
          startTransition(() => action());
        }
      }}
      className={className}
    >
      {isPending ? 'Deleting...' : label}
    </button>
  );
}
