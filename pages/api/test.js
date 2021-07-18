import {
  connectToDatabase,
  Contact,
  cookies,
  getField,
  getTexts
} from "../../lib/export"

async function handler(req, res) {
  // const { page, pageSize } = req.query
  // console.log(req.cookies)
  // const count = req.cookies.test === undefined ? 0 : parseInt(req.cookies.test) + 1
  // res.cookie("test", count)

  try {
    await connectToDatabase()
    const twilioBindingId = await getField({
      Model: Contact,
      id: "60f3592cd109b0621afb3acb",
      field: "twilioBindingId"
    })

    // await createDoc({
    //   Model: Flow,
    //   fields: {
    //     name: "testFlow",
    //     description: "hi asdf",
    //     index: 1,
    //     steps: [
    //       {
    //         keywordPresent: false,
    //         keywords: [],
    //         variableBody: true,
    //         functions: [
    //           {
    //             function: "60f39e5b9a29c87b2e7e69ea",
    //             parameters: [
    //               {
    //                 type: "variableBody",
    //                 body: "this is unecessary"
    //               }
    //             ]
    //           }
    //         ]
    //       }
    //     ]
    //   }
    // })

    res.status(200).json(await getTexts(twilioBindingId))
    res.status(200).json(
      await getDocsByTag({
        Model: Contact,
        tags: ["bro"]
      })
    )
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export default cookies(handler)
