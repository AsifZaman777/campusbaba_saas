import { Router } from "express";
import * as parentController from "../controllers/parentController";
import { validateRequest } from "../middlewares/validateRequest";
import { createParentSchema, updateParentSchema } from "../validators";

const router = Router();

router.post(
  "/",
  validateRequest(createParentSchema),
  parentController.createParent,
);
router.get("/", parentController.getAllParents);
router.get("/:id", parentController.getParentById);
router.get("/:id/children", parentController.getParentChildren);
router.put(
  "/:id",
  validateRequest(updateParentSchema),
  parentController.updateParent,
);
router.delete("/:id", parentController.deleteParent);

export default router;
