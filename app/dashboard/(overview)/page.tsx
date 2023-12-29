import CardWrapper, { Card } from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import { lusitana } from '@/app/ui/fonts';
// import {
// fetchCardData,
// fetchLatestInvoices,
// fetchRevenue,
// } from '../../lib/data';
// import { sql } from '@vercel/postgres';
import { Suspense } from 'react';
import {
  CardsSkeleton,
  LatestInvoicesSkeleton,
  RevenueChartSkeleton,
} from '@/app/ui/skeletons';

export default async function Page() {
  // const revenue = await fetchRevenue();
  // const latestInvoices = await fetchLatestInvoices();
  // const {
  //   totalPaidInvoices,
  //   totalPendingInvoices,
  //   numberOfCustomers,
  //   numberOfInvoices,
  // } = await fetchCardData();

  // const result =
  //   await sql`SELECT COUNT(*) as count FROM invoices WHERE invoices.Status = 'pending'`;
  // const totalPendingInvoices: string = result.rows[0].count;
  // const totalPaidInvoices = (
  //   await sql`SELECT COUNT(*) FROM invoices WHERE invoices.Status = 'paid'`
  // ).rows[0].count;
  // const numberOfInvoices = (await sql`SELECT COUNT(*) FROM invoices`).rows[0]
  //   .count;
  // const numberOfCustomers = (await sql`SELECT COUNT(*) FROM customers`).rows[0]
  //   .count;

  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* <Card title="Collected" value={totalPaidInvoices} type="collected" />
        <Card title="Pending" value={totalPendingInvoices} type="pending" />
        <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
        <Card
          title="Total Customers"
          value={numberOfCustomers}
          type="customers"
        /> */}
        <Suspense fallback={<CardsSkeleton />}>
          <CardWrapper />
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense>
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <LatestInvoices />
        </Suspense>
      </div>
    </main>
  );
}
