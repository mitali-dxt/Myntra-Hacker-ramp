import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";

export async function POST(request) {
  await connectToDatabase();
  const { tribeName, tribeDescription, tribeTags, offset = 0, limit = 5 } = await request.json();

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
  }

  try {
    const total = await Product.countDocuments({});
    const products = await Product.find({}).skip(Number(offset)).limit(Number(limit));

    // Strict, privacy-focused payload for AI
    const productData = products.map(p => ({
      id: p._id.toString(),
      title: p.title,
      brand: p.brand,
      category: p.category,
      gender: p.gender,
      tags: p.tags,
      price: p.price
    }));

    const prompt = `You are a fashion curator. Given a tribe and a SMALL product batch, select relevant products.
Return ONLY valid JSON matching this TypeScript type with no extra text:
{
  "items": Array<{"id": string; "score": number; "reason": string}>
}
Guidelines: score in [0,1]. Reasons must be short (<=120 chars).
Tribe: {"name":"${tribeName}","description":"${tribeDescription}","tags":${JSON.stringify(tribeTags || [])}}
Products: ${JSON.stringify(productData)}
`;

    const resp = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    });

    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`Gemini HTTP error: ${resp.status} ${resp.statusText} ${err}`);
    }

    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    // Clean the response - remove markdown code blocks and extra text
    let cleanText = text.trim();
    if (cleanText.includes('```json')) {
      cleanText = cleanText.split('```json')[1].split('```')[0].trim();
    } else if (cleanText.includes('```')) {
      cleanText = cleanText.split('```')[1].split('```')[0].trim();
    }
    
    // Find JSON object in the text
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanText = jsonMatch[0];
    }
    
    let parsed;
    try {
      parsed = JSON.parse(cleanText);
    } catch (e) {
      console.error("Failed to parse AI response:", cleanText);
      parsed = { items: [] };
    }
    
    const items = Array.isArray(parsed.items) ? parsed.items : [];

    // Map back to product docs and sort by score desc
    const byId = new Map(products.map(p => [p._id.toString(), p]));
    const results = items
      .filter(i => byId.has(i.id))
      .sort((a,b) => (b.score || 0) - (a.score || 0))
      .map(i => ({ product: byId.get(i.id), score: i.score || 0, reason: i.reason || "" }));

    const nextOffset = Number(offset) + products.length;

    return NextResponse.json({ results, offset: Number(offset), nextOffset: nextOffset < total ? nextOffset : null, total });
  } catch (error) {
    console.error("AI classification error:", error);
    return NextResponse.json({ error: "AI classification failed" }, { status: 500 });
  }
}
