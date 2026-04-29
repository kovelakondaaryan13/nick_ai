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

  return NextResponse.json({
    ingredients: [
      { name: "tomatoes", quantity: null, confidence: "high" },
      { name: "red bell pepper", quantity: null, confidence: "high" },
      { name: "asparagus", quantity: null, confidence: "high" },
      { name: "broccoli", quantity: null, confidence: "high" },
      { name: "spinach", quantity: null, confidence: "high" },
      { name: "cabbage", quantity: null, confidence: "high" },
      { name: "strawberries", quantity: null, confidence: "high" },
      { name: "lemon", quantity: null, confidence: "high" },
      { name: "basil", quantity: null, confidence: "high" },
    ],
    analysis: "Fresh fridge! Lots of greens and fruits.",
  });
}
