import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const imageFile = formData.get("image") as File | null;

  if (!imageFile) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  const ingredients = [
    { name: "eggs", quantity: "6", confidence: "high" },
    { name: "cheese", quantity: "1 block", confidence: "high" },
    { name: "tomatoes", quantity: "3", confidence: "high" },
    { name: "spinach", quantity: "1 bag", confidence: "high" },
    { name: "butter", quantity: "1 stick", confidence: "high" },
    { name: "milk", quantity: "1 carton", confidence: "high" },
  ];

  return NextResponse.json({
    ingredients,
    analysis: "Looks like breakfast ingredients!",
  });
}
