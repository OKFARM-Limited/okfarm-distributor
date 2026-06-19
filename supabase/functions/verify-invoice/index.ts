import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { invoiceImageUrl, deliveryData } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    if (!invoiceImageUrl) throw new Error("No invoice image URL provided");

    // Fetch and download the image to convert to base64
    const imgRes = await fetch(invoiceImageUrl);
    if (!imgRes.ok) {
      throw new Error(`Failed to download invoice image from URL: ${imgRes.statusText}`);
    }
    const contentType = imgRes.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await imgRes.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = "";
    const len = uint8Array.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64Data = btoa(binary);

    const systemPrompt = `You are an invoice data extraction assistant. You will be given an image of a FanMilk invoice/delivery note. Extract the following data from the invoice:

1. Invoice number
2. Date
3. Supplier name
4. Line items: each with product name, quantity, unit price
5. Total value

If you cannot read a field, use null. For line items you cannot parse, return an empty array.`;

    const userPrompt = `Extract data from this FanMilk invoice image. Here is the booked delivery for reference (use this to help identify products):
- Invoice Number: ${deliveryData.invoice_number}
- Supplier: ${deliveryData.supplier}
- Booked items: ${JSON.stringify(deliveryData.items?.map((i: any) => ({
  product_name: i.product_name,
  quantity: i.quantity,
  unit_price: i.unit_price
})) || [])}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: userPrompt },
              {
                inlineData: {
                  mimeType: contentType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              invoice_number: { type: "STRING", description: "Invoice number from the document" },
              date: { type: "STRING", description: "Date on the invoice (YYYY-MM-DD format)" },
              supplier: { type: "STRING", description: "Supplier name" },
              line_items: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    product_name: { type: "STRING" },
                    quantity: { type: "NUMBER" },
                    unit_price: { type: "NUMBER" },
                  },
                  required: ["product_name", "quantity", "unit_price"],
                },
              },
              total_value: { type: "NUMBER", description: "Total invoice value" },
            },
            required: ["invoice_number", "date", "supplier", "line_items", "total_value"],
          },
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", response.status, errText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();
    const textResult = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResult) {
      throw new Error("AI did not return structured data");
    }

    const extractedData = JSON.parse(textResult);

    // Compare extracted vs booked
    const mismatches: any[] = [];
    const bookedItems = deliveryData.items || [];

    // Check invoice number
    if (extractedData.invoice_number && extractedData.invoice_number !== deliveryData.invoice_number) {
      mismatches.push({ field: "invoice_number", booked: deliveryData.invoice_number, extracted: extractedData.invoice_number });
    }

    // Check total value
    if (extractedData.total_value && Math.abs(extractedData.total_value - deliveryData.total_value) > 1) {
      mismatches.push({ field: "total_value", booked: deliveryData.total_value, extracted: extractedData.total_value });
    }

    // Check line items by matching product names (fuzzy)
    const itemMismatches: any[] = [];
    for (const extracted of extractedData.line_items || []) {
      const match = bookedItems.find((b: any) =>
        b.product_name?.toLowerCase().includes(extracted.product_name?.toLowerCase()?.slice(0, 6)) ||
        extracted.product_name?.toLowerCase().includes(b.product_name?.toLowerCase()?.slice(0, 6))
      );
      if (match) {
        const qtyMatch = match.quantity === extracted.quantity;
        const priceMatch = Math.abs(match.unit_price - extracted.unit_price) < 1;
        if (!qtyMatch || !priceMatch) {
          itemMismatches.push({
            product: extracted.product_name,
            booked_qty: match.quantity,
            extracted_qty: extracted.quantity,
            booked_price: match.unit_price,
            extracted_price: extracted.unit_price,
            qty_match: qtyMatch,
            price_match: priceMatch,
          });
        }
      } else {
        itemMismatches.push({
          product: extracted.product_name,
          booked_qty: null,
          extracted_qty: extracted.quantity,
          booked_price: null,
          extracted_price: extracted.unit_price,
          qty_match: false,
          price_match: false,
          not_found_in_booking: true,
        });
      }
    }

    // Check for booked items not in extracted
    for (const booked of bookedItems) {
      const found = (extractedData.line_items || []).find((e: any) =>
        e.product_name?.toLowerCase().includes(booked.product_name?.toLowerCase()?.slice(0, 6)) ||
        booked.product_name?.toLowerCase().includes(e.product_name?.toLowerCase()?.slice(0, 6))
      );
      if (!found) {
        itemMismatches.push({
          product: booked.product_name,
          booked_qty: booked.quantity,
          extracted_qty: null,
          booked_price: booked.unit_price,
          extracted_price: null,
          qty_match: false,
          price_match: false,
          not_found_in_invoice: true,
        });
      }
    }

    const allMatch = mismatches.length === 0 && itemMismatches.length === 0;

    return new Response(JSON.stringify({
      extracted: extractedData,
      mismatches,
      itemMismatches,
      allMatch,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("verify-invoice error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
