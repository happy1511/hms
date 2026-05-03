import PageState from "@/components/common/PageState";

export default function NotFound() {
  return (
    <main className="p-4">
      <PageState
        variant="empty"
        title="Page not found"
        description="The page you are looking for does not exist or may have moved."
      />
    </main>
  );
}
