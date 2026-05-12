const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development"
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@dartbites/firebase", "@dartbites/ui"]
};

module.exports = withPWA(nextConfig);
