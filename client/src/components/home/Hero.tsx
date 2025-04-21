const Hero = () => {
  return (
    <div className="relative bg-primary">
      <div className="absolute inset-0">
        <img
          className="w-full h-full object-cover"
          src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=600&q=80"
          alt="Hotel view"
        />
        <div
          className="absolute inset-0 bg-primary mix-blend-multiply opacity-40"
          aria-hidden="true"
        ></div>
      </div>
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl font-heading">
          Find your perfect stay
        </h1>
        <p className="mt-6 text-xl text-white max-w-3xl">
          Discover the best hotels across Tunisia and book your dream vacation with Hootili.
        </p>
      </div>
    </div>
  );
};

export default Hero;
