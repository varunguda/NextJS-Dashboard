'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong!';
      }
    }
    throw error;
  }
}

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount that is greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

const CreateInvoice = FormSchema.omit({ id: true, date: true });
export async function createInvoice(prevState: State, formData: FormData) {
  const validateFields = CreateInvoice.safeParse({
    // .safeParse() returns an object containing either success or error field.
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validateFields.success) {
    return {
      errors: validateFields.error.flatten().fieldErrors,
      message: 'Missing fields, failed to create invoice.',
    };
  }
  const { customerId, amount, status } = CreateInvoice.parse(
    Object.fromEntries(formData.entries()),
  );
  const amountCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountCents}, ${status}, ${date})
    `;
  } catch (err) {
    return {
      message: 'Database Error: Error while creating an invoice!',
    };
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

const UpdateInvoice = FormSchema.omit({ id: true, date: true });
export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validateFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    status: formData.get('status'),
    amount: formData.get('amount'),
  });

  if (!validateFields.success) {
    return {
      errors: validateFields.error.flatten().fieldErrors,
      message: 'Missing fields, failed to edit an invoice.',
    };
  }

  const { customerId, status, amount } = UpdateInvoice.parse(
    Object.fromEntries(formData.entries()),
  );

  const amountCents = amount * 100;

  try {
    await sql`
    UPDATE invoices
    SET customer_id=${customerId}, status=${status}, amount=${amountCents}
    WHERE id=${id}
  `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to update invoice!',
    };
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  // throw new Error('Failed deleting an invoice!');
  try {
    await sql`
    DELETE FROM invoices WHERE id = ${id}
  `;
  } catch (err) {
    return {
      message: 'Databse Error: Error while deleting an invoice!',
    };
  }
  revalidatePath('/dashboard/invoices');
}
