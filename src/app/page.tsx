import HomePage from "./home/HomePage";

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function Home({ searchParams }: Props) {
  const { page } = await searchParams;
  const pageNumber = Math.max(1, parseInt(page ?? "1", 10) || 1);

  return <HomePage page={pageNumber} />;
}
