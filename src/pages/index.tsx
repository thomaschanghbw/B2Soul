import Header from "@/client/components/demo/header";

export default function Home() {
  return (
    <main className="background-gradient flex h-screen w-screen items-center justify-center">
      <div className="w-[90%] space-y-2 lg:w-[60rem] lg:space-y-10">
        <Header />
        {/* <div className="flex h-[65vh]">
          <ChatSection />
        </div> */}
      </div>
    </main>
  );
}
