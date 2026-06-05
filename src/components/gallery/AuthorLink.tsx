"use client";

import Link from "next/link";

export function AuthorLink({
  userId,
  name,
  className = "",
}: {
  userId: string;
  name: string;
  className?: string;
}) {
  return (
    <Link
      href={`/profile/${userId}`}
      className={`text-cyan-400 hover:text-cyan-300 hover:underline ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {name}
    </Link>
  );
}
