import HomePage from "./home/HomePage";

interface Props {
  searchParams: Promise<{ page?: string; lbPage?: string }>;
}

export default async function Home({ searchParams }: Props) {
  const { page, lbPage } = await searchParams;
  const pageNumber = Math.max(1, parseInt(page ?? "1", 10) || 1);
  const lbPageNumber = Math.max(1, parseInt(lbPage ?? "1", 10) || 1);

  return <HomePage page={pageNumber} lbPage={lbPageNumber} />;
}
