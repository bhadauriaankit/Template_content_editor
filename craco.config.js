module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          "stream": require.resolve("stream-browserify"),
          "buffer": require.resolve("buffer/")
        }
      }
    }
  }
};