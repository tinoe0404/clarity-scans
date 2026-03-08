interface PageProps {
  params: { locale: string };
}
export default function ModulesPage({ params }: PageProps) {
  return <h1>Modules ({params.locale}) — Phase 9</h1>;
}
