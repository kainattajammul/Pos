import { Router } from "express";
import multer from "multer";
import { BranchCommunicationController as C } from "../controllers/branchCommunication.controller.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  authenticateRequest,
  requireBranchContext,
  requireBranchPermission,
} from "../middleware/branchStaffAccess.middleware.js";
import { BRANCH_COMMUNICATION_PERMISSIONS as P } from "../constants/branchCommunicationPermissions.js";
import {
  branchCommContextRules,
  communicationSettingsUpdateRules,
  createTemplateRules,
  listQueryRules,
  sendCommunicationRules,
  uuidParam,
} from "../validators/branchCommunication.validator.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });
const router = Router({ mergeParams: true });
router.use(authenticateRequest, requireBranchContext);

router.get("/communication-settings", requireBranchPermission(P.COMMUNICATION_VIEW), branchCommContextRules, validateRequest, asyncHandler(C.getCommunicationSettings));
router.patch("/communication-settings", requireBranchPermission(P.COMMUNICATION_MANAGE), communicationSettingsUpdateRules, validateRequest, asyncHandler(C.updateCommunicationSettings));

router.get("/notification-settings", requireBranchPermission(P.NOTIFICATIONS_VIEW), branchCommContextRules, validateRequest, asyncHandler(C.getNotificationSettings));
router.patch("/notification-settings", requireBranchPermission(P.NOTIFICATIONS_MANAGE), branchCommContextRules, validateRequest, asyncHandler(C.updateNotificationSettings));

router.get("/document-settings", requireBranchPermission(P.DOCUMENTS_VIEW), branchCommContextRules, validateRequest, asyncHandler(C.getDocumentSettings));
router.patch("/document-settings", requireBranchPermission(P.DOCUMENTS_MANAGE_SETTINGS), branchCommContextRules, validateRequest, asyncHandler(C.updateDocumentSettings));
router.post("/document-settings/logo", requireBranchPermission(P.DOCUMENTS_MANAGE_SETTINGS), upload.single("logo"), branchCommContextRules, validateRequest, asyncHandler(C.uploadLogo));

router.get("/documents", requireBranchPermission(P.DOCUMENTS_VIEW), listQueryRules, validateRequest, asyncHandler(C.listDocuments));
router.post("/documents/:documentUuid/signed-url", requireBranchPermission(P.DOCUMENTS_DOWNLOAD), uuidParam("documentUuid"), validateRequest, asyncHandler(C.signedDocumentUrl));

router.get("/receipt-settings", requireBranchPermission(P.RECEIPTS_VIEW), branchCommContextRules, validateRequest, asyncHandler(C.getReceiptSettings));
router.patch("/receipt-settings", requireBranchPermission(P.RECEIPTS_MANAGE_SETTINGS), branchCommContextRules, validateRequest, asyncHandler(C.updateReceiptSettings));

router.get("/invoice-settings", requireBranchPermission(P.INVOICE_SETTINGS_VIEW), branchCommContextRules, validateRequest, asyncHandler(C.getInvoiceSettings));
router.patch("/invoice-settings", requireBranchPermission(P.INVOICE_SETTINGS_MANAGE), branchCommContextRules, validateRequest, asyncHandler(C.updateInvoiceSettings));

router.get("/email-sender-settings", requireBranchPermission(P.EMAIL_SENDER_VIEW), branchCommContextRules, validateRequest, asyncHandler(C.getEmailSenderSettings));
router.patch("/email-sender-settings", requireBranchPermission(P.EMAIL_SENDER_MANAGE), branchCommContextRules, validateRequest, asyncHandler(C.updateEmailSenderSettings));
router.post("/email-sender-settings/test", requireBranchPermission(P.EMAIL_SENDER_TEST), branchCommContextRules, validateRequest, asyncHandler(C.testEmailSender));

router.get("/sms-sender-settings", requireBranchPermission(P.SMS_SENDER_VIEW), branchCommContextRules, validateRequest, asyncHandler(C.getSmsSenderSettings));
router.patch("/sms-sender-settings", requireBranchPermission(P.SMS_SENDER_MANAGE), branchCommContextRules, validateRequest, asyncHandler(C.updateSmsSenderSettings));
router.post("/sms-sender-settings/test", requireBranchPermission(P.SMS_SENDER_TEST), branchCommContextRules, validateRequest, asyncHandler(C.testSmsSender));

router.get("/message-templates", requireBranchPermission(P.MESSAGE_TEMPLATES_VIEW), listQueryRules, validateRequest, asyncHandler(C.listMessageTemplates));
router.post("/message-templates", requireBranchPermission(P.MESSAGE_TEMPLATES_CREATE), createTemplateRules, validateRequest, asyncHandler(C.createMessageTemplate));
router.patch("/message-templates/:templateUuid", requireBranchPermission(P.MESSAGE_TEMPLATES_UPDATE), uuidParam("templateUuid"), validateRequest, asyncHandler(C.updateMessageTemplate));
router.post("/message-templates/:templateUuid/preview", requireBranchPermission(P.MESSAGE_TEMPLATES_PREVIEW), uuidParam("templateUuid"), validateRequest, asyncHandler(C.previewMessageTemplate));
router.get("/message-template-variables", requireBranchPermission(P.MESSAGE_TEMPLATES_VIEW), branchCommContextRules, validateRequest, asyncHandler(C.getTemplateVariables));

router.get("/communications", requireBranchPermission(P.COMMUNICATIONS_VIEW), listQueryRules, validateRequest, asyncHandler(C.listCommunications));
router.post("/communications/send-email", requireBranchPermission(P.COMMUNICATIONS_SEND), sendCommunicationRules, validateRequest, asyncHandler(C.sendEmail));
router.post("/communications/send-sms", requireBranchPermission(P.COMMUNICATIONS_SEND), sendCommunicationRules, validateRequest, asyncHandler(C.sendSms));

export default router;
