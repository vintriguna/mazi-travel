import Navbar from "@/components/Navbar";

export default function TripsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 relative z-10">{children}</main>
    </div>
  );
}
