
-- Allow managers to insert inbound_deliveries
CREATE POLICY "Managers can insert deliveries"
ON public.inbound_deliveries FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'manager'::app_role));

-- Allow assistants to insert inbound_deliveries
CREATE POLICY "Assistants can insert deliveries"
ON public.inbound_deliveries FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'assistant'::app_role));

-- Allow managers to insert delivery_items
CREATE POLICY "Managers can insert delivery_items"
ON public.delivery_items FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'manager'::app_role));

-- Allow assistants to insert delivery_items
CREATE POLICY "Assistants can insert delivery_items"
ON public.delivery_items FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'assistant'::app_role));
