interface PageProps {
  params: { locale: string };
}
export default function VisualGuidePage({ params }: PageProps) {
  return <h1>Visual Guide ({params.locale}) — Phase 12</h1>;
}
