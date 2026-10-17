import { PageLayout, Zone } from '@core/ui';

export default function HomePage() {
  return (
    <PageLayout>
      <Zone name="home.header" />
      <Zone name="home.main" />
      <Zone name="home.footer" />
    </PageLayout>
  );
}
