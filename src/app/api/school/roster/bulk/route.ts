import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Bulk roster import is disabled. Students join with the class code on My Class.",
    },
    { status: 403 }
  );
}
