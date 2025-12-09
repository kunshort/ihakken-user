import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { LodgingLayout } from "@/components/lodging/layout"
import { RestaurantLayout } from "@/components/restaurant/layout"

export default async function ServicePage(props: {
  params: Promise<{ branchId: string; serviceSlug: string }>
}) {
  const params = await props.params
  const { branchId, serviceSlug } = params

  // Route to appropriate service component based on slug
  switch (serviceSlug) {
    case "lodging":
      return <LodgingLayout branchId={branchId} />
    case "restaurant":
      return <RestaurantLayout branchId={branchId} />
    case "gym":
      return (
        <main className="min-h-screen bg-background">
          <Header />
          <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <h1 className="text-4xl font-bold mb-4">Gym Services</h1>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
          <Footer />
        </main>
      )
    case "pool":
      return (
        <main className="min-h-screen bg-background">
          <Header />
          <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <h1 className="text-4xl font-bold mb-4">Pool Services</h1>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
          <Footer />
        </main>
      )
    default:
      return (
        <main className="min-h-screen bg-background">
          <Header />
          <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <h1 className="text-4xl font-bold mb-4">Service Not Found</h1>
            <p className="text-muted-foreground">The requested service could not be found.</p>
          </div>
          <Footer />
        </main>
      )
  }
}
