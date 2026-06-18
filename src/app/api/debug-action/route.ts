import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  
  const isRegistrationClosed = formData.get("isRegistrationClosed") === "on";
  
  console.log('Raw formData entries:', Array.from(formData.entries()));
  console.log('Parsed data:', data);
  console.log('isRegistrationClosed value from formData:', formData.get("isRegistrationClosed"));
  console.log('isRegistrationClosed computed:', isRegistrationClosed);
  
  return NextResponse.json({
    raw: Object.fromEntries(formData),
    isRegistrationClosed
  });
}
