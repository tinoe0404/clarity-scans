interface PageProps {
  params: { locale: string };
}
export default function FeedbackPage({ params }: PageProps) {
  return <h1>Feedback ({params.locale}) — Phase 13</h1>;
}
