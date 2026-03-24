import { GarmentCard } from "@/components/GarmentCard";
import { garments } from "@/lib/garments";

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative flex flex-col items-center">
      
      {/* Subtle modern background circles */}
      <div
        className="absolute top-0 left-0 w-full h-[500px] overflow-hidden -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top, color-mix(in srgb, #bfdbfe 40%, transparent), transparent)",
        }}
      />

      <div className="w-full max-w-7xl mx-auto px-6 py-12 sm:py-16 lg:px-8">
        
        {/* Hero Section */}
        <div className="mx-auto max-w-2xl text-center mb-12">
          <div className="inline-flex items-center rounded-full px-3 py-1 mb-6 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 ring-1 ring-inset ring-blue-600/20 dark:ring-blue-500/30">
            Powered by GPT-Image-1.5
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-7xl mb-6 leading-tight">
            See the Magic of <br/>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Virtual Try-On
            </span>
          </h1>
          <p className="text-xl leading-8 text-neutral-600 dark:text-neutral-400">
            Select a garment from our premium collection, upload your photo, and let AI instantly visualize the perfect fit.
          </p>
        </div>

        {/* Catalog Grid */}
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">New Arrivals</h2>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">View all collection <span aria-hidden="true">&rarr;</span></span>
          </div>
          <div className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 gap-x-8 lg:grid-cols-4 xl:gap-x-10">
            {garments.map((garment) => (
              <GarmentCard key={garment.id} garment={garment} />
            ))}
          </div>
        </div>
        
      </div>
    </main>
  );
}
