import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { invoiceImageUrl, deliveryData } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (!invoiceImageUrl) throw new Error("No invoice image URL provided");

    const systemPrompt = `You are an invoice data extraction assistant. You will be given an image of a FanMilk invoice/delivery note. Extract the following data from the invoice:

1. Invoice number
2. Date
3. Supplier name
4. Line items: each with product name, quantity, unit price
5. Total value

You MUST respond using the extract_invoice_data tool. If you cannot read a field, use null. For line items you cannot parse, return an empty array.`;

    const userPrompt = `Extract data from this FanMilk invoice image. Here is the booked delivery for reference (use this to help identify products):
- Invoice Number: ${deliveryData.invoice_number}
- Supplier: ${deliveryData.supplier}
- Booked items: ${JSON.stringify(deliveryData.items?.map((i: any) => ({
  product_name: i.product_name,
  quantity: i.quantity,
  unit_price: i.unit_price
})) || [])}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              { type: "image_url", image_url: { url: invoiceImageUrl } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_invoice_data",
              description: "Extract structured invoice data from the image",
              parameters: {
                type: "object",
                properties: {
                  invoice_number: { type: "string", description: "Invoice number from the document" },
                  date: { type: "string", description: "Date on the invoice (YYYY-MM-DD format)" },
                  supplier: { type: "string", description: "Supplier name" },
                  line_items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        product_name: { type: "string" },
                        quantity: { type: "number" },
                        unit_price: { type: "number" },
                      },
                      required: ["product_name", "quantity", "unit_price"],
                      additionalProperties: false,
                    },
                  },
                  total_value: { type: "number", description: "Total invoice value" },
                },
                required: ["invoice_number", "date", "supplier", "line_items", "total_value"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_invoice_data" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("AI did not return structured data");
    }

    const extractedData = JSON.parse(toolCall.function.arguments);

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
