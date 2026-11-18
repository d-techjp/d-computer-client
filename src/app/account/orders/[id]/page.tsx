import { OrderDetailPanel } from "@/features/account/components/order-detail-panel";

type PageProps = { params: Promise<{ id: string }> };

export default async function AccountOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <OrderDetailPanel orderId={id} />;
}
