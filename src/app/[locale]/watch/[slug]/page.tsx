interface PageProps {
  params: { locale: string; slug: string };
}
export default function WatchPage({ params }: PageProps) {
  return (
    <h1>
      Video Player ({params.locale}, {params.slug}) — Phase 10
    </h1>
  );
}
