export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-5 shadow-md bg-white">
        <h1 className="text-2xl font-bold text-blue-600">
          FreelanceShield
        </h1>

        <div className="space-x-6">
          <a href="#">Home</a>
          <a href="#">Features</a>
          <a href="#">About</a>
          <a href="#">Contact</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center py-24 px-6">
        <h2 className="text-5xl font-bold mb-6">
          Secure Freelancing Marketplace
        </h2>

        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          Connect trusted clients and talented freelancers on a professional
          platform built for collaboration and growth.
        </p>

        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Get Started
        </button>
      </section>

      {/* Features */}
      <section className="py-16 px-10">
        <h2 className="text-3xl font-bold text-center mb-12">
          Features
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold text-xl mb-2">
              Project Management
            </h3>
            <p>Create and manage projects efficiently.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold text-xl mb-2">
              Messaging
            </h3>
            <p>Communicate with clients and freelancers.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold text-xl mb-2">
              Ratings & Reviews
            </h3>
            <p>Build trust through transparent feedback.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold text-xl mb-2">
              Project Tracking
            </h3>
            <p>Monitor project progress easily.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-10 bg-white">
        <h2 className="text-3xl font-bold text-center mb-10">
          How It Works
        </h2>

        <div className="grid md:grid-cols-4 gap-6 text-center">
          <div>
            <h3 className="font-bold">1</h3>
            <p>Create Account</p>
          </div>

          <div>
            <h3 className="font-bold">2</h3>
            <p>Post or Browse Projects</p>
          </div>

          <div>
            <h3 className="font-bold">3</h3>
            <p>Collaborate</p>
          </div>

          <div>
            <h3 className="font-bold">4</h3>
            <p>Complete Project</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-20 px-6">
        <h2 className="text-4xl font-bold mb-4">
          Ready to Start?
        </h2>

        <p className="text-gray-600 mb-8">
          Join FreelanceShield today and connect with the right opportunities.
        </p>

        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Get Started
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center py-6">
        <p>© 2026 FreelanceShield. All Rights Reserved.</p>
      </footer>

    </main>
  );
}