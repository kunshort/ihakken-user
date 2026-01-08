"use client";
import { useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";

function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/branch/services");
  }, [router]);

  return null;
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <HomePage />
    </Suspense>
  );
}
