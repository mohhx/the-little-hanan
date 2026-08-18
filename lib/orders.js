// lib/orders.js
// Public-facing order creation, called from the (anonymous) checkout page.
// Uses the shared anon client — same as lib/products.js — since the
// "orders_public_insert" RLS policy allows anon inserts but nothing else.
// Admin-side order reads/updates are NOT here; they live inline in the
// admin pages/components, matching how products.js vs ProductForm.js split.
import { supabase } from './supabaseClient'

// order = {
//   orderRef, fullName, phone, email, address, city, state, notes,
//   items, subtotal, paymentMethod,
// }
export async function createOrder(order) {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      order_ref: order.orderRef,
      full_name: order.fullName,
      phone: order.phone,
      email: order.email,
      address: order.address,
      city: order.city,
      state: order.state,
      notes: order.notes || null,
      items: order.items,
      subtotal: order.subtotal,
      payment_method: order.paymentMethod,
      // payment_status / order_status are left to their table defaults
      // ('pending' / 'pending') — nothing to set here.
    })
    .select()
    .single()

  if (error) {
    console.error('createOrder failed:', error.message)
    return { data: null, error }
  }

  return { data, error: null }
}