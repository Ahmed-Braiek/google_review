import { CampaignExperience } from "@/components/experience/CampaignExperience";
export default async function StoreCampaignPage({
  params,
  searchParams,
}: {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { storeSlug } = await params;
  const { welcome } = await searchParams;
  const forceWelcome = welcome === "1" || welcome === "true";
  return <CampaignExperience storeSlug={storeSlug} forceWelcome={forceWelcome} />;
}
