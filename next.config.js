/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  // @huggingface/transformers + onnxruntime-web are browser-only and very large;
  // keep them out of the server/serverless bundle (they'd blow the 250MB limit).
  serverExternalPackages: ["onnxruntime-node", "sharp"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        "@huggingface/transformers": false,
        "onnxruntime-web": false,
      };
    }
    return config;
  },
};

export default config;
