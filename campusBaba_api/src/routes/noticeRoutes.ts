import { Router } from "express";
import * as noticeController from "../controllers/noticeController";
import { validateRequest } from "../middlewares/validateRequest";
import { createNoticeSchema, updateNoticeSchema } from "../validators";

const router = Router();

router.post(
  "/",
  validateRequest(createNoticeSchema),
  noticeController.createNotice,
);
router.get("/teacher/:teacherId", noticeController.getNoticesByTeacherId);
router.get("/", noticeController.getAllNotices);
router.get("/active", noticeController.getActiveNotices);
router.get("/:id", noticeController.getNoticeById);
router.put(
  "/:id",
  validateRequest(updateNoticeSchema),
  noticeController.updateNotice,
);
router.delete("/:id", noticeController.deleteNotice);

export default router;
