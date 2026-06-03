import { Loader2 } from 'lucide-react';

export function LoadingPanel({ label }: { label: string }) {
  return (
    <div className="workspace-panel flex items-center gap-3" role="status" aria-live="polite">
      <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin text-[#0b6e69]" />
      <p className="text-sm font-medium text-[#334554]">{label}</p>
    </div>
  );
}

export function ErrorPanel({ title, message }: { title: string; message: string }) {
  return (
    <div className="workspace-panel border-red-200 bg-red-50" role="alert">
      <h2 className="section-heading text-red-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-red-900">{message}</p>
    </div>
  );
}
