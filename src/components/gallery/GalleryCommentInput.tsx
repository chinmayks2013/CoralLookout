"use client";

interface GalleryCommentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (body: string) => void;
  disabled?: boolean;
  placeholder?: string;
  buttonLabel?: string;
}

export function GalleryCommentInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = "Add a comment",
  buttonLabel = "Post",
}: GalleryCommentInputProps) {
  const submit = () => {
    const body = value.trim();
    if (!body || disabled) return;
    onSubmit(body);
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
        className="flex-1 rounded-lg bg-slate-800/50 border border-cyan-500/20 px-3 py-2 text-sm"
      />
      <button
        type="button"
        disabled={disabled || !value.trim()}
        onClick={submit}
        className="rounded-lg bg-cyan-500/20 px-3 py-2 text-sm text-cyan-300 disabled:opacity-50"
      >
        {buttonLabel}
      </button>
    </div>
  );
}
