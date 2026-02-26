import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    if (process.env.OPENAI_API_KEY) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: "gpt-4o-mini", max_tokens: 400, temperature: 0.7,
          messages: [
            { role: "system", content: "You are Datore AI Assistant for a skills marketplace by AARNAIT AI. Help users find professionals, explain platform features (police verification badges, QR safety scanning, 1% platform fee with 99% to workers, escrow payments, dual ratings). Be helpful, concise, friendly. Support Hindi and English." },
            { role: "user", content: message },
          ],
        }),
      });
      const data = await res.json();
      return NextResponse.json({ reply: data.choices?.[0]?.message?.content || "I'd be happy to help! Could you tell me more about what you need?" });
    }
    // Fallback
    const m = message.toLowerCase();
    let reply = "I'd be happy to help! You can search for professionals by skill, browse categories, or tell me what service you need.";
    if (m.match(/plumb|pipe|tap|leak/)) reply = "I found several plumbing professionals nearby! You can filter by 'Police Verified' for extra safety. Check the Search page to find the best match.";
    else if (m.match(/price|cost|rate|cheap/)) reply = "Rates on Datore are 20-40% below market. Workers set their own prices, and the platform charges only 1% — workers keep 99%.";
    else if (m.match(/safe|verif|trust|police|badge/)) reply = "Workers can earn a Police Verified badge. You can also scan their QR code in person to see their full safety profile.";
    else if (m.match(/pay|money|wallet|escrow/)) reply = "Payments use escrow — money is held until the job is done. Workers get 99%, Datore charges just 1%.";
    else if (m.match(/book|hire/)) reply = "To book: Search → Select worker → Pick date & time → Describe job → Confirm & Pay. The worker responds within hours!";
    else if (m.match(/hello|hi|hey|help/)) reply = "Hello! I'm Datore AI. I can help you find professionals, explain features, or assist with bookings. What do you need?";
    return NextResponse.json({ reply });
  } catch { return NextResponse.json({ reply: "Sorry, I'm having trouble right now. Please try again." }); }
}
