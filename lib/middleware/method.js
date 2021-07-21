export const withMethod = (handler, methods = []) => {
  return async (req, res) => {
    // check if method is used
    if (!methods.includes(req.method))
      return res
        .status(405)
        .json(
          JSON.stringify({ error: `endpoint only accepts ${methods} requests` })
        )

    // return handler
    return handler(req, res)
  }
}
