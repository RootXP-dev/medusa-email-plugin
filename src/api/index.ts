import { json, Router } from "express"
import { z } from "zod"
import { MedusaError } from "@medusajs/utils"
import EmailsService from "../services/emails";

const router = Router()

export default (rootDirectory: string): Router | Router[] => {
   router.post("/email_test", json(), async (req, res) => {
      const schema = z.object({
         event: z.string().min(1),
         payload: z.any(),
      })
      // @ts-ignore
      const { success, error, data } = schema.safeParse(req.body)
      if (!success) {
         // throw new MedusaError(MedusaError.Types.INVALID_DATA, error)
         res.status(422)
         return res.json(error);
      }

      const emailService: EmailsService = req.scope.resolve("emailsService")
      emailService.sendNotification(data.event, data.payload, {}).then((result) => {
         return res.json({ result })
      })
   })

   return router
}