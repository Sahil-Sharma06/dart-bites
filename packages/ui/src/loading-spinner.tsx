export function LoadingSpinner() {
  return (
    <div
      className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-orange-500"
      role="status"
      aria-label="Loading"
    />
  );
}
