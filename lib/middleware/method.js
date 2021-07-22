const checkMethods = (req, res, methods = []) => {
  if (!methods.includes(req.method))
    return res.status(405).json(
      JSON.stringify({
        error: `endpoint only accepts ${methods.join(", ")} requests`
      })
    )

  return true
}

export const withMethod = (handler) => (req, res) => {
  res.limitMethods = (methods = []) => checkMethods(req, res, methods)

  return handler(req, res)
}
