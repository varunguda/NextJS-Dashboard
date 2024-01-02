'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse(
    Object.fromEntries(formData.entries()),
  );
  const amountCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  await sql`INSERT INTO invoices (customer_id, amount, status, date)
  VALUES (${customerId}, ${amountCents}, ${status}, ${date})`;

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

const UpdateInvoice = FormSchema.omit({ id: true, date: true });
export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, status, amount } = UpdateInvoice.parse(
    Object.fromEntries(formData.entries()),
  );
  const amountCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  await sql`
    UPDATE invoices
    SET customer_id=${customerId}, status=${status}, amount=${amountCents}
    WHERE id=${id}
  `;

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  await sql`
    DELETE FROM invoices WHERE id = ${id}
  `;
  revalidatePath('/dashboard/invoices');
}
