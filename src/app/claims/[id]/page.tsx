import { redirect } from "next/navigation";

interface ClaimPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClaimRedirectPage({ params }: ClaimPageProps) {
  const { id } = await params;
  redirect(`/entries/${id}`);
}
