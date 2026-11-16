import { Card, CardContent } from '@/components/ui/card'

export function App() {
  return (
    <main className="mx-auto flex min-h-svh max-w-3xl items-center px-6 py-12">
      <Card className="w-full border-t-2 border-t-primary">
        <CardContent className="space-y-4 px-6 py-4 sm:px-10 sm:py-8">
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
            Vampire: The Masquerade Character Creator
          </h1>
          <p className="max-w-prose text-base leading-relaxed text-muted-foreground">
            Character creation for Fifth Edition is in development.
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
